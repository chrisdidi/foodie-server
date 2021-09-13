export const HTTP_ERROR_CODES = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  UNPROCESSABLE_ENTITY: 422,
};

export const ERROR_NAMES = {
  BAD_REQUEST: 'BAD_REQUEST',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  THIRD_PARTY_ERROR: 'THIRD_PARTY_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
};

export const badRequestError = (message?: string) => ({
  ok: false,
  error: {
    code: ERROR_NAMES.BAD_REQUEST,
    message: message || 'Some required fields are not provided.',
  },
});

export const internalServerError = (message?: string) => ({
  ok: false,
  error: {
    code: ERROR_NAMES.INTERNAL_SERVER_ERROR,
    message: message || 'Unexpected error occured! Please try again later.',
  },
});

export const notFoundError = (message?: string) => ({
  ok: false,
  error: {
    code: ERROR_NAMES.NOT_FOUND,
    message: message || 'Resource not found!',
  },
});

export const unauthorizedError = (message?: string) => ({
  ok: false,
  error: {
    code: ERROR_NAMES.UNPROCESSABLE_ENTITY,
    message: message || `You don't have permission to do that!`,
  },
});
