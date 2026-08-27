'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()

  // View mode: 'login' | 'forgot' | 'reset'
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login')

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Forgot / Reset form state
  const [forgotEmail, setForgotEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: email.trim(),
          password: password.trim(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        localStorage.setItem('admin_user', JSON.stringify(json.user || { email }))
        sessionStorage.setItem('admin_token', json.token || 'auth_token')
        router.push('/admin/dashboard')
      } else {
        setError(json.error || 'Invalid email or password.')
      }
    } catch (err) {
      console.error(err)
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 1: Verify Identity with Email & Security Key
  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'forgot_verify',
          email: forgotEmail.trim(),
          recoveryCode: recoveryCode.trim(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        setSuccessMsg('Security verification passed. Please choose a new password.')
        setView('reset')
      } else {
        setError(json.error || 'Security verification failed.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to verify. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 2: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email: forgotEmail.trim(),
          recoveryCode: recoveryCode.trim(),
          newPassword: newPassword.trim(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        setSuccessMsg('Password updated successfully! Please sign in with your new credentials.')
        setEmail(forgotEmail)
        setPassword('')
        setView('login')
      } else {
        setError(json.error || 'Failed to update password.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img src="/logo.jpg" alt="Varsha's Versatile Logo" className="admin-logo-img" />
          <span className="admin-login-logo-text">Varsha&apos;s Versatile</span>
          <span className="admin-login-subtitle">Admin Control Panel</span>
        </div>

        {/* ================= LOGIN VIEW ================= */}
        {view === 'login' && (
          <>
            <h1 className="admin-login-title">Admin Sign In</h1>
            <p className="admin-login-desc">Enter your email ID and password to access the admin panel.</p>

            {successMsg && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                fontSize: '0.85rem', color: '#15803d', fontWeight: 500
              }}>
                ✅ {successMsg}
              </div>
            )}

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="admin-email">Email ID *</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="Enter your email id...."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="admin-password" style={{ margin: 0 }}>Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setRecoveryCode('')
                      setError('')
                      setSuccessMsg('')
                      setView('forgot')
                    }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-royal-mid)',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.6
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="admin-login-btn"
                className="btn btn-purple"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              >
                {loading ? 'Signing in...' : '✦ Sign In to Dashboard'}
              </button>
            </form>
          </>
        )}

        {/* ================= FORGOT PASSWORD / SECURITY VERIFICATION ================= */}
        {view === 'forgot' && (
          <>
            <h1 className="admin-login-title">Reset Admin Password</h1>
            <p className="admin-login-desc">Enter your registered email and secret master recovery key to verify ownership.</p>

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleVerifyRecovery}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label htmlFor="forgot-email">Registered Email ID *</label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email id...."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label htmlFor="recovery-code">Master Security Key *</label>
                <input
                  id="recovery-code"
                  type="password"
                  placeholder="Enter your private recovery key"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  🔒 Only the authorized admin who knows this security key can reset the password.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-purple"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
              >
                {loading ? 'Verifying Identity...' : 'Verify & Continue →'}
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  setError('')
                  setSuccessMsg('')
                  setView('login')
                }}
                style={{ width: '100%', justifyContent: 'center', background: '#f3f4f6', color: '#4b5563' }}
              >
                ← Back to Login
              </button>
            </form>
          </>
        )}

        {/* ================= SET NEW PASSWORD VIEW ================= */}
        {view === 'reset' && (
          <>
            <h1 className="admin-login-title">Set New Password</h1>
            <p className="admin-login-desc">Enter your new secure password for <strong>{forgotEmail}</strong></p>

            {successMsg && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                fontSize: '0.85rem', color: '#15803d', fontWeight: 500
              }}>
                ✅ {successMsg}
              </div>
            )}

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="new-password" style={{ margin: 0 }}>New Password *</label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-royal-mid)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min 4 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label htmlFor="confirm-password">Confirm New Password *</label>
                <input
                  id="confirm-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-purple"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
              >
                {loading ? 'Updating Password...' : '✦ Save New Password & Login'}
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  setError('')
                  setSuccessMsg('')
                  setView('login')
                }}
                style={{ width: '100%', justifyContent: 'center', background: '#f3f4f6', color: '#4b5563' }}
              >
                Cancel
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--color-royal-mid)', textDecoration: 'none' }}>
            ← Back to Website
          </a>
        </p>
      </div>
    </div>
  )
}
