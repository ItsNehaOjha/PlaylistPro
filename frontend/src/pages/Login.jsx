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
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import SkillLogLogo from '../components/SkillLogLogo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
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
  Welcome to
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
            Sign in to continue your learning journey
          </Typography>

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
              autoComplete="current-password"
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
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2"
                sx={{
                  transition: 'color 0.3s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                Forgot Password?
              </Link>
            </Box>
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
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{
                  transition: 'color 0.3s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
