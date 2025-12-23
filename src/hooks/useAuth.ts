import { AuthContext } from 'providers';
import { useContext } from 'react';

export default function useAuth() {
  const data = useContext(AuthContext);

  if (!data) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return data;
}
