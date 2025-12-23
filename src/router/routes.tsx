import { CommonLayout } from 'layouts';
import ForgotPassword from 'pages/ForgotPassword';
import Home from 'pages/Home';
import Login from 'pages/Login';
import Profile from 'pages/Profile';
import Register from 'pages/Register';
import ResendEmail from 'pages/ResendEmail';
import ResetPassword from 'pages/ResetPassword';
import VerifyAccount from 'pages/VerifyAccount';
import React from 'react';
import { Navigate } from 'react-router-dom';
import SubRouter from 'router/subrouters/Sub';
import { ComplexRoute } from './components/Routes/Routes';
import subNestedRoutes from './subrouters/SubNested/routes';

const SubNested = React.lazy(
  () => import('./subrouters/SubNested/pages/SubNested'),
);

export default [
  {
    path: 'login',
    authorized: false,
    onlyPublic: true, //TODO: add default redirection to '/profile' page
    element: Login,
  },
  {
    path: 'register',
    authorized: false,
    onlyPublic: true,
    element: Register,
  },
  {
    path: 'forgot-password',
    authorized: false,
    onlyPublic: true,
    element: ForgotPassword,
  },
  {
    path: 'reset-password',
    authorized: false,
    onlyPublic: true,
    element: ResetPassword,
  },
  {
    path: 'verify',
    authorized: false,
    onlyPublic: false,
    element: VerifyAccount,
  },
  {
    path: 'resend-email',
    authorized: false,
    onlyPublic: false,
    element: ResendEmail,
  },
  {
    element: <CommonLayout />,
    authorized: true,
    routes: [
      {
        path: 'home',
        element: Home,
      },
      {
        path: 'profile',
        element: Profile,
      },
      {
        path: 'sub/*',
        element: SubRouter,
      },
      {
        path: 'nested-sub',
        element: (
          <React.Suspense fallback={<>...</>}>
            <SubNested />
          </React.Suspense>
        ),
        routes: subNestedRoutes,
      },
      {
        index: true,
        element: <Navigate to="home" replace />,
      },
      {
        path: '*',
        element: () => `not found`,
      },
    ],
  },
] as Array<ComplexRoute>;
