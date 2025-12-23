export const VALID: unknown = undefined;

export const validateRegex =
  (errorMessage: string, regexp: RegExp) => (value: string) =>
    regexp.test(value) ? undefined : errorMessage;

export const validateRequired = (errorMessage: string) => (value: string) => {
  if (value) return VALID;

  return errorMessage ?? '';
};

export const validatePasswordRepeat =
  (errorMessage: string) => (value: string, allValues: any) => {
    return value !== allValues.password ? errorMessage : undefined;
  };

export const composeValidators =
  (...validators: Array<any>) =>
  (value: any, allValues: Record<string, any>) => {
    return validators.reduce((errorMessage, validator) => {
      return errorMessage || validator(value, allValues);
    }, undefined);
  };
