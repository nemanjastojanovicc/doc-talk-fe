import httpClient from 'api/httpClient';
import { Patient } from 'models/Patient';

export const basicPatientsPath = (routePath = '') =>
  `patients${routePath && '/'}${routePath}`;

export const myPatientPath = () => basicPatientsPath('me');
export const myPatientAiChatPath = () => basicPatientsPath('me/ai-chat');
export const myPatientAiChatHistoryPath = () =>
  basicPatientsPath('me/ai-chat-history');
export const myPatientAiChatSummaryPath = () =>
  basicPatientsPath('me/ai-chat-summary');
export const doctorNotificationsPath = () => 'doctor/notifications';
export const patientAiChatHistoryPath = (patientId: string) =>
  basicPatientsPath(`${patientId}/ai-chat-history`);
export const patientMedicationsPath = (
  patientId: string,
  medicationIndex?: number,
) =>
  basicPatientsPath(
    `${patientId}/medications${medicationIndex === undefined ? '' : `/${medicationIndex}`}`,
  );

export type PatientAiChatMessage = {
  id: string;
  patientId: string;
  accountId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type PatientAiChatSummary = {
  summary: string;
  keyPoints: string[];
  warningSignals: string[];
  suggestedDoctorTopics: string[];
};

export type DoctorNotification = {
  id: string;
  patientId: string;
  doctorAccountId: string;
  sourceMessage: string;
  aiReason: string;
  status: 'new' | 'added_to_chart' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    fullName: string;
  };
};

export async function getPatients() {
  const { data } = await httpClient.get<Patient[]>(basicPatientsPath());
  return data;
}

export async function getPatient(patientId: string) {
  const { data } = await httpClient.get<Patient>(basicPatientsPath(patientId));
  return data;
}

export async function getMyPatient() {
  const { data } = await httpClient.get<Patient>(myPatientPath());
  return data;
}

export async function askMyPatientAi(question: string) {
  const { data } = await httpClient.post<{ answer: string }>(
    myPatientAiChatPath(),
    {
      question,
    },
  );
  return data;
}

export async function getMyPatientAiChatHistory() {
  const { data } = await httpClient.get<PatientAiChatMessage[]>(
    myPatientAiChatHistoryPath(),
  );
  return data;
}

export async function getPatientAiChatHistory(patientId: string) {
  const { data } = await httpClient.get<PatientAiChatMessage[]>(
    patientAiChatHistoryPath(patientId),
  );
  return data;
}

export async function addPatientMedication(
  patientId: string,
  payload: { name: string; dosage: string; frequency: string },
) {
  const { data } = await httpClient.post<Patient>(
    patientMedicationsPath(patientId),
    payload,
  );
  return data;
}

export async function updatePatientMedication(
  patientId: string,
  medicationIndex: number,
  payload: { name: string; dosage: string; frequency: string },
) {
  const { data } = await httpClient.put<Patient>(
    patientMedicationsPath(patientId, medicationIndex),
    payload,
  );
  return data;
}

export async function removePatientMedication(
  patientId: string,
  medicationIndex: number,
) {
  const { data } = await httpClient.delete<Patient>(
    patientMedicationsPath(patientId, medicationIndex),
  );
  return data;
}

export async function getMyPatientAiChatSummary() {
  const { data } = await httpClient.post<PatientAiChatSummary>(
    myPatientAiChatSummaryPath(),
  );
  return data;
}

export async function getDoctorNotifications() {
  const { data } = await httpClient.get<DoctorNotification[]>(
    doctorNotificationsPath(),
  );
  return data;
}

export async function reviewDoctorNotification(
  notificationId: string,
  addToChart: boolean,
) {
  const { data } = await httpClient.post<DoctorNotification>(
    `${doctorNotificationsPath()}/${notificationId}/review`,
    { addToChart },
  );
  return data;
}

export type CreatePatientPayload = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Patient['gender'];
  email?: string;
  patientPassword?: string;
  phoneNumber?: string;
  heightCm?: string;
  weightKg?: string;
  bloodPressure?: string;
  smoking?: NonNullable<Patient['lifestyle']>['smoking'] | '';
  alcohol?: NonNullable<Patient['lifestyle']>['alcohol'] | '';
  stressLevel?: string;
  medicalRecord?: UpdateMedicalRecordPayload;
};

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

type UpdateMedicalRecordPayload = {
  chronicConditions?: string[];
  allergies?: string[];
  diagnosesHistory?: string[];
  patientReportedInfo?: string[];
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
};

const toNumberOrNull = (value?: string) => {
  if (value === undefined) return undefined;
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildPatientPayload = (
  payload: CreatePatientPayload | UpdatePatientPayload,
) => {
  const vitals =
    payload.heightCm !== undefined ||
    payload.weightKg !== undefined ||
    payload.bloodPressure !== undefined
      ? {
          heightCm: toNumberOrNull(payload.heightCm),
          weightKg: toNumberOrNull(payload.weightKg),
          bloodPressure: payload.bloodPressure?.trim() || null,
        }
      : undefined;
  const lifestyle =
    payload.smoking !== undefined ||
    payload.alcohol !== undefined ||
    payload.stressLevel !== undefined
      ? {
          smoking: payload.smoking || null,
          alcohol: payload.alcohol || null,
          stressLevel: toNumberOrNull(payload.stressLevel),
        }
      : undefined;

  return {
    firstName: payload.firstName?.trim() || null,
    lastName: payload.lastName?.trim() || null,
    dateOfBirth: payload.dateOfBirth,
    gender: payload.gender,
    email: payload.email?.trim() || undefined,
    phoneNumber: payload.phoneNumber?.trim() || undefined,
    patientPassword: payload.patientPassword?.trim() || undefined,
    vitals,
    lifestyle,
    medicalRecord: payload.medicalRecord,
  };
};

export async function createPatient(payload: CreatePatientPayload) {
  const { data } = await httpClient.post<Patient>(basicPatientsPath(), {
    ...buildPatientPayload(payload),
  });

  return data;
}

export async function updatePatient(
  patientId: string,
  payload: UpdatePatientPayload,
) {
  const { data } = await httpClient.put<Patient>(
    basicPatientsPath(patientId),
    buildPatientPayload(payload),
  );

  return data;
}
