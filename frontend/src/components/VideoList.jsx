import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography,
  Box,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  PlayCircleOutline,
  CheckCircle,
  RadioButtonUnchecked,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const VideoList = ({ videos, onVideoToggle, showDayHeader = true }) => {
  const handleVideoClick = (url, isPrivate) => {
    if (isPrivate) {
      alert('This video is private and cannot be accessed.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCheckboxClick = (e, videoId, isPrivate) => {
    e.stopPropagation();
    if (isPrivate) {
      alert('Cannot mark private videos as completed.');
      return;
    }
    onVideoToggle(videoId);
  };

  const formatDuration = (duration) => {
    return duration || 'N/A';
  };

  const getVideoStatus = (videoId, isPrivate) => {
    if (isPrivate) return 'private';
    return completedVideos[videoId] ? 'completed' : 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'private': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'private': return 'Private';
      default: return 'Pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'private': return <Lock />;
      default: return <AccessTime />;
    }
  };

  const availableVideos = videos.filter(v => !v.isPrivate);
  const privateVideos = videos.filter(v => v.isPrivate);

  return (
    <Box>
      {showDayHeader && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PlayCircleOutline sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
            <Typography 
              variant="h6" 
              component="h3"
              sx={{
                color: 'text.primary',
                transition: 'color 0.3s ease-in-out',
              }}
            >
              Playlist Videos ({videos.length})
              {privateVideos.length > 0 && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({availableVideos.length} available, {privateVideos.length} private)
                </Typography>
              )}
            </Typography>
          </Box>

          {privateVideos.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>Note:</strong> {privateVideos.length} video(s) in this playlist are private or unavailable. 
              These cannot be marked as completed or accessed.
            </Alert>
          )}
        </>
      )}

      <List sx={{ width: '100%' }}>
        {videos.map((video, index) => {
          const isCompleted = completedVideos[video.id];
          const status = getVideoStatus(video.id, video.isPrivate);
          const statusColor = getStatusColor(status);
          const statusLabel = getStatusLabel(status);
          const statusIcon = getStatusIcon(status);

          return (
            <ListItem
              key={video.id}
              sx={{
                border: 1,
                borderColor: video.isPrivate 
                  ? 'error.main'
                  : isCompleted 
                    ? 'success.main' 
                    : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                mb: 2,
                backgroundColor: video.isPrivate
                  ? 'rgba(244, 67, 54, 0.1)'
                  : isCompleted 
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'background.paper',
                transition: 'all 0.3s ease-in-out',
                opacity: video.isPrivate ? 0.7 : 1,
                '&:hover': {
                  transform: video.isPrivate ? 'none' : 'translateX(4px)',
                  boxShadow: video.isPrivate ? 1 : 4,
                  borderColor: video.isPrivate ? 'error.main' : (isCompleted ? 'success.main' : 'primary.main'),
                },
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={isCompleted}
                  disabled={video.isPrivate}
                  onChange={(e) => handleCheckboxClick(e, video.id, video.isPrivate)}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle color="success" />}
                  sx={{
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: video.isPrivate ? 'none' : 'scale(1.1)',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    }
                  }}
                />
              </ListItemIcon>

              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Avatar
                  src={video.thumbnail}
                  variant="rounded"
                  sx={{ 
                    width: 80, 
                    height: 60, 
                    mr: 2,
                    border: 2,
                    borderColor: video.isPrivate ? 'error.main' : (isCompleted ? 'success.main' : 'transparent'),
                    transition: 'all 0.3s ease-in-out',
                    opacity: video.isPrivate ? 0.6 : 1,
                  }}
                />
                
                <Box sx={{ flex: 1 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          color: 'text.primary',
                          textDecoration: video.isPrivate ? 'line-through' : 'none',
                          opacity: video.isPrivate ? 0.6 : 1,
                          cursor: video.isPrivate ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            color: video.isPrivate ? 'text.primary' : 'primary.main',
                            textDecoration: video.isPrivate ? 'line-through' : 'underline',
                          }
                        }}
                        onClick={() => handleVideoClick(video.url, video.isPrivate)}
                      >
                        {video.originalIndex !== undefined ? video.originalIndex + 1 : index + 1}. {video.title}
                        {video.isPrivate && (
                          <Typography component="span" variant="body2" color="error.main" sx={{ ml: 1 }}>
                            (Private)
                          </Typography>
                        )}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          icon={statusIcon}
                          label={statusLabel}
                          size="small"
                          color={statusColor}
                          variant="filled"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            transition: 'all 0.3s ease-in-out',
                          }}
                        />
                        
                        {!video.isPrivate && (
                          <Chip
                            icon={<AccessTime />}
                            label={formatDuration(video.duration)}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              height: 24,
                              transition: 'all 0.3s ease-in-out',
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </Box>
              </Box>

              <ListItemSecondaryAction>
                <Tooltip title={video.isPrivate ? "Video is private" : "Open in YouTube"}>
                  <IconButton
                    edge="end"
                    onClick={() => handleVideoClick(video.url, video.isPrivate)}
                    disabled={video.isPrivate}
                    sx={{
                      color: video.isPrivate ? 'error.main' : 'primary.main',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: video.isPrivate ? 'none' : 'scale(1.1)',
                        color: video.isPrivate ? 'error.main' : 'primary.dark',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                      }
                    }}
                  >
                    {video.isPrivate ? <VisibilityOff /> : <PlayCircle />}
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>

      {videos.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{
              transition: 'color 0.3s ease-in-out',
            }}
          >
            No videos in this day's playlist.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoList;
