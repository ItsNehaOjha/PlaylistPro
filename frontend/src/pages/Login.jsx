import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Users,
  Award,
  PlayCircle,
  ListMusic,
  Calendar,
  BarChart3
} from 'lucide-react';
import RobotMascot from '../components/RobotMascot';
import BrainIcon from '../components/BrainIcon';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await register(formData.name, formData.email, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }
      
      if (result.success) {
        toast.success(isSignUp ? 'Registration successful!' : 'Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: 'Inter, sans-serif'
  };

  const leftSideStyle = {
    display: 'none',
    width: '50%',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    position: 'relative',
    overflow: 'hidden',
    '@media (minWidth: 1024)': {
      display: 'flex'
    }
  };

  const rightSideStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    position: 'relative'
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
    zIndex: 10
  };

  const glassCardStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 44px',
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '12px',
    color: '#E2E8F0',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    '::placeholder': {
      color: '#94A3B8'
    }
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: isSignUp 
      ? 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%)'
      : 'linear-gradient(135deg, #00D4FF 0%, #0EA5E9 100%)',
    color: '#0F172A',
    boxShadow: isSignUp 
      ? '0 10px 20px rgba(255, 107, 53, 0.3)'
      : '0 10px 20px rgba(0, 212, 255, 0.3)'
  };

  const toggleButtonStyle = {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      {/* Left Side - Hero Section */}
      <div style={leftSideStyle}>
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <BrainIcon />
          </div>
          
          <div style={{
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem',
              margin: 0,
              transition: 'transform 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              PlaylistPro
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#CBD5E1',
              marginBottom: '2rem',
              maxWidth: '400px'
            }}>
              Join learners preparing for GATE, interviews, aptitude, and competitive exams. PlaylistPro helps you track videos, playlists, and progress — all in one place.
            </p>
            
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
             
            </div>
          </div>

          
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div style={rightSideStyle}>
        {/* Floating Particles */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: '#00D4FF',
                borderRadius: '50%',
                opacity: 0.3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div style={formContainerStyle}>
          <div style={glassCardStyle}>
            {/* Form Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.5rem',
                margin: 0
              }}>
                {isSignUp ? 'Join PlaylistPro' : 'Welcome Back'}
              </h2>
              <p style={{
                color: '#94A3B8',
                fontSize: '1rem'
              }}>
                {isSignUp ? 'Create your account to start tracking your learning progress' : 'Sign in to continue your learning journey'}
              </p>
            </div>

            {/* Toggle Buttons */}
            <div style={{
              display: 'flex',
              marginBottom: '2rem',
              padding: '4px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                style={{
                  ...toggleButtonStyle,
                  background: !isSignUp 
                    ? 'linear-gradient(135deg, #00D4FF 0%, #0EA5E9 100%)'
                    : 'transparent',
                  color: !isSignUp ? '#0F172A' : '#94A3B8',
                  boxShadow: !isSignUp ? '0 4px 12px rgba(0, 212, 255, 0.3)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                style={{
                  ...toggleButtonStyle,
                  background: isSignUp 
                    ? 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%)'
                    : 'transparent',
                  color: isSignUp ? '#0F172A' : '#94A3B8',
                  boxShadow: isSignUp ? '0 4px 12px rgba(255, 107, 53, 0.3)' : 'none'
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {isSignUp && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <User style={{ width: '20px', height: '20px', color: '#94A3B8' }} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required={Boolean(isSignUp)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FF6B35';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Mail style={{ width: '20px', height: '20px', color: '#94A3B8' }} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00D4FF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Lock style={{ width: '20px', height: '20px', color: '#94A3B8' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00D4FF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                </button>
              </div>

              {isSignUp && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <Lock style={{ width: '20px', height: '20px', color: '#94A3B8' }} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    required={Boolean(isSignUp)}
                    style={{ ...inputStyle, paddingRight: '48px' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FF6B35';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showConfirmPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                  </button>
                </div>
              )}

              {!isSignUp && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Remember me</span>
                  </label>
                  <RouterLink 
                    to="/forgot-password" 
                    style={{
                      fontSize: '0.875rem',
                      color: '#00D4FF',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF6B35'}
                    onMouseLeave={(e) => e.target.style.color = '#00D4FF'}
                  >
                    Forgot Password?
                  </RouterLink>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...primaryButtonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = isSignUp 
                      ? '0 15px 30px rgba(255, 107, 53, 0.4)'
                      : '0 15px 30px rgba(0, 212, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = isSignUp 
                      ? '0 10px 20px rgba(255, 107, 53, 0.3)'
                      : '0 10px 20px rgba(0, 212, 255, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #0F172A',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    <span>{isSignUp ? 'Start Tracking' : 'Sign In'}</span>
                    <ArrowRight style={{ width: '20px', height: '20px' }} />
                  </>
                )}
              </button>
            </form>

            {/* Social Login */}
           

            {/* Footer */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#94A3B8',
                margin: 0
              }}>
                By continuing, you agree to our{' '}
                <a href="#" style={{ color: '#00D4FF', textDecoration: 'none' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#00D4FF', textDecoration: 'none' }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (min-width: 1024px) {
          .left-side {
            display: flex !important;
          }
          .right-side {
            width: 50% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;