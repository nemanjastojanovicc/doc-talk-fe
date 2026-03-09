import { CommonLayout } from 'layouts';
import ForgotPassword from 'pages/ForgotPassword';
import Home from 'pages/Home';
import Login from 'pages/Login';
import Profile from 'pages/Profile';
import Register from 'pages/Register';
import ResendEmail from 'pages/ResendEmail';
import ResetPassword from 'pages/ResetPassword';
import VerifyAccount from 'pages/VerifyAccount';
import PatientHome from 'pages/PatientHome';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ComplexRoute } from './components/Routes/Routes';
import Patient from 'pages/Patient';
import ConsultationDetailsPage from 'pages/ConsultationDetails';

export default [
  {
    path: 'login',
    authorized: false,
    onlyPublic: true,
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
        authorizedRoles: ['admin', 'doctor'],
      },
      {
        path: 'my-health',
        element: PatientHome,
        authorizedRoles: ['patient'],
      },
      {
        path: 'profile',
        element: Profile,
        authorizedRoles: ['admin', 'doctor'],
      },
      {
        path: 'patient/:id',
        element: Outlet,
        authorizedRoles: ['admin', 'doctor'],
        routes: [
          {
            path: '',
            element: Patient,
          },
          {
            path: 'consultations/:consultationId',
            element: <ConsultationDetailsPage />,
          },
        ],
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
