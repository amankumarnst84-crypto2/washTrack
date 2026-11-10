import { useState } from 'react'
import './App.css'

/* ─────────────────────────────────────────
   Inline SVG icons (no extra dependencies)
───────────────────────────────────────── */
function IconWash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M4.93 4.93l3.54 3.54M15.54 15.54l3.54 3.54M19.07 4.93l-3.54 3.54M8.46 15.54l-3.54 3.54" />
    </svg>
  )
}

function IconStudent() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

function IconVendor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconEye({ off }) {
  return off ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   Validation helpers
───────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm({ email, password }) {
  const errors = {}
  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  return errors
}

/* ─────────────────────────────────────────
   App / LoginPage
───────────────────────────────────────── */
const ROLES = [
  { id: 'student', label: 'Student', Icon: IconStudent },
  { id: 'vendor', label: 'Laundry Vendor', Icon: IconVendor },
]

export default function App() {
  /* form state */
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  /* validation + UI state */
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  /* Clear server error when user edits a field */
  function handleEmailChange(e) {
    setEmail(e.target.value)
    if (serverError) setServerError('')
    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }))
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value)
    if (serverError) setServerError('')
    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }))
  }

  function handleRoleChange(id) {
    setRole(id)
    setServerError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    /* Frontend validation */
    const errors = validateForm({ email, password })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setServerError('')
    setLoading(true)

    try {
      /* Simulated network delay — replace with real API call later */
      await new Promise(resolve => setTimeout(resolve, 1400))

      /* Mock: reject a known test bad credential to demonstrate error UI */
      if (email.trim().toLowerCase() === 'fail@test.com') {
        throw new Error('Invalid email or password. Please try again.')
      }

      /* On real success the backend would return a token / session;
         for now we just log the intent. Role verification happens server-side. */
      console.log('Login intent:', { role, email: email.trim() })
      /* TODO: redirect or update auth context here */
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const roleLabel = ROLES.find(r => r.id === role)?.label ?? 'user'

  return (
    <main className="login-page">
      <div className="login-card" role="region" aria-label="Sign in">

        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand-icon" aria-hidden="true">
            <IconWash />
          </span>
          <span className="login-brand-name">WashTrack</span>
        </div>

        {/* Headings */}
        <h1 className="login-heading">Sign in to WashTrack</h1>
        <p className="login-subheading">Select your role to get started</p>

        {/* Role selector */}
        <div
          className="role-selector"
          role="group"
          aria-label="Select your account type"
        >
          {ROLES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`role-btn${role === id ? ' role-btn--active' : ''}`}
              aria-pressed={role === id}
              onClick={() => handleRoleChange(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {serverError && (
          <div className="error-banner" role="alert">
            <IconAlert />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-fields">

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><IconMail /></span>
                <input
                  id="email"
                  className={`form-input${fieldErrors.email ? ' form-input--error' : ''}`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error" id="email-error" role="alert">
                  <IconAlert />
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><IconLock /></span>
                <input
                  id="password"
                  className={`form-input${fieldErrors.password ? ' form-input--error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  <IconEye off={showPassword} />
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error" id="password-error" role="alert">
                  <IconAlert />
                  {fieldErrors.password}
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              `Sign in as ${roleLabel}`
            )}
          </button>
        </form>

        <p className="login-footer-note">
          Your actual access level is verified by the server.
        </p>
      </div>
    </main>
  )
}
