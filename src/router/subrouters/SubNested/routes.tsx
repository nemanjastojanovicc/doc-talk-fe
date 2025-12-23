import React from 'react';
import { Navigate } from 'react-router-dom';
import { EnhancedRouteProps } from 'router/routes/Enhanced/Enhanced.route';
import Test1 from './pages/Test1';
const Test2 = React.lazy(() => import('./pages/Test2'));


export default [
  {
    path: 'test1',
    element: Test1,
  },
  {
    path: 'test2',
    element: (
      <React.Suspense fallback={<>...</>}>
        <Test2 />
      </React.Suspense>
    ),
  },
  {
    index: true,
    element: <Navigate to="test1" replace />,
  },
] as Array<EnhancedRouteProps>;
