'use client'
export const instant = false
import { useEffect, useState } from 'react'
import { type Service } from '@/lib/supabase'

const ICONS = ['💍', '🎂', '🏆', '🎭', '🎓', '🥂', '🎤', '🎶', '🎊', '🎉', '🌸', '⭐']

const EMPTY_FORM = { title: '', description: '', icon: '✨', order_index: 0 }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setServices(json.data)
      }
    } catch (e) {
      console.warn('Error fetching services:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, order_index: services.length })
    setShowModal(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({ title: s.title, description: s.description, icon: s.icon, order_index: s.order_index })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editing) {
        await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        })
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      await fetchServices()
      setShowModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setServices((prev) => prev.filter((s) => s.id !== id))
      }
    } catch (e) {
      console.error('Delete failed:', e)
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Services</h2>
          <p className="admin-page-subtitle">Manage the services displayed on your website ({services.length} services)</p>
        </div>
        <button id="add-service-btn" className="btn btn-gold" onClick={openAdd}>
          + Add Service
        </button>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <span className="admin-table-title">All Services ({services.length})</span>
        </div>

        {services.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No services added yet. Click &quot;Add Service&quot; to get started.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>Description</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontSize: '1.8rem' }}>{s.icon}</td>
                  <td><strong>{s.title}</strong></td>
                  <td style={{ maxWidth: 300, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {s.description?.slice(0, 80)}{(s.description?.length ?? 0) > 80 ? '...' : ''}
                  </td>
                  <td>{s.order_index}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn action-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                      <button className="action-btn action-btn-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
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
              <h3 className="admin-modal-title">{editing ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      style={{
                        fontSize: '1.5rem', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                        border: form.icon === icon ? '2px solid var(--color-gold)' : '2px solid transparent',
                        background: form.icon === icon ? 'rgba(212,175,55,0.1)' : '#f5f3fa',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="Or type any emoji"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(212,175,55,0.2)', borderRadius: 8 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="service-title">Title *</label>
                <input
                  id="service-title" type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Wedding Ceremonies"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="service-desc">Description</label>
                <textarea
                  id="service-desc" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this service..."
                  style={{ minHeight: 100 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="service-order">Display Order</label>
                <input
                  id="service-order" type="number" value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <button
                type="submit"
                className="btn btn-purple"
                disabled={saving}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
