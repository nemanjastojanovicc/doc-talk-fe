import httpClient from 'api/httpClient';
import { Patient } from 'models/Patient';

export const basicPatientsPath = (routePath = '') =>
  `patients${routePath && '/'}${routePath}`;

export const myPatientPath = () => basicPatientsPath('me');

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
};

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

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
    firstName: payload.firstName,
    lastName: payload.lastName,
    dateOfBirth: payload.dateOfBirth,
    gender: payload.gender,
    email: payload.email?.trim() || undefined,
    phoneNumber: payload.phoneNumber?.trim() || undefined,
    patientPassword: payload.patientPassword?.trim() || undefined,
    vitals,
    lifestyle,
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
