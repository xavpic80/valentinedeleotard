import {
  gsap, ScrollTrigger, SplitText, reduceMotion, isTouch, EASE_OUT, EASE_INOUT,
  caseUrl, rich, inline, noOrphans, initSmoother, smoother, initCursor, bindPageLinks, pageEnter,
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
  // Image recadrée sur une zone : { src, zoom, focus: [x, y] } (x et y entre 0 et 1, centre de la zone à garder)
  if (typeof item === "object" && item.src && item.zoom) {
    const z = item.zoom;
    const [fx, fy] = item.focus || [0.5, 0.5];
    const clamp = (v) => Math.min(0, Math.max(1 - z, v));
    const left = clamp(0.5 - fx * z) * 100;
    const top = clamp(0.5 - fy * z) * 100;
    return `<div class="media media--focus ${cls}" style="aspect-ratio:${item.aspect || "3/2"}">
      <img src="${item.src}" alt="${cs.brand}" loading="lazy" style="width:${z * 100}%;height:${z * 100}%;left:${left}%;top:${top}%" /></div>`;
  }
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
  if (s.images && s.gallery) {
    // Galerie horizontale épinglée (même mécanique que Selected work) ; chaque carte s'ouvre en grand au clic
    // galleryText : le texte ouvre la bande à gauche, et les photos gardent leur format (pas de rognage)
    const natural = !!s.galleryText;
    const intro = natural
      ? `<div class="cs-gallery__intro">
          ${s.tag ? `<p class="section-label">${s.tag}</p>` : ""}
          ${s.headline ? `<h2 class="cs-headline">${s.headline}</h2>` : ""}
          ${s.body ? `<div class="cs-body">${rich(s.body)}</div>` : ""}
        </div>`
      : "";
    const loading = natural ? "eager" : "lazy"; // largeur naturelle : il faut l'image pour mesurer la bande
    html += `<div class="cs-gallery${natural ? " cs-gallery--natural" : ""}"><div class="cs-gallery__track">${intro}${s.images
      .map((m) => {
        const list = typeof m === "string" ? [m] : m.images;
        const alt = (typeof m === "object" && m.alt) || cs.brand;
        const inner = list.length > 1
          ? `<div class="media--slideshow" data-slideshow>${list.map((src) => `<img src="${src}" alt="${alt}" loading="${loading}" />`).join("")}</div>`
          : `<img src="${list[0]}" alt="${alt}" loading="${loading}" />`;
        // Diaporama dans une galerie à photos entières : il faut lui donner un format (aspect des données)
        const ratio = typeof m === "object" && m.aspect?.match(/\[(\d+)\/(\d+)\]/);
        const style = ratio ? ` style="aspect-ratio:${ratio[1]}/${ratio[2]}"` : "";
        return `<button type="button" class="cs-gallery__card" data-zoom data-cursor="Zoom"${style}>${inner}</button>`;
      })
      .join("")}</div></div>`;
  } else if (s.images) {
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

// Encadré : texte à gauche, kaléidoscope d'images à droite
function renderBox(s) {
  return `<section class="cs-box-wrap"><div class="cs-box">
    <div class="cs-box__text">
      ${s.tag ? `<p class="section-label">${s.tag}</p>` : ""}
      ${s.headline ? `<h2 class="cs-headline">${s.headline}</h2>` : ""}
      ${s.body ? `<div class="cs-body">${rich(s.body)}</div>` : ""}
    </div>
    <div class="cs-box__reel" data-kaleido data-beat="${s.boxBeat || 1}">
      ${(s.images || []).map((src, n) => `<img src="${src}" alt="" ${n < 2 ? "" : 'loading="lazy"'} />`).join("")}
    </div>
  </div></section>`;
}

function renderSection(s, i) {
  if (s.box) return renderBox(s);
  const text = s.galleryText ? "" : sectionText(s); // galleryText : le texte est dans la bande
  const media = sectionMedia(s);
  return `<section class="cs-section${s.gallery ? " cs-section--gallery" : ""}" data-index="${i}">
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
  // Vidéo en haut de page (heroVideo), au format 16:9, sans parallaxe
  if (cs.heroVideo) {
    return `<div class="cs-hero__media is-fixed" style="aspect-ratio:16/9"><video src="${cs.heroVideo}" poster="${cs.heroImage || ""}" autoplay muted loop playsinline></video></div>`;
  }
  const src = cs.heroImage || cs.tileImage;
  const pos = cs.heroObjectPosition === "object-left-top" ? ' style="object-position:left top"' : "";
  // Format imposé (heroAspect, ex. "aspect-[3000/750]") : image entière, sans rognage ni parallaxe
  const ratio = cs.heroAspect?.match(/\[(\d+)\/(\d+)\]/);
  const style = ratio ? ` style="aspect-ratio:${ratio[1]}/${ratio[2]}"` : "";
  return `<div class="cs-hero__media ${cs.heroFullBleed ? "is-bleed" : ""} ${ratio ? "is-fixed" : ""}"${style}><img src="${src}" alt="${cs.brand}"${pos} /></div>`;
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
    ${(cs.sections || []).map((sec, i) => (sec.beforeHighlights ? renderSection(sec, i) : "")).join("")}
    ${renderHighlights()}
    ${(cs.sections || []).map((sec, i) => (sec.beforeHighlights ? "" : renderSection(sec, i))).join("")}
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

// Kaléidoscope : une image par "beat", fondu enchaîné avec flou (comme le reel de la home)
function kaleidoscopes() {
  document.querySelectorAll("[data-kaleido]").forEach((box) => {
    const imgs = [...box.querySelectorAll("img")];
    if (imgs.length < 2) return;
    const beat = Number(box.dataset.beat) || 1;
    let i = 0;
    gsap.set(imgs, { opacity: 0, filter: "blur(20px)" });
    gsap.set(imgs[0], { opacity: 1, filter: "blur(0px)" });
    const loop = gsap.delayedCall(beat, function tick() {
      const prev = imgs[i];
      i = (i + 1) % imgs.length;
      imgs[i].loading = "eager"; // on charge la suivante à temps
      gsap.to(prev, { opacity: 0, filter: "blur(20px)", duration: 0.35, ease: "power1.inOut" });
      gsap.to(imgs[i], { opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "power1.inOut" });
      loop.restart(true);
    });
    ScrollTrigger.create({
      trigger: box, start: "top bottom", end: "bottom top",
      onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()),
    });
  });
}

// Pendant le scroll, aucune carte ne grandit, et celle qui était agrandie reprend sa taille
let scrolling = false;
let scrollTimer = null;
function shrink(card) {
  if (!card.classList.contains("is-hover")) return;
  gsap.to(card, { scale: 1, duration: 0.5, ease: EASE_OUT, overwrite: "auto", onComplete: () => card.classList.remove("is-hover") });
}
window.addEventListener("scroll", () => {
  scrolling = true;
  document.querySelectorAll(".cs-gallery__card.is-hover").forEach(shrink);
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => (scrolling = false), 200);
}, { passive: true });

// Galeries horizontales : la section reste fixe et les cartes défilent de droite à gauche
function galleries() {
  document.querySelectorAll(".cs-gallery").forEach((gallery) => {
    const track = gallery.querySelector(".cs-gallery__track");
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: gallery,
        start: "center center",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    gsap.utils.toArray(".cs-gallery__card", gallery).forEach((card) => {
      gsap.from(card, {
        rotate: 4, yPercent: 15, opacity: 0.3, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 60%", scrub: true },
      });
      // Survol : toute la carte grandit de 30 % et passe devant ses voisines,
      // seulement quand la souris bouge vraiment (jamais pendant le scroll)
      if (!isTouch) {
        card.addEventListener("mousemove", () => {
          if (scrolling || card.classList.contains("is-hover")) return;
          card.classList.add("is-hover");
          gsap.to(card, { scale: 1.3, duration: 0.6, ease: EASE_OUT, overwrite: "auto" });
        });
        card.addEventListener("mouseleave", () => shrink(card));
      }
    });
  });
}

// Zoom : l'image grandit depuis sa carte jusqu'au plein écran, entière (sans rognage)
function lightbox() {
  const cards = document.querySelectorAll("[data-zoom]");
  if (!cards.length) return;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `<div class="lightbox__bg"></div><img class="lightbox__img" alt="" /><button type="button" class="lightbox__close" aria-label="Close">✕</button>`;
  document.body.appendChild(box);
  const bg = box.querySelector(".lightbox__bg");
  const img = box.querySelector(".lightbox__img");
  let from = null;

  const target = () => {
    // Plus grande taille qui tient dans 90 % de l'écran, au ratio réel de l'image
    const maxW = window.innerWidth * 0.9, maxH = window.innerHeight * 0.88;
    const k = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const w = img.naturalWidth * k, h = img.naturalHeight * k;
    return { left: (window.innerWidth - w) / 2, top: (window.innerHeight - h) / 2, width: w, height: h };
  };

  let current = null;
  const open = (card) => {
    current = card;
    // Pour une carte diaporama, on ouvre l'image affichée à ce moment-là
    const imgs = [...card.querySelectorAll("img")];
    const shown = imgs.find((i) => +getComputedStyle(i).opacity > 0.5) || imgs[0];
    from = card.getBoundingClientRect();
    img.src = shown.currentSrc || shown.src;
    img.alt = shown.alt;
    const go = () => {
      box.classList.add("is-open");
      smoother?.paused(true);
      gsap.set(img, { left: from.left, top: from.top, width: from.width, height: from.height, borderRadius: 10 });
      gsap.to(bg, { opacity: 1, duration: 0.5, ease: "power2.out" });
      gsap.to(img, { ...target(), borderRadius: 4, duration: 0.8, ease: EASE_INOUT });
      gsap.fromTo(".lightbox__close", { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.5 });
    };
    img.complete && img.naturalWidth ? go() : img.addEventListener("load", go, { once: true });
  };

  const close = () => {
    if (!box.classList.contains("is-open")) return;
    gsap.to(".lightbox__close", { opacity: 0, duration: 0.2 });
    gsap.to(bg, { opacity: 0, duration: 0.6, ease: "power2.inOut" });
    // On revient vers la carte telle qu'elle est maintenant (elle a pu reprendre sa taille normale)
    const back = current ? current.getBoundingClientRect() : from;
    gsap.to(img, {
      left: back.left, top: back.top, width: back.width, height: back.height, borderRadius: 10,
      duration: 0.7, ease: EASE_INOUT,
      onComplete: () => { box.classList.remove("is-open"); smoother?.paused(false); },
    });
  };

  cards.forEach((card) => card.addEventListener("click", () => open(card)));
  box.addEventListener("click", close);
  window.addEventListener("keydown", (e) => e.key === "Escape" && close());
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
  revealFade(".cs-body, .cs-roles, .cs-featured, .cs-quote, .cs-results__desc, .cs-team, .cs-credits, .cs-card, .cs-box");
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
  noOrphans(document.querySelector("#case"));
  initSmoother();
  (async () => {
    await document.fonts.ready;
    bindPageLinks();
    pageEnter();
    if (reduceMotion) return;
    initCursor();
    slideshows();
    strips();
    galleries();
    lightbox();
    kaleidoscopes();
    intro();
    scrollAnimations();
    refreshOnImages();
  })();
}
