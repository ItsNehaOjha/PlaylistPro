import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const FuturisticThemeContext = createContext();

export const useFuturisticTheme = () => {
  const context = useContext(FuturisticThemeContext);
  if (!context) {
    throw new Error('useFuturisticTheme must be used within a FuturisticThemeProvider');
  }
  return context;
};

export const FuturisticThemeProvider = ({ children }) => {
  const [darkMode] = useState(true); // Always dark mode for futuristic feel

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00D4FF', // Neon cyan
        light: '#4DDBFF',
        dark: '#0099CC',
      },
      secondary: {
        main: '#FF6B35', // Neon orange
        light: '#FF8A5B',
        dark: '#CC5429',
      },
      background: {
        default: '#0A0E1A', // Deep navy
        paper: 'rgba(15, 23, 42, 0.8)', // Glassmorphism background
      },
      text: {
        primary: '#E2E8F0',
        secondary: '#94A3B8',
      },
      success: {
        main: '#10B981', // Neon green
      },
      warning: {
        main: '#F59E0B', // Neon yellow
      },
      error: {
        main: '#EF4444', // Neon red
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        background: 'linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        color: '#E2E8F0',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        color: '#E2E8F0',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(0, 212, 255, 0.2)',
              border: '1px solid rgba(0, 212, 255, 0.4)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
            border: 'none',
            color: '#0A0E1A',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4DDBFF 0%, #00D4FF 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(148, 163, 184, 0.2)',
          },
          bar: {
            borderRadius: 4,
            background: 'linear-gradient(90deg, #00D4FF 0%, #10B981 100%)',
          },
        },
      },
    },
  });

  return (
    <FuturisticThemeContext.Provider value={{ darkMode, theme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </FuturisticThemeContext.Provider>
  );
};