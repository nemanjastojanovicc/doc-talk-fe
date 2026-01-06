from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

# --- PATIENT TABLE ---
class Patient(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    firstName: str
    lastName: str
    dateOfBirth: str
    gender: str
    isActive: bool = True
    
    # Store these as strings (JSON) to keep SQLite simple
    medicalRecord: str = "{}" 
    vitals: str = "{}"         
    lifestyle: str = "{}"      
    assignedDoctorIds: str = "[]"

    # Link to consultations
    consultations: List["Consultation"] = Relationship(back_populates="patient")

# --- CONSULTATION TABLE ---
class Consultation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    patientId: str = Field(foreign_key="patient.id")
    date: str = Field(default_factory=lambda: datetime.now().isoformat())
    doctorId: str = "doc-001"
    
    transcript: Optional[str] = None
    aiSummary: Optional[str] = None        # Stores the SOAP note as text
    aiRecommendations: Optional[str] = "[]" # Stores the list as a JSON string

    # Link back to patient
    patient: Optional[Patient] = Relationship(back_populates="consultations")