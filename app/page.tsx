'use client'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function HomePage() {
  // Scroll reveal observer with dynamic mutation support
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    )

    const observeAll = () => {
      const revealEls = document.querySelectorAll('.reveal:not(.visible)')
      revealEls.forEach((el) => observer.observe(el))
    }

    observeAll()

    // Watch for dynamically loaded content in Gallery, Testimonials, Services
    const mutationObserver = new MutationObserver(() => {
      observeAll()
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
