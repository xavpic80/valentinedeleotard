import { useEffect, useRef } from "react"

let apiPromise = null
function loadYouTubeAPI() {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }
    const existing = document.getElementById("youtube-iframe-api")
    if (!existing) {
      const tag = document.createElement("script")
      tag.id = "youtube-iframe-api"
      tag.src = "https://www.youtube.com/iframe_api"
      document.body.appendChild(tag)
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT)
    }
  })
  return apiPromise
}

export default function YoutubeLoopTile({ id, start = 0, end, title }) {
  const mountRef = useRef(null)
  const playerRef = useRef(null)
  const maskRef = useRef(null)

  useEffect(() => {
    let destroyed = false
    let watchInterval = null
    let revealTimeout = null

    loadYouTubeAPI().then((YT) => {
      if (destroyed || !mountRef.current) return
      playerRef.current = new YT.Player(mountRef.current, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            e.target.mute()
            e.target.playVideo()
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING && !watchInterval) {
              watchInterval = setInterval(() => {
                const p = playerRef.current
                if (p && typeof p.getCurrentTime === "function" && p.getCurrentTime() >= end) {
                  // YouTube briefly flashes its own play/pause glyph right as it
                  // buffers around a seek, so mask the tile for that instant so it
                  // never reaches the screen, then fade back in once playback resumes.
                  if (maskRef.current) maskRef.current.style.opacity = "1"
                  p.seekTo(start, true)
                  clearTimeout(revealTimeout)
                  revealTimeout = setTimeout(() => {
                    if (maskRef.current) maskRef.current.style.opacity = "0"
                  }, 450)
                }
              }, 250)
            }
          },
        },
      })
    })

    return () => {
      destroyed = true
      if (watchInterval) clearInterval(watchInterval)
      if (revealTimeout) clearTimeout(revealTimeout)
      if (playerRef.current?.destroy) playerRef.current.destroy()
    }
  }, [id, start, end])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-label={title}>
      <div
        ref={mountRef}
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: "177.78vh",
          height: "100%",
          minWidth: "100%",
          minHeight: "56.25vw",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        ref={maskRef}
        className="absolute inset-0 bg-ink transition-opacity duration-200"
        style={{ opacity: 0 }}
      />
    </div>
  )
}
