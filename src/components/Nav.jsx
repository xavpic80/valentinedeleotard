import { Link } from "react-router-dom"

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-ink/95 backdrop-blur px-6 md:px-10 py-4 border-b border-sage/30 text-sage">
      <Link to="/" className="font-display font-black text-xl tracking-wide">
        VALENTINE
        <br />
        DE LEOTARD
      </Link>
      <nav className="hidden md:flex items-center gap-8 font-display font-bold text-sm tracking-wide uppercase">
        <Link to="/" className="hover:opacity-70 transition-opacity">Work</Link>
        <Link to="/about" className="hover:opacity-70 transition-opacity">About</Link>
        <a href="mailto:valentine.picquerey@gmail.com" className="hover:opacity-70 transition-opacity">Contact</a>
      </nav>
    </header>
  )
}
