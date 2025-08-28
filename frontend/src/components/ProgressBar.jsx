import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
} from '@mui/material';
import { CheckCircle, PlaylistPlay, Timer } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ completed, total, label = 'Progress' }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'info';
    return 'primary';
  };

  const getProgressMessage = (percentage) => {
    if (percentage === 100) return '🎉 All videos completed!';
    if (percentage >= 80) return '🚀 Almost there!';
    if (percentage >= 60) return '💪 Great progress!';
    if (percentage >= 40) return '📚 Keep going!';
    if (percentage >= 20) return '🎯 Getting started!';
    return '📖 Ready to begin!';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        backgroundColor: 'background.paper',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CheckCircle sx={{ fontSize: 28, color: 'success.main', mr: 2 }} />
        <Typography 
          variant="h6" 
          component="h3"
          sx={{
            color: 'text.primary',
            transition: 'color 0.3s ease-in-out',
          }}
        >
          Progress Overview
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              transition: 'color 0.3s ease-in-out',
            }}
          >
            {getProgressMessage(percentage)}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.primary"
            sx={{
              fontWeight: 'bold',
              transition: 'color 0.3s ease-in-out',
            }}
          >
            {percentage}%
          </Typography>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={getProgressColor(percentage)}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              transition: 'all 0.3s ease-in-out',
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<PlaylistPlay />}
          label={`${total} Videos`}
          variant="outlined"
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
            }
          }}
        />
        
        <Chip
          icon={<CheckCircle />}
          label={`${completed} Completed`}
          variant="outlined"
          color="success"
          sx={{
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'success.main',
              color: 'white',
            }
          }}
        />
        
        <Chip
          icon={<Timer />}
          label={`${total - completed} Remaining`}
          variant="outlined"
          color="warning"
          sx={{
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'warning.main',
              color: 'white',
            }
          }}
        />
      </Box>

      {percentage > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              transition: 'color 0.3s ease-in-out',
            }}
          >
            {completed === total 
              ? '🎉 Congratulations! You have completed all videos in this playlist.'
              : `You're ${percentage}% through this playlist. Keep up the great work!`
            }
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProgressBar;
