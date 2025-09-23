import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Grid,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { confirmAction } from '../utils/confirmToast.jsx';

const DynamicScheduler = () => {
  const { user, token } = useAuth();
  
  // State management
  const [playlists, setPlaylists] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState(false);

  // Form states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    playlistId: '',
    sessionName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [previewData, setPreviewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // API configuration
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch playlists
  useEffect(() => {
    if (token) {
      fetchPlaylists();
    }
  }, [token]);

  // Fetch sessions
  useEffect(() => {
    if (token && user) {
      fetchSessions();
    }
  }, [token, user]);



  const fetchPlaylists = async () => {
    try {
      setPlaylistsLoading(true);
      console.log('Fetching playlists...');
      const response = await api.get('/playlists');
      console.log('Playlists response:', response.data);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load playlists');
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log('Fetching sessions for user:', user._id);
      const response = await api.get(`/scheduler/sessions/${user._id}`);
      console.log('Sessions response:', response.data);
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh sessions data (can be called from other components)
  const refreshSessions = async () => {
    await fetchSessions();
  };

  // Expose refresh function globally for other components to use
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshSchedulerData = refreshSessions;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshSchedulerData;
      }
    };
  }, []);

  const handleCreateSession = () => {
    setFormData({
      playlistId: '',
      sessionName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setPreviewData(null);
    setCreateDialogOpen(true);
  };

  const handleEditSession = (session) => {
    setSelectedSession(session);
    setFormData({
      playlistId: session.playlistId._id,
      sessionName: session.sessionName,
      startDate: new Date(session.startDate).toISOString().split('T')[0],
      endDate: new Date(session.endDate).toISOString().split('T')[0]
    });
    setEditDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    // Calculate preview when playlist and dates are set
    if (field === 'playlistId' || field === 'startDate' || field === 'endDate') {
      calculatePreview(updatedFormData);
    }
  };

  const calculatePreview = (currentFormData = formData) => {
    if (!currentFormData.playlistId || !currentFormData.startDate || !currentFormData.endDate) {
      setPreviewData(null);
      return;
    }

    const playlist = playlists.find(p => p._id === currentFormData.playlistId);
    if (!playlist) {
      setPreviewData(null);
      return;
    }

    const startDate = new Date(currentFormData.startDate);
    const endDate = new Date(currentFormData.endDate);
    const today = new Date();

    if (startDate < today) {
      toast.error('Start date cannot be in the past');
      setPreviewData(null);
      return;
    }

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      setPreviewData(null);
      return;
    }

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalVideos = playlist.sourceType === 'manual' 
      ? playlist.manualTotalVideos 
      : playlist.availableVideos;
    
    const dailyAllocation = Math.ceil(totalVideos / totalDays);

    setPreviewData({
      playlistTitle: playlist.trackerTitle || playlist.title,
      totalVideos,
      totalDays,
      dailyAllocation,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString()
    });
  };

  const handleSubmit = async () => {
    if (!formData.playlistId || !formData.sessionName || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editDialogOpen && selectedSession) {
        // Update existing session
        await api.put(`/scheduler/session/${selectedSession._id}`, formData);
      } else {
        // Create new session
        await api.post('/scheduler/session', formData);
      }

      await fetchSessions();
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setFormData({
        playlistId: '',
        sessionName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      setPreviewData(null);
      toast.success(editDialogOpen ? 'Session updated successfully!' : 'Session created successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error(error.response?.data?.message || 'Failed to save session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const session = sessions.find(s => s._id === sessionId);
    const sessionName = session?.sessionName || 'this study session';
    
    confirmAction(
      `Are you sure you want to delete "${sessionName}"? This action cannot be undone.`,
      async () => {
        try {
          await api.delete(`/scheduler/session/${sessionId}`);
          await fetchSessions();
          toast.success('Session deleted successfully!');
        } catch (error) {
          console.error('Error deleting session:', error);
          toast.error('Failed to delete session');
        }
      }
    );
  };

  const handleCompleteDay = async (sessionId, date) => {
    try {
      await api.post(`/scheduler/session/${sessionId}/complete-day`, {
        date: date.toISOString()
      });
      await fetchSessions();
      toast.success('Day marked as completed!');
    } catch (error) {
      console.error('Error completing day:', error);
      toast.error('Failed to mark day as completed');
    }
  };

  const handleMissDay = async (sessionId, date) => {
    try {
      await api.post(`/scheduler/session/${sessionId}/miss-day`, {
        date: date.toISOString(),
        reason: 'Missed study day'
      });
      await fetchSessions();
      toast.success('Day marked as missed!');
    } catch (error) {
      console.error('Error marking day as missed:', error);
      toast.error('Failed to mark day as missed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <PauseIcon />;
    }
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => {
      const sessionStart = new Date(session.startDate);
      const sessionEnd = new Date(session.endDate);
      const checkDate = new Date(date);
      return checkDate >= sessionStart && checkDate <= sessionEnd && session.status === 'active';
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          color: '#FFFFFF', 
          fontWeight: 700,
          fontFamily: "'Montserrat', sans-serif",
          mb: 1
        }}>
          Dynamic Scheduler
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'Poppins', sans-serif"
        }}>
          Plan and track your study sessions with smart daily allocation
        </Typography>
      </Box>



      {/* View Toggle */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button
            variant={calendarView ? "outlined" : "contained"}
            onClick={() => setCalendarView(false)}
            sx={{ mr: 2 }}
          >
            List View
          </Button>
          <Button
            variant={calendarView ? "contained" : "outlined"}
            onClick={() => setCalendarView(true)}
            startIcon={<CalendarIcon />}
          >
            Calendar View
          </Button>
        </Box>
        
        <Button
          variant="outlined"
          onClick={fetchSessions}
          disabled={loading}
          startIcon={<RefreshIcon />}
          sx={{
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            }
          }}
        >
          Refresh Progress
        </Button>
        
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreateSession}
          sx={{ backgroundColor: '#1976d2' }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Main Content */}
      {calendarView ? (
        /* Calendar View */
        <Paper sx={{ 
          backgroundColor: 'transparent', 
          border: 'none',
          boxShadow: 'none'
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={selectedDate}
              onChange={setSelectedDate}
              sx={{
                backgroundColor: 'transparent',
                '& .MuiPickersCalendarHeader-root': {
                  color: '#FFFFFF'
                },
                '& .MuiPickersDay-root': {
                  color: '#FFFFFF',
                  '&.Mui-selected': {
                    backgroundColor: 'rgb(48, 137, 81)',
                    color: '#FFFFFF'
                  }
                },
                '& .MuiPickersDay-root.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
              renderDay={(day, selectedDays, pickersDayProps) => {
                const daySessions = getSessionsForDate(day);
                return (
                  <Box
                    {...pickersDayProps}
                    sx={{
                      position: 'relative',
                      '& .MuiPickersDay-root': {
                        position: 'relative'
                      }
                    }}
                  >
                    <Box {...pickersDayProps} />
                    {daySessions.length > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: 'rgb(48, 137, 81)'
                        }}
                      />
                    )}
                  </Box>
                );
              }}
            />
          </LocalizationProvider>
          
          {/* Sessions for selected date */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
              Sessions for {selectedDate.toLocaleDateString()}
            </Typography>
            {getSessionsForDate(selectedDate).length === 0 ? (
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                No active sessions for this date
              </Typography>
            ) : (
              <List>
                {getSessionsForDate(selectedDate).map((session) => (
                  <ListItem
                    key={session._id}
                    sx={{
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={session.sessionName}
                      secondary={`${session.dailyAllocation} videos today`}
                      sx={{
                        '& .MuiListItemText-primary': { color: '#FFFFFF' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.6)' }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleCompleteDay(session._id, selectedDate)}
                        sx={{ color: 'rgb(48, 137, 81)' }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      ) : (
        /* List View */
        <Grid container spacing={3}>
          {sessions.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: 'transparent', 
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'none'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                    No Study Sessions Yet
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                    Create your first study session to start planning your learning journey
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleCreateSession}
                    startIcon={<AddIcon />}
                  >
                    Create Session
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            sessions.map((session) => (
              <Grid item xs={12} md={6} key={session._id}>
                <Card sx={{ 
                  backgroundColor: 'transparent', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'none',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.2)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#FFFFFF', 
                          fontWeight: 600,
                          mb: 1
                        }}>
                          {session.sessionName}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.6)',
                          mb: 1
                        }}>
                          {session.playlistId?.title}
                        </Typography>
                        <Chip
                          icon={session.progressPercentage === 100 ? <CheckCircleIcon /> : getStatusIcon(session.status)}
                          label={session.progressPercentage === 100 ? 'completed' : session.status}
                          color={session.progressPercentage === 100 ? 'success' : getStatusColor(session.status)}
                          size="small"
                          sx={{ 
                            mb: 2,
                            backgroundColor: session.progressPercentage === 100 ? '#31c48d' : undefined,
                            color: session.progressPercentage === 100 ? '#FFFFFF' : undefined
                          }}
                        />
                      </Box>
                      <Box>
                        <Tooltip title="Edit Session">
                          <IconButton
                            onClick={() => handleEditSession(session)}
                            sx={{ color: 'rgba(255,255,255,0.6)' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Session">
                          <IconButton
                            onClick={() => handleDeleteSession(session._id)}
                            sx={{ color: 'rgba(255,255,255,0.6)' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Progress
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {session.progressPercentage === 100 && (
                            <CheckCircleIcon sx={{ color: '#31c48d', fontSize: '16px' }} />
                          )}
                          <Typography variant="body2" sx={{ 
                            color: session.progressPercentage === 100 ? '#31c48d' : 'rgba(255,255,255,0.6)',
                            fontWeight: session.progressPercentage === 100 ? 600 : 400
                          }}>
                            {session.progressPercentage}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={session.progressPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: session.progressPercentage === 100 ? '#31c48d' : 'rgb(48, 137, 81)',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    {/* Session Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Daily Target
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                          {session.dailyAllocation} videos
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Remaining Days
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                          {session.remainingDays}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Start Date
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                          {new Date(session.startDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          End Date
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                          {new Date(session.endDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Create/Edit Session Dialog */}
            <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
        }}
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
          '& .MuiSelect-selectMenu': {
            backgroundColor: '#2C2C2C',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
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
        <DialogTitle sx={{ color: '#FFFFFF' }}>
          {editDialogOpen ? 'Edit Study Session' : 'Create New Study Session'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Select Playlist</InputLabel>
              <Select
                value={formData.playlistId}
                onChange={(e) => handleFormChange('playlistId', e.target.value)}
                variant="outlined"
                disabled={playlistsLoading}
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
                {playlists.map((playlist) => (
                  <MenuItem key={playlist._id} value={playlist._id}>
                    {playlist.trackerTitle || playlist.title} ({playlist.sourceType === 'manual' ? playlist.manualTotalVideos : playlist.availableVideos} videos)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Session Name"
              value={formData.sessionName}
              onChange={(e) => handleFormChange('sessionName', e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { color: '#FFFFFF' }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255,255,255,0.6)' }
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: 'rgba(255,255,255,0.6)' }
                  }}
                  InputProps={{
                    sx: { color: '#FFFFFF' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: 'rgba(255,255,255,0.6)' }
                  }}
                  InputProps={{
                    sx: { color: '#FFFFFF' }
                  }}
                />
              </Grid>
            </Grid>

            {/* Preview */}
            {previewData && (
              <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                  Session Preview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Playlist
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                      {previewData.playlistTitle}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Total Videos
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                      {previewData.totalVideos}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Study Period
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                      {previewData.totalDays} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Daily Target
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgb(48, 137, 81)', fontWeight: 600 }}>
                      {previewData.dailyAllocation} videos
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}
            sx={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !previewData}
            sx={{ backgroundColor: '#1976d2' }}
          >
            {submitting ? 'Saving...' : (editDialogOpen ? 'Update Session' : 'Create Session')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DynamicScheduler;
