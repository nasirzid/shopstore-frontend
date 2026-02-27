import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper } from '@mui/material';
import { selectCurrentUser } from '../redux/slices/authSlice';

export const Home: React.FC = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Home Page
        </Typography>
        <Typography variant="body1">
          You are logged in as: {user?.email}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Name: {user?.name}
        </Typography>
        <Typography variant="body2">
          User ID: {user?.id}
        </Typography>
      </Paper>
    </Box>
  );
};
