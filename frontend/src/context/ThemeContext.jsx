import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProviderWrapper = ({ children }) => {
  // Always keep dark mode enabled
  const [darkMode] = useState(true);

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#121212',
        paper: 'transparent',
      },
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255,255,255,0.6)',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#121212',
            boxShadow: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, theme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
