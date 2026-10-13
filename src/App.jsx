import { Routes, Route } from "react-router-dom"
import Nav from "./components/Nav"
import ScrollToTop from "./components/ScrollToTop"
import Home from "./pages/Home"
import CaseStudy from "./pages/CaseStudy"
import Project from "./pages/Project"
import About from "./pages/About"

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-ink font-body">
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="/projects/:slug" element={<Project />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}
