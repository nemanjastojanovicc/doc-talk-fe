import React from 'react';
import { Stack, TextField } from '@mui/material';
import { Button } from 'components';
import { Medication } from 'models/Patient';

type MedicationFormRowProps = {
  medication: Medication;
  submitLabel: string;
  disabled?: boolean;
  onChangeMedication: React.Dispatch<React.SetStateAction<Medication>>;
  onSubmit: () => void;
  onCancel?: () => void;
};

const MedicationFormRow: React.FC<MedicationFormRowProps> = ({
  medication,
  submitLabel,
  disabled,
  onChangeMedication,
  onSubmit,
  onCancel,
}) => {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
      <TextField
        label="Medication"
        value={medication.name}
        onChange={(e) =>
          onChangeMedication((prev) => ({ ...prev, name: e.target.value }))
        }
        fullWidth
      />
      <TextField
        label="Dosage"
        value={medication.dosage}
        onChange={(e) =>
          onChangeMedication((prev) => ({ ...prev, dosage: e.target.value }))
        }
        fullWidth
      />
      <TextField
        label="Way of use"
        value={medication.frequency}
        onChange={(e) =>
          onChangeMedication((prev) => ({ ...prev, frequency: e.target.value }))
        }
        fullWidth
      />
      <Button variant="contained" onClick={onSubmit} disabled={disabled}>
        {submitLabel}
      </Button>
      {onCancel && (
        <Button variant="outlined" onClick={onCancel} disabled={disabled}>
          Cancel
        </Button>
      )}
    </Stack>
  );
};

export default MedicationFormRow;
