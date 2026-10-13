import { useParams, Link, Navigate } from "react-router-dom"
import { caseStudies, getCaseStudy } from "../data/caseStudies"
import HeroCarousel from "../components/HeroCarousel"

function renderWithBold(text, boldClassName = "font-bold text-ink") {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={boldClassName}>
        {chunk}
      </strong>
    ) : (
      chunk
    )
  )
}

export default function CaseStudy() {
  const { slug } = useParams()
  const cs = getCaseStudy(slug)

  if (!cs || cs.draft) return <Navigate to="/" replace />

  const related = caseStudies.filter((c) => c.slug !== slug && !c.draft)

  return (
    <div>
      <div className="bg-pantone-332 text-ink px-6 md:px-10 py-3">
        <p className="font-display font-bold uppercase tracking-[0.2em] text-xs md:text-sm text-center">
          The Brief
        </p>
      </div>

      <section className="grid md:grid-cols-2 gap-0">
        <div className={`bg-sand ${cs.heroAspect || "aspect-[4/3]"} md:aspect-auto md:h-full`}>
          {cs.heroCarousel ? (
            <HeroCarousel images={cs.heroCarousel} alt={cs.title} />
          ) : (
            cs.heroImage && (
              <img src={cs.heroImage} alt={cs.title} className="w-full h-full object-cover" />
            )
          )}
        </div>
        <div
          className="flex flex-col justify-center px-6 md:px-14 py-12 md:py-20"
          style={cs.heroBg ? { backgroundColor: cs.heroBg, color: cs.heroTextColor } : undefined}
        >
          <p
            className={`font-display font-bold uppercase text-xs tracking-widest mb-2 ${
              cs.heroBg ? "opacity-70" : "text-ink"
            }`}
          >
            {cs.brand} &middot; {cs.year}
          </p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tightest leading-[1.02] mb-6">
            {cs.title}
          </h1>
          <p
            className={`leading-relaxed mb-6 whitespace-pre-line ${cs.heroBg ? "opacity-90" : "text-ink/80"}`}
          >
            {renderWithBold(cs.brief, cs.heroBg ? "font-bold" : "font-bold text-ink")}
          </p>
          {cs.role.length > 0 && (
            <p
              className={`font-display font-bold uppercase text-xs tracking-widest mb-2 ${
                cs.heroBg ? "opacity-60" : "text-ink/50"
              }`}
            >
              {cs.role.join(", ")}
            </p>
          )}
          {cs.featured && (
            <p
              className={`text-xs uppercase tracking-widest font-display font-bold ${
                cs.heroBg ? "opacity-50" : "text-ink/40"
              }`}
            >
              {cs.featured}
            </p>
          )}
        </div>
      </section>

      {cs.results && (
        <section
          className={`px-6 md:px-10 py-16 ${cs.resultsBg ? "" : "bg-terracotta text-ink"}`}
          style={cs.resultsBg ? { backgroundColor: cs.resultsBg, color: cs.resultsTextColor } : undefined}
        >
          <p className="font-display font-bold uppercase tracking-[0.2em] text-xs md:text-sm mb-6">
            {cs.results.label || "The Results"}
          </p>
          {cs.results.items ? (
            <div className={`grid gap-10 items-start ${cs.results.team ? "md:grid-cols-[1.3fr_1fr]" : ""}`}>
              <div className="flex flex-col gap-4 md:gap-6">
                {cs.results.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className={`text-2xl md:text-3xl leading-none mt-1 md:mt-2 ${cs.resultsBg ? "" : "text-ink"}`}
                      style={cs.resultsBg ? { color: cs.resultsTextColor } : undefined}
                    >
                      ✦
                    </span>
                    <span className="font-display font-extrabold text-2xl md:text-5xl tracking-tightest leading-tight">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              {cs.results.team && (
                <div
                  className={`rounded-sm p-8 ${cs.resultsTeamBg ? "" : "bg-ink text-sage"}`}
                  style={cs.resultsTeamBg ? { backgroundColor: cs.resultsTeamBg, color: cs.resultsTeamTextColor } : undefined}
                >
                  <p className="font-display font-bold uppercase tracking-[0.2em] text-xs mb-6">
                    The Team
                  </p>
                  <div className="flex flex-col gap-4">
                    {cs.results.team.map((t, i) => (
                      <div key={i}>
                        <p className="font-display font-bold uppercase text-xs tracking-widest opacity-70 mb-1">
                          {t.role}
                        </p>
                        <p className="font-display font-semibold leading-snug">{t.names}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-10">
              {cs.results.stat && (
                <span className="font-display font-black text-6xl md:text-8xl tracking-tightest">
                  {cs.results.stat}
                </span>
              )}
              <div className="max-w-md pb-2">
                {cs.results.statLabel && (
                  <p className="font-display font-bold uppercase text-sm tracking-wide mb-2">
                    {cs.results.statLabel}
                  </p>
                )}
                <p className="text-ink/85 leading-relaxed">{cs.results.description}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {cs.quote && (
        <section className="px-6 md:px-10 py-16 border-t border-ink/10 bg-sand">
          <blockquote className="max-w-3xl mx-auto text-center">
            <p className="font-display font-bold text-2xl md:text-4xl italic tracking-tightest leading-snug mb-6">
              &ldquo;{cs.quote.text}&rdquo;
            </p>
            <cite className="not-italic font-display font-bold uppercase text-xs tracking-widest text-ink/50">
              — {cs.quote.attribution}
            </cite>
          </blockquote>
        </section>
      )}

      {cs.sections.map((section, i) => {
        const reverse = i % 2 === 1
        const video =
          (section.image && (
            <img src={section.image} alt={section.headline} className="w-full rounded-sm" />
          )) ||
          (section.videoFile && (
            <div className="aspect-video w-full rounded-sm overflow-hidden bg-ink">
              <video
                className="w-full h-full"
                src={section.videoFile}
                controls
                playsInline
              />
            </div>
          )) ||
          (section.video && (
            <div className="aspect-video w-full rounded-sm overflow-hidden bg-ink">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${section.video}`}
                title={section.headline}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )) ||
          (section.videoLink && (
            <a
              href={`https://www.youtube.com/watch?v=${section.videoLink}`}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-video w-full rounded-sm overflow-hidden bg-ink"
            >
              <img
                src={`https://img.youtube.com/vi/${section.videoLink}/hqdefault.jpg`}
                alt={section.headline}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 rounded-full bg-cream/90 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-ink ml-1" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
              <span className="absolute bottom-3 right-3 text-cream text-xs font-display font-bold uppercase tracking-widest bg-ink/60 px-2 py-1 rounded-sm">
                Watch on YouTube
              </span>
            </a>
          ))
        const copy = section.headline && (
          <div
            className={section.copyBg ? "h-full flex flex-col justify-center p-8 rounded-sm" : undefined}
            style={section.copyBg ? { backgroundColor: section.copyBg, color: section.copyTextColor } : undefined}
          >
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tightest mb-6">
              {section.headline}
            </h2>
            <p
              className={`leading-relaxed whitespace-pre-line ${section.copyBg ? "opacity-90" : "text-ink/80"}`}
            >
              {renderWithBold(section.body, section.copyBg ? "font-bold" : "font-bold text-ink")}
            </p>
          </div>
        )

        const textBlock = section.videoFile ? (
          <div>
            <div className="mb-10">{video}</div>
            {copy}
          </div>
        ) : (
          <div
            className={`grid gap-10 ${section.copyBg ? "items-stretch" : "items-start"} ${
              video ? (reverse ? "md:grid-cols-[1.4fr_1fr]" : "md:grid-cols-[1fr_1.4fr]") : ""
            }`}
          >
            {video ? (
              reverse ? (
                <>
                  {video}
                  {copy}
                </>
              ) : (
                <>
                  {copy}
                  {video}
                </>
              )
            ) : (
              copy
            )}
          </div>
        )

        const mediaBlock = (section.imageColumns || section.images) && (
          <>
            {section.imageColumns && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {section.imageColumns.map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-4">
                    {col.map((item, j) =>
                      typeof item === "string" ? (
                        <img
                          key={j}
                          src={item}
                          alt={`${section.headline} visual ${ci}-${j}`}
                          className="w-full rounded-sm"
                        />
                      ) : (
                        <div
                          key={j}
                          className={`rounded-sm overflow-hidden ${item.aspect || "aspect-[3/4]"}`}
                        >
                          <HeroCarousel images={item.images} alt={item.alt || section.headline} />
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.images &&
              (section.imageGrid ? (
                <div
                  className={`columns-1 gap-4 ${
                    section.imageCols === 3 ? "sm:columns-3" : "sm:columns-2"
                  }`}
                >
                  {section.images.map((img, j) =>
                    typeof img === "string" ? (
                      <img
                        key={j}
                        src={img}
                        alt={`${section.headline} visual ${j + 1}`}
                        className="w-full rounded-sm mb-4 break-inside-avoid"
                      />
                    ) : (
                      <div
                        key={j}
                        className="rounded-sm mb-4 break-inside-avoid p-6"
                        style={{ backgroundColor: img.bg, color: img.color }}
                      >
                        {img.heading && (
                          <p className="font-display font-extrabold text-xl tracking-tightest mb-3">
                            {img.heading}
                          </p>
                        )}
                        <p className="leading-relaxed whitespace-pre-line">
                          {renderWithBold(img.body, "font-bold")}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {section.images.map((img, j) => (
                    <img
                      key={j}
                      src={img}
                      alt={`${section.headline} visual ${j + 1}`}
                      className="w-full rounded-sm object-cover"
                    />
                  ))}
                </div>
              ))}
          </>
        )

        return (
          <section
            key={i}
            className="px-6 md:px-10 py-16 border-t border-ink/10"
            style={section.bgColor ? { backgroundColor: section.bgColor } : undefined}
          >
            {section.textBelow ? (
              <>
                {mediaBlock}
                {textBlock && <div className="mt-10">{textBlock}</div>}
              </>
            ) : (
              <>
                {textBlock}
                {mediaBlock && <div className="mt-10">{mediaBlock}</div>}
              </>
            )}
          </section>
        )
      })}

      {cs.behindTheBox && (
        <section className="px-6 md:px-10 py-16 border-t border-ink/10">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tightest mb-8">
            Behind the Box.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cs.behindTheBox.map((src) => (
              <div key={src} className="aspect-[9/16] w-full rounded-sm overflow-hidden bg-ink">
                <video
                  className="w-full h-full object-cover"
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {cs.credits && (
        <p className="px-6 md:px-10 py-6 text-xs uppercase tracking-widest text-ink/40 font-display font-bold border-t border-ink/10">
          {cs.credits}
        </p>
      )}

      {related.length > 0 && (
        <section className="py-16 border-t border-ink/10">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-ink/50 mb-8 px-6 md:px-10">
            More Like This
          </h2>
          <div className="w-full overflow-hidden">
            <div className="related-track flex gap-4 w-max">
              {[...related, ...related].map((r, i) => {
                const preview = r.heroImage || r.heroCarousel?.[0]
                return (
                  <Link
                    key={`${r.slug}-${i}`}
                    to={`/work/${r.slug}`}
                    className="group block shrink-0 w-[220px] sm:w-[260px] overflow-hidden rounded-sm"
                    style={{ backgroundColor: r.tileColor, color: r.tileTextColor }}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      {preview && (
                        <img
                          src={preview}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-display font-bold uppercase text-[10px] tracking-widest opacity-70 mb-1">
                        {r.brand}
                      </p>
                      <h3 className="font-display font-extrabold text-base tracking-tightest leading-snug">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
