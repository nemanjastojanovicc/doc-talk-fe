export const NameRegExp = RegExp('([a-z])(?=.{2,})');
export const EmailRegExp = RegExp(
  '^[a-zA-Z0-9_:$!%-.]+@[a-zA-Z0-9.-]+.[a-zA-Z]$',
);
export const PasswordRegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&\-#$.%&*~!@^(){}[\]:;<>,?/_+=|\\])[a-zA-Z\d@$!%*#?&\-#$.%&*~!@^(){}[\]:;<>,?/_+=|\\]{8,64}$/;
