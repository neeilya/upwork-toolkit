import isObject from 'lodash/isObject'

export enum ErrorType {
  FORBIDDEN = 'FORBIDDEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OTHER = 'OTHER',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
}

const getErrorMessage = (error: any) =>
  error?.message
    ? error.message
    : isObject(error)
      ? JSON.stringify(error)
      : String(error)

export default { getErrorMessage }
