import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import CornerPlusMarkers from './CornerPlusMarkers';
import { 
  createAccount, 
  signInUser, 
  signInWithGoogle, 
  verifyEmailOtp, 
  resendConfirmationOtp,
  formatSupabaseUser
} from '../utils/auth';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signup', // 'signup' | 'signin'
  onSuccess // (user, isNewUser) => void
}) {
  const [mode, setMode] = useState(initialMode); // 'signup' | 'signin' | 'verify_otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const data = await createAccount({ name, email, password });
        setIsSubmitting(false);

        // If email confirmation is enabled on Supabase, session is null until code is verified
        if (!data.session) {
          setMode('verify_otp');
          setSuccessMsg(`We've sent a 6-digit confirmation code to ${email}. Check your email.`);
        } else if (data.user) {
          // If session is immediately active, proceed
          if (onSuccess) onSuccess(formatSupabaseUser(data.user), true);
        }
      } else {
        const user = await signInUser({ email, password });
        setIsSubmitting(false);
        if (onSuccess) onSuccess(user, false);
      }
    } catch (err) {
      const msg = err?.message || 'Authentication failed. Please check your credentials and try again.';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedCode = otpCode.trim();
    if (!trimmedCode || trimmedCode.length < 6) {
      setError('Please enter the 6-digit confirmation code sent to your email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await verifyEmailOtp({ email, token: trimmedCode });
      setIsSubmitting(false);
      if (onSuccess) onSuccess(user, true);
    } catch (err) {
      setError(err?.message || 'Invalid or expired confirmation code. Please check your email or request a new one.');
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      await resendConfirmationOtp(email);
      setSuccessMsg(`A fresh confirmation code has been sent to ${email}.`);
    } catch (err) {
      setError(err?.message || 'Could not resend confirmation code. Please try again in a moment.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || 'Google authentication failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="auth-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="auth-modal-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          border: '1px dashed #cbd5e1',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
          padding: '36px 32px',
          borderRadius: 0,
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CornerPlusMarkers color="#94a3b8" bg="#ffffff" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <X size={18} />
        </button>

        {/* ================= OTP VERIFICATION VIEW ================= */}
        {mode === 'verify_otp' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#fff1f2',
                border: '1.5px solid #fecdd3',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                color: '#780115'
              }}>
                <KeyRound size={26} />
              </div>

              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0f172a',
                margin: '0 0 6px'
              }}>
                Check your email
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 auto', maxWidth: '360px', lineHeight: 1.5 }}>
                We've sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to activate your account.
              </p>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '6px',
                fontSize: '0.82rem',
                marginBottom: '16px',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '6px',
                fontSize: '0.82rem',
                marginBottom: '16px',
                fontWeight: 600
              }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
                  Enter Confirmation Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1.6rem',
                    letterSpacing: '0.35em',
                    textAlign: 'center',
                    fontWeight: 800,
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#780115';
                    e.target.style.boxShadow = '0 0 0 3px rgba(120, 1, 21, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.trim().length < 6}
                className="btn-stitch-primary"
                style={{
                  padding: '12px',
                  width: '100%'
                }}
              >
                <span>{isSubmitting ? 'Verifying code...' : 'Confirm & Continue'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Didn't get the code?</span>
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#780115',
                    fontWeight: 700,
                    cursor: isResending ? 'not-allowed' : 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isResending && <RefreshCw size={12} className="animate-spin" />}
                  <span>{isResending ? 'Resending...' : 'Resend Code'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setMode('signup'); setOtpCode(''); setError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.78rem'
                }}
              >
                ← Back to signup / Change email
              </button>
            </div>
          </div>
        ) : (
          /* ================= SIGN UP / SIGN IN VIEW ================= */
          <div>
            {/* Brand Header */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <img 
                  src="/Careerhut.png" 
                  alt="Careerhut" 
                  style={{ height: '28px', width: 'auto', display: 'block' }}
                />
              </div>

              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0f172a',
                margin: '0 0 6px'
              }}>
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
                {mode === 'signup' 
                  ? 'Join candidates applying directly to official company career pages' 
                  : 'Sign in to access your direct career dashboard and tracked jobs'}
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                marginBottom: '16px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                or with email
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              padding: '4px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              marginBottom: '18px'
            }}>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
                  color: mode === 'signup' ? '#780115' : '#64748b',
                  boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: mode === 'signin' ? '#ffffff' : 'transparent',
                  color: mode === 'signin' ? '#780115' : '#64748b',
                  boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Sign In
              </button>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '6px',
                fontSize: '0.82rem',
                marginBottom: '16px',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '6px',
                fontSize: '0.82rem',
                marginBottom: '16px',
                fontWeight: 600
              }}>
                {successMsg}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Full Name
                  </label>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        fontSize: '0.9rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#780115'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Email Address
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      fontSize: '0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#780115'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Password
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      fontSize: '0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#780115'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-stitch-primary"
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  width: '100%'
                }}
              >
                <span>{isSubmitting ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Security / Trust footer note */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              <ShieldCheck size={14} color="#059669" />
              <span>Zero recruiter spam • Authenticated with Supabase</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
