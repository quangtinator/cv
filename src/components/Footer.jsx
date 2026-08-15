import { site } from '../data/content.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {site.name} · Crafted among the stars
        </p>
        <p className="footer-note">Live long and prosper 🖖</p>
      </div>
    </footer>
  )
}
