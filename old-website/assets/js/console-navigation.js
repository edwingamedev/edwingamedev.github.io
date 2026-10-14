document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("consolePages");

  if (!container) return;

  const pages = [...container.querySelectorAll(".console-page")];
  const links = [...document.querySelectorAll(".nav-button")];

  const navigationLinks = [...document.querySelectorAll('a[href^="#console-"]')];
  const indicators = [...document.querySelectorAll(".page-indicator")];

  if (pages.length === 0) return;

  const TRANSITION_DURATION = 300;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let animationFrame = null;
  let isNavigating = false;
  let scrollFrame = null;

  const getPagePosition = (page) => page.offsetLeft - container.offsetLeft;

  const getClosestPage = () =>
    pages.reduce(
      (closest, page) => {
        const distance = Math.abs(getPagePosition(page) - container.scrollLeft);

        return distance < closest.distance ? { page, distance } : closest;
      },
      { page: pages[0], distance: Infinity }
    ).page;

  const updateActive = (page) => {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${page.id}`;

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    indicators.forEach((indicator) => {
      const isActive = indicator.dataset.page === page.id;

      if (isActive) {
        indicator.setAttribute("aria-current", "location");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });

    indicators.forEach((indicator) => {
      const page = pages.find((item) => item.id === indicator.dataset.page);

      if (!page) return;

      indicator.addEventListener("click", () => {
        activate(page);

        const hash = `#${page.id}`;

        if (window.location.hash !== hash) {
          history.pushState(null, "", hash);
        }
      });
    });
  };

  const syncLocation = () => {
    const page = getClosestPage();
    const hash = `#${page.id}`;

    updateActive(page);

    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  };

  const stopAnimation = () => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    container.style.scrollSnapType = "";
    isNavigating = false;
  };

  const activate = (page, animate = true) => {
    stopAnimation();
    updateActive(page);

    const start = container.scrollLeft;
    const target = getPagePosition(page);
    const distance = target - start;

    if (!animate || reducedMotion.matches || distance === 0) {
      container.scrollLeft = target;
      return;
    }

    isNavigating = true;
    container.style.scrollSnapType = "none";

    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / TRANSITION_DURATION, 1);

      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

      container.scrollLeft = start + distance * eased;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }

      container.scrollLeft = target;
      container.style.scrollSnapType = "";

      animationFrame = null;
      isNavigating = false;

      updateActive(page);
    };

    animationFrame = requestAnimationFrame(tick);
  };

  navigationLinks.forEach((link) => {
    const page = pages.find((item) => `#${item.id}` === link.getAttribute("href"));

    if (!page) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();

      activate(page);

      if (window.location.hash !== `#${page.id}`) {
        history.pushState(null, "", `#${page.id}`);
      }
    });
  });

  container.addEventListener(
    "scroll",
    () => {
      if (isNavigating || scrollFrame !== null) return;

      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;

        if (!isNavigating) {
          updateActive(getClosestPage());
        }
      });
    },
    { passive: true }
  );

  container.addEventListener("scrollend", () => {
    if (isNavigating) return;

    syncLocation();
  });

  const restoreLocation = () => {
    const page = pages.find((item) => `#${item.id}` === window.location.hash);

    activate(page || pages[0], false);
  };

  window.addEventListener("popstate", restoreLocation);
  window.addEventListener("hashchange", restoreLocation);

  restoreLocation();
});
