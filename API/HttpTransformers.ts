/**
 * Response transformer for the API. It is used to transform the response from the API.
 * @param response - Response from the API.
 * @returns - Transformed response.
 */
import { AxiosError, AxiosResponse } from 'axios';
import { BadRequestError } from '../../utils/Errors/BadRequestError';
import { IError } from '../../utils/Errors/IError';
import { AuthorizationError } from '../../utils/Errors/AuthorizationError';

export function responseTransformer(response: any): any | null {
  return response || null;
}

/**
 * Error transformer for the API. It is used to transform the error from the API.
 * @param error - Error from the API.
 * @returns - Transformed error.
 */
export function errorTransformer(error: AxiosError) {
  // The request was made and the server responded with a status code that falls out of the range of 2xx
  if (error.response) {
    return Promise.reject(handleErrorResponse(error.response));
  }
  return Promise.reject(error);
}

/**
 * Response handler for the API. It is used to handle the error from the API.
 * @param error - Error from the API.
 * @param response
 */
function handleErrorResponse(response: AxiosResponse<unknown, any>): IError {
  switch (response.status) {
    case 400:
      throw new BadRequestError(response.data);
    case 401:
      throw new AuthorizationError();
    default:
      throw new Error('Unknown error');
  }
}

export function errorHandler(error: IError) {
  switch (error.constructor) {
    case AuthorizationError:
      // Do something with the bad request error data
      break;
    case BadRequestError:
      // Do something with the bad request error data
      break;
    default:
      // Do something with the bad request error data
      break;
  }
  return Promise.reject(error);
}
