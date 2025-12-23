import { FC } from 'react';

import { Tabs } from 'components';

import {
  Info,
  UpdatePassword,
  UpdateEmail,
  UpdateInfo,
  ManageAccount,
} from './components';

import './Profile.styles.scss';

const Profile: FC = () => (
  <Tabs
    className="profile"
    items={[
      { label: 'Profile', element: <Info /> },
      { label: '✒️ Info', element: <UpdateInfo /> },
      { label: '✒️ Password', element: <UpdatePassword /> },
      { label: '✒️ Email', element: <UpdateEmail /> },
      { label: '⚙️ Account', element: <ManageAccount /> },
    ]}
  />
);

export default Profile;
