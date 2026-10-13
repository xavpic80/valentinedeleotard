import { useEffect, useState } from "react"

const BEAT_MS = 1500

export default function HeroCarousel({ images, alt }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, BEAT_MS)
    return () => clearInterval(t)
  }, [images.length])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  )
}
