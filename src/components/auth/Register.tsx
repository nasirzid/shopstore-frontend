import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, Button, Typography, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { registerUser } from '../../redux/thunks/authThunks';
import { selectAuthError, selectAuthStatus, AuthStatus } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authError = useSelector(selectAuthError);
  const authStatus = useSelector(selectAuthStatus);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password || !name) {
      setValidationError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(registerUser({ email, password, name })).unwrap();
      
      // Show success message and redirect to login
      // Don't navigate to home - user needs to verify email first
      navigate('/login', {
        state: {
          message: 'Registration successful! Please check your email and verify your account before logging in.',
        },
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>

      {(validationError || authError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError || authError?.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
        />
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
          {authStatus === AuthStatus.LOADING ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Box>
  );
};
