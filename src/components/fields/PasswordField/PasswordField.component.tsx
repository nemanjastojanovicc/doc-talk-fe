import { FC, useCallback, useState } from 'react';
import classNames from 'classnames';
import { Field, FieldRenderProps } from 'react-final-form';

import EyeNotVisibleIcon from 'icons/EyeNotVisible.icon';
import EyeVisibleIcon from 'icons/EyeVisible.icon';

import {
  composeValidators,
  validateRegex,
  validateRequired,
  PasswordRegExp,
} from 'validations';

import './PasswordField.styles.scss';
import { IconButton, Input, InputAdornment } from '@mui/material';

type PasswordInputProps = FieldRenderProps<string, HTMLElement> & {
  label: string;
  className?: string;
};

const PasswordInput: FC<PasswordInputProps> = ({
  input,
  meta,
  label,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(
    () => setShowPassword((prev) => !prev),
    [],
  );

  return (
    <div className={classNames('password-field', className)}>
      <label className="password-field__label">{label}</label>
      <div className="password-field__input-container">
        <Input
          {...input}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  showPassword ? 'hide the password' : 'display the password'
                }
                onClick={togglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <EyeNotVisibleIcon /> : <EyeVisibleIcon />}
              </IconButton>
            </InputAdornment>
          }
        />
      </div>
      {meta.touched && meta.error && (
        <small className="error-text">{meta.error}</small>
      )}
    </div>
  );
};

const PasswordField: FC<{ name?: string; label?: string }> = ({
  name = 'password',
  label = 'Password',
}) => (
  <Field
    name={name}
    label={label}
    component={PasswordInput}
    validate={composeValidators(
      validateRequired('Password is required.'),
      validateRegex(
        'Stronger password needed (mix uppercase, lowercase, number, symbol).',
        PasswordRegExp,
      ),
    )}
  />
);

export default PasswordField;
