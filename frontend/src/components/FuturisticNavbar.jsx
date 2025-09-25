import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip
} from '@mui/material';
import {
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu as MenuIcon,
  Home,
  PlayCircle,
  Calendar,
  BarChart3,
  Brain
} from 'lucide-react';
import BrainIcon from './BrainIcon';

const FuturisticNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

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
    handleMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/playlists', label: 'Playlists', icon: PlayCircle },
    { path: '/scheduler', label: 'Scheduler', icon: Calendar },
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Logo Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/dashboard')}
        >
          <BrainIcon size="medium" animated={true} />
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
            
          </Box>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Button
              key={path}
              onClick={() => navigate(path)}
              startIcon={<Icon size={18} />}
              sx={{
                color: isActive(path) ? 'black' : '#E2E8F0',
                backgroundColor: isActive(path) ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                border: isActive(path) ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
                borderRadius: '12px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  color: 'black',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* User greeting with robot mood */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
              Welcome back!
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {user?.name || user?.email}
            </Typography>
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            sx={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              '&:hover': {
                background: 'rgba(0, 212, 255, 0.2)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              '& .MuiPaper-root': {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                mt: 1,
              },
              '& .MuiMenuItem-root': {
                color: '#E2E8F0',
                py: 1.5,
                px: 2,
                borderRadius: '8px',
                margin: '4px 8px',
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.1)',
                  color: '#00D4FF',
                },
              },
            }}
          >
            {/* Mobile navigation items */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {navItems.map(({ path, label, icon: Icon }) => (
                <MenuItem
                  key={path}
                  onClick={() => handleNavigation(path)}
                  selected={isActive(path)}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    <Icon size={18} />
                  </ListItemIcon>
                  {label}
                </MenuItem>
              ))}
              <Box sx={{ height: 1, backgroundColor: 'rgba(148, 163, 184, 0.2)', my: 1 }} />
            </Box>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                <LogOut size={18} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default FuturisticNavbar;