import { Account } from './Account';

export type AuthBody = {
  account: Account;
  accessToken: string;
  refreshToken: string;
};
