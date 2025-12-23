// import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// import { API_PATHS } from 'api';
import { BlockUI, Button } from 'components';
import { useAuth, useCredentials } from 'hooks';

import './Header.styles.scss';

const Header = () => {
  const { isLoading, removeCredentials } = useAuth();
  const credentials = useCredentials();

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
          <Link to="/">Home</Link>
        </span>
        <span className="header__right-section">
          <BlockUI loading={isLoading} />
          {credentials?.account ? (
            <>
              <div>{credentials.account.email}</div>
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
