import React from 'react';
import { Box } from '@mui/material';
import { Bot, Zap, Brain, Cpu } from 'lucide-react';

const RobotMascot = ({ 
  variant = 'default', 
  size = 'medium', 
  animated = true,
  mood = 'happy' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 80;
      case 'xl': return 120;
      default: return 48;
    }
  };

  const iconSize = getSize();

  const getMoodColor = () => {
    switch (mood) {
      case 'excited': return '#10B981';
      case 'focused': return '#F59E0B';
      case 'celebrating': return '#FF6B35';
      default: return '#00D4FF';
    }
  };

  const getRobotIcon = () => {
    switch (variant) {
      case 'brain': return Brain;
      case 'cpu': return Cpu;
      case 'zap': return Zap;
      default: return Bot;
    }
  };

  const RobotIcon = getRobotIcon();

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconSize + 16,
        height: iconSize + 16,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${getMoodColor()}20 0%, transparent 70%)`,
        position: 'relative',
        animation: animated ? 'float 6s ease-in-out infinite' : 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: '50%',
          background: `conic-gradient(${getMoodColor()}, transparent, ${getMoodColor()})`,
          animation: animated ? 'spin 3s linear infinite' : 'none',
          zIndex: -1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          background: 'rgba(10, 14, 26, 0.8)',
          zIndex: -1,
        },
      }}
    >
      <RobotIcon 
        size={iconSize} 
        color={getMoodColor()}
        style={{
          filter: `drop-shadow(0 0 10px ${getMoodColor()}50)`,
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default RobotMascot;