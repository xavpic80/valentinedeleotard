import { Link } from "react-router-dom"
import { caseStudies } from "../data/caseStudies"
import { projects } from "../data/projects"
import KaleidoscopeReel from "../components/KaleidoscopeReel"
import Marquee from "../components/Marquee"
import YoutubeLoopTile from "../components/YoutubeLoopTile"

export default function Home() {
  return (
    <div>
      <section className="relative w-full aspect-[21/9] max-h-[640px]">
        <KaleidoscopeReel />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent pointer-events-none" />
      </section>

      <section className="pt-16 pb-20 bg-sage text-ink">
        <div className="px-6 md:px-10">
          <p className="font-display uppercase tracking-widest text-xs md:text-sm mb-4 opacity-80">
            The Low Down
          </p>
          <h1 className="font-display font-extrabold leading-[0.95] text-[13vw] md:text-[6.5vw] tracking-tightest">
            I am a{" "}
            <span className="italic font-semibold">Hands-on Creative Director</span>
            <br />
            working in CPG, retail &amp; challenger brands.
          </h1>
        </div>
        <div className="mt-8">
          <Marquee />
        </div>
      </section>

      <section className="px-6 md:px-10 py-16">
        <h2 className="font-display font-bold text-xs uppercase tracking-widest text-ink/50 mb-8">
          Selected Work
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies
            .filter((c) => !c.draft)
            .map((cs) => (
              <Link
                key={cs.slug}
                to={`/work/${cs.slug}`}
                className="group block overflow-hidden rounded-sm"
                style={{ backgroundColor: cs.tileColor }}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  {cs.tileYoutube ? (
                    <YoutubeLoopTile
                      id={cs.tileYoutube.id}
                      start={cs.tileYoutube.start}
                      end={cs.tileYoutube.end}
                      title={cs.title}
                    />
                  ) : cs.tileVideo ? (
                    <video
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={cs.tileVideo}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    cs.tileImage && (
                      <img
                        src={cs.tileImage}
                        alt={cs.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )
                  )}
                </div>
                <div className="p-6" style={{ color: cs.tileTextColor }}>
                  <p className="font-display font-bold uppercase text-xs tracking-widest opacity-70 mb-1">
                    {cs.brand}
                  </p>
                  <h3 className="font-display font-extrabold text-2xl md:text-3xl tracking-tightest">
                    {cs.title}
                  </h3>
                </div>
              </Link>
            ))}

          {caseStudies
            .filter((c) => c.draft)
            .map((cs) => (
              <div
                key={cs.slug}
                className="aspect-[4/3] flex flex-col items-start justify-center rounded-sm p-10 text-left bg-sage"
              >
                <p className="font-display font-extrabold text-[13vw] md:text-[6.5vw] tracking-tightest leading-[0.95] text-ink">
                  More
                  <br />
                  <span className="italic font-semibold">to come</span>
                  <br />
                  soon
                  <span className="inline-flex gap-1.5 ml-2 mb-3" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-ink animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-ink animate-bounce" />
                  </span>
                </p>
              </div>
            ))}
        </div>
      </section>

      {projects.some((p) => !p.hidden) && (
      <section className="px-6 md:px-10 pb-20">
        <h2 className="font-display font-bold text-xs uppercase tracking-widest text-ink/50 mb-8">
          More Work
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter((p) => !p.hidden).map((p) => (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              className="group block overflow-hidden rounded-sm"
              style={{ backgroundColor: p.tileColor }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={p.tileImage}
                  alt={p.brand}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5" style={{ color: p.tileTextColor }}>
                <p className="font-display font-bold uppercase text-xs tracking-widest opacity-70 mb-1">
                  {p.category}
                </p>
                <h3 className="font-display font-extrabold text-xl tracking-tightest">
                  {p.brand}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}
    </div>
  )
}
