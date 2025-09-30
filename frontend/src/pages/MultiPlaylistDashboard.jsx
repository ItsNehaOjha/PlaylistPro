import React, { useState, useEffect } from 'react';
import { createApiInstance } from '../utils/api';
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
  
  // Performance optimization states
  const [updatingVideos, setUpdatingVideos] = useState(new Set());
  const [pendingUpdates, setPendingUpdates] = useState(new Map());
  
  // Form states
  const [sourceType, setSourceType] = useState('youtube');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [trackerTitle, setTrackerTitle] = useState('');
  const [videosPerDay, setVideosPerDay] = useState(5);
  const [manualTotalVideos, setManualTotalVideos] = useState(10);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // API configuration - Updated
  const api = createApiInstance(token);

  // Fetch playlists function
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/playlists');
      setPlaylists(response.data);
    } catch (error) {
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
      toast.error(error.response?.data?.message || 'Failed to delete playlist');
    }
  };

  // Optimized video toggle with optimistic updates
  const handleVideoToggle = async (playlistId, videoId, completed, videoIndex) => {
    const videoKey = videoId || `manual-${videoIndex}`;
    const updateKey = `${playlistId}-${videoKey}`;
    
    // Prevent multiple simultaneous updates for the same video
    if (updatingVideos.has(updateKey)) {
      return;
    }

    try {
      // Add to updating set
      setUpdatingVideos(prev => new Set(prev).add(updateKey));
      
      // Optimistic UI update - update local state immediately
      setPlaylists(prevPlaylists => {
        return prevPlaylists.map(playlist => {
          if (playlist._id !== playlistId) return playlist;
          
          if (playlist.sourceType === 'manual') {
            // Handle manual playlist
            const newCompletedVideos = completed 
              ? [...(playlist.completedVideos || []), { videoIndex, completedAt: new Date() }]
              : (playlist.completedVideos || []).filter(cv => cv.videoIndex !== videoIndex);
            
            return {
              ...playlist,
              completedVideos: newCompletedVideos,
              completedVideosCount: newCompletedVideos.length,
              completionPercentage: Math.round((newCompletedVideos.length / playlist.totalVideos) * 100)
            };
          } else {
            // Handle YouTube playlist
            const updatedVideos = playlist.videos.map(video => {
              if (video.videoId === videoId) {
                return {
                  ...video,
                  completed,
                  completionDate: completed ? new Date() : null
                };
              }
              return video;
            });
            
            const completedCount = updatedVideos.filter(v => v.completed && !v.isPrivate).length;
            const totalAvailable = updatedVideos.filter(v => !v.isPrivate).length;
            
            return {
              ...playlist,
              videos: updatedVideos,
              completedVideosCount: completedCount,
              completionPercentage: totalAvailable > 0 ? Math.round((completedCount / totalAvailable) * 100) : 0
            };
          }
        });
      });

      // Make API call in background
      const payload = {
        completed,
        ...(videoId ? { videoId } : { videoIndex })
      };

      await api.patch(`/playlists/${playlistId}`, payload);
      
      // Success - no need to refetch, optimistic update was correct
      
    } catch (error) {
      // Rollback optimistic update on error
      setPlaylists(prevPlaylists => {
        return prevPlaylists.map(playlist => {
          if (playlist._id !== playlistId) return playlist;
          
          if (playlist.sourceType === 'manual') {
            // Rollback manual playlist
            const newCompletedVideos = !completed 
              ? [...(playlist.completedVideos || []), { videoIndex, completedAt: new Date() }]
              : (playlist.completedVideos || []).filter(cv => cv.videoIndex !== videoIndex);
            
            return {
              ...playlist,
              completedVideos: newCompletedVideos,
              completedVideosCount: newCompletedVideos.length,
              completionPercentage: Math.round((newCompletedVideos.length / playlist.totalVideos) * 100)
            };
          } else {
            // Rollback YouTube playlist
            const updatedVideos = playlist.videos.map(video => {
              if (video.videoId === videoId) {
                return {
                  ...video,
                  completed: !completed,
                  completionDate: !completed ? new Date() : null
                };
              }
              return video;
            });
            
            const completedCount = updatedVideos.filter(v => v.completed && !v.isPrivate).length;
            const totalAvailable = updatedVideos.filter(v => !v.isPrivate).length;
            
            return {
              ...playlist,
              videos: updatedVideos,
              completedVideosCount: completedCount,
              completionPercentage: totalAvailable > 0 ? Math.round((completedCount / totalAvailable) * 100) : 0
            };
          }
        });
      });
      
      toast.error(error.response?.data?.message || 'Failed to update video status');
    } finally {
      // Remove from updating set
      setUpdatingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(updateKey);
        return newSet;
      });
    }
  };

  // Optimized batch operations for day completion
  const handleCheckAllInDay = async (playlistId, dayNumber, dayItems, videosPerDay) => {
    try {
      const playlist = playlists.find(p => p._id === playlistId);
      if (!playlist) return;

      if (playlist.sourceType === 'manual') {
        // Get all uncompleted items in this day
        const uncompletedItems = dayItems.filter(item => !item.isCompleted);
        
        if (uncompletedItems.length === 0) {
          toast.info('All items in this day are already completed!');
          return;
        }

        // Optimistic update
        setPlaylists(prevPlaylists => {
          return prevPlaylists.map(p => {
            if (p._id !== playlistId) return p;
            
            const newCompletedVideos = [...(p.completedVideos || [])];
            uncompletedItems.forEach(item => {
              if (!newCompletedVideos.some(cv => cv.videoIndex === item.index)) {
                newCompletedVideos.push({ videoIndex: item.index, completedAt: new Date() });
              }
            });
            
            return {
              ...p,
              completedVideos: newCompletedVideos,
              completedVideosCount: newCompletedVideos.length,
              completionPercentage: Math.round((newCompletedVideos.length / p.totalVideos) * 100)
            };
          });
        });

        // Make API calls for each uncompleted item
        const promises = uncompletedItems.map(item => 
          api.patch(`/playlists/${playlistId}`, {
            completed: true,
            videoIndex: item.index
          })
        );

        await Promise.all(promises);
        toast.success(`Marked ${uncompletedItems.length} items as completed!`);
      } else {
        // Handle YouTube playlists (existing logic)
        const dayVideos = playlist.videos.filter(v => v.dayNumber === parseInt(dayNumber));
        const uncompletedVideos = dayVideos.filter(v => !v.completed && !v.isPrivate);
        
        if (uncompletedVideos.length === 0) {
          toast.info('All videos in this day are already completed!');
          return;
        }

        // Optimistic update for YouTube
        setPlaylists(prevPlaylists => {
          return prevPlaylists.map(p => {
            if (p._id !== playlistId) return p;
            
            const updatedVideos = p.videos.map(video => {
              if (video.dayNumber === parseInt(dayNumber) && !video.completed && !video.isPrivate) {
                return { ...video, completed: true, completionDate: new Date() };
              }
              return video;
            });
            
            const completedCount = updatedVideos.filter(v => v.completed && !v.isPrivate).length;
            const totalAvailable = updatedVideos.filter(v => !v.isPrivate).length;
            
            return {
              ...p,
              videos: updatedVideos,
              completedVideosCount: completedCount,
              completionPercentage: totalAvailable > 0 ? Math.round((completedCount / totalAvailable) * 100) : 0
            };
          });
        });

        // Make API calls for YouTube videos
        const promises = uncompletedVideos.map(video => 
          api.patch(`/playlists/${playlistId}`, {
            completed: true,
            videoId: video.videoId
          })
        );

        await Promise.all(promises);
        toast.success(`Marked ${uncompletedVideos.length} videos as completed!`);
      }
    } catch (error) {
      toast.error('Failed to update some items');
      // Refresh to get correct state
      await fetchPlaylists();
    }
  };

  const handleUncheckAllInDay = async (playlistId, dayNumber, dayItems, videosPerDay) => {
    try {
      const playlist = playlists.find(p => p._id === playlistId);
      if (!playlist) return;

      if (playlist.sourceType === 'manual') {
        // Get all completed items in this day
        const completedItems = dayItems.filter(item => item.isCompleted);
        
        if (completedItems.length === 0) {
          toast.info('No completed items in this day to clear!');
          return;
        }

        // Optimistic update
        setPlaylists(prevPlaylists => {
          return prevPlaylists.map(p => {
            if (p._id !== playlistId) return p;
            
            const newCompletedVideos = (p.completedVideos || []).filter(cv => 
              !completedItems.some(item => item.index === cv.videoIndex)
            );
            
            return {
              ...p,
              completedVideos: newCompletedVideos,
              completedVideosCount: newCompletedVideos.length,
              completionPercentage: Math.round((newCompletedVideos.length / p.totalVideos) * 100)
            };
          });
        });

        // Make API calls for each completed item
        const promises = completedItems.map(item => 
          api.patch(`/playlists/${playlistId}`, {
            completed: false,
            videoIndex: item.index
          })
        );

        await Promise.all(promises);
        toast.success(`Cleared ${completedItems.length} items!`);
      } else {
        // Handle YouTube playlists (existing logic)
        const dayVideos = playlist.videos.filter(v => v.dayNumber === parseInt(dayNumber));
        const completedVideos = dayVideos.filter(v => v.completed && !v.isPrivate);
        
        if (completedVideos.length === 0) {
          toast.info('No completed videos in this day to clear!');
          return;
        }

        // Optimistic update for YouTube
        setPlaylists(prevPlaylists => {
          return prevPlaylists.map(p => {
            if (p._id !== playlistId) return p;
            
            const updatedVideos = p.videos.map(video => {
              if (video.dayNumber === parseInt(dayNumber) && video.completed && !video.isPrivate) {
                return { ...video, completed: false, completionDate: null };
              }
              return video;
            });
            
            const completedCount = updatedVideos.filter(v => v.completed && !v.isPrivate).length;
            const totalAvailable = updatedVideos.filter(v => !v.isPrivate).length;
            
            return {
              ...p,
              videos: updatedVideos,
              completedVideosCount: completedCount,
              completionPercentage: totalAvailable > 0 ? Math.round((completedCount / totalAvailable) * 100) : 0
            };
          });
        });

        // Make API calls for YouTube videos
        const promises = completedVideos.map(video => 
          api.patch(`/playlists/${playlistId}`, {
            completed: false,
            videoId: video.videoId
          })
        );

        await Promise.all(promises);
        toast.success(`Cleared ${completedVideos.length} videos!`);
      }
    } catch (error) {
      toast.error('Failed to update some items');
      // Refresh to get correct state
      await fetchPlaylists();
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
      
      <Box sx={{ 
        mt: 4,
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Typography 
          variant="h2" 
          component="h2" 
          sx={{
            color: '#FFFFFF',
            fontWeight: 400,
            mb: 1,
            mt: 3,
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
        
        {/* Centered Action Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{
            backgroundColor: '#3B82F6',
            color: 'black',
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
                                          color: 'black',
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
                                          color: 'black',
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
                        mb: 1.5,  // Reduced from 3
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Daily Progress
                      </Typography>
                      
                      {(() => {
                        // Group manual items by day based on videosPerDay
                        const videosPerDay = playlist.videosPerDay || 5;
                        const totalItems = playlist.manualTotalVideos || 0;
                        const completedVideos = playlist.completedVideos || [];
                        
                        const groupedItems = {};
                        for (let i = 0; i < totalItems; i++) {
                          const dayNumber = Math.floor(i / videosPerDay) + 1;
                          if (!groupedItems[dayNumber]) groupedItems[dayNumber] = [];
                          groupedItems[dayNumber].push({
                            index: i,
                            isCompleted: completedVideos.some(cv => cv.videoIndex === i)
                          });
                        }

                        return Object.entries(groupedItems).map(([dayNumber, dayItems]) => {
                          const dayCompletedItems = dayItems.filter(item => item.isCompleted).length;
                          const dayTotalItems = dayItems.length;
                          const dayProgress = dayTotalItems > 0 ? (dayCompletedItems / dayTotalItems) * 100 : 0;

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
                                    {dayCompletedItems}/{dayTotalItems} completed
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
                                    fontWeight: 500,
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '0.75rem',
                                    minWidth: '35px'
                                  }}>
                                    {Math.round(dayProgress)}%
                                  </Typography>

                                  {/* Action Buttons */}
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCheckAllInDay(playlist._id, dayNumber, dayItems, videosPerDay);
                                      }}
                                      sx={{
                                        minWidth: 'auto',
                                        px: 0.8,
                                        py: 0.3,
                                        fontSize: '0.75rem',
                                        backgroundColor: 'transparent',
                                        color: 'black',
                                        fontWeight: 600,
                                        border: 'none',
                                        borderRadius: '4px',
                                        textTransform: 'none',
                                        '&:hover': { 
                                          backgroundColor: 'transparent',
                                          color: '#059669',
                                          transform: 'scale(1.1)'
                                        },
                                        '&:active': {
                                          transform: 'scale(0.9)'
                                        }
                                      }}
                                    >
                                      ✓ All
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUncheckAllInDay(playlist._id, dayNumber, dayItems, videosPerDay);
                                      }}
                                      sx={{
                                        minWidth: 'auto',
                                        px: 0.8,
                                        py: 0.3,
                                        fontSize: '0.75rem',
                                        backgroundColor: 'transparent',
                                        color: '#EF4444',
                                        fontWeight: 600,
                                        border: 'none',
                                        borderRadius: '4px',
                                        textTransform: 'none',
                                        '&:hover': { 
                                          backgroundColor: 'transparent',
                                          color: '#DC2626',
                                          transform: 'scale(1.1)'
                                        },
                                        '&:active': {
                                          transform: 'scale(0.9)'
                                        }
                                      }}
                                    >
                                      ✗ Clear
                                    </Button>
                                  </Box>

                                  {expandedDay === dayNumber ? (
                                    <ExpandLessIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                                  ) : (
                                    <ExpandMoreIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                                  )}
                                </Box>
                              </Box>

                              {/* Expandable Day Content */}
                              <Collapse in={expandedDay === dayNumber}>
                                <Box sx={{ p: 2 }}>
                                  <Grid container spacing={1.5}>
                                    {dayItems.map((item) => (
                                      <Grid item xs={12} sm={6} md={4} key={item.index}>
                                        <Box
                                          onClick={() => handleVideoToggle(playlist._id, null, !item.isCompleted, item.index)}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: '6px',
                                            backgroundColor: item.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                            border: item.isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #4B5563',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                              backgroundColor: item.isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.05)',
                                              border: item.isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)'
                                            }
                                          }}
                                        >
                                          {item.isCompleted ? (
                                            <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18 }} />
                                          ) : (
                                            <RadioButtonUncheckedIcon sx={{ color: '#6B7280', fontSize: 18 }} />
                                          )}
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: item.isCompleted ? '#10B981' : '#F9FAFB',
                                              fontWeight: item.isCompleted ? 500 : 400,
                                              fontFamily: "'Inter', sans-serif",
                                              fontSize: '0.85rem'
                                            }}
                                          >
                                            Item {item.index + 1}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        });
                      })()}
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
                helperText="Paste the full YouTube playlist URL here"
                FormHelperTextProps={{ sx: { color: '#6B7280' } }}
              />
              
              <TextField
                margin="dense"
                id="name"
                label="Playlist Name"
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