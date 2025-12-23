import React, { useCallback } from 'react';
import EnhancedRoute, {
  EnhancedRouteProps,
} from 'router/routes/Enhanced/Enhanced.route';
import { Route, Routes as ReactRoutes } from 'react-router-dom';

export type ComplexRoute = EnhancedRouteProps & { routes: ComplexRoute[] };

type RoutesProps = {
  routes: ComplexRoute[];
};

const Routes: React.FC<RoutesProps> = ({ routes }) => {
  const calculateRoutes = useCallback(
    (routes: ComplexRoute[]) =>
      routes.map(
        (
          { path, index = false, routes, children, caseSensitive, ...rest },
          ind,
        ) => (
          <Route
            key={ind}
            index={index}
            caseSensitive={caseSensitive}
            path={path}
            element={<EnhancedRoute {...rest} />}
          >
            {routes ? calculateRoutes(routes) : children}
          </Route>
        ),
      ),
    [],
  );

  return <ReactRoutes>{calculateRoutes(routes)}</ReactRoutes>;
};

export default Routes;
