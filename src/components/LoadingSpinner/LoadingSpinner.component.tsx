import React, { memo } from 'react';
import classNames from 'classnames';

import './LoadingSpinner.styles.scss';

type LoadingSpinnerProps = {
  className?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => (
  <div className={classNames('loading-spinner', className)} />
);

export default memo(LoadingSpinner);
