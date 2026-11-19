import { Link } from "react-router-dom"
import { caseStudies } from "../data/caseStudies"
import { projects } from "../data/projects"
// Kaleidoscope video reel — removed from the top of the homepage per request, kept here
// for easy reinstatement later. To bring it back, uncomment the import below and the
// <section> block right after the opening <div> in the JSX.
// import KaleidoscopeReel from "../components/KaleidoscopeReel"
import Marquee from "../components/Marquee"
import YoutubeLoopTile from "../components/YoutubeLoopTile"

export default function Home() {
  return (
    <div>
      {/* <section className="relative w-full aspect-[21/9] max-h-[640px]">
        <KaleidoscopeReel />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent pointer-events-none" />
      </section> */}

      <section className="px-6 md:px-10 pt-10 pb-16">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-1.5 [&>*]:mb-1.5 [&>*]:break-inside-avoid">
          <div className="bg-sage text-ink rounded-sm p-8 md:p-10 flex flex-col">
            <p className="font-display uppercase tracking-widest text-xs mb-4 opacity-80">
              In a Nutshell
            </p>
            <h1 className="font-display font-extrabold leading-[1.02] text-4xl md:text-5xl tracking-tightest mb-6">
              I am a <span className="italic font-semibold">Hands-on Creative Director</span>{" "}
              working in CPG, retail &amp; challenger brands.
            </h1>
            <p className="leading-relaxed opacity-80 mb-8">
              Two decades building brands, campaigns and teams across Canada and Europe, from
              packaging and product to campaigns, digital and brand identity.
            </p>
            <Link
              to="/about"
              className="inline-block self-start font-display font-bold uppercase tracking-widest text-sm bg-black text-cream rounded-full px-6 py-3 hover:opacity-80 transition-opacity"
            >
              About me
            </Link>
          </div>

          {caseStudies
            .filter((c) => !c.draft)
            .map((cs) => (
              <Link
                key={cs.slug}
                to={`/work/${cs.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-sm bg-ink/5"
              >
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
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${cs.tileObjectPosition || ""}`}
                    />
                  )
                )}
                <div className="absolute left-4 bottom-4">
                  <span className="inline-block bg-black/85 text-cream font-display font-bold uppercase text-[11px] tracking-widest px-3 py-1.5 rounded-full">
                    {cs.category}
                  </span>
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
                <p className="font-display font-extrabold text-[13vw] sm:text-[6vw] lg:text-[4vw] tracking-tightest leading-[0.95] text-ink">
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

      <div className="px-6 md:px-10 pb-16">
        <Marquee />
      </div>

      {projects.some((p) => !p.hidden) && (
      <section className="px-6 md:px-10 pb-20">
        <h2 className="font-display font-bold text-xs uppercase tracking-widest text-ink/50 mb-8">
          More Work
        </h2>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-1.5 [&>*]:mb-1.5 [&>*]:break-inside-avoid">
          {projects.filter((p) => !p.hidden).map((p) => (
            <Link
              key={p.slug}
              to={`/projects/${p.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-sm bg-ink/5"
            >
              <img
                src={p.tileImage}
                alt={p.brand}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute left-4 bottom-4">
                <span className="inline-block bg-black/85 text-cream font-display font-bold uppercase text-[11px] tracking-widest px-3 py-1.5 rounded-full">
                  {p.brand}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}
    </div>
  )
}
