export default function SectionHead({ id, cmd, title }) {
  return (
    <div className="section-head reveal" id={id}>
      <span className="prompt">$ {cmd}</span>
      <h2>{title}</h2>
      <span className="rule" aria-hidden="true" />
    </div>
  )
}
