import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { TrendingUp, Target, Zap } from 'lucide-react';

export const CircularProgressRing = ({ 
  value, 
  size = 120, 
  thickness = 8,
  label,
  showPercentage = true 
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background ring */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{
          color: 'rgba(148, 163, 184, 0.2)',
          position: 'absolute',
        }}
      />
      
      {/* Progress ring with gradient */}
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{
          color: '#00D4FF',
          '& .MuiCircularProgress-circle': {
            stroke: 'url(#progressGradient)',
            strokeLinecap: 'round',
            filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))',
          },
        }}
      />
      
      {/* Center content */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showPercentage && (
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#00D4FF',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              fontSize: size > 100 ? '1.5rem' : '1.2rem',
            }}
          >
            {`${Math.round(value)}%`}
          </Typography>
        )}
        {label && (
          <Typography
            variant="caption"
            sx={{ color: '#94A3B8', textAlign: 'center', mt: 0.5 }}
          >
            {label}
          </Typography>
        )}
      </Box>
      
      {/* SVG gradient definition */}
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};

export const LinearProgressBar = ({ 
  value, 
  label, 
  showStats = true,
  icon: Icon = TrendingUp 
}) => {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon size={16} color="#00D4FF" style={{ marginRight: 8 }} />
        <Typography variant="body2" sx={{ color: '#E2E8F0', flexGrow: 1 }}>
          {label}
        </Typography>
        {showStats && (
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {Math.round(value)}%
          </Typography>
        )}
      </Box>
      
      <Box
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${value}%`,
            background: 'linear-gradient(90deg, #00D4FF 0%, #10B981 100%)',
            borderRadius: 4,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: value > 0 ? 'shimmer 2s infinite' : 'none',
            },
          }}
        />
      </Box>
    </Box>
  );
};

// Add shimmer animation to CSS
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Inject keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}