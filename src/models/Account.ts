export type Role = 'admin' | 'standard';

export type Account = {
  email: string;
  isEmailVerified: boolean | null;
  pendingEmail: boolean | null;
  state: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  roles?: Role[];
};
