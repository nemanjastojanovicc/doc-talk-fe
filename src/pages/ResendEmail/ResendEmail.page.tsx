import React from 'react';
import { Form } from 'react-final-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

import { API_PATHS } from 'api';
import { BlockUI, Button, EmailField } from 'components';
import { APP_URI } from 'config';
import { useTanstackMutation } from 'hooks';
import ErrorIcon from 'icons/Error.icon';
import VerifiedIcon from 'icons/Verified.icon';
import { AuthContainer } from 'pages/components';

import './ResendEmail.styles.scss';

interface ResendEmailFormValues {
  email: string;
}

const LOGIN_LINK = {
  prefix: 'Return to log in?',
  text: 'Login',
  to: APP_URI.LOGIN,
};

const ResendEmail: React.FC = () => {
  const [search] = useSearchParams();

  const {
    mutate: mutateResendEmail,
    error,
    isSuccess,
    isError,
    isPending: isPendingResendEmail,
  } = useTanstackMutation<unknown, ResendEmailFormValues>({
    onSuccess: () => {
      toast.success('Email has been sent successfully.');
    },
    onError: () => {
      toast.error('Sending email failed. Please try again.');
    },
  });

  const isSubmitted = isSuccess || isError;

  return (
    <Form<ResendEmailFormValues>
      onSubmit={(data) => {
        mutateResendEmail({
          path: API_PATHS.account.emailResend(),
          method: 'post',
          body: data,
        });
      }}
      initialValues={{
        email: search.get('email'),
      }}
      render={({ handleSubmit }) => (
        <AuthContainer
          title={
            !isSubmitted
              ? 'Resend verification mail'
              : error
              ? 'Sending email failed'
              : 'Email has been sent'
          }
          className="resend-email"
          icon={!isSubmitted ? <></> : error ? <ErrorIcon /> : <VerifiedIcon />}
          linkInfo={LOGIN_LINK}
        >
          <BlockUI
            fallbackCondition={isSubmitted}
            fallback={error ? <p>{error?.message}</p> : <p>Check your email</p>}
          >
            <form onSubmit={handleSubmit} className="reset-password-form">
              <EmailField />
              <Button
                type="submit"
                className="submit-button"
                isLoading={isPendingResendEmail}
              >
                Send
              </Button>
            </form>
          </BlockUI>
        </AuthContainer>
      )}
    />
  );
};

export default ResendEmail;
