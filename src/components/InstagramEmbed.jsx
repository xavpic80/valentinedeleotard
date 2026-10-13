import { useEffect, useRef } from "react"

let scriptPromise = null
function loadInstagramEmbedScript() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve) => {
    if (window.instgrm) {
      resolve(window.instgrm)
      return
    }
    const existing = document.getElementById("instagram-embed-js")
    if (existing) {
      existing.addEventListener("load", () => resolve(window.instgrm))
      return
    }
    const script = document.createElement("script")
    script.id = "instagram-embed-js"
    script.src = "https://www.instagram.com/embed.js"
    script.async = true
    script.onload = () => resolve(window.instgrm)
    document.body.appendChild(script)
  })
  return scriptPromise
}

export default function InstagramEmbed({ url }) {
  const ref = useRef(null)

  useEffect(() => {
    loadInstagramEmbedScript().then((instgrm) => {
      instgrm?.Embeds?.process()
    })
  }, [url])

  return (
    <div ref={ref} className="w-full overflow-hidden rounded-sm bg-ink/5">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ width: "100%", margin: 0 }}
      />
    </div>
  )
}
