'use client'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home') }} className="navbar-logo">
              <img src="/logo.jpg" alt="Varsha's Versatile Logo" className="navbar-logo-img" />
              <div>Varsha&apos;s <span>Versatile</span></div>
            </a>

            <ul className="navbar-links">
              {['about', 'services', 'gallery', 'testimonials', 'contact'].map((s) => (
                <li key={s}>
                  <a
                    href={`#${s}`}
                    onClick={(e) => { e.preventDefault(); scrollTo(s) }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {s}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); scrollTo('contact') }}
                  className="btn btn-gold navbar-cta"
                >
                  Book Now
                </a>
              </li>
            </ul>

            <button
              className="navbar-toggle"
              id="nav-toggle"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(30,10,79,0.97)',
          zIndex: 999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 32,
          animation: 'fadeIn 0.2s ease'
        }}>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'absolute', top: 24, right: 24, fontSize: '1.8rem',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', background: 'none', border: 'none'
            }}
          >
            ✕
          </button>
          {['about', 'services', 'gallery', 'testimonials', 'contact'].map((s) => (
            <a
              key={s}
              href={`#${s}`}
              onClick={(e) => { e.preventDefault(); scrollTo(s) }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem', color: 'white',
                textTransform: 'capitalize', cursor: 'pointer'
              }}
            >
              {s}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollTo('contact') }}
            className="btn btn-gold"
          >
            Book Now ✦
          </a>
        </div>
      )}
    </>
  )
}
