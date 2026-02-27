import { createAsyncThunk } from '@reduxjs/toolkit';
import { apolloClient } from '../../apollo/client';
import { REGISTER_MUTATION, LOGIN_MUTATION, ME_QUERY, LOGOUT_MUTATION } from '../../graphql/operations';
import { setUser, setTokens, clearAuth, setStatus, setError, AuthStatus, AuthErrorType } from '../slices/authSlice';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../../utilities/tokenStorage';
import type { User } from '../slices/authSlice';

// Typed parameter interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Login user thunk
export const loginUser = createAsyncThunk<User, LoginCredentials>(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setStatus(AuthStatus.LOADING));

      const { data, errors } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: credentials,
      });

      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message;
        dispatch(setError({ type: AuthErrorType.INVALID_CREDENTIALS, message: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      const { user, accessToken } = data.login;

      // Only save access token - refresh token is in HttpOnly cookie
      saveTokens(accessToken, ''); // Empty string for refresh token
      dispatch(setTokens({ accessToken, refreshToken: '' }));
      dispatch(setUser(user));

      return user;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch(setError({ type: AuthErrorType.NETWORK_ERROR, message: errorMessage }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Register user thunk
export const registerUser = createAsyncThunk<User, RegisterData>(
  'auth/register',
  async (registerData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setStatus(AuthStatus.LOADING));

      const { data, errors } = await apolloClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: registerData,
      });

      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message;
        dispatch(setError({ type: AuthErrorType.INVALID_CREDENTIALS, message: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      const { user } = data.register;

      // DO NOT save tokens or log user in - they need to verify email first
      // Just return the user data for confirmation
      dispatch(setStatus(AuthStatus.UNAUTHENTICATED));

      return user;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      dispatch(setError({ type: AuthErrorType.NETWORK_ERROR, message: errorMessage }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout user thunk
export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Call logout mutation to clear HttpOnly cookie
      await apolloClient.mutate({
        mutation: LOGOUT_MUTATION,
      });
    } catch (error) {
      console.error('Logout mutation failed:', error);
      // Continue with local cleanup even if mutation fails
    }
    
    clearTokens();
    dispatch(clearAuth());
  }
);

// Initialize auth thunk
export const initializeAuth = createAsyncThunk<User | null, void>(
  'auth/initialize',
  async (_, { dispatch }) => {
    const token = getAccessToken();

    if (!token) {
      dispatch(setStatus(AuthStatus.UNAUTHENTICATED));
      return null;
    }

    // Restore access token to Redux state (refresh token is in HttpOnly cookie)
    dispatch(setTokens({ accessToken: token, refreshToken: '' }));

    try {
      const { data } = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });

      dispatch(setUser(data.me));
      return data.me;
    } catch (error) {
      clearTokens();
      dispatch(clearAuth());
      return null;
    }
  }
);
