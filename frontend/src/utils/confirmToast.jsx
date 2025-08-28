import toast from 'react-hot-toast';

// Custom confirmation toast
export const confirmAction = (message, onConfirm, onCancel) => {
  const toastId = toast.custom(
    (t) => (
      <div
        style={{
          background: 'rgba(30,30,30,0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          minWidth: '300px',
          maxWidth: '400px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            color: '#FFFFFF', 
            margin: '0 0 8px 0', 
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: "'Inter', sans-serif"
          }}>
            Confirm Action
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.8)', 
            margin: '0',
            fontSize: '14px',
            lineHeight: '1.4',
            fontFamily: "'Inter', sans-serif"
          }}>
            {message}
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onCancel) onCancel();
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onConfirm) onConfirm();
            }}
            style={{
              background: '#f44336',
              border: 'none',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#d32f2f';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f44336';
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity, // Don't auto-dismiss
      position: 'top-center',
    }
  );
};

// Generic confirmation toast for different actions
export const confirmGeneric = (title, message, confirmText, onConfirm, onCancel) => {
  const toastId = toast.custom(
    (t) => (
      <div
        style={{
          background: 'rgba(30,30,30,0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          minWidth: '300px',
          maxWidth: '400px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            color: '#FFFFFF', 
            margin: '0 0 8px 0', 
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: "'Inter', sans-serif"
          }}>
            {title}
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.8)', 
            margin: '0',
            fontSize: '14px',
            lineHeight: '1.4',
            fontFamily: "'Inter', sans-serif"
          }}>
            {message}
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onCancel) onCancel();
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onConfirm) onConfirm();
            }}
            style={{
              background: '#1976d2',
              border: 'none',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#1565c0';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#1976d2';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity, // Don't auto-dismiss
      position: 'top-center',
    }
  );
};

// Success toast with custom styling
export const successToast = (message) => {
  toast.success(message, {
    style: {
      background: 'rgba(30,30,30,0.95)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
    },
  });
};

// Error toast with custom styling
export const errorToast = (message) => {
  toast.error(message, {
    style: {
      background: 'rgba(30,30,30,0.95)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
    },
  });
};
