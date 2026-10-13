import { useEffect, useRef, useState } from "react"

// Color-grouped so the cycle drifts: teal -> green -> blue -> purple -> pink -> warm -> back to teal
const images = [
  "/kaleido2/00.jpg",
  "/kaleido2/01.jpg",
  "/kaleido2/02.jpg",
  "/kaleido2/03.jpg",
  "/kaleido2/04.jpg",
  "/kaleido2/05.jpg",
  "/kaleido2/06.jpg",
  "/kaleido2/07.jpg",
  "/kaleido2/08.gif",
  "/kaleido2/09.jpg",
  "/kaleido2/10.gif",
  "/kaleido2/11.jpg",
  "/kaleido2/12.jpg",
]

const BEAT_MS = 1000
const TRANSITION_MS = 450

export default function KaleidoscopeReel() {
  const [index, setIndex] = useState(0)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    images.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, BEAT_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-ink">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          style={{ transitionDuration: `${TRANSITION_MS}ms` }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-[opacity,filter] ease-in-out ${
            i === index ? "opacity-100 blur-0" : "opacity-0 blur-xl"
          }`}
        />
      ))}
    </div>
  )
}
