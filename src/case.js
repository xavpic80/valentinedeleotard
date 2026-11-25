import {
  gsap, ScrollTrigger, SplitText, reduceMotion, isTouch, EASE_OUT, EASE_INOUT,
  caseUrl, rich, inline, initSmoother, initCursor, bindPageLinks, pageEnter,
  revealTitles, revealLabels, revealFade, revealMedia, contactReveal, refreshOnImages,
} from "./common.js";
import { caseStudies } from "./data/caseStudies.js";

const published = caseStudies.filter((c) => !c.draft);
const slug = new URLSearchParams(location.search).get("slug");
const cs = caseStudies.find((c) => c.slug === slug);

if (!cs) location.replace("/");

/* ------------------------------------------------------------------ */
/*  Rendu des médias                                                  */
/* ------------------------------------------------------------------ */
const isVideo = (src) => /\.mp4$/i.test(src);

function mediaItem(item, cls = "") {
  // Carte texte (ex. "A fandom of its own.")
  if (typeof item === "object" && item.heading) {
    return `<div class="cs-card ${cls}" style="background:${item.bg || "var(--ink)"};color:${item.color || "#fff"}">
      <h4>${item.heading}</h4><p>${inline(item.body)}</p></div>`;
  }
  // Petit diaporama (plusieurs images dans une seule case)
  if (typeof item === "object" && item.images) {
    return `<div class="media media--slideshow ${cls}" data-slideshow>
      ${item.images.map((src) => `<img src="${src}" alt="${item.alt || ""}" loading="lazy" />`).join("")}</div>`;
  }
  if (isVideo(item)) {
    return `<div class="media ${cls}"><video src="${item}" autoplay muted loop playsinline></video></div>`;
  }
  return `<div class="media ${cls}"><img src="${item}" alt="${cs.brand}" loading="lazy" /></div>`;
}

function sectionMedia(s) {
  let html = "";
  if (s.quote) {
    html += `<blockquote class="cs-quote"><p>“${s.quote.text}”</p><cite>${s.quote.attribution}</cite></blockquote>`;
  }
  if (s.video) {
    html += `<div class="media media--video"><iframe src="https://www.youtube-nocookie.com/embed/${s.video}?rel=0&modestbranding=1"
      title="${s.headline || cs.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  if (s.videoFile) html += mediaItem(s.videoFile, "media--full");
  if (s.image && s.imageCrop) {
    // Image recadrée dans un format donné (imageCrop.aspect), en gardant la partie indiquée (imageCrop.position)
    const { aspect = "16 / 9", position = "center" } = s.imageCrop;
    html += `<div class="media media--crop" style="aspect-ratio:${aspect}"><img src="${s.image}" alt="${cs.brand}" loading="lazy" style="object-position:${position}" /></div>`;
  } else if (s.image) html += mediaItem(s.image, "media--full");
  if (s.imageColumns) {
    html += `<div class="cs-columns">${s.imageColumns
      .map((col) => `<div class="cs-columns__col">${col.map((m) => mediaItem(m)).join("")}</div>`)
      .join("")}</div>`;
  }
  if (s.images) {
    if (s.imageCarousel) {
      html += `<div class="cs-strip" data-strip><div class="cs-strip__track">${s.images
        .map((m) => mediaItem(m, "cs-strip__item"))
        .join("")}</div></div>
        <p class="cs-strip__hint">Drag or scroll sideways →</p>`;
    } else if (s.images.length === 1) {
      html += mediaItem(s.images[0], "media--full");
    } else {
      const cols = s.imageGrid ? s.imageCols || 2 : 2;
      html += `<div class="cs-grid" style="--cols:${cols}">${s.images.map((m) => mediaItem(m)).join("")}</div>`;
    }
  }
  return html;
}

function sectionText(s) {
  if (!s.tag && !s.headline && !s.body) return "";
  return `<div class="cs-section__text">
    ${s.tag ? `<p class="section-label">${s.tag}</p>` : ""}
    ${s.headline ? `<h2 class="cs-headline">${s.headline}</h2>` : ""}
    ${s.body ? `<div class="cs-body">${rich(s.body)}</div>` : ""}
  </div>`;
}

function renderSection(s, i) {
  const text = sectionText(s);
  const media = sectionMedia(s);
  return `<section class="cs-section" data-index="${i}">
    ${s.textBelow ? media + text : text + media}
  </section>`;
}

function renderHero() {
  if (cs.heroCarousel) {
    const ratio = cs.heroCarouselAspect?.match(/\[(\d+)\/(\d+)\]/);
    const style = ratio ? ` style="aspect-ratio:${ratio[1]}/${ratio[2]}"` : "";
    // Format imposé (heroCarouselAspect) : image entière en largeur, sans marge de parallaxe
    return `<div class="cs-hero__media ${cs.heroFullBleed ? "is-bleed" : ""} ${ratio ? "is-fixed" : ""} media--slideshow" data-slideshow${style}>
      ${cs.heroCarousel.map((src) => `<img src="${src}" alt="${cs.brand}" />`).join("")}</div>`;
  }
  const src = cs.heroImage || cs.tileImage;
  const pos = cs.heroObjectPosition === "object-left-top" ? ' style="object-position:left top"' : "";
  return `<div class="cs-hero__media ${cs.heroFullBleed ? "is-bleed" : ""}"><img src="${src}" alt="${cs.brand}"${pos} /></div>`;
}

function renderIntro() {
  const blocks = [
    ["The brief", cs.brief],
    ["The idea", cs.idea],
    ["What I did", cs.whatIDid],
  ].filter(([, t]) => t);
  return `<section class="cs-intro">
    <div class="cs-intro__blocks">
      ${blocks.map(([label, t]) => `<div class="cs-intro__block"><p class="section-label">${label}</p><div class="cs-body">${rich(t)}</div></div>`).join("")}
    </div>
    <aside class="cs-intro__aside">
      <p class="section-label">Role</p>
      <ul class="cs-roles">${(cs.role || []).map((r) => `<li>${r}</li>`).join("")}</ul>
      ${cs.featured ? `<p class="cs-featured">${cs.featured}</p>` : ""}
    </aside>
  </section>`;
}

function renderBehindTheBox() {
  if (!cs.behindTheBox) return "";
  return `<section class="cs-section">
    <div class="cs-section__text"><p class="section-label">Behind the box</p><h2 class="cs-headline">Shot on location.</h2></div>
    <div class="cs-grid cs-grid--btb" style="--cols:${cs.behindTheBox.length}">
      ${cs.behindTheBox.map((v) => mediaItem(v)).join("")}
    </div>
  </section>`;
}

// Highlights : bande pleine largeur, placée juste après l'intro (brief / idée / rôle)
function renderHighlights() {
  const r = cs.results;
  if (!r || (!r.items && !r.stat && !r.description)) return "";
  // Avec une image (results.image) : texte à gauche, image à droite, dans la même bande
  return `<section class="cs-results${r.image ? " has-image" : ""}">
    <div class="cs-results__body">
      <p class="section-label">${r.label || "Highlights"}</p>
      ${r.stat ? `<div class="cs-results__stat"><p class="cs-stat"><span data-count>${r.stat}</span></p><p class="cs-stat__label">${r.statLabel || ""}</p></div>` : ""}
      ${r.description ? `<p class="cs-results__desc">${inline(r.description)}</p>` : ""}
      ${r.items ? `<ul class="cs-results__list">${r.items.map((it, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${inline(it)}</p></li>`).join("")}</ul>` : ""}
    </div>
    ${r.image ? `<div class="cs-results__img media"><img src="${r.image}" alt="" loading="lazy" /></div>` : ""}
  </section>`;
}

// Fin de page : l'équipe
function renderOutro() {
  const r = cs.results;
  if (!r) return "";
  return `${r.team ? `<section class="cs-team"><p class="section-label">The team</p><dl>${r.team.map((m) => `<div><dt>${m.role}</dt><dd>${m.names}</dd></div>`).join("")}</dl></section>` : ""}`;
}

function renderNext() {
  const idx = published.findIndex((c) => c.slug === cs.slug);
  const next = published[(idx + 1) % published.length];
  const img = next.tileImage || next.heroImage || next.heroCarousel?.[0];
  return `<a href="${caseUrl(next.slug)}" class="cs-next" data-transition data-cursor="Next">
    <p class="section-label">Next project</p>
    <div class="cs-next__row">
      <h2 class="cs-next__title">${next.brand}</h2>
      <div class="cs-next__img media"><img src="${img}" alt="${next.brand}" loading="lazy" /></div>
    </div>
    <p class="cs-next__sub">${next.title}</p>
  </a>`;
}

function render() {
  document.title = `${cs.brand} — ${cs.title} · Valentine de Léotard`;
  document.querySelector("#case").innerHTML = `
    <section class="cs-hero">
      <a href="/#work" class="cs-back magnetic" data-transition>← All work</a>
      <p class="cs-hero__eyebrow"><span>${cs.brand}</span><span>${cs.category} — ${cs.year}</span></p>
      <h1 class="cs-hero__title">${cs.title}</h1>
      ${renderHero()}
    </section>
    ${renderIntro()}
    ${renderHighlights()}
    ${(cs.sections || []).map(renderSection).join("")}
    ${renderBehindTheBox()}
    ${renderOutro()}
    ${cs.credits ? `<p class="cs-credits">${cs.credits}</p>` : ""}
    ${renderNext()}
  `;
}

/* ------------------------------------------------------------------ */
/*  Animations                                                        */
/* ------------------------------------------------------------------ */
function slideshows() {
  document.querySelectorAll("[data-slideshow]").forEach((box) => {
    const imgs = box.querySelectorAll("img");
    const fixed = box.classList.contains("is-fixed");
    if (imgs.length < 2) return;
    gsap.set(imgs, { opacity: 0 });
    gsap.set(imgs[0], { opacity: 1 });
    const beat = (cs.heroCarouselBeatMs || 2200) / 1000;
    const tl = gsap.timeline({ repeat: -1 });
    imgs.forEach((img, i) => {
      const next = imgs[(i + 1) % imgs.length];
      tl.to(img, { opacity: 0, duration: 0.8, ease: "power2.inOut" }, `+=${beat}`)
        // Léger zoom à l'arrivée, sauf pour un hero au format imposé (sinon les côtés seraient rognés)
        .fromTo(next, { opacity: 0, scale: fixed ? 1 : 1.06 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, "<");
    });
  });
}

// Bandeau d'images : défilement horizontal à la souris (drag) en plus du scroll natif
function strips() {
  document.querySelectorAll("[data-strip]").forEach((strip) => {
    let down = false, startX = 0, startScroll = 0;
    strip.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; startX = e.clientX; startScroll = strip.scrollLeft;
      strip.classList.add("is-dragging");
    });
    window.addEventListener("pointerup", () => { down = false; strip.classList.remove("is-dragging"); });
    strip.addEventListener("pointermove", (e) => {
      if (!down) return;
      strip.scrollLeft = startScroll - (e.clientX - startX);
    });
    if (!isTouch) strip.setAttribute("data-cursor", "Drag");

    gsap.from(strip.querySelectorAll(".cs-strip__item"), {
      x: 120, opacity: 0, duration: 1.2, stagger: 0.06, ease: EASE_OUT,
      scrollTrigger: { trigger: strip, start: "top 85%" },
    });
  });
}

function intro() {
  const chars = SplitText.create(".cs-hero__title", { type: "lines,words,chars", mask: "lines", linesClass: "split-line" }).chars;
  gsap.timeline({ defaults: { ease: EASE_OUT }, delay: 0.5 })
    .from(chars, { yPercent: 110, duration: 1.2, stagger: 0.015 })
    .from(".cs-hero__eyebrow span, .cs-back", { y: 20, opacity: 0, duration: 1, stagger: 0.08 }, 0.2)
    .from(".cs-hero__media", { clipPath: "inset(100% 0 0 0)", duration: 1.5, ease: EASE_INOUT }, 0.3)
    .from(".cs-hero__media:not(.is-fixed) img", { scale: 1.3, duration: 2 }, 0.4);
}

function scrollAnimations() {
  revealTitles(".cs-headline, .cs-next__title");
  revealLabels(".cs-intro .section-label, .cs-section .section-label, .cs-results .section-label");
  revealFade(".cs-body, .cs-roles, .cs-featured, .cs-quote, .cs-results__desc, .cs-team, .cs-credits, .cs-card");
  revealMedia(".cs-section .media:not(.cs-strip__item), .cs-results__img");

  gsap.utils.toArray(".cs-results__list li").forEach((li, i) => {
    gsap.from(li, { y: 30, opacity: 0, duration: 1, delay: i * 0.08, ease: EASE_OUT, scrollTrigger: { trigger: li, start: "top 92%" } });
  });

  // Compteur pour les chiffres clés (ex. 650K+)
  document.querySelectorAll("[data-count]").forEach((el) => {
    const m = el.textContent.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const o = { v: 0 };
    gsap.to(o, {
      v: target, duration: 2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate: () => (el.textContent = m[1] + Math.round(o.v) + m[3]),
    });
  });

  // Parallaxe douce sur l'image du hero
  gsap.to(".cs-hero__media:not(.is-fixed) img", {
    yPercent: 10, ease: "none",
    scrollTrigger: { trigger: ".cs-hero__media", start: "top top", end: "bottom top", scrub: true },
  });

  // Next project : l'image glisse avec la souris
  const next = document.querySelector(".cs-next");
  if (next && !isTouch) {
    const img = next.querySelector(".cs-next__img");
    next.addEventListener("mouseenter", () => gsap.to(img, { clipPath: "inset(0% 0 0% 0)", duration: 0.8, ease: EASE_INOUT }));
    next.addEventListener("mouseleave", () => gsap.to(img, { clipPath: "inset(50% 0 50% 0)", duration: 0.8, ease: EASE_INOUT }));
    gsap.set(img, { clipPath: "inset(50% 0 50% 0)" });
  }

  contactReveal();
}

/* ------------------------------------------------------------------ */
/*  Init                                                              */
/* ------------------------------------------------------------------ */
if (cs) {
  render();
  initSmoother();
  (async () => {
    await document.fonts.ready;
    bindPageLinks();
    pageEnter();
    if (reduceMotion) return;
    initCursor();
    slideshows();
    strips();
    intro();
    scrollAnimations();
    refreshOnImages();
  })();
}
