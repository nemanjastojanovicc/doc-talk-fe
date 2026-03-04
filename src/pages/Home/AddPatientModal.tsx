import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Button } from 'components';
import { Patient } from 'models/Patient';

export type AddPatientForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Patient['gender'];
  email: string;
  patientPassword: string;
  phoneNumber: string;
  heightCm: string;
  weightKg: string;
  bloodPressure: string;
  smoking: NonNullable<Patient['lifestyle']>['smoking'] | '';
  alcohol: NonNullable<Patient['lifestyle']>['alcohol'] | '';
  stressLevel: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (form: AddPatientForm) => void;
  isSaving?: boolean;
  error?: string | null;
};

const createEmptyForm = (): AddPatientForm => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'other',
  email: '',
  patientPassword: '',
  phoneNumber: '',
  heightCm: '',
  weightKg: '',
  bloodPressure: '',
  smoking: '',
  alcohol: '',
  stressLevel: '',
});

const normalizeSingleDigit = (value: string) =>
  value.replace(/\D/g, '').slice(0, 1);

const AddPatientModal: React.FC<Props> = ({
  open,
  onClose,
  onSave,
  isSaving = false,
  error = null,
}) => {
  const [form, setForm] = useState<AddPatientForm>(createEmptyForm());
  const [showPatientPassword, setShowPatientPassword] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const canSubmit = useMemo(
    () =>
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.dateOfBirth.trim() &&
      form.dateOfBirth <= today,
    [form, today],
  );

  const handleClose = () => {
    setForm(createEmptyForm());
    onClose();
  };

  const handleSave = () => {
    if (!canSubmit || isSaving) return;
    onSave?.(form);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add patient</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
              fullWidth
              required
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of birth"
                value={form.dateOfBirth ? dayjs(form.dateOfBirth) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    dateOfBirth: value ? value.format('YYYY-MM-DD') : '',
                  }))
                }
                maxDate={dayjs(today)}
                openTo="year"
                views={['year', 'month', 'day']}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
            <TextField
              label="Gender"
              select
              value={form.gender}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  gender: e.target.value as Patient['gender'],
                }))
              }
              fullWidth
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Stack>

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Patient login password"
            type={showPatientPassword ? 'text' : 'password'}
            value={form.patientPassword}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                patientPassword: e.target.value,
              }))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    onClick={() => setShowPatientPassword((prev) => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPatientPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
            helperText="If email is set, this password will be used for patient login"
          />
          <TextField
            label="Phone number"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
            }
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Height (cm)"
              type="number"
              value={form.heightCm}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, heightCm: e.target.value }))
              }
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Weight (kg)"
              type="number"
              value={form.weightKg}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, weightKg: e.target.value }))
              }
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Blood pressure"
              placeholder="120/80"
              value={form.bloodPressure}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  bloodPressure: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Stress level (1-5)"
              type="number"
              value={form.stressLevel}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  stressLevel: normalizeSingleDigit(e.target.value),
                }))
              }
              fullWidth
              inputProps={{ min: 1, max: 5, step: 1 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Smoking"
              select
              value={form.smoking}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  smoking: e.target.value as AddPatientForm['smoking'],
                }))
              }
              fullWidth
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="never">Never</MenuItem>
              <MenuItem value="former">Former</MenuItem>
              <MenuItem value="current">Current</MenuItem>
            </TextField>
            <TextField
              label="Alcohol"
              select
              value={form.alcohol}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  alcohol: e.target.value as AddPatientForm['alcohol'],
                }))
              }
              fullWidth
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="frequent">Frequent</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit || isSaving}
          isLoading={isSaving}
          onClick={handleSave}
        >
          Save patient
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPatientModal;
