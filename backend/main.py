import os
import shutil
import uuid
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
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

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_db_and_tables()
    with Session(engine) as session:
        # Seed a dummy patient if none exists
        if not session.exec(select(Patient)).first():
            dummy = Patient(
                id="patient-123", 
                firstName="John", 
                lastName="Doe", 
                dateOfBirth="1980-01-01", 
                gender="male"
            )
            session.add(dummy)
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
    return session.exec(select(Patient)).all()

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

        return {"success": True, "data": new_visit}

    except Exception as e:
        print(f"❌ Error during processing: {e}")
        return {"success": False, "error": str(e)}

@app.get("/history/{patient_id}")
def get_history(patient_id: str, session: Session = Depends(get_session)):
    statement = select(Consultation).where(Consultation.patientId == patient_id)
    return session.exec(statement).all()
@app.get("/consultations/{consultation_id}/full")
def get_full_consultation_details(
    consultation_id: str, 
    session: Session = Depends(get_session)
):
    """
    Returns the complete information for a specific visit, 
    including the patient's name and identity details.
    """
    # 1. Fetch the consultation
    consultation = session.get(Consultation, consultation_id)
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # 2. Because of our Relationship in models.py, 
    # we can easily access the patient data
    patient = consultation.patient

    # 3. Clean up the AI Recommendations (turn JSON string back into a list)
    try:
        recommendations = json.loads(consultation.aiRecommendations or "[]")
    except:
        recommendations = [consultation.aiRecommendations]

    # 4. Return a combined "Report" object
    return {
        "consultation_id": consultation.id,
        "date": consultation.date,
        "patient": {
            "id": patient.id,
            "fullName": f"{patient.firstName} {patient.lastName}",
            "dob": patient.dateOfBirth
        },
        "medical_results": {
            "transcript": consultation.transcript,
            "soap_note": consultation.aiSummary,
            "diagnoses": recommendations
        }
    }
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