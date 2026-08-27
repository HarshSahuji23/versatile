'use client'
import { useState, useEffect } from 'react'

const EVENT_TYPES = [
  'Wedding Ceremony', 'Birthday Party', 'Corporate Event',
  'Cultural Program', 'School / College Event', 'Private Celebration', 'Other'
]

const WHATSAPP_NUMBER = '918308562947'

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', event_type: '', event_date: '', message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [todayMin, setTodayMin] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setTodayMin(new Date().toISOString().split('T')[0])
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const buildWhatsAppUrl = (data: typeof form) => {
    const formattedDate = data.event_date ? new Date(data.event_date).toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    }) : 'Date to be decided'

    const message =
      `✨ *New Booking Inquiry for Anchor Varsha Jain* ✨\n\n` +
      `👤 *Client Name:* ${data.name.trim()}\n` +
      `📞 *Phone:* ${data.phone.trim() || 'Not provided'}\n` +
      `✉️ *Email:* ${data.email.trim()}\n` +
      `🎉 *Event Type:* ${data.event_type || 'Event'}\n` +
      `📅 *Event Date:* ${formattedDate}\n` +
      `📝 *Event Details:* ${data.message.trim() || 'No additional details'}\n\n` +
      `Looking forward to connecting!`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const waUrl = buildWhatsAppUrl(form)
    setWhatsappUrl(waUrl)

    try {
      const bookingData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        event_type: form.event_type || null,
        event_date: form.event_date || null,
        message: form.message.trim() || null,
      }

      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      // Open WhatsApp in a new tab
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank')
      }

      setSuccess(true)
    } catch (err: unknown) {
      console.error('Submission error:', err)
      // Even if API route has an issue, allow opening WhatsApp directly
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank')
      }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Let&apos;s Connect</span>
          <h2 className="section-title">Book Your Event<br />With Varsha</h2>
          <p className="section-subtitle">
            Ready to make your event extraordinary? Fill out the form below
            or message directly on WhatsApp to check availability!
          </p>
        </div>

        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info reveal visible">
            <div className="contact-info-item">
              <div className="contact-info-icon">📞</div>
              <div>
                <div className="contact-info-label">Phone & WhatsApp</div>
                <div className="contact-info-value">+91 83085 62947</div>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">✉️</div>
              <div>
                <div className="contact-info-label">Email</div>
                <div className="contact-info-value">varsha@varshasversatile.com</div>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">📍</div>
              <div>
                <div className="contact-info-label">Location</div>
                <div className="contact-info-value">Available Pan-India</div>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">⏰</div>
              <div>
                <div className="contact-info-label">Availability</div>
                <div className="contact-info-value">Mon–Sun, 9am–9pm IST</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Varsha, I would like to inquire about booking you for an event.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ width: '100%' }}
              >
                💬 Chat on WhatsApp Directly
              </a>
            </div>

            {/* <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                Follow on social media
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {['📸 Instagram', '▶️ YouTube', '💼 LinkedIn'].map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: '0.8rem', padding: '6px 14px', borderRadius: 20,
                      background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
                      color: 'var(--color-royal-mid)', fontWeight: 500, cursor: 'pointer'
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div> */}
          </div>

          {/* Form */}
          <div className="booking-form reveal visible reveal-delay-2">
            {success ? (
              <div className="form-success">
                <span className="form-success-icon">🎉</span>
                <h3>Booking Request Sent!</h3>
                <p style={{ marginBottom: 16 }}>
                  Thank you, <strong>{form.name}</strong>! Your booking inquiry has been recorded and WhatsApp has been opened with your event details.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360, margin: '0 auto' }}>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp"
                    >
                      💬 Send / Re-open in WhatsApp
                    </a>
                  )}

                  <button
                    className="btn btn-gold"
                    onClick={() => {
                      setSuccess(false)
                      setForm({ name: '', email: '', phone: '', event_type: '', event_date: '', message: '' })
                      setWhatsappUrl('')
                    }}
                  >
                    Send Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="admin-error">{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="booking-name">Full Name *</label>
                    <input id="booking-name" name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="booking-phone">Phone / WhatsApp Number *</label>
                    <input id="booking-phone" name="phone" type="tel" placeholder="+91 00000 00000" value={form.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="booking-email">Email Address *</label>
                  <input id="booking-email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="booking-event-type">Event Type *</label>
                    <select id="booking-event-type" name="event_type" value={form.event_type} onChange={handleChange} required>
                      <option value="">Select event type</option>
                      {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="booking-date">Event Date</label>
                    <input id="booking-date" name="event_date" type="date" value={form.event_date} onChange={handleChange} min={todayMin} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="booking-message">Additional Details</label>
                  <textarea
                    id="booking-message" name="message"
                    placeholder="Tell me about your event — venue, expected guests, theme, special requirements..."
                    value={form.message} onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  id="booking-submit-btn"
                  className="btn btn-gold"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading ? 'Sending Request...' : '✦ Send Booking Request & Connect on WhatsApp'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
