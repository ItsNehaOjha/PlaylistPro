import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
} from '@mui/material';
import {
  PlaylistPlay,
  Schedule,
  Quiz,
  Assessment,
  Assignment,
  TrendingUp,
  CalendarToday,
  School,
  Analytics,
  NoteAdd,
} from '@mui/icons-material';
import SkillLogLogo from '../components/SkillLogLogo';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: 'Playlist Tracker',
      description: 'Track your YouTube video progress with checklists and completion status across multiple playlists.',
      icon: <PlaylistPlay sx={{ fontSize: 48, color: '#667eea' }} />,
      color: '#667eea',
      path: '/playlists',
      available: true,
    },
    // Remove Dynamic Scheduler feature object
    {
      title: 'Quiz Generator',
      description: 'Create and take practice quizzes to test your knowledge.',
      icon: <School sx={{ fontSize: 48, color: '#f093fb' }} />,
      color: '#f093fb',
      path: null,
      available: false,
    },
    {
      title: 'Progress Analytics',
      description: 'Visualize your learning progress with detailed analytics and insights.',
      icon: <Analytics sx={{ fontSize: 48, color: '#4facfe' }} />,
      color: '#4facfe',
      path: null,
      available: false,
    },
    
  ];

  const handleFeatureClick = (feature) => {
    if (feature.available && feature.path) {
      navigate(feature.path);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 6, 
        pt: 4,
        pb: 2
      }}>
        
        <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: 1,  // space between icon and text
      mb: 2 
    }}
  >
    <SkillLogLogo size="large" showText={false} />
    <Typography 
      variant="h2" 
      component="h1" 
      sx={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 800,
        fontSize: { xs: '2.5rem', md: '3.5rem' },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      SkillLog
    </Typography>
  </Box>  
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            mb: 2,
            opacity: 0.8
          }}
        >
          Plan, Pace, and Progress Your Learning
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{
            fontFamily: 'Inter, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
            opacity: 0.7,
            lineHeight: 1.6
          }}
        >
          Your personal dashboard to track playlists, schedule smartly, and master your learning journey.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease-in-out',
                cursor: feature.available ? 'pointer' : 'default',
                '&:hover': {
                  transform: feature.available ? 'scale(1.02) translateY(-8px)' : 'none',
                  boxShadow: feature.available ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                  borderColor: feature.available ? feature.color : 'rgba(255, 255, 255, 0.1)',
                },
              }}
              onClick={() => handleFeatureClick(feature)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  {feature.icon}
                </Box>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h2"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    mb: 2,
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.6,
                    opacity: 0.8,
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
                <Button 
                  size="medium" 
                  variant="outlined"
                  disabled={!feature.available}
                  sx={{ 
                    color: feature.color, 
                    borderColor: feature.color,
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': feature.available ? {
                      backgroundColor: feature.color,
                      color: '#ffffff',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${feature.color}40`,
                    } : {},
                    '&:disabled': {
                      opacity: 0.4,
                      color: 'rgba(255, 255, 255, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  {feature.available ? 'Get Started' : 'Coming Soon'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper 
        sx={{ 
          mt: 4, 
          p: 3, 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{
            color: 'text.primary',
            transition: 'color 0.3s ease-in-out',
          }}
        >
          🚀 What's Next?
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            transition: 'color 0.3s ease-in-out',
          }}
        >
          These features are currently under development. Soon you'll be able to:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary"
            sx={{
              transition: 'color 0.3s ease-in-out',
            }}
          >
            ✅ Create and manage multiple YouTube playlists
          </Typography>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary"
            sx={{
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Set up adaptive study schedules based on your progress
          </Typography>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary"
            sx={{
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Generate practice quizzes from your study materials
          </Typography>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary"
            sx={{
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Track detailed progress analytics and performance metrics
          </Typography>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Manage tasks and take organized notes for each topic
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
