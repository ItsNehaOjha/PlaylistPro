import React from 'react';
import { Brain } from 'lucide-react';

const BrainIcon = ({ 
  size = 'medium', 
  animated = true,
  mood = 'happy',
  style = {}
}) => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48,
    xl: 64
  };

  const iconSize = sizeMap[size] || sizeMap.medium;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconSize + 20,
        height: iconSize + 20,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
        border: '2px solid #10B981',
        position: 'relative',
        animation: animated ? 'float 6s ease-in-out infinite' : 'none',
        ...style
      }}
    >
      <Brain 
        size={iconSize} 
        color="#10B981"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))',
          zIndex: 1,
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default BrainIcon;