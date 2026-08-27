'use client'
import { useEffect, useState } from 'react'
import { type GalleryImage } from '@/lib/supabase'

const PLACEHOLDER_EVENTS = [
  { id: 'p1', image_url: '', caption: 'Elegant Wedding Ceremony', created_at: '' },
  { id: 'p2', image_url: '', caption: 'Birthday Celebration', created_at: '' },
  { id: 'p3', image_url: '', caption: 'Corporate Award Night', created_at: '' },
  { id: 'p4', image_url: '', caption: 'Cultural Festival', created_at: '' },
  { id: 'p5', image_url: '', caption: 'School Annual Day', created_at: '' },
  { id: 'p6', image_url: '', caption: 'Private Celebration', created_at: '' },
]

const PLACEHOLDER_COLORS = [
  'linear-gradient(135deg, #1e0a4f, #4a2a8a)',
  'linear-gradient(135deg, #2d1b69, #d4af37)',
  'linear-gradient(135deg, #1a0840, #7c4fcd)',
  'linear-gradient(135deg, #4a2a8a, #1e0a4f)',
  'linear-gradient(135deg, #d4af37, #2d1b69)',
  'linear-gradient(135deg, #7c4fcd, #1a0840)',
]

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGallery = async () => {
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

  useEffect(() => {
    fetchGallery()
  }, [])

  // If user uploaded images, show uploaded photos first.
  // If fewer than 6, fill remaining slots with styled placeholders so the grid is visually full.
  const displayItems = images.length > 0
    ? (images.length < 6 ? [...images, ...PLACEHOLDER_EVENTS.slice(images.length)] : images)
    : PLACEHOLDER_EVENTS

  return (
    <section className="gallery section" id="gallery">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Moments</span>
          <h2 className="section-title">A Glimpse of<br />Celebrations Past</h2>
          <p className="section-subtitle">
            Every photograph tells a story. Here&apos;s a peek into some of the magical
            events I&apos;ve had the honor of hosting.
          </p>
        </div>

        <div className="gallery-grid">
          {displayItems.map((item, i) => (
            <div key={item.id || i} className={`gallery-item reveal visible reveal-delay-${(i % 4) + 1}`}>
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.caption || 'Event Photograph'}
                  loading="lazy"
                />
              ) : (
                <div
                  className="gallery-placeholder"
                  style={{ background: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length] }}
                >
                  <span className="gallery-placeholder-icon">
                    {['💍', '🎂', '🏆', '🎭', '🎓', '🥂'][i % 6]}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {item.caption}
                  </span>
                </div>
              )}
              <div className="gallery-caption">{item.caption || 'Event Photograph'}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
