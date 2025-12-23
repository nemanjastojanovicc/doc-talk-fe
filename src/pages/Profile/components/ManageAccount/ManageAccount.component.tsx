import React from 'react';
import classNames from 'classnames';
import toast from 'react-hot-toast';

import { Button } from 'components';
import { useAuth, useTanstackMutation } from 'hooks';
import { AuthBody } from 'models';
import { API_PATHS } from 'api';

import './ManageAccount.styles.scss';

type ManageAccountProps = {
  className?: string;
};

const ManageAccount: React.FC<ManageAccountProps> = ({ className }) => {
  const { setCredentials, removeCredentials } = useAuth();

  const { mutate: mutateDeactivate, isPending: isPendingDeactivate } =
    useTanstackMutation<AuthBody>({
      onSuccess: () => {
        toast.success('Account deactivated successfully.');
        removeCredentials();
      },
      onError: (error) => {
        console.error(error);
        toast.error('Failed to deactivate account. Please try again.');
      },
    });

  const { mutate: mutateReactivate, isPending: isPendingReactivate } =
    useTanstackMutation<AuthBody>({
      onSuccess: (data) => {
        toast.success('Account reactivated successfully.');
        setCredentials(data);
      },
      onError: () => {
        toast.error('Failed to reactivate account. Please try again.');
      },
    });

  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useTanstackMutation<AuthBody>({
      onSuccess: () => {
        toast.success('Account deleted successfully.');
        removeCredentials();
      },
      onError: () => {
        toast.error('Failed to delete account. Please try again.');
      },
    });

  const disableActions =
    isPendingDeactivate || isPendingReactivate || isPendingDelete;

  return (
    <div className={classNames('manage-account', className)}>
      <Button
        type="button"
        disabled={disableActions}
        isLoading={isPendingDeactivate}
        onClick={() =>
          mutateDeactivate({
            path: API_PATHS.account.deactivate(),
            method: 'post',
          })
        }
      >
        Deactivate account
      </Button>

      <Button
        type="button"
        disabled={disableActions}
        isLoading={isPendingReactivate}
        onClick={() =>
          mutateReactivate({
            path: API_PATHS.account.reactivate(),
            method: 'post',
          })
        }
      >
        Reactivate account
      </Button>

      <Button
        type="button"
        disabled={disableActions}
        isLoading={isPendingDelete}
        onClick={() =>
          mutateDelete({
            path: API_PATHS.account.basicPath(),
            method: 'delete',
          })
        }
      >
        Delete account
      </Button>
    </div>
  );
};

export default ManageAccount;
