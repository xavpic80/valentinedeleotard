import {
  gsap, ScrollTrigger, SplitText, reduceMotion, isTouch, EASE_OUT, EASE_INOUT,
  caseUrl, initSmoother, smoother, initCursor, bindPageLinks, pageEnter,
  revealTitles, revealLabels, contactReveal, refreshOnImages,
} from "./common.js";
import { caseStudies } from "./data/caseStudies.js";
import { renderWheel, initWheel, initYoutubeTiles } from "./wheel.js";

const projects = caseStudies.filter((cs) => !cs.draft);

/* ------------------------------------------------------------------ */
/*  Loader + intro                                                    */
/* ------------------------------------------------------------------ */
function playLoader() {
  const loader = document.querySelector(".loader");
  // Le loader ne joue qu'une fois par session (pas à chaque retour d'une case study)
  if (reduceMotion || sessionStorage.getItem("loaded")) {
    loader.remove();
    return Promise.resolve();
  }
  sessionStorage.setItem("loaded", "1");
  document.body.classList.add("is-loading");
  smoother?.paused(true);

  const counter = { v: 0 };
  const num = loader.querySelector(".loader__num");

  return new Promise((resolve) => {
    gsap
      .timeline({
        onComplete: () => {
          loader.remove();
          document.body.classList.remove("is-loading");
          smoother?.paused(false);
        },
      })
      .to(counter, {
        v: 100, duration: 2.2, ease: "power3.inOut",
        onUpdate: () => (num.textContent = Math.round(counter.v)),
      })
      .to(".loader__bar span", { scaleX: 1, duration: 2.2, ease: "power3.inOut" }, 0)
      .to(".loader__count, .loader__bar", { yPercent: -40, opacity: 0, duration: 0.6, ease: "power3.in" }, "+=0.15")
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: EASE_INOUT, onStart: resolve }, "-=0.2");
  });
}

function heroIntro() {
  const chars = SplitText.create(".hero__title .line", { type: "chars", charsClass: "char" }).chars;

  gsap.timeline({ defaults: { ease: EASE_OUT } })
    .from(chars, { yPercent: 110, duration: 1.4, stagger: 0.035 })
    .from(".hero__media", { clipPath: "inset(100% 0 0 0)", duration: 1.6, ease: EASE_INOUT }, 0.1)
    .from(".hero__media img", { scale: 1.4, duration: 2, ease: EASE_OUT }, 0.3)
    .from(".hero__eyebrow span, .hero__intro", { y: 20, opacity: 0, duration: 1, stagger: 0.1 }, 0.5)
    .from(".nav > *", { y: -20, opacity: 0, duration: 1, stagger: 0.1 }, 0.6)
    .from(".hero__scroll", { opacity: 0, duration: 1 }, 0.9);

  gsap.fromTo(".hero__scroll i",
    { scaleY: 0, transformOrigin: "top" },
    { scaleY: 1, duration: 1.2, ease: "power2.inOut", repeat: -1, yoyo: true, delay: 1.5 });

  // Au scroll : le prénom part à gauche, le nom part à droite
  const split = gsap.timeline({
    scrollTrigger: { trigger: ".hero", start: "top top", end: () => "+=" + window.innerHeight * 0.55, scrub: 0.6, invalidateOnRefresh: true },
  });
  split
    .to(".hero__title .line:first-child", { xPercent: -100, ease: "power1.in" }, 0)
    .to(".hero__title .line--italic", { xPercent: 100, ease: "power1.in" }, 0);
}

/* ------------------------------------------------------------------ */
/*  Animations au scroll                                              */
/* ------------------------------------------------------------------ */
function scrollAnimations() {
  revealTitles();
  revealLabels(".section-label, .about__label");

  // Manifeste : les mots s'allument au fil du scroll
  SplitText.create(".about__text", {
    type: "words",
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(self.words, { opacity: 0.12 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".about__text", start: "top 75%", end: "bottom 45%", scrub: true },
      }),
  });
  gsap.from(".about__more p", {
    y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: EASE_OUT,
    scrollTrigger: { trigger: ".about__more", start: "top 85%" },
  });

  // Selected work : la roue (voir src/wheel.js)
  initWheel(projects);

  // Scroll horizontal épinglé
  const track = document.querySelector(".horizontal__track");
  const getDistance = () => track.scrollWidth - window.innerWidth;
  const hTween = gsap.to(track, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal",
      start: "top top",
      end: () => "+=" + getDistance(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
  gsap.utils.toArray(".h-card").forEach((card) => {
    gsap.from(card, {
      rotate: 4, yPercent: 15, opacity: 0.3, ease: "none",
      scrollTrigger: { trigger: card, containerAnimation: hTween, start: "left 100%", end: "left 60%", scrub: true },
    });
  });

  // Marquee infini, accéléré par la vitesse de scroll
  const row = document.querySelector(".marquee__row");
  row.appendChild(row.querySelector(".marquee__inner").cloneNode(true));
  const loop = gsap.to(row, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    trigger: ".marquee",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const dir = self.direction;
      const boost = gsap.utils.clamp(1, 6, Math.abs(self.getVelocity()) / 200);
      gsap.to(loop, { timeScale: boost * dir, duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, ease: "power2.out" });
    },
  });

  gsap.utils.toArray(".services__list li").forEach((li) => {
    gsap.from(li.children, {
      y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: EASE_OUT,
      scrollTrigger: { trigger: li, start: "top 88%" },
    });
  });

  contactReveal();
}

/* ------------------------------------------------------------------ */
/*  Init                                                              */
/* ------------------------------------------------------------------ */
// La home repart toujours du haut (sinon l'intro du nom se joue hors écran)
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) window.scrollTo(0, 0);

renderWheel(projects);
initYoutubeTiles();
initSmoother();
pageEnter();

(async () => {
  await document.fonts.ready;
  bindPageLinks();
  if (reduceMotion) {
    document.querySelector(".loader")?.remove();
    initWheel(projects, { animate: false });
    return;
  }
  initCursor();
  scrollAnimations();
  refreshOnImages();
  await playLoader();
  heroIntro();
  ScrollTrigger.refresh();
  // Arrivée depuis une case study sur /#work ou /#about
  if (location.hash && smoother) smoother.scrollTo(location.hash, false, "top top");
})();
