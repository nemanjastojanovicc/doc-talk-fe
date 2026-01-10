import httpClient from 'api/httpClient';

export async function analyzeConsultation(patientId: string, file: File) {
  const form = new FormData();
  form.append('patient_id', patientId);
  form.append('file', file);

  const { data } = await httpClient.post('/consultations/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
