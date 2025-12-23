import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { API_PATHS } from 'api';
import { BlockUI, Button } from 'components';
import { useAuth, useTanstackMutation } from 'hooks';

import './Header.styles.scss';

const Header = () => {
  const { user, isLoading, removeCredentials } = useAuth();

  const { mutate: mutateLogout } = useTanstackMutation({
    onSuccess: () => {
      removeCredentials();
    },
    onError: () => {
      toast.error('Failed to log out. Please try again.');
    },
  });

  return (
    <header className="header">
      <nav>
        <span className="header__left-section">
          <Link to="/">Home</Link>
          <Link to="/sub">Subrouter</Link>
          <Link to="/nested-sub">Nested Subrouter</Link>
        </span>
        <span className="header__right-section">
          <BlockUI loading={isLoading} />
          {user ? (
            <>
              <Link to="/profile">
                {user.firstName} {user.lastName}
              </Link>
              <Button
                onClick={() => {
                  mutateLogout({
                    path: API_PATHS.auth.logout(),
                    method: 'post',
                  });
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
