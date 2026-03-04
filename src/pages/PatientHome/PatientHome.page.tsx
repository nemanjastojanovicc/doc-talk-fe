import { useQuery } from '@tanstack/react-query';
import { getMyPatient, myPatientPath } from 'api/patients';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from 'hooks';

const PatientHomePage = () => {
  const { account } = useAuth();
  const isPatient =
    account?.role === 'patient' || account?.roles?.includes('patient');

  const { data: patient } = useQuery({
    queryKey: [myPatientPath(), account?.id],
    queryFn: getMyPatient,
    enabled: Boolean(account?.id) && isPatient,
    refetchOnMount: 'always',
  });

  if (!patient) return null;

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        My Health
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6">Personal info</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>{patient.fullName}</Typography>
          <Typography color="text.secondary">
            {patient.gender} • {patient.dateOfBirth}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Vitals</Typography>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Height: ${patient.vitals?.heightCm ?? '—'} cm`} />
            <Chip label={`Weight: ${patient.vitals?.weightKg ?? '—'} kg`} />
            <Chip label={`BP: ${patient.vitals?.bloodPressure ?? '—'}`} />
            <Chip label={`Heart rate: ${patient.vitals?.heartRate ?? '—'}`} />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Diagnoses (from consultations)</Typography>
          <Divider sx={{ my: 1 }} />
          {patient.medicalRecord.diagnosesHistory.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {patient.medicalRecord.diagnosesHistory.map((diagnosis) => (
                <Chip key={diagnosis} label={diagnosis} color="warning" />
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No diagnoses yet</Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Therapies / Medications</Typography>
          <Divider sx={{ my: 1 }} />
          {patient.medicalRecord.medications.length ? (
            <Stack spacing={1}>
              {patient.medicalRecord.medications.map((medication) => (
                <Box key={medication.name}>
                  <Typography fontWeight={600}>{medication.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {medication.dosage} • {medication.frequency}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No active medications</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientHomePage;
