import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { VERIFY_EMAIL_MUTATION } from '../../graphql/operations';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [verifyEmail] = useMutation(VERIFY_EMAIL_MUTATION);

  useEffect(() => {
    const verify = async (): Promise<void> => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        await verifyEmail({ variables: { token } });
        setVerificationStatus('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setVerificationStatus('error');
        setErrorMessage(
          error.message || 'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  const handleGoToLogin = (): void => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center' }}>
            {verificationStatus === 'loading' && (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  Verifying your email...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we verify your email address.
                </Typography>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Email Verified!
                </Typography>
                <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                  Your email has been successfully verified. You can now log in to your
                  account.
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Redirecting to login page in 3 seconds...
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGoToLogin}
                  fullWidth
                >
                  Go to Login
                </Button>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <ErrorOutlineIcon
                  sx={{ fontSize: 80, color: 'error.main', mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Verification Failed
                </Typography>
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {errorMessage}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The verification link may have expired or is invalid. Please try
                  requesting a new verification email.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGoToLogin}
                  fullWidth
                >
                  Go to Login
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail;
