'use client'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [year, setYear] = useState(2025)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <img src="/logo.jpg" alt="Varsha's Versatile Logo" className="footer-logo-img" />
            <div className="footer-brand-name">Varsha&apos;s Versatile</div>
            <p className="footer-brand-desc">
              Professional anchor Varsha Jain — bringing warmth, energy, and elegance
              to weddings, birthdays, corporate events, and every occasion in between.
            </p>
            <div className="footer-socials">
              {['📸', '▶️', '💼'].map((icon, i) => (
                <a key={i} href="#" className="social-link" aria-label={`Social link ${i + 1}`}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-links">
              {[
                { label: 'Home', href: '#home' },
                { label: 'About', href: '#about' },
                { label: 'Services', href: '#services' },
                { label: 'Gallery', href: '#gallery' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'Contact', href: '#contact' },
              ].map((l) => (
                <li key={l.label}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Services</div>
            <ul className="footer-links">
              {[
                'Wedding Ceremonies', 'Birthday Parties', 'Corporate Events',
                'Cultural Programs', 'School Events', 'Private Celebrations'
              ].map((s) => (
                <li key={s}><a href="#services">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Varsha&apos;s Versatile. All rights reserved. Made with ❤️ for Varsha Jain.
          </p>
          <a href="/admin" className="footer-admin-link">Admin Panel</a>
        </div>
      </div>
    </footer>
  )
}
