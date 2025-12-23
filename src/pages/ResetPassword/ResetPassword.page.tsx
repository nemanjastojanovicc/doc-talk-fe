import React from 'react';
import { Form } from 'react-final-form';

import { AuthContainer } from 'pages/components';
import { PasswordField, Button } from 'components';
import { APP_URI } from 'config';
import { useTanstackMutation } from 'hooks';
import toast from 'react-hot-toast';
import { API_PATHS } from 'api';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const LOGIN_LINK = {
  prefix: 'Return to log in?',
  text: 'Login',
  to: APP_URI.LOGIN,
};

const ResetPassword: React.FC = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const { mutate: mutateResetPassword, isPending: isPendingResetPassword } =
    useTanstackMutation({
      onSuccess: () => {
        toast.success('Password updated successfully.');
        navigate(APP_URI.LOGIN, { replace: true });
      },
      onError: (error) => {
        console.error(error);
        toast.error('Failed to update password. Please try again.');
      },
    });

  return (
    <Form<ResetPasswordFormValues>
      onSubmit={({ password }) => {
        mutateResetPassword({
          path: API_PATHS.account.resetPassword(search.get('token')),
          method: 'post',
          body: { newPassword: password },
        });
      }}
      render={({ handleSubmit }) => (
        <AuthContainer title="Reset Password" linkInfo={LOGIN_LINK}>
          <form onSubmit={handleSubmit} className="reset-password-form">
            <PasswordField name="password" label="New Password" />
            <PasswordField name="confirmPassword" label="Confirm Password" />

            <Button
              type="submit"
              className="submit-button"
              isLoading={isPendingResetPassword}
            >
              Reset Password
            </Button>
          </form>
        </AuthContainer>
      )}
    />
  );
};

export default ResetPassword;
