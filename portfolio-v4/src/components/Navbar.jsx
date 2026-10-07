import { navLinks } from '../data/content.js'

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="#top" className="nav-logo">
          ~/portfolio <span className="cursor">▌</span>
        </a>
        <div className="nav-links">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}>
              <span className="cmd">$</span> {l.label.toLowerCase()}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
