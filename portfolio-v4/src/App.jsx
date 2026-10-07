import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Work from './components/Work.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Credentials from './components/Credentials.jsx'
import SshSection from './components/SshSection.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import useReveal from './hooks/useReveal.js'
import { site } from './data/content.js'

export default function App() {
  useReveal()

  useEffect(() => {
    document.title = site.name + ' — The Signal'
  }, [])

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Skills />
        <Experience />
        <Credentials />
        <SshSection />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
