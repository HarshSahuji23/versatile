'use client'
import { useState } from 'react'

const highlights = [
  'Wedding Ceremonies', 'Birthday Parties',
  'Corporate Events', 'Cultural Programs',
  'Award Functions', 'School Events',
]

export default function About() {
  const [imgError, setImgError] = useState(false)

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="about-grid">
          {/* Image */}
          <div className="about-image-wrapper reveal">
            <div className="about-image-frame">
              {!imgError ? (
                <img
                  src="/varsha.jpg"
                  alt="Varsha Jain — Professional Anchor"
                  onError={() => setImgError(true)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                />
              ) : (
                <div className="about-image-placeholder">
                  <span className="mic-icon">🎤</span>
                  <p>Varsha Jain</p>
                </div>
              )}
            </div>
            <div className="about-badge">
              <div className="about-badge-num">2+</div>
              <div className="about-badge-text">Years of<br />Excellence</div>
            </div>
          </div>

          {/* Content */}
          <div className="about-content reveal reveal-delay-2">
            <span className="section-label">About Me</span>
            <h2 className="section-title">
              The Voice Behind<br />Your Memories
            </h2>
            <p className="about-description">
              Hello! I&apos;m <strong>Varsha Jain</strong>, a passionate and versatile professional anchor
              dedicated to making every event an extraordinary experience. With over 2+ years of
              anchoring expertise, I blend warmth, wit, and professionalism to create moments
              that resonate long after the event is over.
            </p>
            <p className="about-description">
              Whether it&apos;s the joyful laughter of a birthday celebration, the sacred elegance
              of a wedding, or the sharp energy of a corporate function — I tailor my style
              to perfectly match your vision and audience.
            </p>

            <div className="about-highlights">
              {highlights.map((h) => (
                <div key={h} className="highlight-item">
                  <div className="highlight-dot" />
                  {h}
                </div>
              ))}
            </div>

            <button
              className="btn btn-purple"
              id="about-contact-btn"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ marginTop: 8, alignSelf: 'flex-start' }}
            >
              Get in Touch →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
