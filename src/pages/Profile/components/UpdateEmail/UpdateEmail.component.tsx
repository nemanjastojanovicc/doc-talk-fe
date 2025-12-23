import React from 'react';
import classNames from 'classnames';
import { Form } from 'react-final-form';

import { Button } from 'components';
import { API_PATHS } from 'api';
import { EmailField } from 'components';
import { useAuth, useTanstackMutation } from 'hooks';
import { AuthBody } from 'models';
import toast from 'react-hot-toast';

type UpdateEmailProps = {
  className?: string;
};

const UpdateEmail: React.FC<UpdateEmailProps> = ({ className }) => {
  const { setCredentials } = useAuth();

  const { mutate: mutateUpdateEmail, isPending: isPendingUpdateEmail } =
    useTanstackMutation<AuthBody>({
      onSuccess: (data) => {
        toast.success('Email updated successfully.');
        setCredentials(data);
      },
      onError: (error) => {
        console.error(error);
        const isEmailAlreadyInUse = error.response?.status === 409;

        toast.error(
          isEmailAlreadyInUse
            ? 'Email is already in use.'
            : 'Failed to update email. Please try again.',
        );
      },
    });

  const classes = classNames('update-email', className);

  return (
    <div className={classes}>
      <Form<any>
        onSubmit={(data) => {
          mutateUpdateEmail({
            path: API_PATHS.account.changeEmail(),
            method: 'post',
            body: data,
          });
        }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="register-form">
            <EmailField name="newEmail" label="New Email" />

            <Button type="submit" isLoading={isPendingUpdateEmail}>
              Update Email
            </Button>
          </form>
        )}
      />
    </div>
  );
};

export default UpdateEmail;
