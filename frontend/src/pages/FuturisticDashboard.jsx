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
import RobotMascot from '../components/RobotMascot';

const FuturisticDashboard = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: 'Playlist Tracker',
      description: 'Track your YouTube video progress with AI-powered insights and completion analytics.',
      icon: PlayCircle,
      color: '#00D4FF',
      path: '/playlists',
      available: true,
      stats: { completed: 12, total: 25 },
      category: 'Learning',
    },
    {
      title: 'Dynamic Scheduler',
      description: 'AI-optimized study sessions with adaptive scheduling and progress tracking.',
      icon: Calendar,
      color: '#10B981',
      path: '/scheduler',
      available: true,
      stats: { completed: 8, total: 15 },
      category: 'Planning',
    },
    {
      title: 'Quiz Generator',
      description: 'Generate intelligent quizzes from your study materials using AI.',
      icon: Brain,
      color: '#F59E0B',
      path: null,
      available: false,
      stats: { completed: 0, total: 10 },
      category: 'Assessment',
    },
    {
      title: 'Progress Analytics',
      description: 'Advanced analytics with ML-powered insights and performance predictions.',
      icon: TrendingUp,
      color: '#8B5CF6',
      path: null,
      available: false,
      stats: { completed: 0, total: 20 },
      category: 'Analytics',
    },
    {
      title: 'Smart Notes',
      description: 'AI-enhanced note-taking with automatic summarization and linking.',
      icon: BookOpen,
      color: '#EF4444',
      path: null,
      available: false,
      stats: { completed: 0, total: 30 },
      category: 'Notes',
    },
  ];

  const quickStats = [
    { label: 'Study Streak', value: '7 days', icon: Zap, color: '#00D4FF' },
    { label: 'Total Progress', value: '68%', icon: Target, color: '#10B981' },
    { label: 'Study Time', value: '24h', icon: Clock, color: '#F59E0B' },
    { label: 'Achievements', value: '12', icon: Award, color: '#8B5CF6' },
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
            Your AI-powered GATE preparation companion. Track progress, optimize study sessions, and achieve your goals with futuristic learning tools.
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
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

        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const progressPercentage = (feature.stats.completed / feature.stats.total) * 100;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  className="glass-card group cursor-pointer"
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      '& .circuit-line': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => feature.available && navigate(feature.path)}
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
                      fullWidth
                      variant="contained"
                      disabled={!feature.available}
                      sx={{
                        background: feature.available 
                          ? `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}CC 100%)`
                          : 'rgba(148, 163, 184, 0.2)',
                        color: feature.available ? '#0A0E1A' : '#94A3B8',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        border: 'none',
                        '&:hover': {
                          background: feature.available 
                            ? `linear-gradient(135deg, ${feature.color}DD 0%, ${feature.color} 100%)`
                            : 'rgba(148, 163, 184, 0.2)',
                          transform: feature.available ? 'translateY(-2px)' : 'none',
                        },
                        '&:disabled': {
                          color: '#94A3B8',
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
        <Box
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
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/scheduler')}
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
        </Box>
      </Container>
    </Box>
  );
};

export default FuturisticDashboard;