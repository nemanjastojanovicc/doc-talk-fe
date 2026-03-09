import os
import shutil
import uuid
import json
import hashlib
import secrets
import hmac
import re
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Dict, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlmodel import Session, create_engine, select, SQLModel

from models import (
    Patient,
    Consultation,
    User,
    Account,
    PatientAiChatMessage,
    DoctorNotification,
)
from ai_engine import (
    transcribe_audio,
    analyze_medical_transcript,
    ask_patient_self_service,
    summarize_patient_chat,
    detect_significant_patient_info,
)
from migrations import run_migrations

# --- DATABASE SETUP ---
DB_FILE = "medical.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def parse_json_value(value: Any, default: Any) -> Any:
    if value is None:
        return default
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return default

def ensure_list(value: Any) -> List[Any]:
    if isinstance(value, list):
        return value
    if value is None:
        return []
    return [value]

def build_medical_record(raw: Any) -> Dict[str, Any]:
    if not isinstance(raw, dict):
        raw = {}
    return {
        "chronicConditions": ensure_list(raw.get("chronicConditions")),
        "allergies": ensure_list(raw.get("allergies")),
        "medications": ensure_list(raw.get("medications")),
        "diagnosesHistory": ensure_list(raw.get("diagnosesHistory")),
        "patientReportedInfo": ensure_list(raw.get("patientReportedInfo")),
    }


def _deduplicate_preserve_order(items: List[str]) -> List[str]:
    seen = set()
    output: List[str] = []
    for item in items:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        output.append(item.strip())
    return output


def _safe_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    try:
        return json.dumps(value, ensure_ascii=False)
    except Exception:
        return str(value)


def _is_significant_patient_message(message: str) -> bool:
    text = message.lower()
    keywords = [
        "faint",
        "fainted",
        "passed out",
        "seizure",
        "convulsion",
        "chest pain",
        "shortness of breath",
        "can't breathe",
        "numb",
        "weakness",
        "paralysis",
        "slurred speech",
        "confusion",
        "worst headache",
        "vomiting blood",
        "blood in stool",
        "high fever",
        "suicidal",
        "loss of consciousness",
        "onesvest",
        "onesvestio",
        "nesvestica",
        "gubitak svesti",
    ]
    return any(keyword in text for keyword in keywords)


def _extract_diagnoses(ai_soap: Any, recommendations: List[str]) -> List[str]:
    diagnoses: List[str] = []

    if isinstance(ai_soap, dict):
        assessment = _safe_text(ai_soap.get("Assessment"))
        for chunk in re.split(r"\n|\.|;", assessment):
            item = chunk.strip(" -•\t")
            if len(item) >= 4:
                diagnoses.append(item)
    else:
        soap_text = _safe_text(ai_soap)
        for line in soap_text.splitlines():
            text = line.strip(" -•\t")
            if not text:
                continue
            if any(keyword in text.lower() for keyword in ["diagnosis", "assessment", "suspected", "likely"]):
                diagnoses.append(text)

    for recommendation in recommendations:
        text = recommendation.strip(" -•\t")
        if not text:
            continue
        if any(keyword in text.lower() for keyword in ["diagnosis", "suspected", "syndrome", "infection", "disease"]):
            diagnoses.append(text)

    if not diagnoses:
        diagnoses.extend([r.strip() for r in recommendations if r and len(r.strip()) > 3])

    return _deduplicate_preserve_order(diagnoses)


def _extract_medications(ai_soap: Any, recommendations: List[str]) -> List[Dict[str, str]]:
    medication_candidates: List[str] = []

    if isinstance(ai_soap, dict):
        plan = _safe_text(ai_soap.get("Plan"))
        medication_candidates.extend([line.strip() for line in plan.splitlines() if line.strip()])
    else:
        soap_text = _safe_text(ai_soap)
        for line in soap_text.splitlines():
            if any(keyword in line.lower() for keyword in ["therapy", "medication", "treatment", "prescribe", "tablet", "capsule", "mg"]):
                medication_candidates.append(line.strip())

    medication_candidates.extend([r.strip() for r in recommendations if r])

    medications: List[Dict[str, str]] = []
    seen_names = set()
    dose_pattern = re.compile(r"(\d+(?:[.,]\d+)?\s?(?:mg|g|mcg|ml|iu))", re.IGNORECASE)

    for candidate in medication_candidates:
        if not candidate:
            continue
        if not any(keyword in candidate.lower() for keyword in ["mg", "therapy", "medication", "prescribe", "tablet", "capsule", "dose", "sirup", "antibiotic", "analgesic"]):
            continue

        dosage_match = dose_pattern.search(candidate)
        dosage = dosage_match.group(1) if dosage_match else "as advised"

        name = candidate
        if dosage_match:
            name = candidate[: dosage_match.start()].strip(" :-,.")
        name = re.sub(r"^(therapy|medication|prescribe|treatment)\s*[:\-]?\s*", "", name, flags=re.IGNORECASE).strip()
        if not name:
            name = "Medication"

        frequency = "as prescribed"
        lower = candidate.lower()
        if "2x" in lower or "twice" in lower:
            frequency = "2x daily"
        elif "3x" in lower or "three times" in lower:
            frequency = "3x daily"
        elif "once" in lower or "1x" in lower:
            frequency = "once daily"

        key = name.lower()
        if key in seen_names:
            continue
        seen_names.add(key)
        medications.append(
            {
                "name": name,
                "dosage": dosage,
                "frequency": frequency,
            }
        )

    return medications


def update_patient_record_from_consultation(
    patient: Patient,
    ai_soap: Any,
    recommendations: List[str],
) -> None:
    current_record = build_medical_record(parse_json_value(patient.medicalRecord, {}))

    extracted_diagnoses = _extract_diagnoses(ai_soap, recommendations)
    current_diagnoses = ensure_list(current_record.get("diagnosesHistory"))
    merged_diagnoses = _deduplicate_preserve_order(
        [*current_diagnoses, *extracted_diagnoses]
    )

    extracted_meds = _extract_medications(ai_soap, recommendations)
    current_meds = ensure_list(current_record.get("medications"))
    existing_med_names = {
        _safe_text(med.get("name")).strip().lower()
        for med in current_meds
        if isinstance(med, dict)
    }

    for med in extracted_meds:
        med_name = _safe_text(med.get("name")).strip().lower()
        if med_name and med_name not in existing_med_names:
            current_meds.append(med)
            existing_med_names.add(med_name)

    current_record["diagnosesHistory"] = merged_diagnoses
    current_record["medications"] = current_meds
    patient.medicalRecord = json.dumps(current_record)

def build_patient_payload(patient: Patient) -> Dict[str, Any]:
    medical_record = build_medical_record(
        parse_json_value(patient.medicalRecord, {})
    )
    vitals = parse_json_value(patient.vitals, {})
    lifestyle = parse_json_value(patient.lifestyle, {})
    assigned_doctor_ids = ensure_list(
        parse_json_value(patient.assignedDoctorIds, [])
    )

    payload: Dict[str, Any] = {
        "id": patient.id,
        "firstName": patient.firstName,
        "lastName": patient.lastName,
        "fullName": f"{patient.firstName} {patient.lastName}",
        "dateOfBirth": patient.dateOfBirth,
        "gender": patient.gender,
        "medicalRecord": medical_record,
        "assignedDoctorIds": assigned_doctor_ids,
        "isActive": patient.isActive,
        "createdAt": patient.createdAt,
        "updatedAt": patient.updatedAt,
    }

    # Optional contact fields
    if patient.email:
        payload["email"] = patient.email
    if patient.phoneNumber:
        payload["phoneNumber"] = patient.phoneNumber

    if isinstance(vitals, dict) and vitals:
        payload["vitals"] = vitals
    if isinstance(lifestyle, dict) and lifestyle:
        payload["lifestyle"] = lifestyle

    return payload

def serialize_consultation(
    consultation: Consultation,
    include_patient: bool = False
) -> Dict[str, Any]:
    ai_recs = parse_json_value(consultation.aiRecommendations, [])
    payload = {
        "id": consultation.id,
        "patientId": consultation.patientId,
        "date": consultation.date,
        "doctorId": consultation.doctorId,
        "transcript": consultation.transcript,
        "doctorNotes": consultation.doctorNotes,
        "aiSummary": consultation.aiSummary,
        "aiRecommendations": ensure_list(ai_recs),
    }

    if include_patient and consultation.patient:
        patient_payload = build_patient_payload(consultation.patient)
        patient_payload["consultations"] = []
        payload["patient"] = patient_payload

    return payload

def serialize_patient(patient: Patient) -> Dict[str, Any]:
    payload = build_patient_payload(patient)
    payload["consultations"] = [
        serialize_consultation(c, include_patient=True)
        for c in (patient.consultations or [])
    ]
    return payload


def create_patient_account(
    *,
    session: Session,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
) -> Account:
    now = datetime.now().isoformat()
    user = User(
        firstName=first_name,
        lastName=last_name,
        createdAt=now,
        updatedAt=now,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    password_data = hash_password(password)
    tokens = issue_tokens()

    account = Account(
        email=email,
        passwordHash=password_data["hash"],
        passwordSalt=password_data["salt"],
        role="patient",
        userId=user.id,
        roles=json.dumps(["patient"]),
        accessToken=tokens["accessToken"],
        refreshToken=tokens["refreshToken"],
        createdAt=now,
        updatedAt=now,
    )
    session.add(account)
    session.commit()
    session.refresh(account)
    return account


def generate_password_salt() -> str:
    return secrets.token_hex(16)


def derive_password_hash(value: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        value.encode("utf-8"),
        salt.encode("utf-8"),
        120_000,
    ).hex()


def hash_password(value: str) -> Dict[str, str]:
    salt = generate_password_salt()
    return {
        "hash": derive_password_hash(value, salt),
        "salt": salt,
    }


def verify_password(value: str, account: Account) -> bool:
    if account.passwordSalt:
        expected_hash = derive_password_hash(value, account.passwordSalt)
        return hmac.compare_digest(account.passwordHash, expected_hash)

    legacy_hash = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return hmac.compare_digest(account.passwordHash, legacy_hash)


def serialize_account(account: Account) -> Dict[str, Any]:
    roles = ensure_list(parse_json_value(account.roles, ["doctor"]))
    return {
        "id": account.id,
        "email": account.email,
        "role": account.role,
        "isEmailVerified": account.isEmailVerified,
        "pendingEmail": account.pendingEmail,
        "state": account.state,
        "userId": account.userId,
        "createdAt": account.createdAt,
        "updatedAt": account.updatedAt,
        "roles": roles,
    }


def issue_tokens() -> Dict[str, str]:
    return {
        "accessToken": secrets.token_urlsafe(32),
        "refreshToken": secrets.token_urlsafe(48),
    }


def parse_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip() or None


def get_account_by_access_token(
    authorization: str | None,
    session: Session,
) -> Account:
    token = parse_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")

    account = session.exec(
        select(Account).where(Account.accessToken == token)
    ).first()
    if not account:
        raise HTTPException(status_code=401, detail="Invalid access token")

    return account

def get_session():
    with Session(engine) as session:
        yield session

class PatientVitals(BaseModel):
    model_config = ConfigDict(extra="ignore")
    heightCm: float | None = None
    weightKg: float | None = None
    bloodPressure: str | None = None
    heartRate: int | None = None

class PatientLifestyle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    smoking: str | None = None
    alcohol: str | None = None
    physicalActivity: str | None = None
    diet: str | None = None
    stressLevel: int | None = None


class PatientMedicalRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    chronicConditions: List[str] = []
    allergies: List[str] = []
    medications: List[Dict[str, Any]] = []
    diagnosesHistory: List[str] = []
    patientReportedInfo: List[str] = []

class MedicationPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    dosage: str
    frequency: str

class PatientCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    firstName: str
    lastName: str
    dateOfBirth: str
    gender: str
    email: str | None = None
    patientPassword: str | None = None
    phoneNumber: str | None = None
    vitals: PatientVitals | None = None
    lifestyle: PatientLifestyle | None = None

class PatientUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    firstName: str | None = None
    lastName: str | None = None
    dateOfBirth: str | None = None
    gender: str | None = None
    email: str | None = None
    patientPassword: str | None = None
    phoneNumber: str | None = None
    vitals: PatientVitals | None = None
    lifestyle: PatientLifestyle | None = None
    medicalRecord: PatientMedicalRecord | None = None


class SignupPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    firstName: str
    lastName: str
    email: str
    password: str


class LoginPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str
    password: str


class PatientAiQuestionPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question: str


class DoctorNotificationReviewPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    addToChart: bool = False

class ConsultationNotesPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    doctorNotes: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_db_and_tables()
    run_migrations(DB_FILE)
    with Session(engine) as session:
        # Remove legacy seed patient if present
        dummy = session.get(Patient, "patient-123")
        if dummy:
            session.delete(dummy)
            session.commit()
    yield

app = FastAPI(lifespan=lifespan)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES ---


@app.post("/auth/signup")
def signup(payload: SignupPayload, session: Session = Depends(get_session)):
    email = payload.email.strip().lower()
    first_name = payload.firstName.strip()
    last_name = payload.lastName.strip()

    if not first_name or not last_name or not email:
        raise HTTPException(status_code=400, detail="Invalid signup data")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password is too short")

    existing = session.exec(select(Account).where(Account.email == email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.now().isoformat()
    user = User(
        firstName=first_name,
        lastName=last_name,
        createdAt=now,
        updatedAt=now,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    tokens = issue_tokens()

    password_data = hash_password(payload.password)

    account = Account(
        email=email,
        passwordHash=password_data["hash"],
        passwordSalt=password_data["salt"],
        role="doctor",
        userId=user.id,
        roles=json.dumps(["doctor"]),
        accessToken=tokens["accessToken"],
        refreshToken=tokens["refreshToken"],
        createdAt=now,
        updatedAt=now,
    )
    session.add(account)
    session.commit()
    session.refresh(account)

    return {
        "account": serialize_account(account),
        "accessToken": account.accessToken,
        "refreshToken": account.refreshToken,
    }


@app.post("/auth/login")
def login(payload: LoginPayload, session: Session = Depends(get_session)):
    email = payload.email.strip().lower()
    account = session.exec(select(Account).where(Account.email == email)).first()

    if not account or not verify_password(payload.password, account):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not account.passwordSalt:
        migrated_password = hash_password(payload.password)
        account.passwordHash = migrated_password["hash"]
        account.passwordSalt = migrated_password["salt"]

    tokens = issue_tokens()
    account.accessToken = tokens["accessToken"]
    account.refreshToken = tokens["refreshToken"]
    account.updatedAt = datetime.now().isoformat()

    session.add(account)
    session.commit()
    session.refresh(account)

    return {
        "account": serialize_account(account),
        "accessToken": account.accessToken,
        "refreshToken": account.refreshToken,
    }


@app.post("/auth/refresh-token")
def refresh_token(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    refresh = parse_bearer_token(authorization)
    if not refresh:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    account = session.exec(
        select(Account).where(Account.refreshToken == refresh)
    ).first()
    if not account:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    tokens = issue_tokens()
    account.accessToken = tokens["accessToken"]
    account.refreshToken = tokens["refreshToken"]
    account.updatedAt = datetime.now().isoformat()

    session.add(account)
    session.commit()

    return {
        "accessToken": tokens["accessToken"],
        "refreshToken": tokens["refreshToken"],
    }


@app.post("/auth/logout")
def logout(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    refresh = parse_bearer_token(authorization)
    if not refresh:
        return {"success": True}

    account = session.exec(
        select(Account).where(Account.refreshToken == refresh)
    ).first()
    if not account:
        return {"success": True}

    account.accessToken = None
    account.refreshToken = None
    account.updatedAt = datetime.now().isoformat()
    session.add(account)
    session.commit()

    return {"success": True}


@app.get("/user")
def get_current_user(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    account = get_account_by_access_token(authorization, session)
    user = session.get(User, account.userId)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt,
    }


@app.get("/patients/me")
def get_my_patient(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    account = get_account_by_access_token(authorization, session)
    if account.role != "patient":
        raise HTTPException(status_code=403, detail="Only patient accounts are allowed")

    patient = session.exec(
        select(Patient).where(Patient.patientAccountId == account.id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    return serialize_patient(patient)


def serialize_patient_ai_chat_message(message: PatientAiChatMessage) -> Dict[str, Any]:
    return {
        "id": message.id,
        "patientId": message.patientId,
        "accountId": message.accountId,
        "role": message.role,
        "content": message.content,
        "createdAt": message.createdAt,
    }


def serialize_doctor_notification(
    notification: DoctorNotification,
    patient: Patient | None = None,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "id": notification.id,
        "patientId": notification.patientId,
        "doctorAccountId": notification.doctorAccountId,
        "sourceMessage": notification.sourceMessage,
        "aiReason": notification.aiReason,
        "status": notification.status,
        "createdAt": notification.createdAt,
        "updatedAt": notification.updatedAt,
    }
    if patient:
        payload["patient"] = {
            "id": patient.id,
            "fullName": f"{patient.firstName} {patient.lastName}",
        }
    return payload


@app.get("/patients/me/ai-chat-history")
def get_my_ai_chat_history(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    account = get_account_by_access_token(authorization, session)
    if account.role != "patient":
        raise HTTPException(status_code=403, detail="Only patient accounts are allowed")

    patient = session.exec(
        select(Patient).where(Patient.patientAccountId == account.id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    messages = session.exec(
        select(PatientAiChatMessage)
        .where(PatientAiChatMessage.patientId == patient.id)
        .order_by(PatientAiChatMessage.createdAt.asc())
    ).all()

    return [serialize_patient_ai_chat_message(message) for message in messages]


@app.get("/patients/{patient_id}/ai-chat-history")
def get_patient_ai_chat_history(
    patient_id: str,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    messages = session.exec(
        select(PatientAiChatMessage)
        .where(PatientAiChatMessage.patientId == patient.id)
        .order_by(PatientAiChatMessage.createdAt.asc())
    ).all()

    return [serialize_patient_ai_chat_message(message) for message in messages]


@app.post("/patients/me/ai-chat")
def patient_self_ai_chat(
    payload: PatientAiQuestionPayload,
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    account = get_account_by_access_token(authorization, session)
    if account.role != "patient":
        raise HTTPException(status_code=403, detail="Only patient accounts are allowed")

    patient = session.exec(
        select(Patient).where(Patient.patientAccountId == account.id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    recent_consultations = session.exec(
        select(Consultation)
        .where(Consultation.patientId == patient.id)
        .order_by(Consultation.date.desc())
    ).all()[:5]

    context = {
        "patient": build_patient_payload(patient),
        "recentConsultations": [
            {
                "date": c.date,
                "doctorNotes": c.doctorNotes,
                "aiSummary": c.aiSummary,
                "aiRecommendations": ensure_list(parse_json_value(c.aiRecommendations, [])),
            }
            for c in recent_consultations
        ],
    }

    answer = ask_patient_self_service(
        patient_context=context,
        question=question,
    )

    now = datetime.now().isoformat()
    user_message = PatientAiChatMessage(
        patientId=patient.id,
        accountId=account.id,
        role="user",
        content=question,
        createdAt=now,
    )
    ai_message = PatientAiChatMessage(
        patientId=patient.id,
        accountId=account.id,
        role="assistant",
        content=answer,
        createdAt=datetime.now().isoformat(),
    )
    session.add(user_message)
    session.add(ai_message)

    significance = detect_significant_patient_info(question, answer)
    assigned_doctor_ids = ensure_list(parse_json_value(patient.assignedDoctorIds, []))

    should_notify = bool(significance.get("shouldNotify")) or _is_significant_patient_message(question)

    if should_notify and assigned_doctor_ids:
        reason = _safe_text(significance.get("reason")).strip() or "Potential significant new patient-reported information"
        for doctor_account_id in assigned_doctor_ids:
            existing_notification = session.exec(
                select(DoctorNotification).where(
                    DoctorNotification.patientId == patient.id,
                    DoctorNotification.doctorAccountId == str(doctor_account_id),
                    DoctorNotification.sourceMessage == question,
                )
            ).first()
            if existing_notification:
                continue

            notification = DoctorNotification(
                patientId=patient.id,
                doctorAccountId=str(doctor_account_id),
                sourceMessage=question,
                aiReason=reason,
                status="new",
                createdAt=datetime.now().isoformat(),
                updatedAt=datetime.now().isoformat(),
            )
            session.add(notification)

    session.commit()

    return {"answer": answer}


@app.post("/patients/me/ai-chat-summary")
def patient_ai_chat_summary(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    account = get_account_by_access_token(authorization, session)
    if account.role != "patient":
        raise HTTPException(status_code=403, detail="Only patient accounts are allowed")

    patient = session.exec(
        select(Patient).where(Patient.patientAccountId == account.id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    messages = session.exec(
        select(PatientAiChatMessage)
        .where(PatientAiChatMessage.patientId == patient.id)
        .order_by(PatientAiChatMessage.createdAt.asc())
    ).all()

    simplified_messages = [
        {"role": message.role, "content": message.content}
        for message in messages
    ]

    summary = summarize_patient_chat(simplified_messages)
    return summary


@app.get("/doctor/notifications")
def get_doctor_notifications(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    account = get_account_by_access_token(authorization, session)
    if account.role not in ("doctor", "user"):
        raise HTTPException(status_code=403, detail="Only doctor accounts are allowed")

    notifications = session.exec(
        select(DoctorNotification)
        .where(DoctorNotification.doctorAccountId == account.id)
        .order_by(DoctorNotification.createdAt.desc())
    ).all()

    patients_map: Dict[str, Patient] = {}
    patient_ids = {notification.patientId for notification in notifications}
    if patient_ids:
        patients = session.exec(select(Patient).where(Patient.id.in_(patient_ids))).all()
        patients_map = {patient.id: patient for patient in patients}

    return [
        serialize_doctor_notification(notification, patients_map.get(notification.patientId))
        for notification in notifications
    ]


@app.post("/doctor/notifications/{notification_id}/review")
def review_doctor_notification(
    notification_id: str,
    payload: DoctorNotificationReviewPayload,
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
):
    account = get_account_by_access_token(authorization, session)
    if account.role not in ("doctor", "user"):
        raise HTTPException(status_code=403, detail="Only doctor accounts are allowed")

    notification = session.get(DoctorNotification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.doctorAccountId != account.id:
        raise HTTPException(status_code=403, detail="You are not allowed to review this notification")

    patient = session.get(Patient, notification.patientId)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if payload.addToChart:
        medical_record = build_medical_record(parse_json_value(patient.medicalRecord, {}))
        current_items = ensure_list(medical_record.get("patientReportedInfo"))
        current_items.append(notification.sourceMessage)
        medical_record["patientReportedInfo"] = _deduplicate_preserve_order(
            [_safe_text(item) for item in current_items if _safe_text(item).strip()]
        )
        patient.medicalRecord = json.dumps(medical_record)
        patient.updatedAt = datetime.now().isoformat()
        notification.status = "added_to_chart"
    else:
        notification.status = "dismissed"

    notification.updatedAt = datetime.now().isoformat()

    session.add(patient)
    session.add(notification)
    session.commit()
    session.refresh(notification)

    return serialize_doctor_notification(notification, patient)

@app.get("/patients")
def get_patients(session: Session = Depends(get_session)):
    patients = session.exec(select(Patient)).all()
    return [serialize_patient(patient) for patient in patients]

@app.get("/patients/{patient_id}")
def get_patient(patient_id: str, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return serialize_patient(patient)

@app.post("/patients")
def create_patient(
    payload: PatientCreate,
    session: Session = Depends(get_session),
):
    email = payload.email.strip().lower() if payload.email else None
    patient_password = payload.patientPassword

    if email and not patient_password:
        raise HTTPException(
            status_code=400,
            detail="Patient password is required when email is provided",
        )
    if patient_password and len(patient_password) < 6:
        raise HTTPException(status_code=400, detail="Patient password is too short")

    account: Account | None = None
    if email:
        existing_account = session.exec(
            select(Account).where(Account.email == email)
        ).first()
        if existing_account:
            raise HTTPException(status_code=409, detail="Email already in use")

        account = create_patient_account(
            session=session,
            first_name=payload.firstName,
            last_name=payload.lastName,
            email=email,
            password=patient_password,
        )

    vitals = payload.vitals.model_dump() if payload.vitals else {}
    lifestyle = payload.lifestyle.model_dump() if payload.lifestyle else {}

    new_patient = Patient(
        patientAccountId=account.id if account else None,
        firstName=payload.firstName,
        lastName=payload.lastName,
        dateOfBirth=payload.dateOfBirth,
        gender=payload.gender,
        email=email,
        phoneNumber=payload.phoneNumber,
        vitals=json.dumps(vitals),
        lifestyle=json.dumps(lifestyle),
    )
    session.add(new_patient)
    session.commit()
    session.refresh(new_patient)
    return serialize_patient(new_patient)

@app.put("/patients/{patient_id}")
def update_patient(
    patient_id: str,
    payload: PatientUpdate,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    updates = payload.model_dump(exclude_unset=True)

    if "firstName" in updates:
        patient.firstName = updates["firstName"]
    if "lastName" in updates:
        patient.lastName = updates["lastName"]
    if "dateOfBirth" in updates:
        patient.dateOfBirth = updates["dateOfBirth"]
    if "gender" in updates:
        patient.gender = updates["gender"]
    if "email" in updates:
        next_email_raw = updates["email"]
        next_email = next_email_raw.strip().lower() if next_email_raw else None

        if patient.patientAccountId and next_email:
            account = session.get(Account, patient.patientAccountId)
            if account and account.email != next_email:
                email_in_use = session.exec(
                    select(Account).where(Account.email == next_email)
                ).first()
                if email_in_use and email_in_use.id != account.id:
                    raise HTTPException(status_code=409, detail="Email already in use")
                account.email = next_email
                account.updatedAt = datetime.now().isoformat()
                session.add(account)

        patient.email = next_email

    if "patientPassword" in updates:
        new_password = updates["patientPassword"]
        if new_password:
            if len(new_password) < 6:
                raise HTTPException(
                    status_code=400,
                    detail="Patient password is too short",
                )

            if not patient.patientAccountId:
                if not patient.email:
                    raise HTTPException(
                        status_code=400,
                        detail="Patient email is required before setting password",
                    )

                email_in_use = session.exec(
                    select(Account).where(Account.email == patient.email)
                ).first()
                if email_in_use:
                    raise HTTPException(status_code=409, detail="Email already in use")

                created_account = create_patient_account(
                    session=session,
                    first_name=patient.firstName,
                    last_name=patient.lastName,
                    email=patient.email,
                    password=new_password,
                )
                patient.patientAccountId = created_account.id
            else:
                account = session.get(Account, patient.patientAccountId)
                if account:
                    new_password_data = hash_password(new_password)
                    account.passwordHash = new_password_data["hash"]
                    account.passwordSalt = new_password_data["salt"]
                    account.updatedAt = datetime.now().isoformat()
                    session.add(account)
    if "phoneNumber" in updates:
        patient.phoneNumber = updates["phoneNumber"]
    if "vitals" in updates:
        vitals = updates["vitals"] or {}
        patient.vitals = json.dumps(vitals)
    if "lifestyle" in updates:
        lifestyle = updates["lifestyle"] or {}
        patient.lifestyle = json.dumps(lifestyle)
    if "medicalRecord" in updates:
        medical_record = updates["medicalRecord"] or {}
        patient.medicalRecord = json.dumps(build_medical_record(medical_record))
    
    # Update the timestamp
    patient.updatedAt = datetime.now().isoformat()

    session.add(patient)
    session.commit()
    session.refresh(patient)
    return serialize_patient(patient)

@app.post("/patients/{patient_id}/medications")
def add_patient_medication(
    patient_id: str,
    payload: MedicationPayload,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    medical_record = build_medical_record(parse_json_value(patient.medicalRecord, {}))
    medications = ensure_list(medical_record.get("medications"))
    medications.append({
        "name": payload.name.strip(),
        "dosage": payload.dosage.strip(),
        "frequency": payload.frequency.strip(),
    })
    medical_record["medications"] = medications
    patient.medicalRecord = json.dumps(medical_record)
    patient.updatedAt = datetime.now().isoformat()

    session.add(patient)
    session.commit()
    session.refresh(patient)
    return serialize_patient(patient)

@app.put("/patients/{patient_id}/medications/{medication_index}")
def update_patient_medication(
    patient_id: str,
    medication_index: int,
    payload: MedicationPayload,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    medical_record = build_medical_record(parse_json_value(patient.medicalRecord, {}))
    medications = ensure_list(medical_record.get("medications"))

    if medication_index < 0 or medication_index >= len(medications):
        raise HTTPException(status_code=404, detail="Medication not found")

    medications[medication_index] = {
        "name": payload.name.strip(),
        "dosage": payload.dosage.strip(),
        "frequency": payload.frequency.strip(),
    }
    medical_record["medications"] = medications
    patient.medicalRecord = json.dumps(medical_record)
    patient.updatedAt = datetime.now().isoformat()

    session.add(patient)
    session.commit()
    session.refresh(patient)
    return serialize_patient(patient)

@app.delete("/patients/{patient_id}/medications/{medication_index}")
def remove_patient_medication(
    patient_id: str,
    medication_index: int,
    session: Session = Depends(get_session),
):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    medical_record = build_medical_record(parse_json_value(patient.medicalRecord, {}))
    medications = ensure_list(medical_record.get("medications"))

    if medication_index < 0 or medication_index >= len(medications):
        raise HTTPException(status_code=404, detail="Medication not found")

    medications.pop(medication_index)
    medical_record["medications"] = medications
    patient.medicalRecord = json.dumps(medical_record)
    patient.updatedAt = datetime.now().isoformat()

    session.add(patient)
    session.commit()
    session.refresh(patient)
    return serialize_patient(patient)

@app.post("/consultations/analyze")
async def analyze_session(
    patient_id: str = Form(...),
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session)
):
    try:
        # 1. Save File
        os.makedirs("uploads", exist_ok=True)
        file_ext = os.path.splitext(file.filename)[1] or ".wav"
        file_path = f"uploads/{uuid.uuid4()}{file_ext}"
        
        # Rewind and read to prevent 0-byte error
        await file.seek(0)
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # 2. Transcribe (Whisper)
        raw_text = transcribe_audio(file_path)

        # 3. Analyze (Gemma/Ollama)
        ai_data = analyze_medical_transcript(raw_text)

        # --- FIX: Convert AI results to strings for SQLite ---
        ai_soap_raw = ai_data.get("soap_note", "No summary generated")
        ai_soap = ai_soap_raw
        if isinstance(ai_soap_raw, (dict, list)):
            ai_soap = json.dumps(ai_soap_raw, indent=2)

        ai_recs_raw = ai_data.get("recommendations", [])
        if isinstance(ai_recs_raw, list):
            recommendations_list = [str(item).strip() for item in ai_recs_raw if str(item).strip()]
        elif ai_recs_raw:
            recommendations_list = [str(ai_recs_raw).strip()]
        else:
            recommendations_list = []

        ai_recs = ai_recs_raw
        if isinstance(ai_recs_raw, (dict, list)):
            ai_recs = json.dumps(ai_recs_raw)

        patient = session.get(Patient, patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        doctor_account = None
        if authorization:
            try:
                account = get_account_by_access_token(authorization, session)
                if account and account.role == "doctor":
                    doctor_account = account
            except Exception:
                doctor_account = None

        if doctor_account:
            assigned_doctor_ids = ensure_list(
                parse_json_value(patient.assignedDoctorIds, [])
            )
            if doctor_account.id not in assigned_doctor_ids:
                assigned_doctor_ids.append(doctor_account.id)
                patient.assignedDoctorIds = json.dumps(assigned_doctor_ids)

        update_patient_record_from_consultation(
            patient,
            ai_soap=ai_soap_raw,
            recommendations=recommendations_list,
        )

        # 4. Save to Database
        new_visit = Consultation(
            id=str(uuid.uuid4()),
            patientId=patient_id,
            doctorId=doctor_account.id if doctor_account else "doc-001",
            transcript=raw_text,
            aiSummary=ai_soap,
            aiRecommendations=ai_recs
        )
        patient.updatedAt = datetime.now().isoformat()
        session.add(patient)
        session.add(new_visit)
        session.commit()
        session.refresh(new_visit)

        serialized_visit = serialize_consultation(new_visit, include_patient=True)
        serialized_visit["aiRecommendations"] = new_visit.aiRecommendations

        return {
            "success": True,
            "data": serialized_visit,
        }

    except Exception as e:
        print(f"❌ Error during processing: {e}")
        return {"success": False, "error": str(e)}

@app.get("/history/{patient_id}")
def get_history(patient_id: str, session: Session = Depends(get_session)):
    statement = (
        select(Consultation)
        .where(Consultation.patientId == patient_id)
        .order_by(Consultation.date.desc())
    )
    consultations = session.exec(statement).all()
    return [
        serialize_consultation(consultation, include_patient=True)
        for consultation in consultations
    ]
@app.get("/consultations/{consultation_id}/full")
def get_full_consultation_details(
    consultation_id: str, 
    session: Session = Depends(get_session)
):
    # 1. Fetch the consultation
    consultation = session.get(Consultation, consultation_id)
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    return serialize_consultation(consultation, include_patient=True)

@app.put("/consultations/{consultation_id}/notes")
def update_consultation_notes(
    consultation_id: str,
    payload: ConsultationNotesPayload,
    session: Session = Depends(get_session),
):
    consultation = session.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.doctorNotes = payload.doctorNotes
    session.add(consultation)
    session.commit()
    session.refresh(consultation)

    return serialize_consultation(consultation, include_patient=True)
@app.get("/all-visits")
def get_all_visits_with_names(session: Session = Depends(get_session)):
    """
    Returns every consultation in the database, 
    including the patient's full name for each one.
    """
    # 1. Fetch all consultations
    statement = select(Consultation)
    results = session.exec(statement).all()
    
    output = []
    for visit in results:
        # Get the patient object linked to this visit
        patient = visit.patient 
        
        # Parse the recommendations back from string to list
        try:
            recs = json.loads(visit.aiRecommendations or "[]")
        except:
            recs = [visit.aiRecommendations]

        output.append({
            "visit_id": visit.id,
            "date": visit.date,
            "patient_name": f"{patient.firstName} {patient.lastName}" if patient else "Unknown",
            "patient_id": visit.patientId,
            "transcript": visit.transcript,
            "soap_note": visit.aiSummary,
            "diagnosis": recs
        })
        
    return output
