const basicAccountPath = (routePath = '') =>
  `account${routePath && '/'}${routePath}`;

export const basicPath = () => basicAccountPath();
export const changeEmail = () => basicAccountPath('change-email');
export const changePassword = () => basicAccountPath('change-password');
export const requestData = () => basicAccountPath('request-data');
export const restore = () => basicAccountPath('restore');
export const verifyEmail = () => basicAccountPath('verify/email/confirm');
export const emailResend = () => basicAccountPath('verify/email/resend');
export const sendRecovery = () => basicAccountPath('recover/request');
export const deactivate = () => basicAccountPath('deactivate');
export const reactivate = () => basicAccountPath('reactivate');
export const resetPassword = (token: string) =>
  basicAccountPath(`recover/reset?token=${token}`);
