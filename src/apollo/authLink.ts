import { setContext } from '@apollo/client/link/context';
import { getAccessToken } from '../utilities/tokenStorage';

// GraphQL Error codes enum
export enum GraphQLErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

// Auth link to add Authorization header
export const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();

  const typedHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (token) {
    typedHeaders.authorization = `Bearer ${token}`;
  }

  return {
    headers: typedHeaders,
  };
});
