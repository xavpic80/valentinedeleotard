// Galerie "roue" pour Selected work.
// Les cartes sont posées sur un grand cercle dont on ne voit que l'arc du haut.
// Au scroll (section épinglée), la roue tourne et la légende affiche le projet de la carte du haut.
import { gsap, ScrollTrigger, caseUrl, EASE_OUT } from "./common.js";

const PER_PROJECT = 3; // visuels par projet sur la roue
// Les cartes utilisent des vignettes légères dans public/thumbs/ (même chemin que l'original).
// Si une vignette manque (nouveau projet), l'image originale est chargée à la place.

// Récupère quelques visuels (images fixes) par projet
function pickImages(cs) {
  const list = [cs.tileImage, cs.heroImage, ...(cs.heroCarousel || [])];
  (cs.sections || []).forEach((s) => {
    if (s.image) list.push(s.image);
    (s.images || []).forEach((m) => typeof m === "string" && list.push(m));
    (s.imageColumns || []).flat().forEach((m) => typeof m === "string" && list.push(m));
  });
  const imgs = [...new Set(list.filter((src) => src && /\.(jpe?g|png|webp)$/i.test(src)))];
  return Array.from({ length: PER_PROJECT }, (_, i) => imgs[i % imgs.length]);
}

export function renderWheel(projects) {
  const ring = document.querySelector(".wheel__ring");
  const images = projects.map(pickImages);
  // Ordre : p1, p2, ... p7, puis on recommence avec le visuel suivant de chaque projet
  const cards = [];
  for (let round = 0; round < PER_PROJECT; round++) {
    projects.forEach((cs, p) => cards.push({ cs, p, src: images[p][round] }));
  }
  ring.innerHTML = cards
    .map(({ cs, p, src }, i) => {
      // La première carte d'un projet qui a une vidéo la joue :
      // tileVideo = fichier mp4, tileYoutube = extrait d'une vidéo YouTube en boucle
      const first = i < projects.length;
      const img = `<img src="/thumbs${src}" onerror="this.onerror=null;this.src='${src}'" alt="${cs.brand} — ${cs.title}" decoding="async" />`;
      let media = img;
      if (first && cs.tileVideo) {
        media = `<video src="${cs.tileVideo}" poster="/thumbs${src}" autoplay muted loop playsinline preload="auto"></video>`;
      } else if (first && cs.tileYoutube) {
        const { id, start = 0, end } = cs.tileYoutube;
        media = `${img}<div class="wheel__yt" data-yt="${id}" data-start="${start}" data-end="${end || ""}"><div></div></div>`;
      }
      return `
      <a href="${caseUrl(cs.slug)}" class="wheel__card" data-project="${p}" data-cursor="View" data-transition>
        <div class="wheel__inner">${media}</div>
      </a>`;
    })
    .join("");
}

/* ------------------------------------------------------------------ */
/*  Extraits YouTube en boucle (muets, sans contrôles)                */
/* ------------------------------------------------------------------ */
let ytApi = null;
function loadYouTubeAPI() {
  if (ytApi) return ytApi;
  ytApi = new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApi;
}

export function initYoutubeTiles() {
  const tiles = document.querySelectorAll(".wheel__yt");
  if (!tiles.length) return;
  loadYouTubeAPI().then((YT) => {
    tiles.forEach((tile) => {
      const start = Number(tile.dataset.start) || 0;
      const end = Number(tile.dataset.end) || null;
      let watch = null;
      const player = new YT.Player(tile.firstElementChild, {
        videoId: tile.dataset.yt,
        playerVars: {
          autoplay: 1, mute: 1, controls: 0, rel: 0, playsinline: 1, start,
          disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1,
        },
        events: {
          onReady: (e) => { e.target.mute(); e.target.playVideo(); },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              tile.classList.add("is-playing"); // la photo dessous disparaît
              if (end && !watch) {
                watch = setInterval(() => {
                  if (player.getCurrentTime?.() >= end) player.seekTo(start, true);
                }, 200);
              }
            }
            if (e.data === YT.PlayerState.ENDED) player.seekTo(start, true);
          },
        },
      });
    });
  });
}

export function initWheel(projects, { animate = true } = {}) {
  const stage = document.querySelector(".wheel__stage");
  const cards = gsap.utils.toArray(".wheel__card");
  const N = cards.length;
  const fullStep = 360 / N; // écart d'origine : les cartes font le tour complet du cercle
  const GAP = 0.5; // espace entre les cartes : 50 % de l'espace d'origine
  const count = projects.length;

  const kicker = stage.querySelector(".wheel__count");
  const title = stage.querySelector(".wheel__title");
  const sub = stage.querySelector(".wheel__sub");
  let active = -1;

  const clamp = gsap.utils.clamp(0, 1);
  const ease = gsap.parseEase("power1.inOut");

  function setCaption(p) {
    if (p === active) return;
    const dir = p > active ? 1 : -1;
    active = p;
    const cs = projects[p];
    kicker.textContent = `${String(p + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    title.textContent = cs.brand;
    title.href = caseUrl(cs.slug);
    sub.textContent = cs.title;
    gsap.fromTo([title, sub], { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: EASE_OUT, overwrite: true });
  }

  function layout(prog) {
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const R = Math.max(vw * 0.994, 856); // rayon du cercle (grand = arc plus plat)
    const cy = vh * -0.155 + R; // centre du cercle : la carte du haut est à ~34,5 % de la hauteur
    // Écart angulaire : on garde la largeur de carte et on réduit seulement le vide entre deux cartes
    const cardW = cards[0].offsetWidth;
    const fullGap = R * (fullStep * Math.PI) / 180 - cardW;
    const step = ((cardW + Math.max(fullGap, 0) * GAP) / R) * (180 / Math.PI);
    const offset = -ease(clamp(prog)) * (count - 1) * step; // fait passer chaque projet en haut

    cards.forEach((card, i) => {
      const theta = i * step + offset;
      const rad = (theta * Math.PI) / 180;
      gsap.set(card, {
        x: R * Math.sin(rad),
        y: cy - R * Math.cos(rad),
        rotation: theta,
      });
    });

    const top = ((Math.round(-offset / step) % N) + N) % N;
    setCaption(Number(cards[top].dataset.project));
  }

  if (!animate) {
    layout(0); // version statique : l'arc, sans rotation
    return;
  }

  const state = { p: 0 };
  layout(0);
  gsap.to(state, {
    p: 1,
    ease: "none",
    onUpdate: () => layout(state.p),
    scrollTrigger: {
      trigger: ".wheel",
      start: "top top",
      end: () => "+=" + window.innerHeight * 2.5,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onRefresh: () => layout(state.p),
    },
  });
}
