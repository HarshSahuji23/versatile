'use client'
export const instant = false
import { useEffect, useState } from 'react'

export default function AdminSettingsPage() {
  const [currentEmail, setCurrentEmail] = useState('admin@varshasversatile.com')
  const [loading, setLoading] = useState(true)

  // Form 1: Change Email
  const [newEmail, setNewEmail] = useState('')
  const [emailCurrentPass, setEmailCurrentPass] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form 2: Change Password
  const [passCurrent, setPassCurrent] = useState('')
  const [passNew, setPassNew] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form 3: Master Recovery Key
  const [keyCurrentPass, setKeyCurrentPass] = useState('')
  const [newRecoveryKey, setNewRecoveryKey] = useState('')
  const [keyLoading, setKeyLoading] = useState(false)
  const [keyMsg, setKeyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch current admin settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/auth')
      const json = await res.json()
      if (json.success && json.email) {
        setCurrentEmail(json.email)
        setNewEmail(json.email)
      }
    } catch (e) {
      console.warn(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Handle Email Update
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMsg(null)
    setEmailLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_email',
          currentPassword: emailCurrentPass,
          newEmail: newEmail.trim(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        setCurrentEmail(json.email || newEmail.trim())
        setEmailCurrentPass('')
        setEmailMsg({ type: 'success', text: 'Admin email updated successfully!' })
        // Update local session
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_user', JSON.stringify({ email: json.email || newEmail.trim() }))
        }
      } else {
        setEmailMsg({ type: 'error', text: json.error || 'Failed to update email.' })
      }
    } catch {
      setEmailMsg({ type: 'error', text: 'Connection error. Please try again.' })
    } finally {
      setEmailLoading(false)
    }
  }

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(null)

    if (passNew.length < 4) {
      setPassMsg({ type: 'error', text: 'New password must be at least 4 characters long.' })
      return
    }

    if (passNew !== passConfirm) {
      setPassMsg({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }

    setPassLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_password',
          currentPassword: passCurrent,
          newPassword: passNew.trim(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        setPassCurrent('')
        setPassNew('')
        setPassConfirm('')
        setPassMsg({ type: 'success', text: 'Admin password updated successfully!' })
      } else {
        setPassMsg({ type: 'error', text: json.error || 'Failed to update password.' })
      }
    } catch {
      setPassMsg({ type: 'error', text: 'Connection error. Please try again.' })
    } finally {
      setPassLoading(false)
    }
  }

  // Handle Master Recovery Key Update
  const handleUpdateRecoveryKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setKeyMsg(null)

    if (newRecoveryKey.trim().length < 4) {
      setKeyMsg({ type: 'error', text: 'Recovery key must be at least 4 characters long.' })
      return
    }

    setKeyLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_recovery_code',
          currentPassword: keyCurrentPass,
          newRecoveryCode: newRecoveryKey.trim().toUpperCase(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        setKeyCurrentPass('')
        setNewRecoveryKey('')
        setKeyMsg({ type: 'success', text: 'Secret Recovery Key updated successfully!' })
      } else {
        setKeyMsg({ type: 'error', text: json.error || 'Failed to update recovery key.' })
      }
    } catch {
      setKeyMsg({ type: 'error', text: 'Connection error. Please try again.' })
    } finally {
      setKeyLoading(false)
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Admin Account & Security Settings</h2>
          <p className="admin-page-subtitle">Manage your login credentials, email address, and security protection</p>
        </div>
      </div>

      {/* Security Status Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(74,42,138,0.06), rgba(212,175,55,0.08))',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
      }}>
        <div style={{ fontSize: '2.5rem' }}>🛡️</div>
        <div>
          <h4 style={{ margin: 0, color: 'var(--color-royal)', fontSize: '1.05rem', fontWeight: 700 }}>
            Account Security is Active
          </h4>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Current Active Admin Email: <strong>{currentEmail}</strong>. Unauthorized visitors cannot change your password or email without entering your current password or secret recovery key.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* ================= 1. CHANGE EMAIL ================= */}
        <div style={{
          background: 'white', borderRadius: 14, padding: '28px',
          boxShadow: 'var(--shadow-soft)', border: '1px solid #e8e3f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: '1.4rem' }}>✉️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-royal)' }}>Change Admin Email</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update the email address used to log in</span>
            </div>
          </div>

          {emailMsg && (
            <div style={{
              background: emailMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${emailMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: '0.85rem', color: emailMsg.type === 'success' ? '#15803d' : '#dc2626'
            }}>
              {emailMsg.type === 'success' ? '✅ ' : '⚠️ '}{emailMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateEmail}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label htmlFor="new-admin-email">New Email Address *</label>
              <input
                id="new-admin-email"
                type="email"
                placeholder="yourname@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label htmlFor="email-current-pass">Current Password (to verify) *</label>
              <input
                id="email-current-pass"
                type="password"
                placeholder="Enter current password"
                value={emailCurrentPass}
                onChange={(e) => setEmailCurrentPass(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-purple"
              disabled={emailLoading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {emailLoading ? 'Updating Email...' : '✦ Save New Email'}
            </button>
          </form>
        </div>

        {/* ================= 2. CHANGE PASSWORD ================= */}
        <div style={{
          background: 'white', borderRadius: 14, padding: '28px',
          boxShadow: 'var(--shadow-soft)', border: '1px solid #e8e3f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: '1.4rem' }}>🔑</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-royal)' }}>Change Admin Password</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set a strong and secure password</span>
            </div>
          </div>

          {passMsg && (
            <div style={{
              background: passMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${passMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: '0.85rem', color: passMsg.type === 'success' ? '#15803d' : '#dc2626'
            }}>
              {passMsg.type === 'success' ? '✅ ' : '⚠️ '}{passMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label htmlFor="settings-current-pass">Current Password *</label>
              <input
                id="settings-current-pass"
                type="password"
                placeholder="Enter your current password"
                value={passCurrent}
                onChange={(e) => setPassCurrent(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="settings-new-pass" style={{ margin: 0 }}>New Password *</label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-royal-mid)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="settings-new-pass"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter new password"
                value={passNew}
                onChange={(e) => setPassNew(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label htmlFor="settings-confirm-pass">Confirm New Password *</label>
              <input
                id="settings-confirm-pass"
                type={showPass ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-purple"
              disabled={passLoading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {passLoading ? 'Updating Password...' : '✦ Save New Password'}
            </button>
          </form>
        </div>

        {/* ================= 3. MASTER SECURITY RECOVERY KEY ================= */}
        <div style={{
          background: 'white', borderRadius: 14, padding: '28px',
          boxShadow: 'var(--shadow-soft)', border: '1px solid #e8e3f0',
          gridColumn: '1 / -1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: '1.4rem' }}>🔐</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-royal)' }}>Master Security Recovery Key</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                This private key is required if you ever forget your password on the login screen
              </span>
            </div>
          </div>

          {keyMsg && (
            <div style={{
              background: keyMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${keyMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: '0.85rem', color: keyMsg.type === 'success' ? '#15803d' : '#dc2626'
            }}>
              {keyMsg.type === 'success' ? '✅ ' : '⚠️ '}{keyMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateRecoveryKey} style={{ maxWidth: 500 }}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label htmlFor="recovery-current-pass">Current Password *</label>
              <input
                id="recovery-current-pass"
                type="password"
                placeholder="Enter current password to authorize key change"
                value={keyCurrentPass}
                onChange={(e) => setKeyCurrentPass(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label htmlFor="new-recovery-key">New Master Recovery Key *</label>
              <input
                id="new-recovery-key"
                type="text"
                placeholder="e.g. VARSHA2026 or mysecretkey"
                value={newRecoveryKey}
                onChange={(e) => setNewRecoveryKey(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Keep this code confidential. Only someone with this key can reset your admin password.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-gold"
              disabled={keyLoading}
            >
              {keyLoading ? 'Updating Key...' : '✦ Update Master Recovery Key'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
