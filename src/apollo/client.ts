import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { authLink } from './authLink';
import { errorLink } from './errorLink';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include', // Include cookies in requests
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
