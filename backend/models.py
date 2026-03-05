from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from uuid import uuid4
from datetime import datetime


class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    firstName: str
    lastName: str
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now().isoformat())

    account: Optional["Account"] = Relationship(back_populates="user")


class Account(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    email: str = Field(index=True)
    passwordHash: str
    passwordSalt: Optional[str] = None
    role: str = "user"
    isEmailVerified: Optional[bool] = False
    pendingEmail: Optional[bool] = None
    state: str = "active"
    userId: str = Field(foreign_key="user.id", index=True)
    roles: str = '["user"]'
    accessToken: Optional[str] = None
    refreshToken: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now().isoformat())

    user: Optional[User] = Relationship(back_populates="account")

# --- PATIENT TABLE ---
class Patient(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    patientAccountId: Optional[str] = None
    firstName: str
    lastName: str
    dateOfBirth: str
    gender: str
    isActive: bool = True
    
    # Contact info
    email: Optional[str] = None
    phoneNumber: Optional[str] = None
    
    # Store these as strings (JSON) to keep SQLite simple
    medicalRecord: str = "{}" 
    vitals: str = "{}"         
    lifestyle: str = "{}"      
    assignedDoctorIds: str = "[]"
    
    # Timestamps
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now().isoformat())

    # Link to consultations
    consultations: List["Consultation"] = Relationship(back_populates="patient")

# --- CONSULTATION TABLE ---
class Consultation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    patientId: str = Field(foreign_key="patient.id")
    date: str = Field(default_factory=lambda: datetime.now().isoformat())
    doctorId: str = "doc-001"
    
    transcript: Optional[str] = None
    doctorNotes: Optional[str] = None      # Doctor's manual notes
    aiSummary: Optional[str] = None        # Stores the SOAP note as text
    aiRecommendations: Optional[str] = "[]" # Stores the list as a JSON string

    # Link back to patient
    patient: Optional[Patient] = Relationship(back_populates="consultations")


class PatientAiChatMessage(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    patientId: str = Field(index=True)
    accountId: str = Field(index=True)
    role: str
    content: str
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())


class DoctorNotification(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    patientId: str = Field(index=True)
    doctorAccountId: str = Field(index=True)
    sourceMessage: str
    aiReason: str
    status: str = "new"
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now().isoformat())