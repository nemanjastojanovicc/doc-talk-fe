import React from 'react';
import { Field, Form } from 'react-final-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { API_PATHS } from 'api';
import { Button, EmailField, InputField, PasswordField } from 'components';
import { APP_URI } from 'config';
import { useAuth, useTanstackMutation } from 'hooks';
import { AuthBody } from 'models';
import { AuthContainer } from 'pages/components';
import {
  composeValidators,
  NameRegExp,
  validateRegex,
  validateRequired,
} from 'validations';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  onSubmit: (values: RegisterFormValues) => void;
}

const LOGIN_LINK = {
  prefix: 'Already have an account?',
  text: 'Login',
  to: APP_URI.LOGIN,
};

const Register: React.FC<RegisterProps> = () => {
  const { setCredentials } = useAuth();
  const navigate = useNavigate();

  const { mutate: mutateRegister, isPending: isPendingRegister } =
    useTanstackMutation<AuthBody, Omit<RegisterFormValues, 'confirmPassword'>>({
      onSuccess: (data) => {
        setCredentials(data);
        navigate(APP_URI.HOME);
      },
      onError: (error) => {
        console.error(error);

        const isEmailAlreadyInUse = error.response?.status === 409;

        toast.error(
          isEmailAlreadyInUse
            ? 'Email is already registered.'
            : 'Registration failed. Please try again.',
        );
      },
    });

  return (
    <Form<RegisterFormValues>
      onSubmit={({ confirmPassword, ...data }) => {
        mutateRegister({
          path: API_PATHS.auth.signup(),
          method: 'post',
          body: data,
        });
      }}
      render={({ handleSubmit }) => (
        <AuthContainer title="Register" linkInfo={LOGIN_LINK}>
          <form onSubmit={handleSubmit} className="register-form">
            <Field
              name="firstName"
              label="First Name"
              component={InputField}
              validate={composeValidators(
                validateRequired('First name field is required.'),
                validateRegex('Please enter a valid first name.', NameRegExp),
              )}
            />
            <Field
              name="lastName"
              label="Last Name"
              component={InputField}
              validate={composeValidators(
                validateRequired('Last name field is required.'),
                validateRegex('Please enter a valid last name.', NameRegExp),
              )}
            />

            <EmailField />

            <PasswordField />
            <PasswordField name="confirmPassword" label="Confirm Password" />

            <Button
              type="submit"
              className="submit-button"
              isLoading={isPendingRegister}
            >
              Register
            </Button>
          </form>
        </AuthContainer>
      )}
    />
  );
};

export default Register;
