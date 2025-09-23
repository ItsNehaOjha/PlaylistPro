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
  Radio
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
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { confirmAction } from '../utils/confirmToast.jsx';

const MultiPlaylistDashboard = () => {
  const { user, token } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [videosPerDay, setVideosPerDay] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});
  
  // New state for manual playlist creation
  const [sourceType, setSourceType] = useState('youtube');
  const [manualTitle, setManualTitle] = useState('');
  const [manualTotalVideos, setManualTotalVideos] = useState(10);
  const [trackerTitle, setTrackerTitle] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/playlists');
      setPlaylists(response.data);
      
      // Initialize expanded days for each playlist
      const initialExpanded = {};
      response.data.forEach(playlist => {
        initialExpanded[playlist._id] = { 1: true }; // Only Day 1 expanded by default
      });
      setExpandedDays(initialExpanded);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPlaylists();
    }
  }, [token]);

  // Add new playlist
  const handleAddPlaylist = async () => {
    try {
      setSubmitting(true);
      
      let requestData = {
        videosPerDay,
        sourceType,
        trackerTitle: trackerTitle.trim(),
      };

      if (sourceType === 'youtube') {
        if (!newPlaylistUrl.trim()) {
          toast.error('Please enter a playlist URL');
          return;
        }
        requestData.playlistUrl = newPlaylistUrl.trim();
      } else {
        if (!trackerTitle.trim()) {
          toast.error('Please enter a tracker title');
          return;
        }
        requestData.title = trackerTitle.trim();
        requestData.totalVideos = manualTotalVideos;
      }

      const response = await api.post('/playlists', requestData);

      setPlaylists(prev => [response.data, ...prev]);
      
      // Reset form
      setNewPlaylistUrl('');
      setManualTitle('');
      setManualTotalVideos(10);
      setTrackerTitle('');
      setSourceType('youtube');
      setAddDialogOpen(false);
      
      // Initialize expanded days for new playlist
      setExpandedDays(prev => ({
        ...prev,
        [response.data._id]: { 1: true }
      }));
      
      toast.success('Playlist added successfully!');
    } catch (error) {
      console.error('Error adding playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to add playlist');
    } finally {
      setSubmitting(false);
    }
  };

  // Update video completion status
  const handleVideoToggle = async (playlistId, videoId, completed, videoIndex) => {
    try {
      const playlist = playlists.find(p => p._id === playlistId);
      if (!playlist) return;

      let requestData = { completed };
      
      if (playlist.sourceType === 'manual') {
        requestData.videoIndex = videoIndex;
      } else {
        requestData.videoId = videoId;
      }

      const response = await api.patch(`/playlists/${playlistId}`, requestData);

      setPlaylists(prev => 
        prev.map(playlist => 
          playlist._id === playlistId ? response.data : playlist
        )
      );
      
      // Refresh scheduler data if available
      if (typeof window !== 'undefined' && window.refreshSchedulerData) {
        setTimeout(() => window.refreshSchedulerData(), 500); // Small delay to ensure playlist update is processed
      }
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video progress');
    }
  };

  // Update manual playlist total videos
  const handleUpdateManualTotal = async (playlistId, newTotal) => {
    try {
      const response = await api.patch(`/playlists/${playlistId}/total`, {
        totalVideos: newTotal
      });

      setPlaylists(prev => 
        prev.map(playlist => 
          playlist._id === playlistId ? response.data : playlist
        )
      );
      setEditingPlaylist(null);
      
      // Refresh scheduler data if available
      if (typeof window !== 'undefined' && window.refreshSchedulerData) {
        setTimeout(() => window.refreshSchedulerData(), 500);
      }
    } catch (error) {
      console.error('Error updating manual total:', error);
      toast.error('Failed to update total videos');
    }
  };

  // Delete playlist
  const handleDeletePlaylist = async (playlistId) => {
    const playlist = playlists.find(p => p._id === playlistId);
    const playlistName = playlist?.trackerTitle || playlist?.title || 'this playlist';
    
    confirmAction(
      `Are you sure you want to delete "${playlistName}"? This action cannot be undone.`,
      async () => {
        try {
          await api.delete(`/playlists/${playlistId}`);
          setPlaylists(prev => prev.filter(p => p._id !== playlistId));
          
          // Clean up expanded days
          setExpandedDays(prev => {
            const newExpanded = { ...prev };
            delete newExpanded[playlistId];
            return newExpanded;
          });
          toast.success('Playlist deleted successfully!');
        } catch (error) {
          console.error('Error deleting playlist:', error);
          toast.error('Failed to delete playlist');
        }
      }
    );
  };

  // Toggle day expansion
  const toggleDayExpansion = (playlistId, dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [playlistId]: {
        ...prev[playlistId],
        [dayNumber]: !prev[playlistId]?.[dayNumber]
      }
    }));
  };

  // Group videos by day for a specific playlist
  const groupVideosByDay = (videos, videosPerDay) => {
    const groups = {};
    videos.forEach(video => {
      const dayNumber = video.dayNumber;
      if (!groups[dayNumber]) {
        groups[dayNumber] = [];
      }
      groups[dayNumber].push(video);
    });
    return groups;
  };

  // Generate manual video entries for a day
  const generateManualVideosForDay = (playlist, dayNumber) => {
    const startIndex = (dayNumber - 1) * playlist.videosPerDay;
    const endIndex = Math.min(startIndex + playlist.videosPerDay, playlist.manualTotalVideos);
    const videos = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const isCompleted = playlist.completedVideos.some(cv => cv.videoIndex === i);
      videos.push({
        videoId: `manual-${i}`,
        title: `Video ${i + 1}`,
        originalIndex: i,
        completed: isCompleted,
        completionDate: isCompleted ? playlist.completedVideos.find(cv => cv.videoIndex === i)?.completedAt : null,
        isPrivate: false,
        url: '',
        thumbnail: '',
      });
    }
    
    return videos;
  };

  // Get day groups for a specific playlist
  const getDayGroups = (playlist) => {
    console.log('getDayGroups called for playlist:', playlist.title, 'sourceType:', playlist.sourceType);
    let dayGroups = {};
    
    if (playlist.sourceType === 'youtube') {
      console.log('Processing YouTube playlist with', playlist.videos?.length, 'videos');
      dayGroups = groupVideosByDay(playlist.videos, playlist.videosPerDay);
    } else {
      console.log('Processing manual playlist with', playlist.manualTotalVideos, 'total videos,', playlist.videosPerDay, 'per day');
      // For manual playlists, generate day groups
      const totalDays = Math.ceil(playlist.manualTotalVideos / playlist.videosPerDay);
      console.log('Total days calculated:', totalDays);
      for (let day = 1; day <= totalDays; day++) {
        dayGroups[day] = generateManualVideosForDay(playlist, day);
        console.log(`Day ${day} has ${dayGroups[day].length} videos`);
      }
    }
    
    console.log('Final dayGroups:', dayGroups);
    return dayGroups;
  };

  // Check all videos in a day
  const handleCheckAllInDay = async (playlistId, dayNumber) => {
    console.log('handleCheckAllInDay called with:', { playlistId, dayNumber });
    try {
      const playlist = playlists.find(p => p._id === playlistId);
      if (!playlist) {
        console.log('Playlist not found:', playlistId);
        return;
      }
      
      console.log('Found playlist:', playlist.title);
      const dayGroups = getDayGroups(playlist);
      console.log('Day groups:', dayGroups);
      const dayVideos = dayGroups[dayNumber] || [];
      console.log('Day videos for day', dayNumber, ':', dayVideos);
      
      // Update all videos in the day
      for (const video of dayVideos) {
        console.log('Processing video:', video);
        if (playlist.sourceType === 'manual') {
          await handleVideoToggle(playlistId, null, true, video.originalIndex);
        } else {
          await handleVideoToggle(playlistId, video.videoId, true, video.originalIndex);
        }
      }
      
      console.log('All videos in day', dayNumber, 'marked as completed');
      
      // Refresh scheduler data after bulk update
      if (typeof window !== 'undefined' && window.refreshSchedulerData) {
        setTimeout(() => window.refreshSchedulerData(), 1000);
      }
    } catch (error) {
      console.error('Error checking all videos:', error);
      toast.error('Failed to check all videos in day');
    }
  };

  // Uncheck all videos in a day
  const handleUncheckAllInDay = async (playlistId, dayNumber) => {
    console.log('handleUncheckAllInDay called with:', { playlistId, dayNumber });
    try {
      const playlist = playlists.find(p => p._id === playlistId);
      if (!playlist) {
        console.log('Playlist not found:', playlistId);
        return;
      }
      
      console.log('Found playlist:', playlist.title);
      const dayGroups = getDayGroups(playlist);
      console.log('Day groups:', dayGroups);
      const dayVideos = dayGroups[dayNumber] || [];
      console.log('Day videos for day', dayNumber, ':', dayVideos);
      
      // Update all videos in the day
      for (const video of dayVideos) {
        console.log('Processing video:', video);
        if (playlist.sourceType === 'manual') {
          await handleVideoToggle(playlistId, null, false, video.originalIndex);
        } else {
          await handleVideoToggle(playlistId, video.videoId, false, video.originalIndex);
        }
      }
      
      console.log('All videos in day', dayNumber, 'marked as incomplete');
      
      // Refresh scheduler data after bulk update
      if (typeof window !== 'undefined' && window.refreshSchedulerData) {
        setTimeout(() => window.refreshSchedulerData(), 1000);
      }
    } catch (error) {
      console.error('Error unchecking all videos:', error);
      toast.error('Failed to uncheck all videos in day');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ 
       
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          backgroundColor: 'transparent', 
          borderRadius: '2px', 
          padding: '30px 20px',
          marginBottom: '30px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{
              color: '#FFFFFF',
              fontSize: '2rem',
              fontWeight: 700,
              padding: '0px',
              marginBottom: '15px',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            My Learning Playlists
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.95rem',
              fontFamily: "'Poppins', sans-serif",
              padding: '0px',
              marginBottom: '0px'
            }}
            paragraph
          >
            Track your progress across multiple YouTube playlists and manual sources
          </Typography>
        </Box>
      </Box>



      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{
            backgroundColor: '#1976d2',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '12px 24px',
            fontFamily: "'Inter', sans-serif",
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          Add New Playlist
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPlaylists}
          disabled={loading}
          sx={{
            borderColor: '#1976d2',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '12px 24px',
            fontFamily: "'Inter', sans-serif",
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {playlists.length === 0 ? (
        <Card sx={{ 
          p: 4, 
          textAlign: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}>
          <Typography variant="h6" sx={{ 
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Inter', sans-serif"
          }} gutterBottom>
            No playlists yet
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Inter', sans-serif"
          }} paragraph>
            Add your first YouTube playlist or manual tracker to start tracking your learning progress!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              backgroundColor: '#1976d2',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '10px 20px',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Add Your First Playlist
          </Button>
        </Card>
      ) : (
        <>
          <Tabs 
            value={selectedTab} 
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              mb: 4,
              padding: '0 20px',
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'Inter', sans-serif",
                marginRight: '24px',
                minWidth: 'auto',
                padding: '12px 16px',
                '&.Mui-selected': {
                  color: '#FFFFFF',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#31c48d',
              }
            }}
          >
            {playlists.map((playlist, index) => (
              <Tab 
                key={playlist._id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {playlist.sourceType === 'youtube' ? <YouTubeIcon fontSize="small" /> : <VideoFileIcon fontSize="small" />}
                    <Typography variant="body2" noWrap>
                      {playlist.trackerTitle || playlist.title}
                    </Typography>
                    <Chip 
                      label={`${playlist.completedVideosCount}/${playlist.totalVideos}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>

          {playlists.map((playlist, index) => (
            <Box
              key={playlist._id}
              sx={{ display: selectedTab === index ? 'block' : 'none' }}
            >
              <Card sx={{ 
                mb: 4, 
                backgroundColor: 'transparent', 
                border: 'none',
                boxShadow: 'none',
                padding: '30px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <CardContent sx={{ padding: '0 !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ 
                          color: '#FFFFFF',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          marginBottom: '0'
                        }}>
                          {playlist.trackerTitle || playlist.title}
                        </Typography>
                        {playlist.sourceType === 'youtube' ? (
                          <YouTubeIcon sx={{ color: '#FF0000', fontSize: 24 }} />
                        ) : (
                          <VideoFileIcon sx={{ color: '#4CAF50', fontSize: 24 }} />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: "'Inter', sans-serif",
                        marginBottom: '8px'
                      }} gutterBottom>
                        {playlist.completedVideosCount}/{playlist.totalVideos} videos completed
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: "'Inter', sans-serif",
                        marginBottom: '0'
                      }}>
                        {playlist.videosPerDay} videos per day • Last updated: {new Date(playlist.lastFetched).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    {/* Action Icons */}
                    <Box sx={{ display: 'flex', gap: 2, marginLeft: '20px' }}>
                      <IconButton
                        size="small"
                        onClick={() => setEditingPlaylist(playlist)}
                        sx={{ color: '#1976d2' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePlaylist(playlist._id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 4, padding: '0 20px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ 
                        color: '#FFFFFF',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500
                      }}>
                        Progress
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {playlist.completionPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={playlist.completionPercentage}
                      sx={{
                        height: 8,
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#31c48d',
                        }
                      }}
                    />
                  </Box>

                  {/* Day Groups */}
                  {(() => {
                    let dayGroups = {};
                    
                    if (playlist.sourceType === 'youtube') {
                      dayGroups = groupVideosByDay(playlist.videos, playlist.videosPerDay);
                    } else {
                      // For manual playlists, generate day groups
                      const totalDays = Math.ceil(playlist.manualTotalVideos / playlist.videosPerDay);
                      for (let day = 1; day <= totalDays; day++) {
                        dayGroups[day] = generateManualVideosForDay(playlist, day);
                      }
                    }

                    return Object.keys(dayGroups).map(dayNumber => {
                      const dayVideos = dayGroups[dayNumber];
                      const dayCompletedVideos = dayVideos.filter(v => v.completed && !v.isPrivate).length;
                      const dayTotalVideos = dayVideos.filter(v => !v.isPrivate).length;
                      const isDayCompleted = dayCompletedVideos === dayTotalVideos && dayTotalVideos > 0;
                      

                      const isExpanded = expandedDays[playlist._id]?.[dayNumber] || false;

                      return (
                        <Card key={dayNumber} sx={{ 
                          mb: 3, 
                          backgroundColor: 'transparent', 
                          border: 'none',
                          boxShadow: 'none',
                          padding: '0 20px'
                        }}>
                          <Box
                            sx={{
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: 'transparent',
                              padding: '20px 0',
                              borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}
                            onClick={() => toggleDayExpansion(playlist._id, parseInt(dayNumber))}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {/* Day Title */}
                              <Typography variant="h6" sx={{ 
                                color: '#FFFFFF', 
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                fontFamily: "'Inter', sans-serif",
                                marginBottom: '0'
                              }}>
                                Day - {dayNumber}
                              </Typography>
                              
                              {/* Video Count */}
                              <Typography variant="body2" sx={{ 
                                color: 'rgba(255,255,255,0.6)',
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.875rem',
                                marginBottom: '8px'
                              }}>
                                {dayTotalVideos} videos
                              </Typography>
                              
                              {/* Progress Bar */}
                              <LinearProgress
                                variant="determinate"
                                value={isDayCompleted ? 100 : (dayTotalVideos > 0 ? Math.round((dayCompletedVideos / dayTotalVideos) * 100) : 0)}
                                sx={{
                                  height: 6,
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  width: '120px',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#31c48d',
                                  }
                                }}
                              />

                            </Box>
                            
                            {/* Expand/Collapse Arrow */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: '10px' }}>
                              {isDayCompleted && (
                                <CheckCircleIcon sx={{ color: '#31c48d', fontSize: '20px' }} />
                              )}
                              {isExpanded ? <ExpandLessIcon sx={{ color: '#FFFFFF' }} /> : <ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
                            </Box>
                          </Box>

                          {isExpanded && (
                            <Box sx={{ padding: '20px 0' }}>
                              {dayTotalVideos > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleCheckAllInDay(playlist._id, parseInt(dayNumber))}
                                    disabled={dayCompletedVideos === dayTotalVideos}
                                    sx={{
                                      borderColor: '#666666',
                                      color: '#666666',
                                      borderRadius: '6px',
                                      padding: '8px 16px',
                                      fontSize: '0.8rem',
                                      fontFamily: "'Inter', sans-serif",
                                      '&:disabled': {
                                        borderColor: '#444444',
                                        color: '#444444',
                                      }
                                    }}
                                  >
                                    All Completed
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleUncheckAllInDay(playlist._id, parseInt(dayNumber))}
                                    disabled={dayCompletedVideos === 0}
                                    sx={{
                                      borderColor: '#FF9800',
                                      color: '#FF9800',
                                      borderRadius: '6px',
                                      padding: '8px 16px',
                                      fontSize: '0.8rem',
                                      fontFamily: "'Inter', sans-serif",
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                      }
                                    }}
                                  >
                                    Uncheck All in Day
                                  </Button>
                                </Box>
                              )}
                              
                              <Grid container spacing={2}>
                                {dayVideos.map((video, index) => (
                                  <Grid item xs={12} key={video.videoId || index}>
                                    <Card
                                      key={video.videoId || index}
                                      variant="outlined"
                                      onClick={() => handleVideoToggle(playlist._id, video.videoId, !video.completed, video.originalIndex)}
                                      sx={{
                                        mb: 1,
                                        backgroundColor: video.completed ? '#31c48d' : 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: video.completed ? '8px' : '0',
                                        padding: '12px 16px',
                                        minHeight: '60px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        '&:last-child': {
                                          borderBottom: 'none'
                                        },
                                        '& .MuiCardContent-root': {
                                          padding: '0 !important',
                                          width: '100%',
                                          color: '#FFFFFF',
                                          fontFamily: "'Inter', sans-serif"
                                        }
                                      }}
                                    >
                                      <CardContent sx={{ padding: '0 !important', width: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                          {/* Left side - Thumbnail and Title */}
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                            {/* Thumbnail */}
                                            <Box
                                              sx={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#333333',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'rgba(255,255,255,0.6)',
                                                fontSize: '12px',
                                                textAlign: 'center',
                                                lineHeight: 1.2
                                              }}
                                            >
                                              {video.thumbnail ? (
                                                <img 
                                                  src={video.thumbnail} 
                                                  alt={video.title}
                                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                              ) : (
                                                '📹'
                                              )}
                                            </Box>
                                            
                                            {/* Video Title */}
                                            <Typography
                                              variant="body1"
                                              sx={{
                                                color: '#FFFFFF',
                                                fontFamily: "'Inter', sans-serif",
                                                fontWeight: 500,
                                                flex: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                              }}
                                            >
                                              {video.title}
                                            </Typography>
                                          </Box>
                                          
                                          {/* Right side - Duration and Completion Status */}
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {/* Duration */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: video.completed ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: '0.875rem'
                                              }}
                                            >
                                              {video.duration || '00:00'}
                                            </Typography>
                                            
                                            {/* Completion Status */}
                                            <Box
                                              sx={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: 'transparent',
                                                border: video.completed ? 'none' : '2px solid rgba(255,255,255,0.3)',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}
                                            >
                                              {video.completed && (
                                                <CheckCircleIcon sx={{ color: '#FFFFFF', fontSize: '16px' }} />
                                              )}
                                            </Box>
                                          </Box>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}
                        </Card>
                      );
                    });
                  })()}
                </CardContent>
              </Card>
            </Box>
          ))}
        </>
      )}

      {/* Add Playlist Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(30,30,30,0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            minWidth: '400px',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0,0,0,0.4)',
          },
          // Enhanced dropdown styling
          '& .MuiSelect-select': {
            color: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 16px',
            '&:focus': {
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderColor: '#1E88E5',
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
            }
          },
          '& .MuiSelect-icon': {
            color: 'rgba(255,255,255,0.6)',
          },
          '& .MuiPaper-root.MuiMenu-paper': {
            backgroundColor: '#2C2C2C',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginTop: '4px',
            '& .MuiMenuItem-root': {
              color: '#E0E0E0',
              padding: '12px 16px',
              margin: '2px 8px',
              borderRadius: '6px',
              fontSize: '14px',
              lineHeight: '1.4',
              '&:hover': {
                backgroundColor: '#3A3A3A',
                fontWeight: '600',
              },
              '&.Mui-selected': {
                backgroundColor: '#1E88E5',
                color: '#FFFFFF',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: '#1976D2',
                }
              },
              '&:not(:last-child)': {
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }
            }
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.6)',
            '&.Mui-focused': {
              color: '#1E88E5',
            }
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1E88E5',
            }
          }
        }}
      >
        <DialogTitle>Add New Playlist</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Source Type
            </Typography>
            <RadioGroup
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              row
            >
              <FormControlLabel 
                value="youtube" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <YouTubeIcon fontSize="small" />
                    YouTube Playlist
                  </Box>
                }
              />
              <FormControlLabel 
                value="manual" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoFileIcon fontSize="small" />
                    Manual Tracker
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
                type="url"
                fullWidth
                variant="outlined"
                value={newPlaylistUrl}
                onChange={(e) => setNewPlaylistUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=..."
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Tracker Title"
                fullWidth
                variant="outlined"
                value={trackerTitle}
                onChange={(e) => setTrackerTitle(e.target.value)}
                placeholder="Enter a custom name for this playlist"
                sx={{ mb: 2 }}
                helperText="This will be the display name for your playlist"
              />
              
              <FormControl fullWidth>
                <InputLabel>Videos per Day</InputLabel>
                <Select
                  value={videosPerDay}
                  label="Videos per Day"
                  variant="outlined"
                  onChange={(e) => setVideosPerDay(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#2C2C2C',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginTop: '4px',
                        maxHeight: '300px',
                        '& .MuiMenuItem-root': {
                          color: '#E0E0E0',
                          padding: '12px 16px',
                          margin: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          '&:hover': {
                            backgroundColor: '#3A3A3A',
                            fontWeight: '600',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#1E88E5',
                            color: '#FFFFFF',
                            fontWeight: '600',
                            '&:hover': {
                              backgroundColor: '#1976D2',
                            }
                          },
                          '&:not(:last-child)': {
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value={3}>3 videos per day</MenuItem>
                  <MenuItem value={5}>5 videos per day</MenuItem>
                  <MenuItem value={7}>7 videos per day</MenuItem>
                  <MenuItem value={10}>10 videos per day</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Enter a YouTube playlist URL and we'll fetch all the videos and organize them by day for you.
              </Typography>
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
                sx={{ mb: 2 }}
                helperText="This will be the display name for your tracker"
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
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Items per Day</InputLabel>
                <Select
                  value={videosPerDay}
                  label="Items per Day"
                  variant="outlined"
                  onChange={(e) => setVideosPerDay(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#2C2C2C',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginTop: '4px',
                        maxHeight: '300px',
                        '& .MuiMenuItem-root': {
                          color: '#E0E0E0',
                          padding: '12px 16px',
                          margin: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          '&:hover': {
                            backgroundColor: '#3A3A3A',
                            fontWeight: '600',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#1E88E5',
                            color: '#FFFFFF',
                            fontWeight: '600',
                            '&:hover': {
                              backgroundColor: '#1976D2',
                            }
                          },
                          '&:not(:last-child)': {
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value={3}>3 items per day</MenuItem>
                  <MenuItem value={5}>5 items per day</MenuItem>
                  <MenuItem value={7}>7 items per day</MenuItem>
                  <MenuItem value={10}>10 items per day</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Create a manual tracker for non-YouTube sources like course materials, notes, or offline videos.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddPlaylist} 
            variant="contained"
            disabled={submitting || (sourceType === 'youtube' ? !newPlaylistUrl.trim() : !manualTitle.trim())}
          >
            {submitting ? 'Adding...' : 'Add Playlist'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Manual Playlist Total Dialog */}
      <Dialog 
        open={!!editingPlaylist} 
        onClose={() => setEditingPlaylist(null)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(30,30,30,0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            minWidth: '400px',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0,0,0,0.4)',
          },
          // Enhanced dropdown styling
          '& .MuiSelect-select': {
            color: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 16px',
            '&:focus': {
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderColor: '#1E88E5',
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
            }
          },
          '& .MuiSelect-icon': {
            color: 'rgba(255,255,255,0.6)',
          },
          '& .MuiPaper-root.MuiMenu-paper': {
            backgroundColor: '#2C2C2C',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginTop: '4px',
            '& .MuiMenuItem-root': {
              color: '#E0E0E0',
              padding: '12px 16px',
              margin: '2px 8px',
              borderRadius: '6px',
              fontSize: '14px',
              lineHeight: '1.4',
              '&:hover': {
                backgroundColor: '#3A3A3A',
                fontWeight: '600',
              },
              '&.Mui-selected': {
                backgroundColor: '#1E88E5',
                color: '#FFFFFF',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: '#1976D2',
                }
              },
              '&:not(:last-child)': {
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }
            }
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.6)',
            '&.Mui-focused': {
              color: '#1E88E5',
            }
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1E88E5',
            }
          }
        }}
      >
        <DialogTitle>Edit Total Videos</DialogTitle>
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
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Update the total number of videos/items in this tracker. Completed items beyond the new total will be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingPlaylist(null)}>Cancel</Button>
          <Button 
            onClick={() => handleUpdateManualTotal(editingPlaylist._id, editingPlaylist.manualTotalVideos)}
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MultiPlaylistDashboard;
