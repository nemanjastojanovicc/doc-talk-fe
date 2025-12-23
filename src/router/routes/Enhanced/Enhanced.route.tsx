import React, { useMemo } from 'react';
import { Navigate, RouteProps, useLocation } from 'react-router-dom';

import { useAuth } from 'hooks';
import { Role } from 'models';
import { APP_URI } from 'config';
import authService from 'services/authService';
import credentialsService from 'services/credentialsService';

export type EnhancedRouteProps = {
  authorized?: boolean;
  onlyPublic?: boolean;
  authorizedRoles?: Array<Role>;
} & Omit<RouteProps, 'element'> & {
    element: React.FC | React.ReactNode;
  };

const EnhancedRoute: React.FC<EnhancedRouteProps> = (props) => {
  const {
    authorized = false,
    onlyPublic = false,
    element,
    authorizedRoles,
  } = props;

  const { account, isLoggedIn } = useAuth();

  const location = useLocation();

  const finalRoute = useMemo(() => {
    if ((authorized || authorizedRoles) && !isLoggedIn) {
      return (
        <Navigate
          to={{ pathname: APP_URI.LOGIN }}
          state={{ from: location.pathname }}
          replace
        />
      );
    }

    if (onlyPublic && isLoggedIn) {
      return <Navigate to={APP_URI.BASE} />;
    }
    if (authorizedRoles) {
      const accountAllowed = authService.checkRolesForAccount(
        account,
        authorizedRoles,
      );
      if (!accountAllowed) credentialsService.removeAuthBody();
    }

    if (typeof element === 'function') {
      const Component = element;

      return <Component />;
    }
    return element as React.ReactElement;
  }, [
    authorized,
    authorizedRoles,
    isLoggedIn,
    onlyPublic,
    location,
    account,
    element,
  ]);

  return finalRoute;
};

export default EnhancedRoute;
