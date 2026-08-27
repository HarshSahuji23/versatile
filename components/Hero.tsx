'use client'

// Pre-computed particle positions to avoid Math.random() at prerender time
const PARTICLES = [
  { id: 0, left: '8%', delay: '0s', duration: '9s', size: '3px' },
  { id: 1, left: '18%', delay: '1.2s', duration: '11s', size: '2px' },
  { id: 2, left: '27%', delay: '2.5s', duration: '8s', size: '4px' },
  { id: 3, left: '35%', delay: '0.8s', duration: '13s', size: '2px' },
  { id: 4, left: '44%', delay: '3.1s', duration: '10s', size: '3px' },
  { id: 5, left: '52%', delay: '1.7s', duration: '7s', size: '2px' },
  { id: 6, left: '61%', delay: '4.2s', duration: '12s', size: '4px' },
  { id: 7, left: '69%', delay: '0.5s', duration: '9s', size: '3px' },
  { id: 8, left: '76%', delay: '2.8s', duration: '11s', size: '2px' },
  { id: 9, left: '83%', delay: '1.4s', duration: '8s', size: '3px' },
  { id: 10, left: '90%', delay: '3.6s', duration: '10s', size: '2px' },
  { id: 11, left: '12%', delay: '5s', duration: '14s', size: '4px' },
  { id: 12, left: '40%', delay: '6.1s', duration: '9s', size: '3px' },
  { id: 13, left: '57%', delay: '2.2s', duration: '12s', size: '2px' },
  { id: 14, left: '72%', delay: '4.8s', duration: '8s', size: '3px' },
  { id: 15, left: '88%', delay: '0.3s', duration: '11s', size: '4px' },
  { id: 16, left: '22%', delay: '3.9s', duration: '9s', size: '2px' },
  { id: 17, left: '65%', delay: '1.1s', duration: '13s', size: '3px' },
]

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="home">
      <div className="hero-particles">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">Professional Event Anchor</div>

          <div className="hero-name">Varsha Jain</div>

          <h1 className="hero-title">
            Crafting <span className="accent">Magical</span>
            <br />Moments
          </h1>

          <p className="hero-tagline">
            From intimate birthday celebrations to grand weddings — I bring energy,
            elegance, and unforgettable memories to every occasion.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-gold"
              id="hero-book-btn"
              onClick={() => scrollTo('contact')}
            >
              ✦ Book Your Event
            </button>
            <button
              className="btn btn-outline"
              id="hero-gallery-btn"
              onClick={() => scrollTo('gallery')}
            >
              View Gallery
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">50+</div>
              <div className="hero-stat-label">Events Hosted</div>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">2+</div>
              <div className="hero-stat-label">Years Experience</div>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">100%</div>
              <div className="hero-stat-label">Happy Clients</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll" onClick={() => scrollTo('about')} style={{ cursor: 'pointer' }}>
        <div className="scroll-dot" />
        <div className="scroll-dot" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
