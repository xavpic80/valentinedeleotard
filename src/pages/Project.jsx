import { useParams, Link, Navigate } from "react-router-dom"
import { getProject } from "../data/projects"

export default function Project() {
  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <Navigate to="/" replace />

  return (
    <div>
      <section
        className="px-6 md:px-10 py-16"
        style={{ backgroundColor: project.tileColor }}
      >
        <p className="font-display font-bold uppercase text-xs tracking-widest text-ink/60 mb-2">
          {project.category}
        </p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tightest mb-6">
          {project.brand}
        </h1>
        <p className="max-w-xl text-ink/80 leading-relaxed">{project.description}</p>
      </section>

      <section className="px-6 md:px-10 py-16 grid sm:grid-cols-2 gap-4">
        {project.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${project.brand} visual ${i + 1}`}
            className="w-full rounded-sm object-cover"
          />
        ))}
      </section>

      <div className="px-6 md:px-10 pb-16">
        <Link
          to="/"
          className="font-display font-bold uppercase text-sm tracking-widest border-b-2 border-terracotta pb-1"
        >
          Back to work
        </Link>
      </div>
    </div>
  )
}
