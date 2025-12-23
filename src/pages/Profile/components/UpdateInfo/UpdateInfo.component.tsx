import React from 'react';
import classNames from 'classnames';
import { Field, Form } from 'react-final-form';
import { queryClient } from 'react-query';
import toast from 'react-hot-toast';

import { InputField, Button } from 'components';
import { useAuth, useTanstackMutation } from 'hooks';
import { AuthBody } from 'models';
import { API_PATHS } from 'api';

type UpdateInfoProps = {
  className?: string;
};

const UpdateInfo: React.FC<UpdateInfoProps> = ({ className }) => {
  const { user } = useAuth();

  const { mutate: mutateUpdateInfo, isPending: isPendingUpdate } =
    useTanstackMutation<AuthBody>({
      onSuccess: (data) => {
        queryClient.setQueryData([API_PATHS.user.basicPath()], data);
        toast.success('Successfully updated user info.');
      },
      onError: (error) => {
        console.error(error);
        toast.error('Error on updating user info.');
      },
    });

  const classes = classNames('update-profile', className);

  return (
    <div className={classes}>
      <Form<any>
        onSubmit={(data) => {
          mutateUpdateInfo({
            path: API_PATHS.user.basicPath(),
            method: 'patch',
            body: data,
          });
        }}
        initialValues={{
          firstName: user?.firstName,
          lastName: user?.lastName,
        }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="register-form">
            <Field name="firstName" label="First Name" component={InputField} />
            <Field name="lastName" label="Last Name" component={InputField} />
            <Button type="submit" isLoading={isPendingUpdate}>
              Update Info
            </Button>
          </form>
        )}
      />
    </div>
  );
};

export default UpdateInfo;
