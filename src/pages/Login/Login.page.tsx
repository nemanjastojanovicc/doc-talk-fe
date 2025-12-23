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

  const { mutate: mutateLogin, isPending: isPendingLogin } =
    useTanstackMutation<AuthBody, LoginFormValues>({
      onSuccess: (data) => {
        setCredentials(data);
        navigate(APP_URI.PROFILE);
      },
      onError: (error) => {
        console.error(error);
        toast.error('Login failed. Please try again.');
      },
    });

  return (
    <Form<LoginFormValues>
      onSubmit={(data) => {
        mutateLogin({
          path: API_PATHS.auth.login(),
          method: 'post',
          body: data,
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
