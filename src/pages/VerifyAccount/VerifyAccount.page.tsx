import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { API_PATHS } from 'api';
import { BlockUI } from 'components';
import ErrorIcon from 'icons/Error.icon';
import VerifiedIcon from 'icons/Verified.icon';
import { ErrorCode, ResponseError } from 'models';
import { AuthContainer } from 'pages/components';

import './VerifyAccount.styles.scss';

const VerifyAccount: React.FC = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const { isPending, error, isSuccess } = useQuery<unknown, ResponseError>({
    queryKey: [
      API_PATHS.account.verifyEmail(),
      {
        token: search.get('token'),
      },
    ],
    retry: 0,
  });

  useEffect(() => {
    if (isSuccess) {
      navigate('/login');
      toast.success('Account has been verified successfully.');
    } else if (error) {
      toast.error('Verification failed. Please try again.');
    }
  }, [navigate, error, isSuccess]);

  return (
    <AuthContainer
      title={
        isPending
          ? ''
          : error
          ? 'Verification Failed'
          : 'Verification Completed'
      }
      className="verify-account"
      icon={isPending ? <></> : error ? <ErrorIcon /> : <VerifiedIcon />}
    >
      <BlockUI
        loading={isPending}
        fallbackCondition={!!error}
        fallback={
          <>
            <p>{error?.message}</p>
            {error?.errorCode === ErrorCode.EMAIL_ALREADY_VERIFIED ? (
              <Link to="/">Go Home</Link>
            ) : (
              <Link to={`/resend-email?email=${search.get('email')}`}>
                Resend email
              </Link>
            )}
          </>
        }
      >
        <div className="verify-account__cuccess">
          <p>Your account has been successfully verified!</p>
          <p>Redirecting you to the app...</p>
        </div>
      </BlockUI>
    </AuthContainer>
  );
};

export default VerifyAccount;
