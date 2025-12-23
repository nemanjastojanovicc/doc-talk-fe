export enum ErrorCode {
  TOKEN_EXPIRED = 3002,
  EMAIL_ALREADY_VERIFIED = 2002,
}

export type ResponseError = {
  message: string;
  errorType: string;
  errorCode: number;
  statusCode: number;
};
