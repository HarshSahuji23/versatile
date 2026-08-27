'use client'
import { useEffect, useState } from 'react'
import { type Testimonial } from '@/lib/supabase'

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: '1', client_name: 'Priya & Rahul Sharma', event_type: 'Wedding Ceremony', review: 'Varsha was absolutely phenomenal! She kept our guests engaged and made our wedding day even more special. Her energy and grace were unmatched. We could not have asked for a better anchor!', rating: 5, created_at: '' },
  { id: '2', client_name: 'Neha Gupta', event_type: 'Birthday Party', review: 'My daughter\'s 18th birthday was a dream come true, thanks to Varsha! She knew exactly how to balance fun and sentiment. Every guest was smiling and dancing. Truly the best!', rating: 5, created_at: '' },
  { id: '3', client_name: 'TechCorp India Ltd.', event_type: 'Corporate Award Night', review: 'We hired Varsha for our annual awards ceremony and she delivered beyond expectations. Professional, charming, and perfectly in command of the audience. Highly recommended for corporate events.', rating: 5, created_at: '' },
  { id: '4', client_name: 'Anjali Mehta', event_type: 'Cultural Program', review: 'Varsha\'s command over language and her ability to connect with a diverse audience is remarkable. She made our cultural evening a grand success. Will definitely book again!', rating: 5, created_at: '' },
  { id: '5', client_name: 'St. Xavier\'s School', event_type: 'Annual Day Function', review: 'Energetic, witty, and perfectly paced — Varsha kept both students and parents thoroughly entertained. She was a joy to work with and made our Annual Day truly memorable.', rating: 5, created_at: '' },
]

const EVENT_TYPES = [
  'Wedding Ceremony', 'Birthday Party', 'Corporate Event',
  'Cultural Program', 'School / College Event', 'Private Celebration', 'Other'
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    client_name: '',
    event_type: 'Wedding Ceremony',
    rating: 5,
    review: ''
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setTestimonials(json.data)
      } else {
        setTestimonials(DEFAULT_TESTIMONIALS)
      }
    } catch (e) {
      console.warn('Error fetching testimonials:', e)
      setTestimonials(DEFAULT_TESTIMONIALS)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_name.trim() || !form.review.trim()) return

    setSubmitting(true)
    const payload = {
      client_name: form.client_name.trim(),
      event_type: form.event_type || 'Event',
      rating: form.rating,
      review: form.review.trim(),
    }

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setTestimonials((prev) => [json.data, ...prev])
      } else {
        // Optimistic append
        const optimistic: Testimonial = {
          id: 'rev_' + Date.now(),
          ...payload,
          created_at: new Date().toISOString(),
        }
        setTestimonials((prev) => [optimistic, ...prev])
      }
      setSubmitted(true)
    } catch (err) {
      console.error('Review submit failed:', err)
      const optimistic: Testimonial = {
        id: 'rev_' + Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
      }
      setTestimonials((prev) => [optimistic, ...prev])
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    if (submitted) {
      setForm({ client_name: '', event_type: 'Wedding Ceremony', rating: 5, review: '' })
      setSubmitted(false)
    }
  }

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-label" style={{ color: 'rgba(212,175,55,0.8)' }}>Client Stories</span>
          <h2 className="section-title" style={{ color: 'white' }}>
            What My Clients<br />Say About Me
          </h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.65)', margin: '0 auto' }}>
            Real words from real people who trusted me with their most cherished moments.
          </p>

          <div className="review-header-action">
            <button
              id="leave-review-btn"
              className="btn-review-trigger"
              onClick={() => {
                setSubmitted(false)
                setShowModal(true)
              }}
            >
              ★ Leave a Review / Share Your Experience
            </button>
          </div>
        </div>

        <div className="testimonials-track">
          {testimonials.map((t, i) => (
            <div key={t.id || i} className={`testimonial-card reveal reveal-delay-${(i % 4) + 1}`}>
              <div className="testimonial-stars">
                {'★'.repeat(t.rating)}{'☆'.repeat(Math.max(0, 5 - t.rating))}
              </div>
              <p className="testimonial-review">&ldquo;{t.review}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {(t.client_name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="testimonial-name">{t.client_name}</div>
                  <div className="testimonial-event">{t.event_type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="review-modal-overlay" onClick={handleCloseModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Share Your Experience</h3>
              <p>Hosted an event with Varsha? We&apos;d love to hear your feedback!</p>
              <button className="review-modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="review-modal-body">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--color-royal)', marginBottom: 8 }}>
                    Thank You For Your Review!
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                    Your feedback has been submitted and added to the testimonials section. Your kind words mean the world to Varsha!
                  </p>
                  <button className="btn btn-gold" onClick={handleCloseModal} style={{ margin: '0 auto' }}>
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label htmlFor="review-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-royal)', marginBottom: 6 }}>
                      Your Name / Couple / Organization *
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      placeholder="e.g. Rahul & Sneha"
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(212,175,55,0.3)' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label htmlFor="review-event" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-royal)', marginBottom: 6 }}>
                      Event Type *
                    </label>
                    <select
                      id="review-event"
                      value={form.event_type}
                      onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(212,175,55,0.3)' }}
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-royal)', marginBottom: 6 }}>
                      Your Rating *
                    </label>
                    <div className="star-rating-select">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hoverRating || form.rating)
                        return (
                          <button
                            key={star}
                            type="button"
                            className="star-btn"
                            style={{ color: active ? '#d4af37' : '#d1d5db' }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setForm({ ...form, rating: star })}
                          >
                            ★
                          </button>
                        )
                      })}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gold)', marginLeft: 8 }}>
                        {hoverRating || form.rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label htmlFor="review-text" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-royal)', marginBottom: 6 }}>
                      Your Review / Feedback *
                    </label>
                    <textarea
                      id="review-text"
                      placeholder="Share what made your event special with Varsha as your anchor..."
                      value={form.review}
                      onChange={(e) => setForm({ ...form, review: e.target.value })}
                      required
                      rows={4}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid rgba(212,175,55,0.3)', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={handleCloseModal}
                      style={{ flex: 1, background: '#f3f4f6', color: '#4b5563', justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-purple"
                      disabled={submitting}
                      style={{ flex: 1.5, justifyContent: 'center' }}
                    >
                      {submitting ? 'Submitting...' : '✦ Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
