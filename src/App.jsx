import { useEffect } from 'react'
import BlackHole from './components/BlackHole.jsx'
import ShipCursor from './components/ShipCursor.jsx'
import BeamButton from './components/BeamButton.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Work from './components/Work.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Credentials from './components/Credentials.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import VersionSwitcher from './shared/VersionSwitcher.jsx'
import useReveal from './hooks/useReveal.js'
import { site } from './data/content.js'

export default function App() {
  useReveal()

  useEffect(() => {
    document.title = site.name + ' - ' + site.role
  }, [])

  return (
    <>
      <BlackHole />
      <ShipCursor />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Skills />
        <Experience />
        <Credentials />
        <Contact />
      </main>
      <Footer />
      <BeamButton />
      <VersionSwitcher current="v3" />
    </>
  )
}