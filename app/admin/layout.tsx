'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/bookings', icon: '📋', label: 'Bookings' },
  { href: '/admin/services', icon: '✨', label: 'Services' },
  { href: '/admin/gallery', icon: '🖼️', label: 'Gallery' },
  { href: '/admin/testimonials', icon: '💬', label: 'Testimonials' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If on the login page itself, don't protect
    if (pathname === '/admin') {
      setLoading(false)
      return
    }

    // Check session
    try {
      const stored = localStorage.getItem('admin_user')
      const token = sessionStorage.getItem('admin_token')
      if (stored || token) {
        const parsed = stored ? JSON.parse(stored) : { email: 'admin@varshasversatile.com' }
        setUser(parsed)
        setLoading(false)
        return
      }
    } catch {
      // ignore
    }

    // Unauthorized access: strictly redirect to admin login
    setUser(null)
    setLoading(false)
    router.replace('/admin')
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_user')
      sessionStorage.removeItem('admin_token')
    }
    setUser(null)
    router.replace('/admin')
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar drawer on route navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const pageName = NAV_ITEMS.find((n) => n.href === pathname)?.label ?? 'Admin'

  // If on login page, render children directly without the dashboard sidebar wrapper
  if (pathname === '/admin') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f3f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-backdrop open"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--color-gold)', objectFit: 'cover' }} />
            <div>
              <span className="admin-sidebar-logo">Varsha&apos;s Versatile</span>
              <span className="admin-sidebar-subtitle">Content Manager</span>
            </div>
          </div>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item" style={{ marginBottom: 8 }}>
            <span className="admin-nav-icon">🌐</span>
            View Website
          </Link>
          <button
            className="admin-nav-item"
            onClick={handleLogout}
            id="admin-logout-btn"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,100,100,0.7)' }}
          >
            <span className="admin-nav-icon">🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <h1 className="admin-topbar-title">{pageName}</h1>
          </div>
          <div className="admin-topbar-user">
            <span className="admin-user-email">{user?.email || 'admin@varshasversatile.com'}</span>
            <div className="admin-avatar">V</div>
          </div>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}
