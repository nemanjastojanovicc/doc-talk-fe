import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Stack,
  Card,
  CardContent,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';

import PatientCardList from './PatientsList';
import { patients } from 'mock/patients';
import { Patient } from 'models/Patient';
import { Button } from 'components';

/**
 * Heuristic:
 * Patient needs attention if:
 * - has chronic condition
 * - OR 2+ medications
 * - OR high stress level (4–5)
 */
export const needsAttention = (patient: Patient): boolean => {
  const chronicCount = patient.medicalRecord.chronicConditions.length;
  const medicationsCount = patient.medicalRecord.medications.length;
  const stressLevel = patient.lifestyle?.stressLevel ?? 0;

  return chronicCount >= 1 || medicationsCount >= 2 || stressLevel >= 4;
};

type ActiveFilter = 'needsAttention' | 'active' | null;

const Home: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

  const filteredPatients = useMemo(() => {
    const query = search.toLowerCase();

    return patients.filter((p) => {
      const matchesSearch = `${p.firstName} ${p.lastName}`
        .toLowerCase()
        .includes(query);

      const matchesFilter =
        activeFilter === 'needsAttention'
          ? needsAttention(p)
          : activeFilter === 'active'
          ? p.isActive
          : true;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.isActive).length;
  const attentionCount = patients.filter(needsAttention).length;

  const toggleFilter = (filter: ActiveFilter) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Hello Doctor!
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Review your patients and focus on priority cases.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ height: 40 }}
          onClick={() => {
            // navigate('/patients/new')
          }}
        >
          Add patient
        </Button>
      </Box>

      {/* SEARCH */}
      <Stack direction="row" spacing={2} alignItems="center">
        <SearchIcon color="action" />
        <TextField
          fullWidth
          size="small"
          placeholder="Search patients by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Stack>

      {/* STATS + FILTERS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* TOTAL (info only) */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <PeopleIcon color="info" fontSize="large" />
              <Box>
                <Typography fontWeight={600} fontSize={24}>
                  {totalPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total patients
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* ACTIVE FILTER */}
        <Card
          sx={{
            cursor: 'pointer',
            border:
              activeFilter === 'active' ? '2px solid' : '2px solid transparent',
            borderColor:
              activeFilter === 'active' ? 'primary.main' : 'transparent',
          }}
          onClick={() => toggleFilter('active')}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CheckCircleOutlineIcon color="primary" fontSize="large" />
              <Box>
                <Typography fontWeight={600} fontSize={24}>
                  {activePatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active patients
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* NEEDS ATTENTION FILTER */}
        <Card
          sx={{
            cursor: 'pointer',
            border:
              activeFilter === 'needsAttention'
                ? '2px solid'
                : '2px solid transparent',
            borderColor:
              activeFilter === 'needsAttention'
                ? 'warning.main'
                : 'transparent',
          }}
          onClick={() => toggleFilter('needsAttention')}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <WarningAmberIcon color="warning" fontSize="large" />
              <Box>
                <Typography fontWeight={600} fontSize={24}>
                  {attentionCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Needs attention
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Divider />

      {/* PATIENT LIST */}
      <PatientCardList patients={filteredPatients} />
    </Box>
  );
};

export default Home;
