const items = [
  "HANDS ON CREATIVE DIRECTOR",
  "BRAND STRATEGY",
  "CAMPAIGN DIRECTION",
  "PACKAGING DESIGN",
  "SOCIAL MEDIA",
  "TEAM LEADERSHIP",
  "AI-DRIVEN PRODUCTION",
]

export default function Marquee() {
  const track = (
    <>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="px-4">{item}</span>
          <span>/</span>
        </span>
      ))}
    </>
  )

  return (
    <div className="w-full overflow-hidden bg-cream py-3">
      <div className="marquee-track flex whitespace-nowrap font-display font-bold text-sm md:text-base tracking-wide text-ink">
        {track}
        {track}
      </div>
    </div>
  )
}
