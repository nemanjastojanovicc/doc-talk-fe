import { analyzeConsultation } from 'api/consultations';
import Button from 'components/Button';
import { ChangeEvent, FC, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

type Props = {
  patientId: string;
  onUploaded?: (result: any) => void;
};

type SoapObject = Partial<{
  Subjective: string;
  Objective: string;
  Assessment: string;
  Plan: string;
}>;

type AnalyzeSuccessResponse = {
  success: true;
  data: {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    transcript?: string | null;
    aiSummary?: string | SoapObject | null; // can be object or string
    aiRecommendations?: string | null; // JSON string
  };
};

type AnalyzeErrorResponse = {
  success: false;
  error: string;
};

type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;

function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  for (const t of candidates) {
    if (window.MediaRecorder?.isTypeSupported?.(t)) return t;
  }
  return '';
}

const tryParseRecommendations = (raw?: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    return [String(parsed)];
  } catch {
    return [raw];
  }
};

const tryParseSoap = (raw: unknown): SoapObject | null => {
  if (!raw) return null;

  // already object
  if (typeof raw === 'object') return raw as SoapObject;

  // string that might be JSON
  if (typeof raw === 'string') {
    const s = raw.trim();
    try {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === 'object') return parsed as SoapObject;
    } catch {
      // ignore
    }
  }

  return null;
};

const SOAP_ORDER: Array<keyof SoapObject> = [
  'Subjective',
  'Objective',
  'Assessment',
  'Plan',
];

const BasicSpeechRecorder: FC<Props> = ({ patientId, onUploaded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<AnalyzeSuccessResponse['data'] | null>(
    null,
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const mimeType = useMemo(() => pickMimeType(), []);

  const startRecording = async () => {
    setError(null);
    setResult(null);
    setAudioUrl(null);
    setSelectedFile(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        setSelectedFile(null);
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start(250);
      setIsRecording(true);
    } catch (e: any) {
      setError(e?.message ?? 'Microphone permission error');
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setIsRecording(false);

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const uploadRecording = async () => {
    setError(null);

    if (!patientId) {
      setError('Missing patientId');
      return;
    }

    let fileToUpload: File | null = selectedFile;

    if (!fileToUpload) {
      if (chunksRef.current.length === 0) {
        setError('No recording or selected file available');
        return;
      }

      const recorder = mediaRecorderRef.current;
      const type = recorder?.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type });

      const ext = type.includes('mp4')
        ? 'm4a'
        : type.includes('webm')
        ? 'webm'
        : 'webm';

      fileToUpload = new File([blob], `recording.${ext}`, { type });
    }

    setIsUploading(true);
    try {
      const res = (await analyzeConsultation(
        patientId,
        fileToUpload,
      )) as AnalyzeResponse;

      if (res?.success) {
        setResult(res.data);
      } else {
        setError((res as AnalyzeErrorResponse)?.error ?? 'Upload failed');
      }

      onUploaded?.(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setSelectedFile(file);
    chunksRef.current = [];
    setAudioUrl(URL.createObjectURL(file));
  };

  const recommendations = useMemo(
    () => tryParseRecommendations(result?.aiRecommendations),
    [result?.aiRecommendations],
  );

  const soap = useMemo(
    () => tryParseSoap(result?.aiSummary),
    [result?.aiSummary],
  );

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {/* Controls */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Voice capture
            </Typography>

            <Stack direction="row" spacing={1}>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelected}
                style={{ display: 'none' }}
              />
              <Button
                onClick={openFilePicker}
                type="button"
                disabled={isRecording || isUploading}
              >
                Choose file
              </Button>
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  type="button"
                  disabled={isUploading}
                >
                  Start recording
                </Button>
              ) : (
                <Button onClick={stopRecording} type="button">
                  Stop recording
                </Button>
              )}

              <Button
                onClick={uploadRecording}
                type="button"
                disabled={isRecording || isUploading}
              >
                Upload to analyze
              </Button>
            </Stack>
          </Stack>

          <Divider />

          {isUploading && (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Processing: uploading → transcribing → analyzing…
              </Typography>
            </Stack>
          )}

          {audioUrl && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                {selectedFile
                  ? `Selected file: ${selectedFile.name}`
                  : 'Recording preview'}
              </Typography>
              <audio controls src={audioUrl} style={{ width: '100%' }} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Analysis result
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  label={`Consultation: ${result.id.slice(0, 8)}…`}
                  size="small"
                  sx={{ borderRadius: 2 }}
                  variant="outlined"
                />
                <Chip
                  label={`Patient: ${result.patientId}`}
                  size="small"
                  sx={{ borderRadius: 2 }}
                  variant="outlined"
                />
                <Chip
                  label={new Date(result.date).toLocaleString()}
                  size="small"
                  sx={{ borderRadius: 2 }}
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Divider />

            {/* Transcript */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 0.75 }}
              >
                Transcript
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {result.transcript || '—'}
                </Typography>
              </Box>
            </Box>

            {/* SOAP */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 0.75 }}
              >
                SOAP note
              </Typography>

              {soap ? (
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {SOAP_ORDER.map((key, idx) => {
                    const value = soap[key];
                    if (!value) return null;

                    return (
                      <Box key={key}>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1,
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 900, letterSpacing: 0.5 }}
                          >
                            {key.toUpperCase()}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${idx + 1}/4`}
                            variant="outlined"
                            sx={{ borderRadius: 2, height: 22 }}
                          />
                        </Box>

                        <Box
                          sx={{
                            px: 1.5,
                            py: 1.25,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {value}
                          </Typography>
                        </Box>

                        {idx < SOAP_ORDER.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {typeof result.aiSummary === 'string'
                      ? result.aiSummary
                      : '—'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Recommendations */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 0.75 }}
              >
                Recommendations
              </Typography>

              {recommendations.length > 0 ? (
                <List dense disablePadding sx={{ pl: 1 }}>
                  {recommendations.map((r, idx) => (
                    <ListItem key={`${r}-${idx}`} disableGutters>
                      <ListItemText
                        primary={`• ${r}`}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: {
                            fontWeight: 600,
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  —
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BasicSpeechRecorder;
