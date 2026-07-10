// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import type { ThemePalette } from './types';

interface LoginFormProps {
  theme: ThemePalette;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoginMode: boolean;
}

export default function LoginForm({
  theme, email, setEmail, password, setPassword, onSubmit, isLoginMode
}: LoginFormProps) {
  // Local state to manage the password input visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 44px 12px 14px', // Keeps password dots from overlapping the eye toggle icon
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: theme.input,
    color: theme.primaryText,
    transition: 'all 0.2s ease',
  };

  const eyeToggleStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    color: '#94a3b8',
    outline: 'none',
    zIndex: 10,       // Guarantees icon floats completely over the background input layer
    height: '32px',    // Formulates clean spatial boundaries for clicking targets
    width: '32px',
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: theme.primaryText, marginBottom: '8px', letterSpacing: '0.05em' }}>
          Email address
        </label>
        <input 
          type="email" 
          required 
          style={inputStyle} 
          placeholder="you@company.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>

      <div>
        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: theme.primaryText, marginBottom: '8px', letterSpacing: '0.05em' }}>
          Password
        </label>
        
        {/* Relative layout wrapper with flex centering for pixel-perfect structural targeting */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input 
            type={showPassword ? "text" : "password"} // Switches visibility mode conditionally
            required 
            style={inputStyle} 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={eyeToggleStyle}
            tabIndex={-1} // Keeps keyboard focus flowing sequentially down to the form submit action
          >
            {showPassword ? (
              /* --- EYE CLOSED ICON --- */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              /* --- EYE OPEN ICON --- */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <button type="submit" style={{
          width: '100%', backgroundColor: theme.accent, color: '#ffffff', padding: '14px 24px', borderRadius: '8px',
          fontWeight: 600, fontSize: '14px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer'
        }}>
          {isLoginMode ? 'Connect to Assets' : 'Initialize Account'}
        </button>
      </div>
    </form>
  );
}