import { site } from '../data/content.js'

export default function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <span>
          <span className="ok">●</span> signal acquired — {site.name}
        </span>
        <span>portfolio v4 · "The Signal" · terminal edition</span>
        <span>
          v1–v3 live at{' '}
          <a href="https://quangtinator.github.io/cv/" target="_blank" rel="noreferrer">
            quangtinator.github.io/cv
          </a>
        </span>
      </div>
    </footer>
  )
}
