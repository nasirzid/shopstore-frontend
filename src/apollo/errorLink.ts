import { onError } from '@apollo/client/link/error';
import { GraphQLError } from 'graphql';
import { clearTokens } from '../utilities/tokenStorage';
import { store } from '../redux/store';
import { clearAuth } from '../redux/slices/authSlice';
import { GraphQLErrorCode } from './authLink';

// Type guard for auth errors
export function isAuthError(errors: ReadonlyArray<GraphQLError>): boolean {
  return errors.some(
    (error) =>
      error.extensions?.code === GraphQLErrorCode.UNAUTHENTICATED ||
      error.extensions?.code === GraphQLErrorCode.FORBIDDEN
  );
}

// Error link to handle authentication errors
export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    if (isAuthError(graphQLErrors)) {
      clearTokens();
      store.dispatch(clearAuth());
    }

    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});
