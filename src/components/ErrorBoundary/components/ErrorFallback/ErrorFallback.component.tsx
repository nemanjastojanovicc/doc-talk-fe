import React from 'react';
import classNames from 'classnames';

import './ErrorFallback.styles.scss';

type ErrorFallbackProps = {
  className?: string;
  children?: React.ReactNode;
};

const ErrorFallback: React.FC<ErrorFallbackProps> = (props) => {
  const { className } = props;

  const classes = classNames('error-fallback', className);

  return (
    <div className={classes}>
      <h1 className="error-ops">{`Oops...`}</h1>
      <h3 className="error-desc">{`Looks like something went wrong.`}</h3>
      <h3 className="error-desc">{`We're working on it.`}</h3>
    </div>
  );
};

export default ErrorFallback;
