import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import App from './App';
import { store } from './redux/store';
import { apolloClient } from './apollo/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <CssBaseline />
        <App />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);
