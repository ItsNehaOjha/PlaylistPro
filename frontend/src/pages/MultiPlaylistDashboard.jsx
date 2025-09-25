import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  YouTube as YouTubeIcon,
  VideoFile as VideoFileIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { confirmAction } from '../utils/confirmToast.jsx';

const MultiPlaylistDashboard = () => {
  const { user, token } = useAuth();
  
  // State management
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  
  // Form states
  const [sourceType, setSourceType] = useState('youtube');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [trackerTitle, setTrackerTitle] = useState('');
  const [videosPerDay, setVideosPerDay] = useState(5);
  const [manualTotalVideos, setManualTotalVideos] = useState(10);

  // API configuration
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch playlists function
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/playlists');
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  // Other handler functions would go here
  const handleAddPlaylist = async () => {
    if (!sourceType) {
      toast.error('Please select a source type');
      return;
    }

    if (sourceType === 'youtube' && !playlistUrl.trim()) {
      toast.error('Please enter a YouTube playlist URL');
      return;
    }

    if (sourceType === 'manual' && (!trackerTitle.trim() || !manualTotalVideos)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        sourceType,
        videosPerDay,
        ...(sourceType === 'youtube' 
          ? { 
              playlistUrl: playlistUrl.trim(),
              trackerTitle: trackerTitle.trim() || undefined
            }
          : { 
              title: trackerTitle.trim(),
              totalVideos: manualTotalVideos,
              trackerTitle: trackerTitle.trim()
            }
        )
      };

      await api.post('/playlists', payload);
      
      // Reset form
      setPlaylistUrl('');
      setTrackerTitle('');
      setManualTotalVideos(10);
      setVideosPerDay(5);
      setSourceType('youtube');
      setAddDialogOpen(false);
      
      // Refresh playlists
      await fetchPlaylists();
      
      toast.success('Playlist added successfully!');
    } catch (error) {
      console.error('Error adding playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to add playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await api.delete(`/playlists/${playlistId}`);
      await fetchPlaylists();
      toast.success('Playlist deleted successfully!');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to delete playlist');
    }
  };

  const handleVideoToggle = async (playlistId, videoId, completed, videoIndex) => {
    try {
      const payload = {
        completed,
        ...(videoId ? { videoId } : { videoIndex })
      };

      await api.patch(`/playlists/${playlistId}`, payload);
      await fetchPlaylists();
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error(error.response?.data?.message || 'Failed to update video status');
    }
  };

  const handleCheckAllInDay = async (playlistId, dayNumber) => {
    try {
      const playlist = playlists.find(p => p._id === playlistId);
      if (!playlist) return;

      const dayVideos = playlist.videos.filter(v => v.dayNumber === dayNumber && !v.isPrivate);
      
      for (const video of dayVideos) {
        if (!video.completed) {
          await api.patch(`/playlists/${playlistId}`, {
            videoId: video.videoId,
            completed: true
          });
        }
      }
      
      await fetchPlaylists();
      toast.success(`All videos in Day ${dayNumber} marked as complete!`);
    } catch (error) {
      console.error('Error checking all videos in day:', error);
      toast.error(error.response?.data?.message || 'Failed to update videos');
    }
  };

  const handleUncheckAllInDay = async (playlistId, dayNumber) => {
    try {
      const playlist = playlists.find(p => p._id === playlistId);
      if (!playlist) return;

      const dayVideos = playlist.videos.filter(v => v.dayNumber === dayNumber && !v.isPrivate);
      
      for (const video of dayVideos) {
        if (video.completed) {
          await api.patch(`/playlists/${playlistId}`, {
            videoId: video.videoId,
            completed: false
          });
        }
      }
      
      await fetchPlaylists();
      toast.success(`All videos in Day ${dayNumber} cleared!`);
    } catch (error) {
      console.error('Error unchecking all videos in day:', error);
      toast.error(error.response?.data?.message || 'Failed to update videos');
    }
  };

  const handleUpdateManualTotal = async (playlistId, newTotal) => {
    try {
      await api.patch(`/playlists/${playlistId}/total`, {
        totalVideos: newTotal
      });
      await fetchPlaylists();
      toast.success('Manual playlist total updated successfully!');
    } catch (error) {
      console.error('Error updating manual total:', error);
      toast.error(error.response?.data?.message || 'Failed to update total');
    }
  };

  // useEffect for initial data fetch
  useEffect(() => {
    if (token) {
      fetchPlaylists();
    }
  }, [token]);

  return (
    <Container maxWidth="lg" >
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            color: '#FFFFFF',
            fontWeight: 600,
            mb: 1,
            fontFamily: "'Inter', sans-serif"
          }}
        >
          My Learning Playlists
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#94A3B8',
            fontFamily: "'Inter', sans-serif",
            mb: 2
          }}
        >
          Track your progress across multiple YouTube playlists and manual sources
        </Typography>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              borderRadius: '8px',
              px: 3,
              py: 1,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none'
              }
            }}
          >
            Add Playlist
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPlaylists}
            disabled={loading}
            sx={{
              borderColor: '#374151',
              color: '#9CA3AF',
              borderRadius: '8px',
              px: 3,
              py: 1.5,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#4B5563',
                backgroundColor: 'rgba(75, 85, 99, 0.1)'
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {playlists.length === 0 ? (
        <Card sx={{ 
          p: 6, 
          textAlign: 'center',
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '12px',
          boxShadow: 'none'
        }}>
          <Box sx={{ mb: 3 }}>
            <VideoFileIcon sx={{ fontSize: 48, color: '#6B7280', mb: 2 }} />
          </Box>
          <Typography variant="h6" sx={{ 
            color: '#F9FAFB',
            fontFamily: "'Inter', sans-serif",
            mb: 2
          }}>
            No playlists yet
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#9CA3AF',
            fontFamily: "'Inter', sans-serif",
            mb: 4,
            maxWidth: '400px',
            mx: 'auto'
          }}>
            Add your first YouTube playlist or manual tracker to start tracking your learning progress
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontFamily: "'Inter', sans-serif",
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none'
              }
            }}
          >
            Add Your First Playlist
          </Button>
        </Card>
      ) : (
        <>
          {/* Playlist Tabs */}
          <Box sx={{ mb: 2 }}>
            <Tabs 
              value={selectedTab} 
              onChange={(e, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                '& .MuiTab-root': {
                  color: '#9CA3AF',
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: '40px',
                  '&.Mui-selected': {
                    color: '#3B82F6'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#3B82F6',
                  height: '2px'
                }
              }}
            >
              {playlists.map((playlist, index) => (
                <Tab 
                  key={playlist._id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {playlist.sourceType === 'youtube' ? 
                        <YouTubeIcon sx={{ fontSize: 16 }} /> : 
                        <VideoFileIcon sx={{ fontSize: 16 }} />
                      }
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {playlist.trackerTitle || playlist.title}
                      </Typography>
                      <Chip 
                        label={`${playlist.completedVideosCount}/${playlist.totalVideos}`}
                        size="small"
                        sx={{
                          backgroundColor: '#1F2937',
                          color: '#9CA3AF',
                          border: '1px solid #374151',
                          fontSize: '0.7rem',
                          height: '20px'
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Playlist Content */}
          {playlists.map((playlist, index) => (
            <Box
              key={playlist._id}
              sx={{ display: selectedTab === index ? 'block' : 'none' }}
            >
              <Card sx={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                boxShadow: 'none',
                mb: 2
              }}>
                <CardContent sx={{ p: 2 }}>
                  {/* Playlist Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#F9FAFB',
                            fontWeight: 600,
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {playlist.trackerTitle || playlist.title}
                        </Typography>
                        {/* Progress percentage inline with title */}
                        <Typography variant="body2" sx={{ 
                          color: '#3B82F6',
                          fontWeight: 600,
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {playlist.completionPercentage}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip
                          icon={playlist.sourceType === 'youtube' ? <YouTubeIcon /> : <VideoFileIcon />}
                          label={playlist.sourceType === 'youtube' ? 'YouTube Playlist' : 'Manual Tracker'}
                          size="small"
                          sx={{
                            backgroundColor: playlist.sourceType === 'youtube' ? '#DC2626' : '#059669',
                            color: '#FFFFFF',
                            fontWeight: 500
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {playlist.videosPerDay} videos per day
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                        {playlist.sourceType === 'youtube' 
                          ? `${playlist.availableVideos} available videos (${playlist.privateVideos} private)`
                          : `${playlist.totalVideos} total items`
                        }
                      </Typography>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => setEditingPlaylist(playlist)}
                        sx={{ 
                          color: '#6B7280',
                          '&:hover': { 
                            color: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePlaylist(playlist._id)}
                        sx={{ 
                          color: '#6B7280',
                          '&:hover': { 
                            color: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Compact Progress Section */}
                  <Box sx={{ mb: 2 }}>  {/* Reduced from 4 */}
                    <LinearProgress
                      variant="determinate"
                      value={playlist.completionPercentage}
                      sx={{
                        height: 6,  // Reduced from 8
                        borderRadius: 3,
                        backgroundColor: '#374151',
                        mb: 0.5,  // Small margin
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#10B981',
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ 
                      color: '#9CA3AF',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.8rem'  // Smaller text
                    }}>
                      {playlist.completedVideosCount} of {playlist.totalVideos} completed
                    </Typography>
                  </Box>

                  {/* Day-wise Content */}
                  {playlist.sourceType === 'youtube' && (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        color: '#F9FAFB',
                        fontWeight: 600,
                        mb: 1.5,  // Reduced from 3
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Daily Progress
                      </Typography>
                      
                      {(() => {
                        const groupedVideos = playlist.videos.reduce((acc, video) => {
                          if (!acc[video.dayNumber]) acc[video.dayNumber] = [];
                          acc[video.dayNumber].push(video);
                          return acc;
                        }, {});

                        return Object.entries(groupedVideos).map(([dayNumber, dayVideos]) => {
                          const dayCompletedVideos = dayVideos.filter(v => v.completed && !v.isPrivate).length;
                          const dayTotalVideos = dayVideos.filter(v => !v.isPrivate).length;
                          const dayProgress = dayTotalVideos > 0 ? (dayCompletedVideos / dayTotalVideos) * 100 : 0;

                          return (
                            <Box
                              key={dayNumber}
                              sx={{
                                mb: 1,  // Reduced from 2
                                backgroundColor: '#1F2937',
                                borderRadius: '8px',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Compact Day Header */}
                              <Box 
                                onClick={() => setExpandedDay(expandedDay === dayNumber ? null : dayNumber)}
                                sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  p: 1.5,  // Reduced from 3
                                  cursor: 'pointer',
                                  backgroundColor: '#374151',
                                  borderBottom: expandedDay === dayNumber ? '1px solid #4B5563' : 'none'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body1" sx={{  // Reduced from h6
                                    color: '#F9FAFB',
                                    fontWeight: 600,
                                    fontFamily: "'Inter', sans-serif"
                                  }}>
                                    Day {dayNumber}
                                  </Typography>
                                  <Typography variant="body2" sx={{
                                    color: '#9CA3AF',
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '0.8rem'
                                  }}>
                                    {dayCompletedVideos}/{dayTotalVideos} completed
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {/* Compact Progress Bar */}
                                  <Box sx={{ width: 60, mr: 1 }}>  
                                    <LinearProgress
                                      variant="determinate"
                                      value={dayProgress}
                                      sx={{
                                        height: 4,  // Reduced from default
                                        borderRadius: 2,
                                        backgroundColor: '#4B5563',
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: '#10B981',
                                          borderRadius: 2
                                        }
                                      }}
                                    />
                                  </Box>
                                  
                                  <Typography variant="body2" sx={{ 
                                    color: '#3B82F6',
                                    fontWeight: 600,
                                    minWidth: '35px',
                                    fontSize: '0.8rem'
                                  }}>
                                    {Math.round(dayProgress)}%
                                  </Typography>

                                  <ExpandMoreIcon 
                                    sx={{ 
                                      color: '#9CA3AF',
                                      fontSize: 20,  // Reduced from default
                                      transform: expandedDay === dayNumber ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s ease'
                                    }} 
                                  />
                                </Box>
                              </Box>

                              {/* Expanded Content */}
                              <Collapse in={expandedDay === dayNumber}>
                                <Box sx={{ p: 3, backgroundColor: '#1F2937' }}>
                                  {/* Simple Action Buttons */}
                                  {dayTotalVideos > 0 && (
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCheckAllInDay(playlist._id, parseInt(dayNumber));
                                        }}
                                        disabled={dayCompletedVideos === dayTotalVideos}
                                        sx={{
                                          backgroundColor: '#10B981',
                                          color: '#FFFFFF',
                                          textTransform: 'none',
                                          fontSize: '0.8rem',
                                          fontFamily: "'Inter', sans-serif",
                                          boxShadow: 'none',
                                          '&:hover': {
                                            backgroundColor: '#059669',
                                            boxShadow: 'none'
                                          },
                                          '&:disabled': {
                                            backgroundColor: '#4B5563',
                                            color: '#9CA3AF'
                                          }
                                        }}
                                      >
                                        Mark All Complete
                                      </Button>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUncheckAllInDay(playlist._id, parseInt(dayNumber));
                                        }}
                                        disabled={dayCompletedVideos === 0}
                                        sx={{
                                          backgroundColor: '#F59E0B',
                                          color: '#FFFFFF',
                                          textTransform: 'none',
                                          fontSize: '0.8rem',
                                          fontFamily: "'Inter', sans-serif",
                                          boxShadow: 'none',
                                          '&:hover': {
                                            backgroundColor: '#D97706',
                                            boxShadow: 'none'
                                          },
                                          '&:disabled': {
                                            backgroundColor: '#4B5563',
                                            color: '#9CA3AF'
                                          }
                                        }}
                                      >
                                        Clear All
                                      </Button>
                                    </Box>
                                  )}

                                  {/* Simple Video List */}
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {dayVideos.map((video, index) => (
                                      <Box
                                        key={video.videoId || index}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVideoToggle(playlist._id, video.videoId, !video.completed, video.originalIndex);
                                        }}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 2,
                                          p: 2,
                                          borderRadius: '6px',
                                          backgroundColor: video.completed ? '#065F46' : '#374151',
                                          cursor: 'pointer',
                                          border: '1px solid transparent'
                                        }}
                                      >
                                        {/* Simple Completion Indicator */}
                                        <Box sx={{ 
                                          width: 20, 
                                          height: 20, 
                                          borderRadius: '50%',
                                          backgroundColor: video.completed ? '#10B981' : '#6B7280',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0
                                        }}>
                                          {video.completed && (
                                            <CheckCircleIcon sx={{ color: '#FFFFFF', fontSize: 14 }} />
                                          )}
                                        </Box>

                                        {/* Video Title */}
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            color: '#FFFFFF',
                                            fontSize: '0.875rem',
                                            fontFamily: "'Inter', sans-serif",
                                            flex: 1,
                                            opacity: video.completed ? 0.7 : 1
                                          }}
                                        >
                                          {video.title}
                                          {video.isPrivate && (
                                            <span style={{ color: '#F59E0B', marginLeft: '8px' }}>
                                              (Private Video)
                                            </span>
                                          )}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        });
                      })()}
                    </Box>
                  )}

                  {/* Manual Tracker Content */}
                  {playlist.sourceType === 'manual' && (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        color: '#F9FAFB',
                        fontWeight: 600,
                        mb: 3,
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Manual Progress Tracker
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {Array.from({ length: playlist.manualTotalVideos }, (_, index) => {
                          const isCompleted = playlist.completedVideos?.some(cv => cv.videoIndex === index);
                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box
                                onClick={() => handleVideoToggle(playlist._id, null, !isCompleted, index)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  p: 2,
                                  borderRadius: '6px',
                                  backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                  border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #374151',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.05)',
                                    border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)'
                                  }
                                }}
                              >
                                {isCompleted ? (
                                  <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                                ) : (
                                  <RadioButtonUncheckedIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isCompleted ? '#10B981' : '#F9FAFB',
                                    fontWeight: isCompleted ? 500 : 400,
                                    fontFamily: "'Inter', sans-serif"
                                  }}
                                >
                                  Item {index + 1}
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </>
      )}

      {/* Add Playlist Dialog - Clean and Simple */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#F9FAFB',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          pb: 2
        }}>
          Add New Playlist
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <Typography variant="subtitle1" sx={{ 
              color: '#F9FAFB',
              mb: 2,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500
            }}>
              Source Type
            </Typography>
            <RadioGroup
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              sx={{ gap: 1 }}
            >
              <FormControlLabel
                value="youtube"
                control={<Radio sx={{ color: '#9CA3AF' }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <YouTubeIcon sx={{ color: '#DC2626' }} />
                    <Typography sx={{ color: '#F9FAFB', fontFamily: "'Inter', sans-serif" }}>
                      YouTube Playlist
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="manual"
                control={<Radio sx={{ color: '#9CA3AF' }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoFileIcon sx={{ color: '#059669' }} />
                    <Typography sx={{ color: '#F9FAFB', fontFamily: "'Inter', sans-serif" }}>
                      Manual Tracker
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {sourceType === 'youtube' ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="YouTube Playlist URL"
                fullWidth
                variant="outlined"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=..."
                sx={{ 
                  mb: 3,
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#F9FAFB',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#4B5563' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                  }
                }}
              />
              
              <TextField
                margin="dense"
                label="Tracker Title"
                fullWidth
                variant="outlined"
                value={trackerTitle}
                onChange={(e) => setTrackerTitle(e.target.value)}
                placeholder="Enter a custom name for this playlist"
                sx={{ 
                  mb: 3,
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#F9FAFB',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#4B5563' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                  }
                }}
                helperText="This will be the display name for your playlist"
                FormHelperTextProps={{ sx: { color: '#6B7280' } }}
              />
              
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9CA3AF' }}>Videos per Day</InputLabel>
                <Select
                  value={videosPerDay}
                  label="Videos per Day"
                  variant="outlined"
                  onChange={(e) => setVideosPerDay(e.target.value)}
                  sx={{
                    color: '#F9FAFB',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#4B5563' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        '& .MuiMenuItem-root': {
                          color: '#F9FAFB',
                          '&:hover': { backgroundColor: '#374151' },
                          '&.Mui-selected': { backgroundColor: '#3B82F6' }
                        }
                      }
                    }
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <MenuItem key={num} value={num}>{num} videos per day</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Tracker Title"
                fullWidth
                variant="outlined"
                value={trackerTitle}
                onChange={(e) => setTrackerTitle(e.target.value)}
                placeholder="e.g., Course Notes, Study Materials, etc."
                sx={{ 
                  mb: 3,
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#F9FAFB',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#4B5563' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                  }
                }}
                helperText="This will be the display name for your tracker"
                FormHelperTextProps={{ sx: { color: '#6B7280' } }}
              />
              
              <TextField
                margin="dense"
                label="Total Videos/Items"
                type="number"
                fullWidth
                variant="outlined"
                value={manualTotalVideos}
                onChange={(e) => setManualTotalVideos(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 1000 }}
                sx={{ 
                  mb: 3,
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#F9FAFB',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#4B5563' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                  }
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9CA3AF' }}>Items per Day</InputLabel>
                <Select
                  value={videosPerDay}
                  label="Items per Day"
                  variant="outlined"
                  onChange={(e) => setVideosPerDay(e.target.value)}
                  sx={{
                    color: '#F9FAFB',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#4B5563' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        '& .MuiMenuItem-root': {
                          color: '#F9FAFB',
                          '&:hover': { backgroundColor: '#374151' },
                          '&.Mui-selected': { backgroundColor: '#3B82F6' }
                        }
                      }
                    }
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <MenuItem key={num} value={num}>{num} items per day</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setAddDialogOpen(false)}
            sx={{ 
              color: '#9CA3AF',
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddPlaylist}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Add Playlist'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog - Similar clean styling */}
      <Dialog 
        open={!!editingPlaylist} 
        onClose={() => setEditingPlaylist(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#F9FAFB',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600
        }}>
          Edit Total Videos
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Total Videos/Items"
            type="number"
            fullWidth
            variant="outlined"
            value={editingPlaylist?.manualTotalVideos || 1}
            onChange={(e) => {
              if (editingPlaylist) {
                setEditingPlaylist({
                  ...editingPlaylist,
                  manualTotalVideos: parseInt(e.target.value) || 1
                });
              }
            }}
            inputProps={{ min: 1, max: 1000 }}
            sx={{ 
              mb: 2,
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                color: '#F9FAFB',
                '& fieldset': { borderColor: '#374151' },
                '&:hover fieldset': { borderColor: '#4B5563' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Update the total number of videos/items in this tracker. Completed items beyond the new total will be removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditingPlaylist(null)}
            sx={{ 
              color: '#9CA3AF',
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleUpdateManualTotal(editingPlaylist._id, editingPlaylist.manualTotalVideos)}
            variant="contained"
            sx={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none'
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MultiPlaylistDashboard;