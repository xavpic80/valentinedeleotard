import { useEffect, useState } from "react"

const slides = [
  { type: "video", src: "/video/hero-loop.mp4" },
  { type: "video", src: "/video/bts-organic-ocean.mov" },
  { type: "image", src: "/1_Macaron_2016_Mood.jpg" },
  { type: "video", src: "/video/bts-casa-dei-ravioli.mov" },
  { type: "image", src: "/projects/jonny/Jonny_Cover.jpg" },
  { type: "video", src: "/video/bts-8-acres.mov" },
  { type: "image", src: "/private-label/hero-sweets.jpg" },
  { type: "image", src: "/beat-the-founder/spark-excited.jpg" },
]

const SLIDE_DURATION = 3800

export default function HeroReel() {
  const [index, setIndex] = useState(0)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(t)
  }, [])

  const slide = slides[index]

  return (
    <div className="relative w-full h-full overflow-hidden bg-ink">
      {slide.type === "video" ? (
        <video
          key={slide.src}
          className="hero-fade absolute inset-0 w-full h-full object-cover"
          src={slide.src}
          autoPlay
          muted={muted}
          loop
          playsInline
        />
      ) : (
        <img
          key={slide.src}
          src={slide.src}
          alt=""
          className="hero-fade absolute inset-0 w-full h-full object-cover"
        />
      )}

      {slide.type === "video" && (
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-ink/50 hover:bg-ink/70 transition-colors rounded-full pl-2.5 pr-3 py-1.5 text-cream backdrop-blur-sm"
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
          <span className="font-display font-bold uppercase text-[10px] tracking-widest">
            {muted ? "Sound on" : "Mute"}
          </span>
        </button>
      )}

      <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-cream" : "w-1.5 bg-cream/40"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
