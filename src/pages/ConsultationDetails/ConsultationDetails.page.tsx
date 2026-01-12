import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Chip,
  Button,
  TextField,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API_PATHS } from 'api';
import { getConsultationFull } from 'api/consultations';
import utils from 'utils';
import { formatAiSummary } from 'pages/Patient/utils';

const ConsultationDetailsPage = () => {
  const { consultationId } = useParams();

  const { data: consultation } = useQuery({
    queryKey: [
      API_PATHS.consultations.consultationFullPath(consultationId ?? ''),
    ],
    queryFn: () => getConsultationFull(consultationId ?? ''),
    enabled: Boolean(consultationId),
  });

  console.log({ consultation });

  if (!consultation) return <></>;

  return (
    <Box
      sx={{
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Consultation
          </Typography>
          <Typography color="text.secondary">
            {consultation.patient?.fullName} •{' '}
            {utils.formatDate(consultation.date)}
          </Typography>
        </Box>

        <Chip label="Completed" color="primary" />
      </Box>

      {/* AI Summary */}
      {consultation.aiSummary && (
        <Card
          sx={{
            borderLeft: '4px solid',
            borderColor: 'primary.main',
          }}
        >
          <CardContent>
            <Typography variant="h6">AI Summary</Typography>
            <Divider sx={{ my: 1 }} />

            <Typography variant="body2">
              {formatAiSummary(consultation.aiSummary)}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Doctor Notes – CORE */}
      <Card>
        <CardContent>
          <Typography variant="h6">Doctor notes</Typography>
          <Divider sx={{ my: 1 }} />

          <TextField
            fullWidth
            multiline
            minRows={6}
            defaultValue={consultation.doctorNotes}
            placeholder="Write your medical notes, conclusions, decisions..."
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 2,
            }}
          >
            <Button variant="contained" startIcon={<SaveIcon />}>
              Save notes
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {consultation.aiRecommendations?.length ? (
        <Card>
          <CardContent>
            <Typography variant="h6">AI recommendations</Typography>
            <Divider sx={{ my: 1 }} />

            <Stack spacing={1}>
              {consultation.aiRecommendations.map((rec, index) => (
                <Typography key={index} variant="body2">
                  • {rec}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {/* Transcript */}
      {consultation.transcript && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">Transcript</Typography>
              <ExpandMoreIcon />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box
              sx={{
                maxHeight: 200,
                overflowY: 'auto',
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" whiteSpace="pre-wrap">
                {consultation.transcript}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ConsultationDetailsPage;
