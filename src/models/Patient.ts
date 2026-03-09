export type Gender = 'male' | 'female' | 'other';

export type LifestyleHabits = {
  smoking: 'never' | 'former' | 'current';
  alcohol: 'none' | 'moderate' | 'frequent';
  physicalActivity: 'low' | 'moderate' | 'high';
  diet?: 'balanced' | 'poor' | 'special';
  stressLevel?: 1 | 2 | 3 | 4 | 5;
};

export type Medication = {
  index?: number;
  name: string;
  dosage: string;
  frequency: string;
  startedAt?: string;
};

export type MedicalRecord = {
  chronicConditions: string[];
  allergies: string[];
  medications: Medication[];
  diagnosesHistory: string[];
  patientReportedInfo?: string[];
};

export type Vitals = {
  heightCm?: number;
  weightKg?: number;
  bloodPressure?: string;
  heartRate?: number;
};

export type ConsultationSummary = {
  id: string;
  date: string;
  doctorId: string;
  transcript?: string;
  doctorNotes?: string;
  aiSummary?: string;
  aiRecommendations?: string[];

  patient: Patient;
};

export type Patient = {
  id: string;

  // Identity
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;

  // Contact
  email?: string;
  phoneNumber?: string;

  // Medical data
  medicalRecord: MedicalRecord;
  vitals?: Vitals;
  lifestyle?: LifestyleHabits;

  // DocTalk core
  consultations: ConsultationSummary[];

  // System
  assignedDoctorIds: string[];
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};
