'use client'
import { useEffect, useState } from 'react'
import { type Service } from '@/lib/supabase'

const DEFAULT_SERVICES: Service[] = [
  { id: '1', title: 'Wedding Ceremonies', icon: '💍', description: 'Making your special day unforgettable with the perfect blend of tradition, emotion, and elegance.', order_index: 0, created_at: '' },
  { id: '2', title: 'Birthday Parties', icon: '🎂', description: 'From milestone birthdays to surprise parties — energetic, fun, and memorable hosting for all ages.', order_index: 1, created_at: '' },
  { id: '3', title: 'Corporate Events', icon: '🏆', description: 'Professional and polished anchoring for conferences, award nights, product launches, and team events.', order_index: 2, created_at: '' },
  { id: '4', title: 'Cultural Programs', icon: '🎭', description: 'Celebrating heritage and art with soulful and engaging commentary for cultural festivals and shows.', order_index: 3, created_at: '' },
  { id: '5', title: 'School & College Events', icon: '🎓', description: 'Energizing annual days, farewell parties, and competitions with youthful spirit and enthusiasm.', order_index: 4, created_at: '' },
  { id: '6', title: 'Private Celebrations', icon: '🥂', description: 'Anniversaries, baby showers, kitty parties, and more — personal touch for your intimate gatherings.', order_index: 5, created_at: '' },
]

export default function Services() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES)

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services')
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setServices(json.data)
        }
      } catch (e) {
        console.warn('Error fetching services:', e)
      }
    }
    fetchServices()
  }, [])

  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-label">What I Offer</span>
          <h2 className="section-title">Services Tailored<br />For Every Occasion</h2>
          <p className="section-subtitle">
            No two events are the same — and neither is my approach. I craft each
            performance uniquely to match your vision and vibe.
          </p>
        </div>

        <div className="services-grid">
          {services.map((s, i) => (
            <div key={s.id} className={`service-card reveal reveal-delay-${(i % 4) + 1}`}>
              <span className="service-icon">{s.icon || '✨'}</span>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-description">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
