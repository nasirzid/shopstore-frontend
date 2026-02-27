import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Box, TextField, Button, Typography, Alert, Link as MuiLink } from '@mui/material';
import { FORGOT_PASSWORD_MUTATION } from '../../graphql/operations';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);

  const [forgotPassword, { loading, error }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setValidationError('');
    setSuccess(false);

    if (!email) {
      setValidationError('Email is required');
      return;
    }

    try {
      await forgotPassword({ variables: { email } });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Forgot password failed:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Forgot Password
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your email address and we'll send you instructions to reset your password.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          If an account exists with that email, you will receive password reset instructions.
        </Alert>
      )}

      {(validationError || error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError || error?.message}
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
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>
      </form>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <MuiLink component={Link} to="/login" variant="body2">
          Back to Login
        </MuiLink>
      </Box>
    </Box>
  );
};
