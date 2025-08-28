import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { PlaylistAdd } from '@mui/icons-material';

const PlaylistInput = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [urlType, setUrlType] = useState('');

  const detectUrlType = (url) => {
    if (url.includes('playlist?list=')) {
      return 'playlist';
    } else if (url.includes('/live/') || url.includes('watch?v=')) {
      return 'video';
    }
    return 'unknown';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setUrlType('');

    if (!url.trim()) {
      setError('Please enter a playlist URL');
      return;
    }

    // Basic URL validation
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    // Determine URL type
    setUrlType(detectUrlType(url));

    // Extract playlist ID if it's a full URL
    let processedUrl = url;
    if (url.includes('list=')) {
      const playlistId = url.match(/list=([^&]+)/)?.[1];
      if (playlistId) {
        processedUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
      }
    }

    onSubmit(processedUrl);
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    if (error) setError('');
    if (urlType) setUrlType('');
  };

  const getUrlTypeInfo = () => {
    switch (urlType) {
      case 'playlist':
        return { color: 'success', text: 'Playlist URL detected', icon: '📚' };
      case 'live':
        return { color: 'warning', text: 'Live video URL detected', icon: '🔴' };
      case 'video':
        return { color: 'info', text: 'Single video URL detected', icon: '▶️' };
      case 'other':
        return { color: 'default', text: 'YouTube URL detected', icon: '🌐' };
      default:
        return null;
    }
  };

  const urlTypeInfo = getUrlTypeInfo();

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'background.paper',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {/* Removed YouTube icon as it's no longer imported */}
        <Typography 
          variant="h5" 
          component="h2"
          sx={{
            color: 'text.primary',
            transition: 'color 0.3s ease-in-out',
          }}
        >
          Add YouTube Playlist
        </Typography>
      </Box>

      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: 3,
          transition: 'color 0.3s ease-in-out',
        }}
      >
        Paste a YouTube playlist URL below. We will fetch videos using the YouTube Data API v3.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {urlTypeInfo && (
        <Alert 
          severity={urlTypeInfo.color} 
          icon={null} // Removed Info icon as it's no longer imported
          sx={{ mb: 2 }}
        >
          {urlTypeInfo.icon} {urlTypeInfo.text}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            label="YouTube Playlist URL"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={url}
            onChange={handleInputChange}
            variant="outlined"
            disabled={isLoading}
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
            variant="contained"
            size="large"
            disabled={isLoading || !url.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : <PlaylistAdd />}
            sx={{
              minWidth: 140,
              transition: 'all 0.3s ease-in-out',
              // Removed darkMode specific styles as darkMode is removed
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4, // Changed from darkMode to fixed value
              },
              '&:disabled': {
                transform: 'none',
                boxShadow: 'none',
              }
            }}
          >
            {isLoading ? 'Fetching...' : 'Fetch Playlist'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          sx={{
            mb: 1,
            transition: 'color 0.3s ease-in-out',
          }}
        >
          💡 Supported URL Types:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* Removed Chip components as they are no longer imported */}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            transition: 'color 0.3s ease-in-out',
          }}
        >
          Note: Ensure your frontend .env has REACT_APP_YOUTUBE_API_KEY set, then restart the dev server.
        </Typography>
      </Box>
    </Box>
  );
};

export default PlaylistInput;
