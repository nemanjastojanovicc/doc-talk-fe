import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import { Button } from 'components';
import BasicSpeechRecorder from 'components/BasicSpeechRecorder';
import { needsAttention } from 'pages/Home/Home.page';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_PATHS } from 'api';
import {
  doctorNotificationsPath,
  getDoctorNotifications,
  getPatientAiChatHistory,
  patientAiChatHistoryPath,
  getPatient,
  reviewDoctorNotification,
  updatePatient,
} from 'api/patients';
import { getConsultationHistory } from 'api/consultations';
import { Patient } from 'models/Patient';
import EditPatientModal from './EditPatientModal';
import type { EditPatientForm } from './EditPatientModal';
import { calculateAge, formatAiSummary } from './utils';
import utils from 'utils';

const splitLines = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationWayOfUse, setMedicationWayOfUse] = useState('');
  const [medicationError, setMedicationError] = useState<string | null>(null);

  const { data: patient } = useQuery({
    queryKey: [API_PATHS.patients.basicPatientsPath(id ?? '')],
    queryFn: () => getPatient(id ?? ''),
    enabled: Boolean(id),
  });

  const { data: historyData } = useQuery({
    queryKey: [API_PATHS.consultations.consultationHistoryPath(id ?? '')],
    queryFn: () => getConsultationHistory(id ?? ''),
    enabled: Boolean(id),
  });

  const { data: doctorNotifications = [] } = useQuery({
    queryKey: [doctorNotificationsPath()],
    queryFn: getDoctorNotifications,
  });

  const { data: patientChatMessages = [] } = useQuery({
    queryKey: [patientAiChatHistoryPath(id ?? '')],
    queryFn: () => getPatientAiChatHistory(id ?? ''),
    enabled: Boolean(id),
  });

  const patientId = patient?.id ?? '';

  const updatePatientMutation = useMutation({
    mutationFn: (payload: EditPatientForm) =>
      updatePatient(patientId, {
        ...payload,
        medicalRecord: {
          chronicConditions: splitLines(payload.chronicConditions),
          allergies: splitLines(payload.allergies),
          diagnosesHistory: splitLines(payload.diagnosesHistory),
          patientReportedInfo: splitLines(payload.patientReportedInfo),
          medications: patient.medicalRecord.medications,
        },
      }),
    onSuccess: (updatedPatient) => {
      queryClient.setQueryData(
        [API_PATHS.patients.basicPatientsPath(updatedPatient.id)],
        updatedPatient,
      );
      queryClient.setQueryData<Patient[]>(
        [API_PATHS.patients.basicPatientsPath()],
        (prev = []) =>
          prev.length
            ? prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
            : [updatedPatient],
      );
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      setEditError(error?.detail ?? error?.message ?? 'Save failed');
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: (nextMedication: {
      name: string;
      dosage: string;
      frequency: string;
    }) =>
      updatePatient(patientId, {
        medicalRecord: {
          chronicConditions: patient.medicalRecord.chronicConditions,
          allergies: patient.medicalRecord.allergies,
          diagnosesHistory: patient.medicalRecord.diagnosesHistory,
          patientReportedInfo: patient.medicalRecord.patientReportedInfo ?? [],
          medications: [...patient.medicalRecord.medications, nextMedication],
        },
      }),
    onSuccess: (updatedPatient) => {
      queryClient.setQueryData(
        [API_PATHS.patients.basicPatientsPath(updatedPatient.id)],
        updatedPatient,
      );
      queryClient.setQueryData<Patient[]>(
        [API_PATHS.patients.basicPatientsPath()],
        (prev = []) =>
          prev.length
            ? prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
            : [updatedPatient],
      );
      setMedicationName('');
      setMedicationDosage('');
      setMedicationWayOfUse('');
      setMedicationError(null);
    },
    onError: (error: any) => {
      setMedicationError(error?.detail ?? error?.message ?? 'Medication save failed');
    },
  });

  const reviewNotificationMutation = useMutation({
    mutationFn: ({ notificationId, addToChart }: { notificationId: string; addToChart: boolean }) =>
      reviewDoctorNotification(notificationId, addToChart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [doctorNotificationsPath()] });
      queryClient.invalidateQueries({
        queryKey: [API_PATHS.patients.basicPatientsPath(id ?? '')],
      });
    },
  });

  if (!patient) return null;

  const age = calculateAge(patient.dateOfBirth);
  const attention = needsAttention(patient);
  const consultations = historyData ?? patient.consultations ?? [];
  const patientNotifications = doctorNotifications.filter(
    (notification) => notification.patientId === patient.id,
  );
  const actionableNotifications = patientNotifications.filter(
    (notification) => notification.status === 'new',
  );

  const patientUpdatedInfo = Array.from(
    new Set([
      ...(patient.medicalRecord.patientReportedInfo ?? []),
      ...patientNotifications
        .filter((notification) => notification.status !== 'dismissed')
        .map((notification) => notification.sourceMessage.trim())
        .filter(Boolean),
      ...patientChatMessages
        .filter((message) => message.role === 'user')
        .map((message) => message.content.trim())
        .filter(Boolean),
    ]),
  );

  const handleAddMedication = () => {
    const name = medicationName.trim();
    const dosage = medicationDosage.trim();
    const frequency = medicationWayOfUse.trim();

    if (!name || !dosage || !frequency || addMedicationMutation.isPending) {
      setMedicationError('Please fill medication, dosage and way of use');
      return;
    }

    addMedicationMutation.mutate({ name, dosage, frequency });
  };

  return (
    <Box
      sx={{
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'grey.50',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {patient.firstName} {patient.lastName}
          </Typography>
          <Typography color="text.secondary">
            {patient.gender} • {age} years
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="Active"
            color={patient.isActive ? 'primary' : 'default'}
            variant={patient.isActive ? 'filled' : 'outlined'}
          />
          <Chip
            label="Needs attention"
            color={attention ? 'warning' : 'default'}
            variant={attention ? 'filled' : 'outlined'}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setEditError(null);
              setIsEditOpen(true);
            }}
          >
            Edit
          </Button>
        </Stack>
      </Box>

      {/* INFO GRID */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* CONTACT */}
        <Card>
          <CardContent>
            <Typography variant="h6">Contact</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              Email: {patient.email ?? '—'}
            </Typography>
            <Typography variant="body2">
              Phone: {patient.phoneNumber ?? '—'}
            </Typography>
          </CardContent>
        </Card>

        {/* SYSTEM */}
        <Card>
          <CardContent>
            <Typography variant="h6">System</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              Assigned doctors: {patient.assignedDoctorIds.length}
            </Typography>
            <Typography variant="body2">
              Created at: {patient.createdAt}
            </Typography>
          </CardContent>
        </Card>

        {/* MEDICAL */}
        <Card>
          <CardContent>
            <Typography variant="h6">Medical record</Typography>
            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2">Chronic conditions</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {patient.medicalRecord.chronicConditions.length ? (
                patient.medicalRecord.chronicConditions.map((c) => (
                  <Chip key={c} label={c} color="warning" />
                ))
              ) : (
                <Chip label="None" variant="outlined" />
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2">Allergies</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {patient.medicalRecord.allergies.length ? (
                patient.medicalRecord.allergies.map((a) => (
                  <Chip key={a} label={a} color="error" />
                ))
              ) : (
                <Chip label="None" variant="outlined" />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* MEDICATIONS */}
        <Card>
          <CardContent>
            <Typography variant="h6">Medications</Typography>
            <Divider sx={{ my: 1 }} />
            {patient.medicalRecord.medications.length ? (
              <Stack spacing={1}>
                {patient.medicalRecord.medications.map((m) => (
                  <Box key={m.name}>
                    <Typography fontWeight={500}>{m.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {m.dosage} • {m.frequency}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No active therapy</Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Add medication
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                label="Medication"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Dosage"
                value={medicationDosage}
                onChange={(e) => setMedicationDosage(e.target.value)}
                fullWidth
              />
              <TextField
                label="Way of use"
                value={medicationWayOfUse}
                onChange={(e) => setMedicationWayOfUse(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleAddMedication}
                disabled={addMedicationMutation.isPending}
              >
                Add
              </Button>
            </Stack>
            {medicationError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {medicationError}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* VITALS & LIFESTYLE */}
        <Card sx={{ gridColumn: '1 / -1' }}>
          <CardContent>
            <Typography variant="h6">Vitals & lifestyle</Typography>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Height: ${patient.vitals?.heightCm ?? '—'} cm`} />
              <Chip label={`Weight: ${patient.vitals?.weightKg ?? '—'} kg`} />
              <Chip label={`BP: ${patient.vitals?.bloodPressure ?? '—'}`} />
              <Chip label={`Smoking: ${patient.lifestyle?.smoking ?? '—'}`} />
              <Chip label={`Alcohol: ${patient.lifestyle?.alcohol ?? '—'}`} />
              <Chip
                label={`Stress: ${patient.lifestyle?.stressLevel ?? '—'}`}
                color={
                  (patient.lifestyle?.stressLevel ?? 0) >= 4
                    ? 'warning'
                    : 'default'
                }
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ gridColumn: '1 / -1' }}>
          <CardContent>
            <Typography variant="h6">Information updated from the patient</Typography>
            <Divider sx={{ my: 1 }} />
            {patientUpdatedInfo.length ? (
              <Stack spacing={1}>
                {patientUpdatedInfo.map((entry) => (
                  <Typography key={entry} variant="body2">
                    • {entry}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No patient-reported info recorded
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ gridColumn: '1 / -1' }}>
          <CardContent>
            <Typography variant="h6">AI detected significant patient info</Typography>
            <Divider sx={{ my: 1 }} />
            {actionableNotifications.length ? (
              <Stack spacing={1.5}>
                {actionableNotifications.map((notification) => (
                  <Box key={notification.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.25 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {notification.patient?.fullName ?? `${patient.firstName} ${patient.lastName}`}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      “{notification.sourceMessage}”
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AI reason: {notification.aiReason}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() =>
                          reviewNotificationMutation.mutate({
                            notificationId: notification.id,
                            addToChart: true,
                          })
                        }
                        disabled={reviewNotificationMutation.isPending}
                      >
                        Add to chart
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          reviewNotificationMutation.mutate({
                            notificationId: notification.id,
                            addToChart: false,
                          })
                        }
                        disabled={reviewNotificationMutation.isPending}
                      >
                        Dismiss
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No new AI notifications for this patient</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <BasicSpeechRecorder
        patientId={patient.id}
        onUploaded={() => undefined}
      />

      <EditPatientModal
        open={isEditOpen}
        patient={patient}
        onClose={() => setIsEditOpen(false)}
        onSave={(form) => updatePatientMutation.mutate(form)}
        isSaving={updatePatientMutation.isPending}
        error={editError}
      />

      {/* CONSULTATIONS */}
      <Card>
        <CardContent>
          <Typography variant="h6">Consultations</Typography>

          {consultations.length ? (
            <Stack spacing={2} mt={2}>
              {consultations.map((c) => (
                <Box
                  key={c.id}
                  onClick={() => navigate(`consultations/${c.id}`)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                  >
                    <Stack direction="column" justifyContent="space-between">
                      <Typography fontWeight={500}>
                        {utils.formatDate(c.date)}
                      </Typography>

                      {c.aiSummary && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Typography variant="body2" color="text.secondary">
                            AI: {formatAiSummary(c.aiSummary)}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Chip label="See consultation" size="small" color="info" />
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No consultations yet</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientDetailsPage;
