'use client'
export const instant = false
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Link from 'next/link'

type Stats = {
  bookings: number
  newBookings: number
  services: number
  gallery: number
  testimonials: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ bookings: 0, newBookings: 0, services: 0, gallery: 0, testimonials: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [bRes, sRes, gRes, tRes] = await Promise.all([
          fetch('/api/bookings').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/services').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/gallery').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/testimonials').then((r) => r.json()).catch(() => ({ data: [] })),
        ])

        const bData: any[] = Array.isArray(bRes.data) ? bRes.data : []
        const sData: any[] = Array.isArray(sRes.data) ? sRes.data : []
        const gData: any[] = Array.isArray(gRes.data) ? gRes.data : []
        const tData: any[] = Array.isArray(tRes.data) ? tRes.data : []

        setStats({
          bookings: bData.length,
          newBookings: bData.filter((b) => b.status === 'new').length,
          services: sData.length,
          gallery: gData.length,
          testimonials: tData.length,
        })
        setRecentBookings(bData.slice(0, 5))
      } catch (e) {
        console.warn('Dashboard fetch stats error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Dashboard</h2>
          <p className="admin-page-subtitle">Welcome back, Varsha! Here&apos;s an overview of your website.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">📋</div>
          <div>
            <div className="admin-stat-number">{stats.bookings}</div>
            <div className="admin-stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon red">🔔</div>
          <div>
            <div className="admin-stat-number">{stats.newBookings}</div>
            <div className="admin-stat-label">New Inquiries</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon gold">✨</div>
          <div>
            <div className="admin-stat-number">{stats.services}</div>
            <div className="admin-stat-label">Services</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">🖼️</div>
          <div>
            <div className="admin-stat-number">{stats.gallery}</div>
            <div className="admin-stat-label">Gallery Images</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">💬</div>
          <div>
            <div className="admin-stat-number">{stats.testimonials}</div>
            <div className="admin-stat-label">Testimonials</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'View Bookings', href: '/admin/bookings', color: 'var(--color-royal-mid)' },
          { label: 'Add Service', href: '/admin/services', color: 'var(--color-purple)' },
          { label: 'Upload Photo', href: '/admin/gallery', color: '#16a34a' },
          { label: 'Add Review', href: '/admin/testimonials', color: '#d97706' },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <button
              className="btn"
              style={{ background: a.color, color: 'white', fontSize: '0.85rem', padding: '10px 20px' }}
            >
              {a.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <span className="admin-table-title">Recent Booking Requests</span>
          <Link href="/admin/bookings">
            <button className="action-btn action-btn-edit">View All</button>
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No booking requests yet. They&apos;ll appear here once someone submits the form.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Event Type</th>
                <th>Event Date</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.email}</span></td>
                  <td>{b.event_type || '—'}</td>
                  <td>{b.event_date ? new Date(b.event_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(b.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
