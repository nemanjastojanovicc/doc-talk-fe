import React from 'react';
import { Form } from 'react-final-form';
import toast from 'react-hot-toast';

import { EmailField, Button } from 'components';
import { AuthContainer } from 'pages/components';
import { APP_URI } from 'config';
import { useTanstackMutation } from 'hooks';
import { AuthBody } from 'models';
import { API_PATHS } from 'api';

type ForgotPasswordFormValues = {
  email: string;
};

const REMEMBER_PASSWORD_LINK = {
  prefix: 'Remembered your password?',
  text: 'Login',
  to: APP_URI.LOGIN,
};

const ForgotPassword: React.FC = () => {
  const {
    mutate: mutateSendInstructions,
    isPending: isPendingSendInstructions,
  } = useTanstackMutation<AuthBody>({
    onSuccess: () => {
      toast.success('Instructions sent successfully.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to send instructions. Please try again.');
    },
  });

  return (
    <Form<ForgotPasswordFormValues>
      onSubmit={({ email }) => {
        mutateSendInstructions({
          path: API_PATHS.account.sendRecovery(),
          method: 'post',
          body: { email },
        });
      }}
      render={({ handleSubmit }) => (
        <AuthContainer
          title="Forgot Password"
          linkInfo={REMEMBER_PASSWORD_LINK}
        >
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <EmailField />

            <Button
              type="submit"
              className="submit-button"
              isLoading={isPendingSendInstructions}
            >
              Send Instructions
            </Button>
          </form>
        </AuthContainer>
      )}
    />
  );
};

export default ForgotPassword;
