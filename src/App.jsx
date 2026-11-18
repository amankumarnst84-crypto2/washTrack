import { useEffect, useState } from 'react'
import { api } from './api'
import StudentDashboard from './StudentDashboard'
import VendorDashboard from './VendorDashboard'
import './App.css'
import './Workflow.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api('/auth/me').then(data => { if (active) setUser(data.user) })
      .catch(() => {}).finally(() => { if (active) setChecking(false) })
    const expired = () => { setUser(null); setError('Your session expired. Please sign in again.') }
    window.addEventListener('washtrack-session-expired', expired)
    return () => { active = false; window.removeEventListener('washtrack-session-expired', expired) }
  }, [])

  async function login(event) {
    event.preventDefault()
    setError(''); setBusy(true)
    try {
      const result = await api('/auth/login', { method: 'POST', body: { email: email.trim(), password } })
      setUser(result.user); setPassword('')
      window.location.hash = result.user.role === 'STAFF' ? '/vendor/dashboard' : '/student/dashboard'
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  async function logout() {
    setBusy(true)
    try {
      await api('/auth/logout', { method: 'POST', body: {} })
      setUser(null); setPassword(''); setError(''); window.location.hash = '/login'
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  if (checking) return <main className="wt-loading" role="status">Loading WashTrack…</main>
  if (user) {
    const Dashboard = user.role === 'STAFF' ? VendorDashboard : StudentDashboard
    return <><div className="wt-auth-error">{error && <p role="alert">{error}</p>}</div><Dashboard user={user} onSignOut={logout} signingOut={busy} /></>
  }
  return <main className="login-page">
    <div className="login-card">
      <div className="login-brand"><span className="login-brand-name">WashTrack</span></div>
      <h1 className="login-heading">Your laundry, accounted for</h1>
      <p className="login-subheading">Sign in with your assigned student or staff account</p>
      {error && <p className="error-banner" role="alert">{error}</p>}
      <form onSubmit={login}>
        <div className="form-fields">
          <label className="form-group">Email address<input className="form-input wt-login-input" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></label>
          <label className="form-group">Password<input className="form-input wt-login-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /></label>
          <label className="wt-check"><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show password</label>
        </div>
        <button className="submit-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="login-footer-note">Your account determines your role and assigned bag. Need an account? Contact laundry staff.</p>
    </div>
  </main>
}
