import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth/auth';
import { getThemePalette } from '../../components/auth/theme';
import LeftPanel from '../../components/auth/LeftPanel';
import RegisterForm from '../../components/auth/RegisterForm';

export default function Register() {
  // 1. Core State Handlers
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_preference') === 'dark';
  });
  useEffect(() => {
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 2. Fetch the strict high-contrast theme palette dynamically
  const theme = getThemePalette(isDarkMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser({ email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Page Layout Styles Object (Guarantees background contrast shifts)
  const pageStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: theme.background,
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    transition: 'background-color 0.2s ease',
  };

  const floatingToggleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '24px',
    right: '24px',
    zIndex: 10,
    padding: '8px 14px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.card,
    color: theme.primaryText,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={pageStyle}>
      {/* Dynamic Theme Switcher - Now fully functional on Register page */}
      <button type="button" style={floatingToggleStyle} onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        )}
        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      {/* Shared Brand Presentation Left Panel */}
      <LeftPanel theme={theme} />

      {/* Right Form Display Wrapper */}
      <main style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '60px', 
        backgroundColor: theme.card, 
        color: theme.primaryText, 
        transition: 'all 0.2s ease' 
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: theme.primaryText, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Create Account
            </h1>
            <p style={{ margin: 0, color: theme.mutedText, fontSize: '14px' }}>
              Register your credentials to access the console.
            </p>
          </div>

          {/* High-Contrast Success Banner */}
          {success && (
            <div style={{
              borderRadius: '8px',
              backgroundColor: isDarkMode ? '#14532d' : '#f0fdf4',
              border: `1px solid ${isDarkMode ? '#166534' : '#bbf7d0'}`,
              color: isDarkMode ? '#bbf7d0' : '#15803d',
              padding: '12px 14px',
              fontSize: '13px',
              marginBottom: '24px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Account deployed successfully! Redirecting...</span>
            </div>
          )}

          {/* High-Contrast Error Banner */}
          {error && (
            <div style={{
              borderRadius: '8px',
              backgroundColor: theme.errorBg,
              border: `1px solid ${theme.errorBorder}`,
              color: theme.errorText,
              padding: '12px 14px',
              fontSize: '13px',
              marginBottom: '24px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Clean Subform Component (Only takes email & password) */}
          <RegisterForm
            theme={theme}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSubmit}
            loading={loading}
            success={success}
          />

          {/* Link to Redirect Back to Login */}
          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: theme.mutedText, fontWeight: 500 }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: theme.accent, 
                fontWeight: 700, 
                textDecoration: 'none', 
                marginLeft: '4px' 
              }}
            >
              Sign in
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}