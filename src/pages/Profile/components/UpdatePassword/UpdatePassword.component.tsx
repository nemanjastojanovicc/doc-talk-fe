import classNames from 'classnames';
import { Form } from 'react-final-form';

import { API_PATHS } from 'api';
import { Button, PasswordField } from 'components';
import { useAuth, useTanstackMutation } from 'hooks';
import { AuthBody } from 'models';
import toast from 'react-hot-toast';

type UpdatePasswordProps = {
  className?: string;
};

const UpdatePassword: React.FC<UpdatePasswordProps> = (props) => {
  const { className } = props;

  const classes = classNames('update-password', className);

  const { setCredentials } = useAuth();

  const { mutate: mutateUpdatePassword, isPending: isPendingUpdatePassword } =
    useTanstackMutation<Pick<AuthBody, 'account'>>({
      onSuccess: (data) => {
        setCredentials(data);
        toast.success('Password updated successfully.');
      },
      onError: (error) => {
        console.error(error);
        toast.error('Failed to update password. Please try again.');
      },
    });

  return (
    <div className={classes}>
      <Form<any>
        onSubmit={(data) => {
          mutateUpdatePassword({
            path: API_PATHS.account.changePassword(),
            method: 'post',
            body: data,
          });
        }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="register-form">
            <PasswordField name="oldPassword" label="Current Password" />
            <PasswordField name="newPassword" label="New Password" />
            <Button type="submit" isLoading={isPendingUpdatePassword}>
              Update Password
            </Button>
          </form>
        )}
      />
    </div>
  );
};

export default UpdatePassword;
