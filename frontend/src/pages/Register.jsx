import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SkillLogLogo from '../components/SkillLogLogo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
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
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    color: 'text.primary',
    display: 'flex',
    alignItems: 'center',
    gap: 1, // adds spacing between items
    transition: 'color 0.3s ease-in-out',
  }}
>
  Join
  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
    <SkillLogLogo size="large" style={{ marginRight: 6 }} />
   
  </Box>
</Typography>

         
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ 
              mb: 3,
              fontFamily: 'Inter, sans-serif',
              opacity: 0.7,
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Start your learning journey today
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              sx={{
                '& .MuiInputLabel-root': {
                  transition: 'color 0.3s ease-in-out',
                },
                '& .MuiInputBase-input': {
                  transition: 'color 0.3s ease-in-out',
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                '& .MuiInputLabel-root': {
                  transition: 'color 0.3s ease-in-out',
                },
                '& .MuiInputBase-input': {
                  transition: 'color 0.3s ease-in-out',
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
                  boxShadow: 4,
                }
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{
                  transition: 'color 0.3s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
