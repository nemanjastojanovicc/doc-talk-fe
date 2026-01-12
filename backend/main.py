import os
import shutil
import uuid
import json
from contextlib import asynccontextmanager
from typing import Any, Dict, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlmodel import Session, create_engine, select, SQLModel

# Import your custom logic
from models import Patient, Consultation
from ai_engine import transcribe_audio, analyze_medical_transcript

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
    }

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
        "createdAt": "",
        "updatedAt": "",
    }

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
        "date": consultation.date,
        "doctorId": consultation.doctorId,
        "transcript": consultation.transcript,
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

class PatientCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    firstName: str
    lastName: str
    dateOfBirth: str
    gender: str
    vitals: PatientVitals | None = None
    lifestyle: PatientLifestyle | None = None

class PatientUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    firstName: str | None = None
    lastName: str | None = None
    dateOfBirth: str | None = None
    gender: str | None = None
    vitals: PatientVitals | None = None
    lifestyle: PatientLifestyle | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_db_and_tables()
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
    vitals = payload.vitals.model_dump() if payload.vitals else {}
    lifestyle = payload.lifestyle.model_dump() if payload.lifestyle else {}

    new_patient = Patient(
        firstName=payload.firstName,
        lastName=payload.lastName,
        dateOfBirth=payload.dateOfBirth,
        gender=payload.gender,
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
    if "vitals" in updates:
        vitals = updates["vitals"] or {}
        patient.vitals = json.dumps(vitals)
    if "lifestyle" in updates:
        lifestyle = updates["lifestyle"] or {}
        patient.lifestyle = json.dumps(lifestyle)

    session.add(patient)
    session.commit()
    session.refresh(patient)
    return serialize_patient(patient)

@app.post("/consultations/analyze")
async def analyze_session(
    patient_id: str = Form(...),
    file: UploadFile = File(...),
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
        ai_soap = ai_data.get("soap_note", "No summary generated")
        if isinstance(ai_soap, (dict, list)):
            ai_soap = json.dumps(ai_soap, indent=2)

        ai_recs = ai_data.get("recommendations", [])
        if isinstance(ai_recs, (dict, list)):
            ai_recs = json.dumps(ai_recs)

        # 4. Save to Database
        new_visit = Consultation(
            id=str(uuid.uuid4()),
            patientId=patient_id,
            doctorId="doc-001",
            transcript=raw_text,
            aiSummary=ai_soap,
            aiRecommendations=ai_recs
        )
        session.add(new_visit)
        session.commit()
        session.refresh(new_visit)

        return {
            "success": True,
            "data": serialize_consultation(new_visit, include_patient=True),
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
