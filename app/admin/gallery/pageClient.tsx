'use client'
export const instant = false
import { useEffect, useState, useRef } from 'react'
import { type GalleryImage } from '@/lib/supabase'

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/gallery')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setImages(json.data)
      }
    } catch (e) {
      console.warn('Error fetching gallery:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && !previewUrl) {
      alert('Please select or drop an image to upload.')
      return
    }
    setSaving(true)

    try {
      const formData = new FormData()
      if (selectedFile) {
        formData.append('file', selectedFile)
      } else if (previewUrl) {
        formData.append('image_data', previewUrl)
      }
      formData.append('caption', caption.trim() || 'Event Photograph')

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success) {
        await fetchImages()
        setCaption('')
        setSelectedFile(null)
        setPreviewUrl(null)
        setShowModal(false)
      } else {
        alert(json.error || 'Failed to upload image')
      }
    } catch (err: any) {
      console.error('Upload failed:', err)
      alert('Failed to upload image. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this image from the gallery?')) return

    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setImages((prev) => prev.filter((img) => img.id !== id))
      } else {
        alert('Failed to remove image.')
      }
    } catch (e) {
      console.error('Delete failed:', e)
      // Optimistic local filter
      setImages((prev) => prev.filter((img) => img.id !== id))
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Gallery</h2>
          <p className="admin-page-subtitle">Upload and manage photos displayed in the gallery section ({images.length} photos)</p>
        </div>
        <button
          id="add-gallery-btn"
          className="btn btn-gold"
          onClick={() => {
            setSelectedFile(null)
            setPreviewUrl(null)
            setCaption('')
            setShowModal(true)
          }}
        >
          + Add Image
        </button>
      </div>

      {images.length === 0 ? (
        <div className="admin-table-wrapper" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No gallery images yet. Click &quot;+ Add Image&quot; to upload your first photo directly from your device.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                background: 'white', borderRadius: 12, overflow: 'hidden',
                boxShadow: 'var(--shadow-soft)', border: '1px solid #e8e3f0',
                display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ aspectRatio: '4/3', background: 'var(--color-royal-mid)', overflow: 'hidden' }}>
                {img.image_url ? (
                  <img src={img.image_url} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '2rem' }}>
                    🖼️
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.caption || 'Event Photograph'}
                </p>
                <button
                  className="action-btn action-btn-delete"
                  onClick={() => handleDelete(img.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px' }}
                >
                  🗑️ Remove Image
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Upload Gallery Image</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!previewUrl ? (
                <div
                  className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ marginBottom: 18 }}
                >
                  <span className="upload-dropzone-icon">📸</span>
                  <div className="upload-dropzone-title">Click to browse or drop image here</div>
                  <div className="upload-dropzone-sub">Supports JPG, PNG, WEBP from your computer or phone</div>
                </div>
              ) : (
                <div className="upload-preview-wrapper">
                  <img src={previewUrl} alt="Selected preview" />
                  <button
                    type="button"
                    className="upload-remove-btn"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    title="Change / Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label htmlFor="gallery-caption">Caption / Event Title</label>
                <input
                  id="gallery-caption"
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Grand Wedding Reception at Taj"
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: '#f3f4f6', color: '#4b5563', justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-purple"
                  disabled={saving || !previewUrl}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {saving ? 'Uploading...' : '✦ Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
