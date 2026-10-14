export default function About() {
  return (
    <section className="px-6 md:px-10 py-20 max-w-5xl">
      <p className="font-display font-bold uppercase tracking-widest text-xs text-ink mb-4">
        About
      </p>
      <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tightest mb-10">
        Hi, I'm Valentine.
      </h1>
      <div className="grid md:grid-cols-[1fr_minmax(0,420px)] gap-10 md:gap-14 items-center">
        <div>
          <div className="space-y-6 text-ink/80 leading-relaxed text-lg">
            <p>
              I'm a Senior Creative Director based in Montreal, with{" "}
              <strong className="font-bold text-ink">
                two decades building brands, campaigns and teams across Canada and Europe
              </strong>
              . Parisian-born and Parisian-raised, which basically means I have opinions
              about bread and typography.
            </p>
            <p>
              I hold a master's degree in visual communication and began my career in
              advertising at M&amp;C Saatchi. In 2010 I moved to Canada and spent the
              next years shaping brands like DAVIDsTEA and, later, Goodfood,{" "}
              <strong className="font-bold text-ink">
                building creative studios from the ground up and leading teams of 25+
                creatives
              </strong>
              .
            </p>
            <p>
              I love bold colours, sleek branding, and creating work that makes people
              stop scrolling, smile, or suddenly feel hungry. I believe great design is{" "}
              <strong className="font-bold text-ink">
                a mix of strategy, storytelling, and a little bit of visual showmanship
              </strong>
              .
            </p>
            <p>And yes, I take creativity seriously. Myself? Not always.</p>
          </div>
          <a
            href="mailto:valentine.picquerey@gmail.com"
            className="inline-block mt-10 font-display font-bold uppercase tracking-widest text-sm border-b-2 border-terracotta pb-1"
          >
            Let's chat · valentine.picquerey@gmail.com
          </a>
        </div>
        <img
          src="/about/valentine-portrait.jpg"
          alt="Valentine de Leotard"
          className="w-full h-auto rounded-sm"
        />
      </div>
    </section>
  )
}
