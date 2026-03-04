export type Role = 'admin' | 'standard' | 'user' | 'patient';

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
