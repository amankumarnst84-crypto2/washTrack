import { useState } from 'react'
import './App.css'

/* ─────────────────────────────────────────
   Inline SVG icons — no extra dependencies
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
   Clothesline illustration
   ─ viewBox 0 0 310 165
   ─ Rope sags from the two poles
   ─ Five garments (T-shirt, A-line dress,
     cami top, V-neck tee, flowy dress)
   ─ No intimate clothing
   ─ Pure inline SVG — zero dependencies
───────────────────────────────────────── */
function ClotheslineIllustration() {
  /* Colour palette */
  const c = {
    pole:   '#8aaec6',   /* rope & poles: muted blue-grey     */
    pin:    '#c4a87e',   /* clothespins: warm wood             */
    /* garment fills */
    tee1:   '#7ec8e3',   /* sky-blue T-shirt                   */
    tee1d:  '#5ab8d8',   /* stripe accent                      */
    dress1: '#f9b17a',   /* peach A-line dress                 */
    dress1d:'#f09060',   /* waistband accent                   */
    cami:   '#78cdba',   /* mint cami                          */
    camid:  '#56bfa8',   /* side-panel accent                  */
    tee2:   '#b4a9d8',   /* lavender V-neck                    */
    dress2: '#f5d478',   /* warm-yellow flowy dress            */
    dress2d:'#e8c24a',   /* polka + waistband                  */
  }

  return (
    <svg
      viewBox="0 0 310 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="clothesline-svg"
      aria-hidden="true"
      role="presentation"
    >
      {/* ── Poles ── */}
      <rect x="8"   y="16" width="4" height="147" rx="2" fill={c.pole} />
      <rect x="298" y="16" width="4" height="147" rx="2" fill={c.pole} />

      {/* ── Rope (slight catenary sag via quadratic bezier) ── */}
      <path d="M 10,55 Q 155,63 300,55"
        stroke={c.pole} strokeWidth="1.8" strokeLinecap="round" />

      {/* ════════════════════════════════════
          GARMENT 1 — Sky-blue T-shirt  cx=44
          Shoulders at y=55; body to y=143
          Sleeves extend ±24 px from cx
      ════════════════════════════════════ */}
      {/* Body + sleeves path */}
      <path
        d="M 26,55 L 20,62 L 24,71 L 28,69 L 28,143 L 60,143 L 60,69 L 64,71 L 68,62 L 62,55 Q 44,63 26,55 Z"
        fill={c.tee1}
      />
      {/* Horizontal chest stripe */}
      <rect x="29" y="100" width="31" height="5" rx="1" fill={c.tee1d} opacity="0.55" />
      {/* Clothespins — one at each shoulder */}
      <rect x="23" y="49" width="6" height="12" rx="1.5" fill={c.pin} />
      <rect x="59" y="49" width="6" height="12" rx="1.5" fill={c.pin} />

      {/* ════════════════════════════════════
          GARMENT 2 — Peach A-line dress cx=102
          Narrow bodice → flared skirt
      ════════════════════════════════════ */}
      <path
        d="M 97,55 Q 102,63 107,55 L 115,98 L 126,148 L 78,148 L 89,98 Z"
        fill={c.dress1}
      />
      {/* Waistband accent */}
      <path d="M 89,98 L 115,98"
        stroke={c.dress1d} strokeWidth="4" strokeLinecap="round" opacity="0.65" />
      {/* Single centred clothespin */}
      <rect x="99" y="49" width="6" height="12" rx="1.5" fill={c.pin} />

      {/* ════════════════════════════════════
          GARMENT 3 — Mint cami top  cx=160
          Sleeveless; curved neckline
      ════════════════════════════════════ */}
      <path
        d="M 144,55 Q 160,64 176,55 L 176,138 L 144,138 Z"
        fill={c.cami}
      />
      {/* Subtle side-panel shading */}
      <rect x="144" y="90" width="8"  height="48" fill={c.camid} opacity="0.22" />
      <rect x="168" y="90" width="8"  height="48" fill={c.camid} opacity="0.22" />
      {/* Clothespins at each shoulder */}
      <rect x="141" y="49" width="6" height="12" rx="1.5" fill={c.pin} />
      <rect x="173" y="49" width="6" height="12" rx="1.5" fill={c.pin} />

      {/* ════════════════════════════════════
          GARMENT 4 — Lavender V-neck tee cx=218
          V-neck dips to y=72 at centre
      ════════════════════════════════════ */}
      <path
        d="M 200,55 L 210,65 L 218,72 L 226,65 L 236,55 L 242,62 L 238,71 L 234,69 L 234,143 L 202,143 L 202,69 L 198,71 L 194,62 Z"
        fill={c.tee2}
      />
      {/* Clothespins at each shoulder */}
      <rect x="197" y="49" width="6" height="12" rx="1.5" fill={c.pin} />
      <rect x="233" y="49" width="6" height="12" rx="1.5" fill={c.pin} />

      {/* ════════════════════════════════════
          GARMENT 5 — Warm-yellow flowy dress cx=276
          Narrow spaghetti straps → wide skirt
      ════════════════════════════════════ */}
      <path
        d="M 271,55 Q 276,63 281,55 L 290,100 L 300,148 L 252,148 L 262,100 Z"
        fill={c.dress2}
      />
      {/* Waistband */}
      <path d="M 262,100 L 290,100"
        stroke={c.dress2d} strokeWidth="4" strokeLinecap="round" opacity="0.65" />
      {/* Polka-dot pattern on skirt */}
      <circle cx="276" cy="118" r="2.2" fill={c.dress2d} opacity="0.65" />
      <circle cx="265" cy="130" r="2.2" fill={c.dress2d} opacity="0.65" />
      <circle cx="287" cy="128" r="2.2" fill={c.dress2d} opacity="0.65" />
      <circle cx="272" cy="140" r="2.2" fill={c.dress2d} opacity="0.65" />
      <circle cx="289" cy="140" r="2.2" fill={c.dress2d} opacity="0.65" />
      {/* Single centred clothespin */}
      <rect x="273" y="49" width="6" height="12" rx="1.5" fill={c.pin} />
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
   Role definitions
───────────────────────────────────────── */
const ROLES = [
  { id: 'student', label: 'Student',       Icon: IconStudent },
  { id: 'vendor',  label: 'Laundry Vendor', Icon: IconVendor  },
]

/* ─────────────────────────────────────────
   App — login page
───────────────────────────────────────── */
export default function App() {
  /* ── form state ── */
  const [role,         setRole]         = useState('student')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)

  /* ── UI state ── */
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(false)

  /* Clear errors eagerly as the user types */
  function handleEmailChange(e) {
    setEmail(e.target.value)
    if (serverError)        setServerError('')
    if (fieldErrors.email)  setFieldErrors(prev => ({ ...prev, email: '' }))
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value)
    if (serverError)           setServerError('')
    if (fieldErrors.password)  setFieldErrors(prev => ({ ...prev, password: '' }))
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
      /* Simulated network round-trip — replace with real API call */
      await new Promise(resolve => setTimeout(resolve, 1400))

      /* Demo: surface error UI for a known bad credential */
      if (email.trim().toLowerCase() === 'fail@test.com') {
        throw new Error('Invalid email or password. Please try again.')
      }

      /* Role verification happens server-side.
         On success: redirect or update auth context here. */
      console.log('Login intent:', { role, email: email.trim() })
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const roleLabel = ROLES.find(r => r.id === role)?.label ?? 'user'

  return (
    <main className="login-page">
      <div className="login-card">

        {/* ── Left: visual / illustration panel ── */}
        <div className="login-visual-panel" aria-hidden="true">
          <ClotheslineIllustration />

          <div className="visual-brand">
            <span className="visual-brand-icon">
              <IconWash />
            </span>
            <span className="visual-brand-name">WashTrack</span>
          </div>

          <p className="visual-tagline">
            Your campus laundry,<br />tracked and organised.
          </p>
        </div>

        {/* ── Right: form panel ── */}
        <div className="login-form-panel" role="region" aria-label="Sign in">

          {/* Small brand marker — visible on mobile when visual panel is condensed */}
          <div className="form-brand" aria-hidden="true">
            <span className="form-brand-icon"><IconWash /></span>
            <span className="form-brand-name">WashTrack</span>
          </div>

          <h1 className="form-heading">Welcome back</h1>
          <p className="form-subheading">Select your role, then sign in</p>

          {/* Role selector */}
          <div className="role-selector" role="group" aria-label="Select your account type">
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

      </div>
    </main>
  )
}
