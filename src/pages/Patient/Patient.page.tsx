import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import BasicSpeechRecorder from 'components/BasicSpeechRecorder';
import { patients } from 'mock/patients';
import { needsAttention } from 'pages/Home/Home.page';
import { useNavigate, useParams } from 'react-router-dom';

const calculateAge = (dateOfBirth: string): number => {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = patients.find((pat) => pat.id === id);
  if (!patient) return null;

  const age = calculateAge(patient.dateOfBirth);
  const attention = needsAttention(patient);

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

        <Stack direction="row" spacing={1}>
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
      </Box>

      <BasicSpeechRecorder
        patientId={'1'}
        onUploaded={(res) => {
          console.log(res);
        }}
      />

      {/* CONSULTATIONS */}
      <Card>
        <CardContent>
          <Typography variant="h6">Consultations</Typography>

          {patient.consultations.length ? (
            <Stack spacing={2} mt={2}>
              {patient.consultations.map((c) => (
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
                      <Typography fontWeight={500}>{c.date}</Typography>

                      {c.aiSummary && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Typography variant="body2" color="text.secondary">
                            AI: {c.aiSummary}
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
