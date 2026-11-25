// Selected work : les cartes de projets, dans la section à scroll horizontal épinglé
// (la même que celle créée pour la photo culinaire). Une carte par projet.
import { caseUrl } from "./common.js";

// Toutes les cartes ont le même format : verticales, ratio 3:4 (classe h-card--tall)
// Les cartes utilisent des vignettes légères dans public/thumbs/ (même chemin que l'original).
// Si une vignette manque, l'image originale est chargée à la place.

function cardMedia(cs) {
  const src = cs.tileImage || cs.heroImage || cs.heroCarousel?.[0];
  // Cadrage de la carte : tilePosition ("x% y%") ou l'ancien réglage object-top
  const pos = cs.tilePosition
    ? ` style="object-position: ${cs.tilePosition}"`
    : cs.tileObjectPosition === "object-top" ? ' style="object-position: top"' : "";
  const img = `<img src="/thumbs${src}" onerror="this.onerror=null;this.src='${src}'" alt="${cs.brand} — ${cs.title}" loading="lazy"${pos} />`;
  // tileVideo = fichier mp4, tileYoutube = extrait d'une vidéo YouTube en boucle
  if (cs.tileVideo) {
    return `<video src="${cs.tileVideo}" poster="/thumbs${src}" autoplay muted loop playsinline preload="metadata"></video>`;
  }
  if (cs.tileYoutube) {
    const { id, start = 0, end } = cs.tileYoutube;
    return `${img}<div class="card__yt" data-yt="${id}" data-start="${start}" data-end="${end || ""}"><div></div></div>`;
  }
  return img;
}

export function renderWorkCards(projects) {
  const track = document.querySelector("#work .horizontal__track");
  track.insertAdjacentHTML(
    "beforeend",
    projects
      .map((cs, i) => {
        return `
      <a href="${caseUrl(cs.slug)}" class="h-card h-card--tall" data-cursor="View" data-transition>
        <div class="ph ph--filled">${cardMedia(cs)}</div>
        <p><span>${String(i + 1).padStart(2, "0")}</span>${cs.brand}<em>${cs.category}</em></p>
      </a>`;
      })
      .join("")
  );
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
  const tiles = document.querySelectorAll(".card__yt");
  if (!tiles.length) return;
  loadYouTubeAPI().then((YT) => {
    tiles.forEach((tile) => {
      const start = Number(tile.dataset.start) || 0;
      const end = Number(tile.dataset.end) || null;
      let watch = null;
      let showTimer = null;
      // YouTube affiche brièvement son icône pause au démarrage et à chaque retour au début :
      // on cache alors la vidéo derrière la photo, et on la réaffiche une demi-seconde plus tard
      const show = (delay = 500) => { clearTimeout(showTimer); showTimer = setTimeout(() => tile.classList.add("is-playing"), delay); };
      const hide = () => { clearTimeout(showTimer); tile.classList.remove("is-playing"); };
      // Retour au début de l'extrait : on cache la vidéo le temps du saut, puis on la réaffiche nous-mêmes
      // (YouTube ne renvoie pas toujours l'état "lecture" après un saut)
      const restart = () => { hide(); player.seekTo(start, true); show(1100); };
      // YouTube ne démarre pas une vidéo hors écran : on (re)lance la lecture dès que la carte est visible,
      // et on la met en pause quand elle sort de l'écran
      let ready = false;
      let visible = false;
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!ready) return;
        if (visible) {
          hide(); // l'icône play/pause de YouTube apparaît ~1 s à la reprise : on attend avant de réafficher
          player.mute();
          player.playVideo();
          show(1100);
        }
        else { player.pauseVideo(); hide(); }
      }, { threshold: 0.1 }).observe(tile);
      const player = new YT.Player(tile.firstElementChild, {
        videoId: tile.dataset.yt,
        playerVars: {
          autoplay: 1, mute: 1, controls: 0, rel: 0, playsinline: 1, start,
          disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            ready = true;
            if (visible) e.target.playVideo();
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              show(1100); // la photo dessous disparaît, une fois l'icône de YouTube partie
              if (end && !watch) {
                watch = setInterval(() => {
                  if (player.getCurrentTime?.() >= end) restart();
                }, 200);
              }
            }
            if (e.data === YT.PlayerState.ENDED) restart();
          },
        },
      });
    });
  });
}
