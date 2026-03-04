import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useAuth } from 'hooks';

const UserInfoPage = () => {
  const { account, user } = useAuth();

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>
        User information
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body1">
              <strong>Email:</strong> {account?.email ?? '—'}
            </Typography>
            <Typography variant="body1">
              <strong>Role:</strong> {account?.role ?? account?.roles?.[0] ?? 'user'}
            </Typography>
            <Typography variant="body1">
              <strong>State:</strong> {account?.state ?? '—'}
            </Typography>
            <Typography variant="body1">
              <strong>User ID:</strong> {account?.userId ?? '—'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              Profile
            </Typography>
            <Typography variant="body1">
              <strong>First name:</strong> {user?.firstName ?? '—'}
            </Typography>
            <Typography variant="body1">
              <strong>Last name:</strong> {user?.lastName ?? '—'}
            </Typography>
            <Typography variant="body1">
              <strong>Created at:</strong> {user?.createdAt ?? '—'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default UserInfoPage;
