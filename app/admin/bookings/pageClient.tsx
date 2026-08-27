'use client'
export const instant = false
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, type Booking } from '@/lib/supabase'

const STATUS_OPTIONS = ['new', 'read', 'responded']

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data)
      }
    } catch (e) {
      console.warn('Error fetching bookings:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    } catch (e) {
      console.warn(e)
    }
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null)
  }

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this booking request?')) return
    try {
      await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
    } catch (e) {
      console.warn(e)
    }
    setBookings((prev) => prev.filter((b) => b.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Booking Requests</h2>
          <p className="admin-page-subtitle">{bookings.length} total inquiries received</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <span className="admin-table-title">All Inquiries</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Click a row to view details
          </span>
        </div>

        {bookings.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No booking requests yet. Share your website to start receiving inquiries!
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Event Type</th>
                <th>Date</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(b)}>
                  <td>
                    <strong>{b.name}</strong>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.email}</span>
                  </td>
                  <td>{b.event_type || '—'}</td>
                  <td>{b.event_date ? new Date(b.event_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td>{b.phone || '—'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className={`badge badge-${b.status}`}
                      style={{ cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="action-btn action-btn-delete" onClick={() => deleteBooking(b.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Booking Details</h3>
              <button className="admin-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Name', value: selected.name },
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone || '—' },
                { label: 'Event Type', value: selected.event_type || '—' },
                { label: 'Event Date', value: selected.event_date ? new Date(selected.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                { label: 'Received On', value: new Date(selected.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}

              {selected.message && (
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Message</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', background: '#f9f7fc', padding: '12px 16px', borderRadius: 8, lineHeight: 1.7 }}>{selected.message}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>Update Status</label>
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(212,175,55,0.3)', borderRadius: 8, fontSize: '0.9rem' }}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <a href={`mailto:${selected.email}`}>
                    <button className="btn btn-purple" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>Email Client</button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
