import React from 'react';
import classNames from 'classnames';

import { BlockUI } from 'components';
import { ButtonProps, Button as MuiButton } from '@mui/material';

const Button: React.FC<ButtonProps & { isLoading?: boolean }> = ({
  isLoading,
  children,
  className,
  disabled,
  variant = 'contained',
  ...rest
}) => (
  <MuiButton
    className={classNames('button', className)}
    disabled={isLoading || disabled}
    loading={isLoading}
    variant={variant}
    {...rest}
  >
    <BlockUI loading={isLoading}>{children}</BlockUI>
  </MuiButton>
);

export default Button;
