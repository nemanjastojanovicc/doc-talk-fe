import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  askMyPatientAi,
  getMyPatient,
  getMyPatientAiChatHistory,
  myPatientAiChatHistoryPath,
  myPatientPath,
} from 'api/patients';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
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

  const [question, setQuestion] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);

  const {
    data: chatMessages = [],
    refetch: refetchChatHistory,
  } = useQuery({
    queryKey: [myPatientAiChatHistoryPath(), account?.id],
    queryFn: getMyPatientAiChatHistory,
    enabled: Boolean(account?.id) && isPatient,
  });

  const askAiMutation = useMutation({
    mutationFn: (text: string) => askMyPatientAi(text),
    onSuccess: async () => {
      await refetchChatHistory();
      setQuestion('');
      setChatError(null);
    },
    onError: (error: any) => {
      setChatError(error?.detail ?? error?.message ?? 'AI request failed');
    },
  });

  const handleAskAi = () => {
    const text = question.trim();
    if (!text || askAiMutation.isPending) return;
    askAiMutation.mutate(text);
  };

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

      <Card>
        <CardContent>
          <Typography variant="h6">AI Health Assistant</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Ask about your record or general medical explanations related to your symptoms.
          </Typography>
          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1.25} sx={{ maxHeight: 240, overflowY: 'auto', mb: 1.5 }}>
            {chatMessages.length ? (
              chatMessages.map((message, index) => (
                <Box
                  key={`${message.role}-${index}`}
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    px: 1.25,
                    py: 0.9,
                    borderRadius: 1.5,
                    bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </Typography>
                  <Typography variant="body2">{message.content}</Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary" variant="body2">
                No questions yet.
              </Typography>
            )}
          </Stack>

          {chatError && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {chatError}
            </Typography>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              placeholder="Ask about my medications, allergies, or illness..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && question.trim()) {
                  handleAskAi();
                }
              }}
            />
            <Button
              variant="contained"
              disabled={!question.trim() || askAiMutation.isPending}
              onClick={handleAskAi}
            >
              Ask AI
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientHomePage;
