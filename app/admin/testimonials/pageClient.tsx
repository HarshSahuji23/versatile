'use client'
export const instant = false
import { useEffect, useState } from 'react'
import { type Testimonial } from '@/lib/supabase'

const EMPTY_FORM = { client_name: '', event_type: 'Wedding Ceremony', review: '', rating: 5 }

const EVENT_TYPES = ['Wedding Ceremony', 'Birthday Party', 'Corporate Event', 'Cultural Program', 'School / College Event', 'Private Celebration', 'Other']

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setTestimonials(json.data)
      }
    } catch (e) {
      console.warn('Error fetching testimonials:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTestimonials() }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        await fetchTestimonials()
        setShowModal(false)
        setForm(EMPTY_FORM)
      } else {
        alert(json.error || 'Failed to save review')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const res = await fetch(`/api/testimonials?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (e) {
      console.error('Delete failed:', e)
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Testimonials</h2>
          <p className="admin-page-subtitle">Manage client reviews displayed on your website ({testimonials.length} reviews)</p>
        </div>
        <button id="add-testimonial-btn" className="btn btn-gold" onClick={openAdd}>
          + Add Testimonial
        </button>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <span className="admin-table-title">All Testimonials ({testimonials.length})</span>
        </div>

        {testimonials.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No testimonials yet. Add your first client review!
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Event</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.client_name}</strong></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.event_type}</td>
                  <td style={{ color: '#d4af37', letterSpacing: 2 }}>{'★'.repeat(t.rating)}</td>
                  <td style={{ maxWidth: 320, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    &ldquo;{t.review.slice(0, 90)}{t.review.length > 90 ? '...' : ''}&rdquo;
                  </td>
                  <td>
                    <button
                      className="action-btn action-btn-delete"
                      onClick={() => handleDelete(t.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Add Testimonial</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <div className="form-group">
                <label htmlFor="t-name">Client Name *</label>
                <input
                  id="t-name" type="text" value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="e.g. Priya & Rahul Sharma"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="t-event">Event Type</label>
                <select
                  id="t-event" value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                >
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, rating: r })}
                      style={{
                        fontSize: '1.5rem', cursor: 'pointer', background: 'none',
                        border: 'none', color: r <= form.rating ? '#d4af37' : '#d1d5db',
                        transition: 'color 0.15s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="t-review">Review *</label>
                <textarea
                  id="t-review" value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  placeholder="What did the client say about your performance?"
                  required
                  style={{ minHeight: 120 }}
                />
              </div>

              <button
                type="submit" className="btn btn-purple" disabled={saving}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {saving ? 'Adding...' : '✦ Add Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
