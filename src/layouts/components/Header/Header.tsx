// import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// import { API_PATHS } from 'api';
import { BlockUI, Button } from 'components';
import { APP_URI } from 'config';
import { useAuth, useCredentials } from 'hooks';

import './Header.styles.scss';

const Header = () => {
  const { isLoading, removeCredentials } = useAuth();
  const credentials = useCredentials();
  const isPatient =
    credentials?.account?.role === 'patient' ||
    credentials?.account?.roles?.includes('patient');

  // const { mutate: mutateLogout } = useTanstackMutation({
  //   onSuccess: () => {
  //     removeCredentials();
  //   },
  //   onError: () => {
  //     toast.error('Failed to log out. Please try again.');
  //   },
  // });

  return (
    <header className="header">
      <nav>
        <span className="header__left-section">
          <Link to={isPatient ? APP_URI.PATIENT_HOME : APP_URI.HOME}>Home</Link>
        </span>
        <span className="header__right-section">
          <BlockUI loading={isLoading} />
          {credentials?.account ? (
            <>
              <div>{credentials.account.email}</div>
              {isPatient ? (
                <Link to={APP_URI.PATIENT_HOME}>
                  <Button variant="text">My Health</Button>
                </Link>
              ) : (
                <>
                  <Link to={APP_URI.USER_INFO}>
                    <Button variant="text">My Info</Button>
                  </Link>
                  <Link to={APP_URI.PROFILE}>
                    <Button variant="text">Profile</Button>
                  </Link>
                </>
              )}
              <Button
                variant="text"
                onClick={() => {
                  // mutateLogout({
                  //   path: API_PATHS.auth.logout(),
                  //   method: 'post',
                  // });
                  removeCredentials();
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </span>
      </nav>
    </header>
  );
};

export default Header;
