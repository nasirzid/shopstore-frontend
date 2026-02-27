import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Enums
export enum AuthStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ERROR = 'ERROR',
}

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

// Interfaces
export interface User {
  id: number;
  email: string;
  name: string;
  status: string;
  createdAt: string;
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  error: AuthError | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: AuthStatus.IDLE,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = AuthStatus.AUTHENTICATED;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = AuthStatus.UNAUTHENTICATED;
      state.error = null;
    },
    setError: (state, action: PayloadAction<AuthError>) => {
      state.error = action.payload;
      state.status = AuthStatus.ERROR;
    },
    setStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
  },
});

// Actions
export const { setUser, setTokens, clearAuth, setError, setStatus } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.status === AuthStatus.AUTHENTICATED && state.auth.user !== null;

export const selectCurrentUser = (state: RootState): User | null => state.auth.user;

export const selectAuthStatus = (state: RootState): AuthStatus => state.auth.status;

export const selectAuthError = (state: RootState): AuthError | null => state.auth.error;

export const selectAccessToken = (state: RootState): string | null => state.auth.accessToken;

// Reducer
export default authSlice.reducer;
