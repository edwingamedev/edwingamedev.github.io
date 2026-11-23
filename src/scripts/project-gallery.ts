const VIDEO_PATTERN = /\.(webm|mp4)(?:[?#]|$)/i;
const SWIPE_THRESHOLD = 50;

function initGallery(gallery: HTMLElement): void {
  const items = Array.from(gallery.querySelectorAll<HTMLButtonElement>("[data-gallery-item]"));

  const track = gallery.querySelector<HTMLElement>("[data-gallery-track]");
  const stripPrev = gallery.querySelector<HTMLButtonElement>("[data-strip-prev]");
  const stripNext = gallery.querySelector<HTMLButtonElement>("[data-strip-next]");

  const dialog = gallery.querySelector<HTMLDialogElement>("[data-gallery-dialog]");
  const preview = gallery.querySelector<HTMLElement>("[data-gallery-preview]");
  const counter = gallery.querySelector<HTMLElement>("[data-gallery-count]");

  const previous = gallery.querySelector<HTMLButtonElement>("[data-gallery-prev]");
  const next = gallery.querySelector<HTMLButtonElement>("[data-gallery-next]");
  const close = gallery.querySelector<HTMLButtonElement>("[data-gallery-close]");

  if (
    !track ||
    !stripPrev ||
    !stripNext ||
    !dialog ||
    !preview ||
    !counter ||
    !previous ||
    !next ||
    !close ||
    items.length === 0
  ) {
    return;
  }

  initCarousel(track, items, stripPrev, stripNext);

  initLightbox(gallery, items, dialog, preview, counter, previous, next, close);
}

function initCarousel(
  track: HTMLElement,
  items: HTMLButtonElement[],
  previous: HTMLButtonElement,
  next: HTMLButtonElement
): void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const update = (): void => {
    const hasOverflow = track.scrollWidth > track.clientWidth + 1;

    previous.hidden = !hasOverflow;
    next.hidden = !hasOverflow;

    previous.disabled = !hasOverflow || track.scrollLeft <= 1;
    next.disabled = !hasOverflow || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  };

  const move = (direction: number): void => {
    const firstItem = items[0];
    if (!firstItem) return;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = firstItem.getBoundingClientRect().width + gap;

    track.scrollBy({
      left: distance * direction,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  };

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));

  track.addEventListener("scroll", update, { passive: true });

  const resizeObserver = new ResizeObserver(update);
  resizeObserver.observe(track);

  items.forEach((item) => resizeObserver.observe(item));

  update();
}

function initLightbox(
  gallery: HTMLElement,
  items: HTMLButtonElement[],
  dialog: HTMLDialogElement,
  preview: HTMLElement,
  counter: HTMLElement,
  previous: HTMLButtonElement,
  next: HTMLButtonElement,
  close: HTMLButtonElement
): void {
  let currentIndex = 0;
  let touchStartX: number | null = null;

  const normalize = (index: number): number =>
    ((index % items.length) + items.length) % items.length;

  const showMedia = (index: number): void => {
    currentIndex = normalize(index);

    const item = items[currentIndex];
    const src = item?.dataset.src;

    if (!src) return;

    preview.replaceChildren();

    if (VIDEO_PATTERN.test(src)) {
      const wrapper = document.createElement("div");
      wrapper.className = "video-preview";

      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("aria-label", item.dataset.alt ?? "");

      const playIndicator = document.createElement("span");
      playIndicator.className = "video-play-indicator";
      playIndicator.setAttribute("aria-hidden", "true");

      const playIcon = gallery.querySelector<HTMLTemplateElement>("[data-play-icon]");

      if (playIcon) {
        playIndicator.append(playIcon.content.cloneNode(true));
      }

      const updateIndicator = (): void => {
        playIndicator.hidden = !video.paused;
      };

      video.addEventListener("play", updateIndicator);
      video.addEventListener("pause", updateIndicator);
      video.addEventListener("ended", updateIndicator);

      wrapper.append(video, playIndicator);
      preview.append(wrapper);

      video.play().catch(() => {
        updateIndicator();
      });
    } else {
      const image = document.createElement("img");
      image.src = src;
      image.alt = item.dataset.alt ?? "";

      preview.append(image);
    }

    counter.textContent = `${currentIndex + 1} / ${items.length}`;
  };

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      showMedia(index);
      dialog.showModal();
    });
  });

  previous.addEventListener("click", () => showMedia(currentIndex - 1));
  next.addEventListener("click", () => showMedia(currentIndex + 1));
  close.addEventListener("click", () => dialog.close());

  if (items.length === 1) {
    previous.hidden = true;
    next.hidden = true;
  }

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && items.length > 1) {
      event.preventDefault();
      showMedia(currentIndex - 1);
    } else if (event.key === "ArrowRight" && items.length > 1) {
      event.preventDefault();
      showMedia(currentIndex + 1);
    }
  });

  preview.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    },
    { passive: true }
  );

  preview.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) return;

      const endX = event.changedTouches[0]?.clientX;

      if (endX === undefined) {
        touchStartX = null;
        return;
      }

      const distance = endX - touchStartX;
      touchStartX = null;

      if (Math.abs(distance) < SWIPE_THRESHOLD || items.length === 1) return;

      showMedia(currentIndex + (distance < 0 ? 1 : -1));
    },
    { passive: true }
  );

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    preview.replaceChildren();
    touchStartX = null;
  });
}

document.querySelectorAll<HTMLElement>("[data-gallery]").forEach(initGallery);
