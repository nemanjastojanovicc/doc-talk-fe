import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import './AuthContainer.styles.scss';

interface LinkInfo {
  to: string;
  text: string;
  prefix: string;
}

interface AuthContainerProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  linkInfo?: LinkInfo;
  className?: string;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  title,
  linkInfo,
  className,
  icon,
}) => (
  <div className={classNames('auth-container', className)}>
    <div className="auth-box">
      {icon}

      {title && <h1 className="auth-title">{title}</h1>}

      <div className="form-area">{children}</div>

      {linkInfo && (
        <div className="link-container">
          {linkInfo.prefix}{' '}
          <Link className="active-link" to={linkInfo.to}>
            {linkInfo.text}
          </Link>
        </div>
      )}
    </div>
  </div>
);

export default AuthContainer;
