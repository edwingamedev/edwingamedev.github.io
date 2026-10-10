document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".projects-console");
  if (!section) return;

  const track = section.querySelector(".projects-carousel-track");
  const previous = section.querySelector('[data-direction="previous"]');
  const next = section.querySelector('[data-direction="next"]');
  const indicators = [...section.querySelectorAll(".projects-carousel-indicator")];
  const counter = section.querySelector(".projects-carousel-count");

  if (!track || !previous || !next) return;

  const originals = [...track.querySelectorAll(".projects-carousel-slide")];
  const count = originals.length;

  if (count === 0) {
    previous.disabled = true;
    next.disabled = true;
    return;
  }

  const DURATION = 300;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let currentIndex = 0;
  let physicalIndex = 0;
  let animationFrame = null;
  let isAnimating = false;
  let isSettling = false;

  const wrap = (index) => ((index % count) + count) % count;

  /* =======================================================
     CLONES
     ======================================================= */

  const cloneSlide = (slide) => {
    const clone = slide.cloneNode(true);

    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;

    return clone;
  };

  if (count > 1) {
    track.prepend(...originals.map(cloneSlide));
    track.append(...originals.map(cloneSlide));
  }

  const slides = [...track.querySelectorAll(".projects-carousel-slide")];

  const firstOriginal = count > 1 ? count : 0;
  physicalIndex = firstOriginal;

  /* =======================================================
     POSITION AND STATE
     ======================================================= */

  const getPosition = (index) => {
    const slide = slides[index];

    return slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
  };

  const getClosestIndex = () => {
    const center = track.scrollLeft + track.clientWidth / 2;

    return slides.reduce(
      (closest, slide, index) => {
        const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);

        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: 0, distance: Infinity }
    ).index;
  };

  const updateUI = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-selected", index === physicalIndex);
    });

    indicators.forEach((indicator, index) => {
      if (index === currentIndex) {
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });

    if (counter) {
      counter.textContent =
        `${String(currentIndex + 1).padStart(2, "0")} / ` + `${String(count).padStart(2, "0")}`;
    }
  };

  const setSnap = (enabled) => {
    track.style.scrollSnapType = enabled ? "" : "none";
  };

  const jumpTo = (index) => {
    setSnap(false);
    track.scrollLeft = getPosition(index);
  };

  /* =======================================================
     INFINITE LOOP NORMALIZATION
     ======================================================= */

  const normalize = () => {
    let normalizedIndex = physicalIndex;

    if (count > 1) {
      if (physicalIndex < count) {
        normalizedIndex += count;
      } else if (physicalIndex >= count * 2) {
        normalizedIndex -= count;
      }
    }

    const needsReposition = normalizedIndex !== physicalIndex;

    if (needsReposition) {
      /*
       * Disable image transitions before changing the
       * selected slide from a clone to its original.
       */
      track.classList.add("is-repositioning");

      physicalIndex = normalizedIndex;
      currentIndex = wrap(physicalIndex - firstOriginal);

      updateUI();
      jumpTo(physicalIndex);

      /*
       * Commit the new visual state without transitions.
       * The class is removed after the browser has had
       * an opportunity to render the repositioned state.
       */
      void track.offsetWidth;
    } else {
      currentIndex = wrap(physicalIndex - firstOriginal);
      updateUI();
    }

    return needsReposition;
  };

  const settle = (repositioned = false) => {
    isSettling = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (repositioned) {
          track.classList.remove("is-repositioning");
        }

        setSnap(true);

        isAnimating = false;
        isSettling = false;
      });
    });
  };

  /* =======================================================
     ANIMATION
     ======================================================= */

  const moveTo = (index, animate = true) => {
    if (isAnimating || isSettling) return;
    if (index < 0 || index >= slides.length) return;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    const start = track.scrollLeft;
    const target = getPosition(index);
    const distance = target - start;

    physicalIndex = index;
    currentIndex = wrap(index - firstOriginal);

    setSnap(false);
    updateUI();

    isAnimating = true;

    const finish = () => {
      track.scrollLeft = target;

      const repositioned = normalize();
      settle(repositioned);
    };

    if (!animate || reducedMotion.matches || Math.abs(distance) < 1) {
      finish();
      return;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / DURATION, 1);

      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

      track.scrollLeft = start + distance * eased;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }

      animationFrame = null;
      finish();
    };

    animationFrame = requestAnimationFrame(tick);
  };

  /* =======================================================
     NAVIGATION
     ======================================================= */

  previous.disabled = count < 2;
  next.disabled = count < 2;

  previous.addEventListener("click", () => {
    moveTo(physicalIndex - 1);
  });

  next.addEventListener("click", () => {
    moveTo(physicalIndex + 1);
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      if (isAnimating || isSettling || index === currentIndex) return;

      const forward = wrap(index - currentIndex);
      const backward = wrap(currentIndex - index);

      if (Math.min(forward, backward) === 1) {
        moveTo(physicalIndex + (forward === 1 ? 1 : -1));
        return;
      }

      moveTo(firstOriginal + index, false);
    });
  });

  /* =======================================================
     MANUAL SCROLL
     ======================================================= */

  track.addEventListener("scrollend", () => {
    if (isAnimating || isSettling) return;

    physicalIndex = getClosestIndex();

    setSnap(false);

    const repositioned = normalize();
    settle(repositioned);
  });

  /* =======================================================
     RESIZE
     ======================================================= */

  window.addEventListener("resize", () => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    isAnimating = true;
    isSettling = true;

    track.classList.add("is-repositioning");

    physicalIndex = firstOriginal + currentIndex;

    updateUI();
    jumpTo(physicalIndex);

    void track.offsetWidth;

    settle(true);
  });

  /* =======================================================
     INITIAL STATE
     ======================================================= */

  track.classList.add("is-repositioning");

  jumpTo(physicalIndex);
  updateUI();

  void track.offsetWidth;

  settle(true);
});
