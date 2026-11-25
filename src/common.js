// Code partagé entre la home et les pages case study :
// smooth scroll, curseur, effets magnétiques, transitions de page, footer.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = window.matchMedia("(hover: none)").matches;
export const EASE_OUT = "expo.out";
export const EASE_INOUT = "power4.inOut";

export const caseUrl = (slug) => `/case.html?slug=${encodeURIComponent(slug)}`;

// **gras** -> <strong>, paragraphes séparés par une ligne vide
export const rich = (text = "") =>
  text
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`)
    .join("");
export const inline = (text = "") => text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

/* ------------------------------------------------------------------ */
/*  Smooth scroll                                                     */
/* ------------------------------------------------------------------ */
export let smoother = null;
export function initSmoother() {
  if (reduceMotion) return null;
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
    smoothTouch: 0.1,
  });

  // Liens d'ancre compatibles avec le smoother
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      e.preventDefault();
      const target = id === "#" ? 0 : id;
      if (smoother) smoother.scrollTo(target, true, "top top");
      else if (target === 0) window.scrollTo({ top: 0 });
      else document.querySelector(target)?.scrollIntoView();
    });
  });
  return smoother;
}

// Les images chargent après coup : on recalcule les positions des ScrollTriggers
export function refreshOnImages(root = document) {
  let pending = 0;
  let t;
  const schedule = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); };
  root.querySelectorAll("img").forEach((img) => {
    if (!img.complete) { pending++; img.addEventListener("load", schedule, { once: true }); }
  });
  return pending;
}

/* ------------------------------------------------------------------ */
/*  Transitions de page                                               */
/* ------------------------------------------------------------------ */
export function pageEnter() {
  const curtain = document.querySelector(".curtain");
  if (!curtain) return;
  const fromTransition = sessionStorage.getItem("transition");
  sessionStorage.removeItem("transition");
  if (reduceMotion) { curtain.style.display = "none"; return; }
  // Sur la home, le rideau est ouvert par défaut : on ne le joue qu'en arrivant d'une autre page
  if (curtain.classList.contains("curtain--open")) {
    if (!fromTransition) return;
    gsap.set(curtain, { clipPath: "inset(0 0 0% 0)" });
  }
  gsap.to(curtain, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: EASE_INOUT, delay: 0.1 });
}

export function bindPageLinks() {
  const curtain = document.querySelector(".curtain");
  document.querySelectorAll("a[data-transition]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || reduceMotion || !curtain) return;
      e.preventDefault();
      const href = a.getAttribute("href");
      sessionStorage.setItem("transition", "1");
      gsap.fromTo(curtain,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 0.8, ease: EASE_INOUT, onComplete: () => (window.location.href = href) });
    });
  });
}
// Retour arrière depuis le cache du navigateur : on relève le rideau
window.addEventListener("pageshow", (e) => {
  if (e.persisted) gsap.set(".curtain", { clipPath: "inset(0 0 100% 0)" });
});

/* ------------------------------------------------------------------ */
/*  Curseur + effets magnétiques                                      */
/* ------------------------------------------------------------------ */
export function initCursor() {
  if (isTouch) return;
  const el = document.querySelector(".cursor");
  const label = el.querySelector(".cursor__label");
  const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
  window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });

  document.querySelectorAll("[data-cursor]").forEach((target) => {
    target.addEventListener("mouseenter", () => {
      label.textContent = target.dataset.cursor;
      el.classList.add("is-view");
      gsap.to(el, { width: 90, height: 90, duration: 0.5, ease: EASE_OUT });
      gsap.to(label, { opacity: 1, duration: 0.3, delay: 0.1 });
    });
    target.addEventListener("mouseleave", () => {
      el.classList.remove("is-view");
      gsap.to(el, { width: 12, height: 12, duration: 0.5, ease: EASE_OUT });
      gsap.to(label, { opacity: 0, duration: 0.15 });
    });
  });

  document.querySelectorAll(".magnetic").forEach((m) => {
    const mx = gsap.quickTo(m, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const my = gsap.quickTo(m, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    m.addEventListener("mousemove", (e) => {
      const r = m.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.4);
      my((e.clientY - r.top - r.height / 2) * 0.4);
    });
    m.addEventListener("mouseleave", () => { mx(0); my(0); });
  });

  const big = document.querySelector(".contact__big");
  if (big) {
    const bx = gsap.quickTo(big, "x", { duration: 1, ease: "power3" });
    const by = gsap.quickTo(big, "y", { duration: 1, ease: "power3" });
    big.addEventListener("mousemove", (e) => {
      const r = big.getBoundingClientRect();
      bx((e.clientX - r.left - r.width / 2) * 0.06);
      by((e.clientY - r.top - r.height / 2) * 0.1);
    });
    big.addEventListener("mouseleave", () => { bx(0); by(0); });
  }
}

/* ------------------------------------------------------------------ */
/*  Animations génériques au scroll                                   */
/* ------------------------------------------------------------------ */
export function revealTitles(selector = ".section-title") {
  document.querySelectorAll(selector).forEach((title) => {
    SplitText.create(title, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110, duration: 1.2, stagger: 0.1, ease: EASE_OUT,
          scrollTrigger: { trigger: title, start: "top 88%" },
        }),
    });
  });
}

export function revealLabels(selector = ".section-label") {
  gsap.utils.toArray(selector).forEach((el) => {
    gsap.from(el, { opacity: 0, x: -20, duration: 1, ease: EASE_OUT, scrollTrigger: { trigger: el, start: "top 92%" } });
  });
}

export function revealFade(selector) {
  gsap.utils.toArray(selector).forEach((el) => {
    gsap.from(el, { opacity: 0, y: 40, duration: 1.1, ease: EASE_OUT, scrollTrigger: { trigger: el, start: "top 90%" } });
  });
}

// Visuel : rideau + dézoom à l'entrée, parallaxe interne au scroll
export function revealMedia(selector) {
  gsap.utils.toArray(selector).forEach((box) => {
    const img = box.querySelector("img, video");
    gsap.timeline({ scrollTrigger: { trigger: box, start: "top 88%" } })
      .from(box, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: EASE_INOUT })
      .from(img, { scale: 1.3, duration: 1.8, ease: EASE_OUT }, 0);
  });
}

export function contactReveal() {
  const contactChars = SplitText.create(".contact__big .line", { type: "chars" }).chars;
  gsap.from(contactChars, {
    yPercent: 110, duration: 1.2, stagger: 0.025, ease: EASE_OUT,
    scrollTrigger: { trigger: ".contact__big", start: "top 80%" },
  });
}
