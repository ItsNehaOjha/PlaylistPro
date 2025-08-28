import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        email: email
      });
      
      if (response.data.success) {
        setSuccess('Password reset link has been sent to your email address.');
        setEmail('');
        toast.success('Password reset link sent successfully!');
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'background.paper',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom
            sx={{
              color: 'text.primary',
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Reset Password
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ 
              mb: 3,
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Enter your email address and we'll send you a link to reset your password
          </Typography>

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              sx={{
                '& .MuiInputLabel-root': {
                  transition: 'color 0.3s ease-in-out',
                },
                '& .MuiInputBase-input': {
                  transition: 'color 0.3s ease-in-out',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 8,
                }
              }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  transition: 'color 0.3s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                <ArrowBackIcon fontSize="small" />
                Back to Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
