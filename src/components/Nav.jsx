import { Link } from "react-router-dom"

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-black/95 backdrop-blur px-6 md:px-10 py-4 border-b border-white/10 text-cream">
      <Link to="/" className="font-display font-bold text-xl tracking-tight">
        Valentine de Léotard
      </Link>
      <nav className="hidden md:flex items-center gap-8 font-display font-bold text-sm tracking-wide uppercase">
        <Link to="/" className="hover:opacity-70 transition-opacity">Work</Link>
        <Link to="/about" className="hover:opacity-70 transition-opacity">About</Link>
        <a href="mailto:valentine.picquerey@gmail.com" className="hover:opacity-70 transition-opacity">Contact</a>
      </nav>
    </header>
  )
}
