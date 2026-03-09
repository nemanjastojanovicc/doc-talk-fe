import httpClient from 'api/httpClient';
import { ConsultationSummary } from 'models/Patient';

export const consultationHistoryPath = (patientId: string) =>
  `history/${patientId}`;

export const consultationFullPath = (consultationId: string) =>
  `consultations/${consultationId}/full`;

export const consultationNotesPath = (consultationId: string) =>
  `consultations/${consultationId}/notes`;

export async function analyzeConsultation(patientId: string, file: File) {
  const form = new FormData();
  form.append('patient_id', patientId);
  form.append('file', file);

  const { data } = await httpClient.post('/consultations/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}

export async function getConsultationHistory(
  patientId: string,
): Promise<ConsultationSummary[]> {
  const { data } = await httpClient.get<ConsultationSummary[]>(
    consultationHistoryPath(patientId),
  );
  return data;
}

export async function getConsultationFull(
  consultationId: string,
): Promise<ConsultationSummary> {
  const { data } = await httpClient.get<ConsultationSummary>(
    consultationFullPath(consultationId),
  );

  return data;
}

export async function updateConsultationNotes(
  consultationId: string,
  doctorNotes: string,
): Promise<ConsultationSummary> {
  const { data } = await httpClient.put<ConsultationSummary>(
    consultationNotesPath(consultationId),
    { doctorNotes },
  );
  return data;
}
