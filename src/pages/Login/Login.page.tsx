import React from 'react';
import { Form } from 'react-final-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { API_PATHS } from 'api';
import { Button, EmailField, PasswordField } from 'components';
import { APP_URI } from 'config';
import { useAuth, useTanstackMutation } from 'hooks';
import { AuthBody } from 'models';
import { AuthContainer } from 'pages/components';

import './Login.styles.scss';

interface LoginFormValues {
  email: string;
  password: string;
}

const REGISTER_LINK = {
  prefix: "Don't have an account?",
  text: 'Register',
  to: '/register',
};

const Login: React.FC = () => {
  const { setCredentials } = useAuth();
  const navigate = useNavigate();

  const { mutate: mutateLogin, isPending: isPendingLogin } = useTanstackMutation<
    AuthBody,
    LoginFormValues
  >({
    onSuccess: (data) => {
      setCredentials(data);
      const isPatient =
        data?.account?.role === 'patient' ||
        data?.account?.roles?.includes('patient');
      navigate(isPatient ? APP_URI.PATIENT_HOME : APP_URI.HOME);
    },
    onError: (error) => {
      console.error(error);
      const message =
        (error as any)?.detail ||
        (error as any)?.message ||
        'Login failed. Please try again.';
      toast.error(message);
    },
  });

  return (
    <Form<LoginFormValues>
      onSubmit={(data) => {
        const payload = {
          email: data.email.trim().toLowerCase(),
          password: data.password,
        };

        mutateLogin({
          path: API_PATHS.auth.login(),
          method: 'post',
          body: payload,
        });
      }}
      render={({ handleSubmit }) => (
        <AuthContainer title="Login" linkInfo={REGISTER_LINK}>
          <form onSubmit={handleSubmit} className="login-form">
            <EmailField />
            <PasswordField />

            <Button
              type="submit"
              className="submit-button"
              isLoading={isPendingLogin}
            >
              Login
            </Button>
          </form>
        </AuthContainer>
      )}
    />
  );
};

export default Login;
