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
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Container
} from '@mui/material';
import {
  PlayCircle,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Target,
  Zap,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Plus,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Share,
  CheckCircle,
  Circle,
  Brain
} from 'lucide-react';
import BrainIcon from '../components/BrainIcon';
import { CircularProgressRing } from '../components/FuturisticProgress';
import axios from 'axios';

const FuturisticDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  // State for dynamic data
  const [playlists, setPlaylists] = useState([]);
  // Remove: const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState([
    { label: 'Study Streak', value: '0 days', icon: Zap, color: '#00D4FF' },
    { label: 'Total Progress', value: '0%', icon: Target, color: '#10B981' },
    { label: 'Study Time', value: '0h', icon: Clock, color: '#F59E0B' },
    { label: 'Achievements', value: '0', icon: Award, color: '#8B5CF6' },
  ]);

  // API configuration
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch playlists and sessions, then calculate stats
  useEffect(() => {
    if (token && user) {
      fetchAllData();
    }
  }, [token, user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch both playlists and sessions concurrently
      const [playlistResponse, sessionResponse] = await Promise.all([
        api.get('/playlists'),
        api.get(`/scheduler/sessions/${user._id}`)
      ]);
      
      const playlistData = playlistResponse.data;
      const sessionData = sessionResponse.data.data || [];
      
      setPlaylists(playlistData);
      setSessions(sessionData);
      
      // Calculate dynamic stats
      calculateStats(playlistData, sessionData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // If sessions API fails, still try to fetch playlists
      try {
        // Fetch playlists only
        const playlistResponse = await api.get('/playlists');
        // Remove: api.get(`/scheduler/sessions/${user._id}`)
        
        const playlistData = playlistResponse.data;
        // Remove: const sessionData = sessionResponse.data.data || [];
        
        setPlaylists(playlistData);
        // Remove: setSessions(sessionData);
        calculateStats(playlistData, []);
      } catch (playlistError) {
        console.error('Error fetching playlists:', playlistError);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (playlistData, sessionData) => {
    // Check if playlistData exists and is an array
    if (!playlistData || !Array.isArray(playlistData) || playlistData.length === 0) {
      setQuickStats([
        { label: 'Study Streak', value: '0 days', icon: Zap, color: '#00D4FF' },
        { label: 'Total Progress', value: '0%', icon: Target, color: '#10B981' },
        { label: 'Study Time', value: '0h', icon: Clock, color: '#F59E0B' },
        { label: 'Achievements', value: '0', icon: Award, color: '#8B5CF6' },
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
      return acc + playlist.videos.filter(v => v.completed && !v.isPrivate).length;
    }, 0);
    
    const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    
    // Calculate session stats
    const activeSessions = sessionData.filter(session => session.status === 'active').length;
    const completedSessions = sessionData.filter(session => session.status === 'completed').length;
    const totalSessions = sessionData.length;
    
    // Calculate study time from completed videos (assuming 10 minutes per video)
    const studyTimeHours = Math.round((completedVideos * 10) / 60);
    
    // Calculate study streak
    const streak = calculateStudyStreak(playlistData);
    
    // Update quick stats
    setQuickStats([
      { label: 'Study Streak', value: `${streak} days`, icon: Zap, color: '#00D4FF' },
      { label: 'Total Progress', value: `${progressPercentage}%`, icon: Target, color: '#10B981' },
      { label: 'Study Time', value: `${studyTimeHours}h`, icon: Clock, color: '#F59E0B' },
      { label: 'Achievements', value: `${completedSessions}`, icon: Award, color: '#8B5CF6' },
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
        playlist.videos.some(video => {
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
      description: 'Your current progress count till now exclusing the private videos',
      icon: PlayCircle,
      color: '#00D4FF',
      path: '/playlists',
      available: true,
      stats: { 
        completed: playlists.reduce((acc, playlist) => {
          if (playlist.sourceType === 'manual') {
            return acc + (playlist.completedVideos ? playlist.completedVideos.length : 0);
          }
          return acc + playlist.videos.filter(v => v.completed && !v.isPrivate).length;
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
    // Remove Dynamic Scheduler feature object
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
    <Box sx={{ minHeight: '100vh', pt: 3, pb: 6 }}>
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <BrainIcon size="xl" animated={true} mood="excited" />
          </Box>
          
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
            }}
          >
            Welcome to SkillLog
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: '#94A3B8',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Easily track your YouTube playlists, auto-schedule daily study sessions, and stay consistent so you can hit exam deadlines without last-minute cramming.
          </Typography>
        </Box>

        {/* Learning Progress Section - Separate Container */}
        <Box
          sx={{
            mb: 6,
            mx: 'auto',
            maxWidth: '900px',
            p: 4,
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
          }}
        >
          {/* Dynamic Track Record Heading */}
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #00D4FF 0%, #10B981 50%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Your Learning Progress
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              mb: 4,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            Real-time insights from your study activities
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
            {quickStats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card className="glass-card hover:scale-105 transition-transform duration-300">
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Grid */}
        <Typography
          variant="h2"
          sx={{
            mb: 4,
            textAlign: 'center',
            color: '#E2E8F0',
          }}
        >
          Learning Modules
        </Typography>

        {/* First Row - Playlist Tracker Only */}
        <Grid container spacing={4} sx={{ mb: 6, justifyContent: 'center' }}>
          {features.slice(0, 1).map((feature, index) => {
            const Icon = feature.icon;
            const progressPercentage = (feature.stats.completed / feature.stats.total) * 100;
            
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
                  
                  <CardContent sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: '16px',
                            background: `${feature.color}20`,
                            border: `2px solid ${feature.color}40`,
                          }}
                        >
                          <Icon size={40} color={feature.color} />
                        </Box>
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: '#E2E8F0',
                              mb: 1,
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
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <CircularProgressRing
                        value={progressPercentage}
                        size={80}
                        thickness={6}
                        showPercentage={true}
                      />
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#94A3B8',
                        mb: 4,
                        flexGrow: 1,
                        lineHeight: 1.7,
                        fontSize: '1.1rem',
                      }}
                    >
                      {feature.description}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                      <Typography variant="h6" sx={{ color: '#94A3B8' }}>
                        Progress: {feature.stats.completed}/{feature.stats.total}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: feature.color,
                          fontWeight: 700,
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
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
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
            const progressPercentage = (feature.stats.completed / feature.stats.total) * 100;
            
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
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            background: `${feature.color}20`,
                            border: `1px solid ${feature.color}40`,
                          }}
                        >
                          <Icon size={32} color={feature.color} />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
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
                      
                      <CircularProgressRing
                        value={progressPercentage}
                        size={60}
                        thickness={4}
                        showPercentage={false}
                      />
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
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        Progress: {feature.stats.completed}/{feature.stats.total}
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

                    {/* Action Button */}
                    <Button
                      variant="outlined"
                      size="medium"
                      disabled={!feature.available}
                      sx={{
                        borderColor: `${feature.color}40`,
                        color: '#64748B',
                        fontWeight: 600,
                        py: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: `${feature.color}60`,
                          backgroundColor: `${feature.color}10`,
                        },
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

        {/* Motivational Section */}
        {/* <Box
          sx={{
            mt: 8,
            p: 4,
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '20px',
          }}
        >
          <BrainIcon size="large" animated={true} mood="happy" />
          <Typography
            variant="h4"
            sx={{
              mt: 2,
              mb: 2,
              fontWeight: 700,
              color: '#E2E8F0',
            }}
          >
            Ready to Level Up Your GATE Prep?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              mb: 3,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Your AI study companion is here to help you achieve your goals. Start with playlist tracking and dynamic scheduling to build momentum!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/playlists')}
              sx={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
                color: '#0A0E1A',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
              }}
            >
              Start Learning
            </Button>
            <BrainIcon size="large" animated={true} />
            // Remove scheduler navigation
            // onClick={() => navigate('/scheduler')}
              sx={{
                border: '1px solid rgba(0, 212, 255, 0.4)',
                color: '#00D4FF',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.6)',
                },
              }}
            >
              Plan Schedule
            </Button>
          </Box>
        </Box> */}
      </Container>
    </Box>
  );
};

export default FuturisticDashboard;