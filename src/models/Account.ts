export type Role = 'admin' | 'doctor' | 'patient';

export type Account = {
  email: string;
  role?: Role;
  isEmailVerified: boolean | null;
  pendingEmail: boolean | null;
  state: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  roles?: Role[];
};
