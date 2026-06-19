export const required = (val) => (!val || String(val).trim() === '' ? 'This field is required' : undefined);

export const minLength = (min) => (val) =>
  val && val.length < min ? `Must be at least ${min} characters` : undefined;

export const maxLength = (max) => (val) =>
  val && val.length > max ? `Cannot exceed ${max} characters` : undefined;

export const isEmail = (val) =>
  val && !/^\S+@\S+\.\S+$/.test(val) ? 'Enter a valid email address' : undefined;

export const isStrongPassword = (val) => {
  if (!val) return undefined;
  if (val.length < 6) return 'Password must be at least 6 characters';
  if (!/\d/.test(val)) return 'Password must contain at least one number';
  return undefined;
};

export const isFutureDate = (val) => {
  if (!val) return undefined;
  return new Date(val) < new Date() ? 'Date must be in the future' : undefined;
};

export const composeValidators = (...validators) => (val) =>
  validators.reduce((err, validator) => err || validator(val), undefined);
