import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { Patient } from 'models/Patient';
import { needsAttention } from './Home.page';

type Props = {
  patients: Patient[];
};

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

const PatientCardList = ({ patients }: Props) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
        width: '100%',
      }}
    >
      {patients.map((patient) => {
        const age = calculateAge(patient.dateOfBirth);
        const attention = needsAttention(patient);

        return (
          <Card
            key={patient.id}
            onClick={() => navigate(`/patient/${patient.id}`)}
            sx={{
              height: '100%',
              borderRadius: 3,
              cursor: 'pointer',
              transition: '0.2s',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              {/* Header */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    // bgcolor: 'primary.main',
                    bgcolor: 'active.main',
                    width: 48,
                    height: 48,
                  }}
                >
                  <PersonIcon />
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {patient.firstName} {patient.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {patient.gender} • {age} years
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Medical */}
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalHospitalIcon fontSize="small" color="error" />
                  <Typography variant="subtitle2">
                    Chronic conditions
                  </Typography>
                </Stack>

                {patient.medicalRecord.chronicConditions.length > 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    {patient.medicalRecord.chronicConditions.map((c) => (
                      <Chip key={c} label={c} size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    None reported
                  </Typography>
                )}

                <Stack direction="row" spacing={1} alignItems="center">
                  <MedicationIcon fontSize="small" color="error" />
                  <Typography variant="subtitle2">Medications</Typography>
                </Stack>

                {patient.medicalRecord.medications.length > 0 ? (
                  <Stack spacing={0.5}>
                    {patient.medicalRecord.medications.map((m) => (
                      <Typography
                        key={m.name}
                        variant="body2"
                        color="text.secondary"
                      >
                        {m.name} ({m.dosage})
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No active therapy
                  </Typography>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Footer */}
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <PsychologyIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Stress: {patient.lifestyle?.stressLevel ?? 'N/A'}
                  </Typography>
                </Stack>

                {/* STATUS CHIPS */}
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    size="small"
                    label="Active"
                    color={patient.isActive ? 'primary' : 'default'}
                    variant={patient.isActive ? 'filled' : 'outlined'}
                  />

                  <Chip
                    size="small"
                    label="Needs attention"
                    color={attention ? 'warning' : 'default'}
                    variant={attention ? 'filled' : 'outlined'}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default PatientCardList;
