import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';

import { API_PATHS } from 'api';
import { useCredentials } from 'hooks';
import { Account, AuthBody, User } from 'models';
import { queryClient } from 'react-query';

type Props = {
  children: React.ReactNode;
};

type Auth = {
  user?: User;
  account?: Account;
  isLoggedIn: boolean;
  isLoading: boolean;
  setCredentials: (data: Partial<AuthBody>) => void;
  removeCredentials: () => void;
};

export const AuthContext = React.createContext<Auth>(null);

const AuthProvider: React.FC<Props> = ({ children }) => {
  const credentials = useCredentials();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [API_PATHS.user.basicPath()],
    // enabled: !!credentials.accessToken,
    enabled: false,
  });

  useEffect(() => {
    if (!credentials.accessToken) {
      queryClient.setQueryData([API_PATHS.user.basicPath()], null);
    }
  }, [credentials.accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        account: credentials.account,
        isLoggedIn: !!credentials.account,
        setCredentials: credentials.setCredentials,
        removeCredentials: credentials.removeCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
