import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Container
} from '@mui/material';
import {
  PlayCircle,
  TrendingUp,
  Award,
  Clock,
  Target,
  Zap,
  BookOpen,
  Users,
} from 'lucide-react';
import BrainIcon from '../components/BrainIcon';
import { CircularProgressRing } from '../components/FuturisticProgress';
import axios from 'axios';
import { createApiInstance } from '../utils/api'; // Use centralized API

export default function FuturisticDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  // State for dynamic data
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState([
    { label: 'Study Streak', value: '0 days', icon: Zap, color: '#00D4FF' },
    { label: 'Total Progress', value: '0%', icon: Target, color: '#10B981' },
    { label: 'Study Time', value: '0h', icon: Clock, color: '#F59E0B' },
    { label: 'Achievements', value: '0', icon: Award, color: '#8B5CF6' },
  ]);

  // API configuration - use centralized API
  const api = createApiInstance(token);

  // Fetch playlists and sessions, then calculate stats
  useEffect(() => {
    if (token && user) {
      fetchAllData();
    }
  }, [token, user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch playlists
      const playlistResponse = await api.get('/playlists');
      const playlistData = playlistResponse.data;
      
      setPlaylists(playlistData);
      
      // Calculate dynamic stats
      calculateStats(playlistData);
    } catch (error) {
      console.error('Error fetching data:', error);
      try {
        // Fetch playlists only
        const playlistResponse = await api.get('/playlists');
        const playlistData = playlistResponse.data;
        setPlaylists(playlistData);
        calculateStats(playlistData);
      } catch (playlistError) {
        console.error('Error fetching playlists:', playlistError);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (playlistData) => {
    // Check if playlistData exists and is an array
    if (!playlistData || !Array.isArray(playlistData) || playlistData.length === 0) {
      setQuickStats([
        { label: 'Study Streak', value: '0 days', icon: Zap, color: '#00D4FF' },
        { label: 'Total Progress', value: '0%', icon: Target, color: '#10B981' },
        { label: 'Study Time', value: '0h', icon: Clock, color: '#F59E0B' },
        { label: 'Playlists Completed', value: '0', icon: Award, color: '#8B5CF6' },
      ]);
      return;
    }

    // Calculate playlist stats - use availableVideos instead of videos.length
    const totalVideos = playlistData.reduce((acc, playlist) => {
      if (playlist.sourceType === 'manual') {
        return acc + (playlist.manualTotalVideos || 0);
      }
      return acc + (playlist.availableVideos || 0);
    }, 0);
    
    const completedVideos = playlistData.reduce((acc, playlist) => {
      if (playlist.sourceType === 'manual') {
        return acc + (playlist.completedVideos ? playlist.completedVideos.length : 0);
      }
      return acc + (playlist.videos ? playlist.videos.filter(v => v.completed && !v.isPrivate).length : 0);
    }, 0);
    
    // Calculate completed playlists
    const completedPlaylists = playlistData.filter(playlist => {
      if (playlist.sourceType === 'manual') {
        const totalVideos = playlist.manualTotalVideos || 0;
        const completed = playlist.completedVideos ? playlist.completedVideos.length : 0;
        return totalVideos > 0 && completed >= totalVideos;
      } else {
        const availableVideos = playlist.availableVideos || 0;
        const completedCount = playlist.videos ? playlist.videos.filter(v => v.completed && !v.isPrivate).length : 0;
        return availableVideos > 0 && completedCount >= availableVideos;
      }
    }).length;
    
    const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    
    // Calculate study time from completed videos (assuming 10 minutes per video)
    const studyTimeHours = Math.round((completedVideos * 10) / 60);
    
    // Calculate study streak
    const streak = calculateStudyStreak(playlistData);
    
    // Update quick stats
    setQuickStats([
      { label: 'Study Streak', value: `${streak} days`, icon: Zap, color: '#00D4FF' },
      { label: 'Total Progress', value: `${progressPercentage}%`, icon: Target, color: '#10B981' },
      { label: 'Study Time', value: `${studyTimeHours}h`, icon: Clock, color: '#F59E0B' },
      { label: 'Playlists Completed', value: `${completedPlaylists}`, icon: Award, color: '#8B5CF6' },
    ]);
  };

  const calculateStudyStreak = (playlistData) => {
    // Simplified streak calculation - count days with completed videos
    const today = new Date();
    let streak = 0;
    
    // Check if there's any activity in the last 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasActivity = playlistData.some(playlist => 
        playlist.videos && playlist.videos.some(video => {
          if (video.completed && video.completedAt) {
            const completedDate = new Date(video.completedAt);
            return completedDate.toDateString() === checkDate.toDateString();
          }
          return false;
        })
      );
      
      if (hasActivity) {
        streak++;
      } else if (i === 0) {
        // If no activity today, streak is 0
        break;
      }
    }
    
    return streak;
  };

  // Dynamic features based on playlist data only
  const features = [
    {
      title: 'Playlist Tracker',
      description: 'Your current progress count till now excluding the private videos',
      icon: PlayCircle,
      color: '#00D4FF',
      path: '/playlists',
      available: true,
      stats: { 
        completed: playlists.reduce((acc, playlist) => {
          if (playlist.sourceType === 'manual') {
            return acc + (playlist.completedVideos ? playlist.completedVideos.length : 0);
          }
          return acc + (playlist.videos ? playlist.videos.filter(v => v.completed && !v.isPrivate).length : 0);
        }, 0), 
        total: playlists.reduce((acc, playlist) => {
          if (playlist.sourceType === 'manual') {
            return acc + (playlist.manualTotalVideos || 0);
          }
          return acc + (playlist.availableVideos || 0);
        }, 0)
      },
      category: 'Learning',
    },
    {
      title: 'Quiz Generator',
      description: 'Generate quizzes from your video content',
      icon: BookOpen,
      color: '#F59E0B',
      path: null,
      available: false,
      stats: { completed: 0, total: 15 },
      category: 'Assessment',
    },
    {
      title: 'Progress Analytics',
      description: 'Detailed insights into your learning patterns',
      icon: TrendingUp,
      color: '#8B5CF6',
      path: null,
      available: false,
      stats: { completed: 0, total: 8 },
      category: 'Analytics',
    },
    {
      title: 'Study Groups',
      description: 'Collaborate with peers on shared playlists',
      icon: Users,
      color: '#06B6D4',
      path: null,
      available: false,
      stats: { completed: 0, total: 5 },
      category: 'Social',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pt: 3, pb: 6, overflowX: 'hidden' }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Hero Section */}
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <BrainIcon size="xl" animated={true} mood="excited" />
          </Box>
          
          <Typography
            variant="h1"
            sx={{
              mb: { xs: 1.5, md: 2 },
              background: 'linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 5.5vw, 3.5rem)'
            }}
          >
            Welcome to PlaylistPro
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: '#94A3B8',
              mb: { xs: 3, md: 4 },
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              px: { xs: 1, sm: 0 },
              fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)'
            }}
          >
            Easily track your YouTube playlists, auto-schedule daily study sessions, and stay consistent so you can hit exam deadlines without last-minute cramming.
          </Typography>
        </Box>

        {/* Learning Progress Section */}
        <Box sx={{ display: 'grid', placeItems: 'center', px: { xs: 1.5, sm: 0 }, width: '100%' }}>
          <Box
            sx={{
              mb: { xs: 4, md: 6 },
              width: '100%',
              maxWidth: 900,
              boxSizing: 'border-box',
              p: { xs: 1.25, sm: 3, md: 4 },
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(245, 158, 11, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              mx: 'auto',
              alignSelf: 'center'
            }}
          >
          <Typography
            variant="h3"
            sx={{
              mb: { xs: 2, md: 3 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, #00D4FF 0%, #10B981 50%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 4vw, 2.25rem)'
            }}
          >
            Your Learning Progress
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              mb: { xs: 3, md: 4 },
              textAlign: 'center',
              fontStyle: 'italic',
              px: { xs: 1, sm: 0 }
            }}
          >
            Real-time insights from your study activities
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            {quickStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                <Card className="glass-card hover:scale-105 transition-transform duration-300" sx={{ width: '100%', mx: 'auto' }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2.5, md: 3 } }}>
                    <stat.icon 
                      size={32} 
                      color={stat.color}
                      style={{ marginBottom: 8 }}
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: stat.color,
                        mb: 0.5,
                        fontSize: 'clamp(1.125rem, 4.2vw, 1.75rem)'
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: '#94A3B8', fontSize: 'clamp(0.8rem, 2.8vw, 0.95rem)' }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          </Box>
        </Box>

        {/* Features Grid */}
        <Typography
          variant="h2"
          sx={{
            mb: { xs: 3, md: 4 },
            textAlign: 'center',
            color: '#E2E8F0',
            fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)'
          }}
        >
          Learning Modules
        </Typography>

        {/* First Row - Playlist Tracker Only */}
        <Grid container spacing={4} sx={{ mb: { xs: 4, md: 6 }, justifyContent: 'center', px: { xs: 1, sm: 0 } }}>
          {features.slice(0, 1).map((feature, index) => {
            const Icon = feature.icon;
            const progressPercentage = feature.stats.total > 0 ? (feature.stats.completed / feature.stats.total) * 100 : 0;
            
            return (
              <Grid item xs={12} sm={10} md={8} lg={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: '500px',
                    mx: 'auto',
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    '&:hover': {
                      '& .circuit-line': {
                        opacity: 1,
                      },
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(0, 212, 255, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Circuit line animation */}
                  <Box
                    className="circuit-line"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  
                  <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: { xs: 'center', md: 'flex-start' }, justifyContent: 'space-between', mb: { xs: 3, md: 4 }, gap: { xs: 2, md: 0 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 } }}>
                        <Box
                          sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: '16px',
                            background: `${feature.color}20`,
                            border: `2px solid ${feature.color}40`,
                          }}
                        >
                          <Icon size={34} color={feature.color} />
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: '#E2E8F0',
                              mb: 1,
                              fontSize: 'clamp(1.25rem, 4.5vw, 2rem)'
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Chip
                            label={feature.category}
                            size="medium"
                            sx={{
                              backgroundColor: `${feature.color}30`,
                              color: feature.color,
                              border: `1px solid ${feature.color}60`,
                              fontSize: { xs: '0.75rem', md: '0.8rem' },
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ transform: { xs: 'scale(0.9)', md: 'none' } }}>
                        <CircularProgressRing
                          value={progressPercentage}
                          size={80}
                          thickness={6}
                          showPercentage={true}
                        />
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#94A3B8',
                        mb: { xs: 3, md: 4 },
                        flexGrow: 1,
                        lineHeight: 1.7,
                        fontSize: 'clamp(0.95rem, 2.8vw, 1.1rem)',
                        textAlign: { xs: 'center', sm: 'left' }
                      }}
                    >
                      {feature.description}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 4 }, gap: { xs: 1.5, md: 0 }, flexWrap: 'wrap' }}>
                      <Typography variant="h6" sx={{ color: '#94A3B8', fontSize: 'clamp(0.95rem, 2.8vw, 1.25rem)' }}>
                        Progress: {feature.stats.completed}/{feature.stats.total}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: feature.color,
                          fontWeight: 700,
                          fontSize: 'clamp(0.95rem, 2.8vw, 1.25rem)'
                        }}
                      >
                        {Math.round(progressPercentage)}% Complete
                      </Typography>
                    </Box>

                    {/* Action Button */}
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate(feature.path)}
                      disabled={!feature.available}
                      sx={{
                        background: feature.available 
                          ? `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}CC 100%)`
                          : 'rgba(148, 163, 184, 0.1)',
                        color: feature.available ? '#000' : '#64748B',
                        fontWeight: 600,
                        py: 1.2,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: 'clamp(1rem, 3.8vw, 1.1rem)',
                        width: { xs: '100%', sm: 'auto' },
                        alignSelf: { xs: 'stretch', sm: 'center' },
                        '&:hover': {
                          background: feature.available 
                            ? `linear-gradient(135deg, ${feature.color}DD 0%, ${feature.color}AA 100%)`
                            : 'rgba(148, 163, 184, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {feature.available ? 'Launch Module' : 'Coming Soon'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Second Section - Upcoming Features */}
        <Typography
          variant="h3"
          sx={{
            mb: 4,
            textAlign: 'center',
            color: '#94A3B8',
            fontWeight: 600,
          }}
        >
          Upcoming Features
        </Typography>

        {/* Remaining Features Grid */}
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {features.slice(1).map((feature, index) => {
            const Icon = feature.icon;
            const progressPercentage = feature.stats.total > 0 ? (feature.stats.completed / feature.stats.total) * 100 : 0;
            
            return (
              <Grid item xs={12} sm={8} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: '400px',
                    mx: 'auto',
                    opacity: 0.7,
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    '&:hover': {
                      '& .circuit-line': {
                        opacity: 1,
                      },
                      opacity: 0.9,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Circuit line animation */}
                  <Box
                    className="circuit-line"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          background: `${feature.color}20`,
                          border: `1px solid ${feature.color}40`,
                        }}
                      >
                        <Icon size={24} color={feature.color} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#E2E8F0',
                            mb: 0.5,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Chip
                          label={feature.category}
                          size="small"
                          sx={{
                            backgroundColor: `${feature.color}20`,
                            color: feature.color,
                            border: `1px solid ${feature.color}40`,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#94A3B8',
                        mb: 3,
                        flexGrow: 1,
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        {feature.stats.completed}/{feature.stats.total} features
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: feature.color,
                          fontWeight: 600,
                        }}
                      >
                        {Math.round(progressPercentage)}%
                      </Typography>
                    </Box>

                    {/* Coming Soon Button */}
                    <Button
                      variant="outlined"
                      size="medium"
                      disabled
                      sx={{
                        borderColor: 'rgba(148, 163, 184, 0.3)',
                        color: '#64748B',
                        fontWeight: 500,
                        py: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                      }}
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}