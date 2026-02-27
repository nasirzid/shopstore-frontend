import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
import { Box, TextField, Button, Typography, Alert, IconButton, InputAdornment, Link as MuiLink } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginUser } from '../../redux/thunks/authThunks';
import { selectAuthError, selectAuthStatus, AuthStatus } from '../../redux/slices/authSlice';
import { RESEND_VERIFICATION_EMAIL_MUTATION } from '../../graphql/operations';
import type { AppDispatch } from '../../redux/store';

export const Login: React.FC = () => {
  const location = useLocation();
  const successMessage = (location.state as { message?: string })?.message;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authError = useSelector(selectAuthError);
  const authStatus = useSelector(selectAuthStatus);

  const [resendVerificationEmail, { loading: resendLoading }] = useMutation(
    RESEND_VERIFICATION_EMAIL_MUTATION
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setValidationError('');
    setIsEmailNotVerified(false);
    setResendSuccess(false);

    if (!email || !password) {
      setValidationError('Email and password are required');
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Check if error is due to unverified email
      if (error?.message?.includes('verify your email')) {
        setIsEmailNotVerified(true);
      }
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    try {
      await resendVerificationEmail({ variables: { email } });
      setResendSuccess(true);
      setIsEmailNotVerified(false);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {resendSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Verification email sent! Please check your inbox.
        </Alert>
      )}

      {isEmailNotVerified && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Your email is not verified. Please check your inbox for the verification email.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleResendVerification}
            disabled={resendLoading}
            sx={{ mt: 1 }}
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </Alert>
      )}

      {(validationError || (authError && !isEmailNotVerified)) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError || authError?.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={authStatus === AuthStatus.LOADING}
        >
          {authStatus === AuthStatus.LOADING ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <MuiLink component={Link} to="/forgot-password" variant="body2">
          Forgot Password?
        </MuiLink>
      </Box>
    </Box>
  );
};
