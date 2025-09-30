import React from 'react';
import { Box, Typography } from '@mui/material';
import { Book, PlayArrow } from '@mui/icons-material';

const PlaylistProLogo = ({ variant = 'default', size = 'medium', showText = true }) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { icon: 16, text: 'body2' };
      case 'large': return { icon: 32, text: 'h4' };
      default: return { icon: 24, text: 'h6' };
    }
  };

  const { icon: iconSize, text: textSize } = getSize();

  const LogoIcon = () => (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <Book 
        sx={{ 
          fontSize: iconSize,
          color: variant === 'white' ? '#FFFFFF' : '#667eea'
        }}
      />
      <PlayArrow 
        sx={{ 
          fontSize: iconSize * 0.6,
          color: variant === 'white' ? '#FFFFFF' : '#764ba2',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          marginLeft: 0.5
        }}
      />
    </Box>
  );

  if (!showText) {
    return <LogoIcon />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LogoIcon />
      <Typography 
        variant={textSize} 
        sx={{ 
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          color: variant === 'white' ? '#FFFFFF' : 'inherit'
        }}
      >
        PlaylistPro
      </Typography>
    </Box>
  );
};

export default PlaylistProLogo;
