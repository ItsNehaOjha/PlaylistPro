import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  PlaylistPlay,
  Schedule as ScheduleIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SkillLogLogo from './SkillLogLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#121212',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ padding: '15px 20px' }}>
        <Box 
          sx={{ 
            flexGrow: 1,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            }
          }}
          onClick={() => navigate('/dashboard')}
        >
          <SkillLogLogo variant="white" size="medium" />
           <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              SkillLog
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#94A3B8',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Prepration Assistant
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
            Welcome, {user?.name}!
          </Typography>
          
          <Tooltip title="Navigation Menu">
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                color: '#FFFFFF',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: 'rgba(30,30,30,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              },
              '& .MuiMenuItem-root': {
                color: '#FFFFFF',
                padding: '12px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2)',
                }
              }
            }}
          >
            <MenuItem 
              onClick={() => handleNavigation('/dashboard')}
              selected={isActive('/dashboard')}
            >
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              Dashboard
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleNavigation('/playlists')}
              selected={isActive('/playlists')}
            >
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <PlaylistPlay fontSize="small" />
              </ListItemIcon>
              Playlists
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleNavigation('/scheduler')}
              selected={isActive('/scheduler')}
            >
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <ScheduleIcon fontSize="small" />
              </ListItemIcon>
              Dynamic Scheduler
            </MenuItem>
            
            {/* Remove scheduler menu item */}
            
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
