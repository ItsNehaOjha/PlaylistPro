import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Users, 
  Award, 
  TrendingUp, 
  Brain, 
  Zap, 
  Target, 
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Rocket,
  Globe,
  Shield,
  Heart,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  ListMusic,
  Calendar,
  BarChart3
} from 'lucide-react';
import RobotMascot from '../components/RobotMascot';
import BrainIcon from '../components/BrainIcon';

const Home = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Define the missing gradientTextStyle
  const gradientTextStyle = {
    background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

 const features = [
  {
    icon: ListMusic,
    title: "Study Playlists",
    description: "Turn YouTube videos into structured playlists for any exam or subject.",
    stats: "100% playlist support"
  },
  {
    icon: Target,
    title: "Exam Tracking",
    description: "Set your exam goals, add subjects, and monitor preparation progress.",
    stats: "Customizable tracking"
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Visual insights into completion rates, weak topics, and study consistency.",
    stats: "Real-time insights"
  },
  {
    icon: BookOpen,
    title: "Notes & To-Dos",
    description: "Attach notes and create daily to-do lists directly linked to topics.",
    stats: "Integrated workflow"
  },
  {
    icon: Calendar,
    title: "Exam Countdown",
    description: "Stay on track with automatic countdowns to your exam date.",
    stats: "Never miss deadlines"
  },
  {
    icon: Award,
    title: "Milestone Tracking",
    description: "Mark chapters, topics, and subjects as completed to see progress.",
    stats: "Step-by-step success"
  }
];


 
  const stats = [
  { number: "100%", label: "All Playlists Supported", icon: PlayCircle },
  { number: "50+", label: "Exams & Skills Tracked", icon: BookOpen },
  { number: "Real-time", label: "Progress Analytics", icon: BarChart3 },
  { number: "Unlimited", label: "Video Sources Supported", icon: Globe }
];

 const subjects = [
  { name: "GATE", icon: "🔧", courses: 45 },
  { name: "Aptitude", icon: "📊", courses: 30 },
  { name: "Interview Prep", icon: "💼", courses: 20 },
  { name: "Coding Practice", icon: "💻", courses: 35 },
  { name: "DSA", icon: "🧩", courses: 28 },
  { name: "Operating Systems", icon: "🖥️", courses: 18 },
  { name: "DBMS", icon: "🗄️", courses: 15 },
  { name: "CDS", icon: "🎖️", courses: 22 },
  { name: "UPSC", icon: "🏛️", courses: 65 },
  { name: "Banking", icon: "🏦", courses: 30 }
];



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Change testimonial every 4 seconds
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#e2e8f0'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainIcon size="small" />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00D4FF' }}>SkillLog</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
           
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                color: '#0f172a',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 25px rgba(0, 212, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '8rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite 2s'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {/* Logo and Mascot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <BrainIcon variant="brain" size="xl" mood="excited" />
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              marginLeft: '1rem',
              background: 'linear-gradient(135deg, #00D4FF, #FF6B35, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              SkillLog
            </h1>
          </div>

          {/* Main Headline */}
          <h2 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            Master Your Exam Prep with
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Smart Study Playlists
            </span>
          </h2>

          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: '1.6'
          }}>
            Transform your exam preparation with organized study playlists, progress tracking, 
            and smart scheduling. Turn YouTube videos into structured learning paths.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                color: '#0f172a',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 212, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <PlayCircle size={20} />
              Start Tracking Free
            </button>
           
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            color: '#64748b',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} style={{ color: '#10B981' }} />
              <span>
                Track your progress
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} style={{ color: '#F59E0B' }} />
              <span>The smart way to study</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} style={{ color: '#00D4FF' }} />
              <span>Learn Anytime, Anywhere:</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '4rem 1.5rem',
        background: 'rgba(30, 41, 59, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <stat.icon size={32} style={{ color: '#00D4FF', margin: '0 auto 1rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>
                    {stat.number}
                  </div>
                  <div style={{ color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
              Why Choose SkillLog?
            </h3>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Discover the features that make learning more effective, engaging, and enjoyable
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '1rem',
                padding: '2rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <feature.icon size={24} style={{ color: '#ffffff' }} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h4>
                <p style={{ color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
                <div style={{ fontSize: '0.875rem', color: '#00D4FF', fontWeight: '500' }}>
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'rgba(30, 41, 59, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
              Explore Learning Paths
            </h3>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Choose from hundreds of courses across various subjects and skill levels
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {subjects.map((subject, index) => (
              <div key={index} style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{subject.icon}</div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {subject.name}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {subject.courses} courses
                </p>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                  borderRadius: '2px',
                  opacity: 0.7
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
     

      {/* CTA Section */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <BrainIcon variant="zap" size="large" mood="celebrating" />
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1.5rem',
              marginTop: '2rem'
            }}>
              Master Your Learning Journey with
              <span style={gradientTextStyle}> Smart Progress Tracking</span>
            </h3>
            <p style={{
              fontSize: '1.25rem',
              color: '#94a3b8',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
             Join learners preparing for GATE, interviews, aptitude, and competitive exams. SkillLog helps you track videos, playlists, and progress — all in one place.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0, 212, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Sparkles size={20} />
                Get Started Free
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 1.5rem 2rem',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(30, 41, 59, 0.5)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <BrainIcon size="small" />
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', marginLeft: '0.5rem' }}>
                  SkillLog
                </span>
              </div>
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                Empowering learners worldwide with AI-driven education technology.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '1rem' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>API</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '1rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>About</a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Blog</a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Careers</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '1rem' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Help Center</a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Community</a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(30, 41, 59, 0.5)',
            paddingTop: '2rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <p>&copy; 2024 SkillLog. All rights reserved. Made with ❤️ for learners worldwide.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Home;

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    avatar: "👩‍💻",
    content: "PlaylistPro's structured approach helped me prepare systematically for technical interviews. The progress tracking kept me motivated throughout my placement preparation journey!",
    rating: 5,
    company: "Google"
  },
  {
    id: 2,
    name: "Rahul Kumar",
    role: "IAS Officer",
    avatar: "👨‍💼",
    content: "PlaylistPro transformed my UPSC preparation strategy. The exam countdown and daily scheduling features kept me on track throughout the year-long journey.",
    rating: 5,
    company: "Government of India"
  },
  {
    id: 3,
    name: "Ananya Patel",
    role: "GATE AIR 47",
    avatar: "👩‍🎓",
    content: "PlaylistPro's smart scheduling aligned perfectly with my GATE timeline. The milestone tracking gave me confidence that I was progressing well. Scored 98.7 percentile!",
    rating: 5,
    company: "IIT Bombay"
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Cybersecurity Analyst",
    avatar: "👨‍💻",
    content: "PlaylistPro helped me structure my cybersecurity learning journey. From basics to advanced topics, the playlist feature made everything organized and trackable.",
    rating: 5,
    company: "Microsoft"
  }
];