import classNames from 'classnames';
import { forwardRef } from 'react';
import { FieldRenderProps } from 'react-final-form';
import { Input } from '@mui/material';

import './InputField.styles.scss';

export const InputField = forwardRef<
  HTMLInputElement,
  FieldRenderProps<string, HTMLElement>
>((props, ref) => {
  const { input, meta, label, className, ...rest } = props;

  return (
    <div className={classNames('input-field', className)}>
      <label>{label}</label>
      <Input {...input} {...rest} />

      {meta.touched && meta.error && (
        <small className="error-text">{meta.error}</small>
      )}
    </div>
  );
});

export default InputField;
