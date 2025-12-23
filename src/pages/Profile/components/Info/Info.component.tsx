import classNames from 'classnames';
import React from 'react';

import { useAuth } from 'hooks';
import { BlockUI } from 'components';
import { Account, User } from 'models';

import './Info.styles.scss';

type InfoProps = {
  className?: string;
};

const prepareProfileData = (user: User, account: Account) => {
  if (!user || !account) {
    return [];
  }

  return [
    {
      label: 'First name',
      value: user.firstName,
    },
    {
      label: 'Last name',
      value: user.lastName,
    },
    {
      label: 'Email',
      value: account.email,
    },
    {
      label: 'Email verified',
      value: account.isEmailVerified ? 'Yes' : 'No',
    },
    {
      label: 'Created',
      value: new Date(user.createdAt).toLocaleDateString(),
    },
  ];
};

const Info: React.FC<InfoProps> = ({ className }) => {
  const { user, account, isLoading } = useAuth();

  return (
    <div
      className={classNames('info', { 'info--loading': isLoading }, className)}
    >
      <BlockUI loading={isLoading}>
        {prepareProfileData(user, account).map((item) => (
          <div className="info__item" key={item.label}>
            <div>{item.label}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </BlockUI>
    </div>
  );
};

export default Info;
