import { FC } from 'react';
import { Field } from 'react-final-form';

import {
  composeValidators,
  validateRegex,
  validateRequired,
  EmailRegExp,
} from 'validations';

import InputField from '../InputField';

export type EmailFieldProps = {
  name?: string;
  label?: string;
  placeholder?: string;
};

const EmailField: FC<EmailFieldProps> = ({
  name = 'email',
  label = 'Email',
  placeholder = 'your@email.com',
}) => (
  <Field
    type="email"
    name={name}
    label={label}
    component={InputField}
    placeholder={placeholder}
    validate={composeValidators(
      validateRequired('Email is required.'),
      validateRegex('Please enter a valid email address.', EmailRegExp),
    )}
  />
);

export default EmailField;
