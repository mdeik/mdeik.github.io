/**
 * Fit-to-viewport functionality
 * Dynamically adjusts font size to ensure content fits within viewport on desktop
 * On mobile, allows natural scrolling and uses maximum font size
 */
(function fitToViewport() {
  const MIN_FONT = 10;
  const MAX_FONT = 18;
  const root = document.documentElement;
  const timeline = document.getElementById("timeline");
  const projectsTimeline = document.getElementById("projects-timeline");

  /**
   * Check if current viewport is mobile size
   * @returns {boolean} True if mobile breakpoint is matched
   */
  function isMobile() {
    return window.matchMedia("(max-width:560px)").matches;
  }

  /**
   * Adjust font size and scrolling behavior based on viewport
   */
  function adjust() {
    // On mobile, use max font and allow natural scrolling
    if (isMobile()) {
      root.style.setProperty("--base-font", MAX_FONT);
      if (timeline) timeline.style.overflow = "visible";
      if (projectsTimeline) projectsTimeline.style.overflow = "visible";
      return;
    }

    // Start with maximum font size
    root.style.setProperty("--base-font", MAX_FONT);

    requestAnimationFrame(() => {
      const fullHeight = document.documentElement.scrollHeight;
      const viewH = window.innerHeight;

      // If content already fits, keep max font size
      if (fullHeight <= viewH) {
        root.style.setProperty("--base-font", MAX_FONT);
        if (timeline) timeline.style.overflow = "auto";
        if (projectsTimeline) projectsTimeline.style.overflow = "auto";
        return;
      }

      // Scale font size based on viewport to content ratio
      const scale = viewH / fullHeight;
      const newFont = Math.max(
        MIN_FONT,
        Math.floor(MAX_FONT * Math.min(1, scale))
      );
      root.style.setProperty("--base-font", newFont);

      // Final check to ensure proper scrolling behavior
      requestAnimationFrame(() => {
        if (timeline) timeline.style.overflow = "auto";
        if (projectsTimeline) projectsTimeline.style.overflow = "auto";
      });
    });
  }

  // Set up event listeners for responsive adjustments
  window.addEventListener("load", adjust);
  window.addEventListener("resize", adjust);

  // Observe DOM changes that might affect layout
  const ro = new ResizeObserver(adjust);
  ro.observe(document.body);
})();

/**
 * Enhanced keyboard accessibility for interactive elements
 * Adds Enter/Space key support for chips and icon buttons
 */
document.querySelectorAll(".chip, .icon-btn").forEach((el) => {
  el.setAttribute("tabindex", "0");

  el.addEventListener("keydown", (e) => {
    // Trigger click on Enter or Space key
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click?.();

      // Visual feedback for keyboard activation
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 180);
    }
  });
});

/**
 * Fit-to-viewport functionality
 */
(function fitToViewport() {
  const MIN_FONT = 10; // Minimum font size in pixels
  const MAX_FONT = 18; // Maximum font size in pixels
  const root = document.documentElement;
  const timeline = document.getElementById("timeline");
  const projectsTimeline = document.getElementById("projects-timeline");

  function isMobile() {
    return window.matchMedia("(max-width:560px)").matches;
  }

  function adjust() {
    if (isMobile()) {
      root.style.setProperty("--base-font", MAX_FONT);
      if (timeline) timeline.style.overflow = "visible";
      if (projectsTimeline) projectsTimeline.style.overflow = "visible";
      return;
    }

    root.style.setProperty("--base-font", MAX_FONT);

    requestAnimationFrame(() => {
      const fullHeight = document.documentElement.scrollHeight;
      const viewH = window.innerHeight;
      if (fullHeight <= viewH) {
        root.style.setProperty("--base-font", MAX_FONT);
        if (timeline) timeline.style.overflow = "auto";
        if (projectsTimeline) projectsTimeline.style.overflow = "auto";
        return;
      }

      const scale = viewH / fullHeight;
      const newFont = Math.max(
        MIN_FONT,
        Math.floor(MAX_FONT * Math.min(1, scale))
      );
      root.style.setProperty("--base-font", newFont);

      requestAnimationFrame(() => {
        if (timeline) timeline.style.overflow = "auto";
        if (projectsTimeline) projectsTimeline.style.overflow = "auto";
      });
    });
  }

  window.addEventListener("load", adjust);
  window.addEventListener("resize", adjust);

  const ro = new ResizeObserver(adjust);
  ro.observe(document.body);
})();

/**
 * Enhanced keyboard accessibility for interactive elements
 */
document.querySelectorAll(".chip, .icon-btn").forEach((el) => {
  el.setAttribute("tabindex", "0");

  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click?.();
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 180);
    }
  });
});

/* ---------------- Read-more feature ----------------
   Keeps the Read more button while a paragraph is expanded so
   a resize/mutation check won't immediately remove it.
*/
(function addReadMoreFeature() {
  const CLAMPED_SELECTOR = ".job p";
  const CHECK_DEBOUNCE = 120;
  let resizeTimer = null;

  function ensureId(el) {
    if (!el.id) el.id = "desc-" + Math.random().toString(36).slice(2, 9);
    return el.id;
  }

  function isTruncated(p) {
    return p.scrollHeight > p.clientHeight + 1;
  }

  function createButton(id) {
    const wrap = document.createElement("div");
    wrap.className = "read-more-wrap";
    const btn = document.createElement("button");
    btn.className = "read-more-btn";
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", id);
    btn.textContent = "Read more";
    wrap.appendChild(btn);
    return { wrap, btn };
  }

  function setTimelineExpandedState(p, expanded) {
    const timeline = p.closest(".timeline");
    if (!timeline) return;
    if (expanded) {
      timeline.classList.add("expanded");
      timeline.style.overflow = "visible";
    } else {
      timeline.classList.remove("expanded");
      timeline.style.overflow = "";
    }
  }

  function processParagraph(p) {
    const parentJob = p.closest(".job") || p.parentElement;
    const existingWrap = parentJob.querySelector(".read-more-wrap");
    const truncated = isTruncated(p);

    if (truncated && !existingWrap) {
      const id = ensureId(p);
      const { wrap, btn } = createButton(id);
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        if (!expanded) {
          p.classList.add("expanded");
          btn.textContent = "Show less";
          btn.setAttribute("aria-expanded", "true");
          // make parent timeline allow visible overflow so layout adjusts
          setTimelineExpandedState(p, true);
          p.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          p.classList.remove("expanded");
          btn.textContent = "Read more";
          btn.setAttribute("aria-expanded", "false");
          setTimelineExpandedState(p, false);
          p.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(processAll, CHECK_DEBOUNCE);
      });
      parentJob.appendChild(wrap);
      return;
    }

    // If an existing button is present but not truncated and not expanded, remove it.
    if (existingWrap && !truncated && !p.classList.contains("expanded")) {
      existingWrap.remove();
      p.classList.remove("expanded");
      setTimelineExpandedState(p, false);
    }

    // If paragraph is expanded but the timeline lost the state (rare), reapply
    if (p.classList.contains("expanded")) {
      setTimelineExpandedState(p, true);
    }
  }

  function processAll() {
    document.querySelectorAll(CLAMPED_SELECTOR).forEach(processParagraph);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      setTimeout(processAll, 10)
    );
  } else {
    setTimeout(processAll, 10);
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(processAll, CHECK_DEBOUNCE);
  });

  const timelines = document.querySelectorAll("#timeline, #projects-timeline");
  timelines.forEach((tl) => {
    const mo = new MutationObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(processAll, CHECK_DEBOUNCE);
    });
    mo.observe(tl, { childList: true, subtree: true, characterData: true });
  });
})();
