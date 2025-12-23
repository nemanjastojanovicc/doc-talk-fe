import { useCallback, useEffect, useState } from 'react';

import { AuthBody } from 'models';
import credentialsService from 'services/credentialsService';

export default function useCredentials() {
  const [credentials, setCredentialsState] = useState<AuthBody>(
    credentialsService.authBody,
  );

  const setCredentials = useCallback((data: Partial<AuthBody>) => {
    credentialsService.saveAuthBody(data);
  }, []);

  const removeCredentials = useCallback(() => {
    credentialsService.removeAuthBody();
  }, []);

  useEffect(() => {
    const handleUpdateCredentials = () => {
      setCredentialsState(credentialsService.authBody);
    };

    credentialsService.onUpdate(handleUpdateCredentials);

    return () => {
      credentialsService.removeOnUpdate(handleUpdateCredentials);
    };
  }, []);

  return {
    ...credentials,
    setCredentials,
    removeCredentials,
  };
}
