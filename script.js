(function main() {
  // config
  const MIN_FONT = 10;
  const MAX_FONT = 18;
  const MOBILE_BREAKPOINT = "(max-width:560px)";

  // cached elements
  const root = document.documentElement;
  const timelineEl = document.getElementById("timeline");
  const projectsTimelineEl = document.getElementById("projects-timeline");

  // simple helpers
  function isMobile() {
    return window.matchMedia(MOBILE_BREAKPOINT).matches;
  }

  // reset page + optional element scroll to top (iOS-friendly)
  function resetScrollTop(...els) {
    requestAnimationFrame(() => {
      try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch { window.scrollTo(0, 0); }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      els.forEach((el) => { if (el) el.scrollTop = 0; });

      // reapply after a short delay for flaky rendering on some browsers
      setTimeout(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        els.forEach((el) => { if (el) el.scrollTop = 0; });
      }, 50);
    });
  }

  // adjust base font so content fits (desktop); toggle timeline overflow
  function adjustFontAndOverflow() {
    if (isMobile()) {
      root.style.setProperty("--base-font", `${MAX_FONT}px`);
      if (timelineEl) timelineEl.style.overflow = "visible";
      if (projectsTimelineEl) projectsTimelineEl.style.overflow = "visible";
      scheduleProcessAll();
      return;
    }

    root.style.setProperty("--base-font", `${MAX_FONT}px`);

    requestAnimationFrame(() => {
      const contentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      if (contentHeight <= viewportHeight) {
        root.style.setProperty("--base-font", `${MAX_FONT}px`);
        if (timelineEl) timelineEl.style.overflow = "auto";
        if (projectsTimelineEl) projectsTimelineEl.style.overflow = "auto";
        resetScrollTop(timelineEl, projectsTimelineEl);
        scheduleProcessAll();
        return;
      }

      const scale = viewportHeight / contentHeight;
      const scaled = Math.max(MIN_FONT, Math.floor(MAX_FONT * Math.min(1, scale)));
      root.style.setProperty("--base-font", `${scaled}px`);

      requestAnimationFrame(() => {
        if (timelineEl) timelineEl.style.overflow = "auto";
        if (projectsTimelineEl) projectsTimelineEl.style.overflow = "auto";
        resetScrollTop(timelineEl, projectsTimelineEl);
        scheduleProcessAll();
      });
    });
  }

  // read-more handling for truncated .job p
  const CLAMPED_SELECTOR = ".job p";
  const CHECK_DEBOUNCE = 120;
  let debounceTimer = null;

  function isTruncated(p) {
    return p.scrollHeight > p.clientHeight + 1;
  }

  function ensureId(el) {
    if (!el.id) el.id = "desc-" + Math.random().toString(36).slice(2, 9);
    return el.id;
  }

  function createReadMoreButton(id) {
    const wrap = document.createElement("div");
    wrap.className = "read-more-wrap";
    const btn = document.createElement("button");
    btn.className = "read-more-btn";
    btn.type = "button";
    btn.setAttribute("aria-controls", id);
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "Read more";
    wrap.appendChild(btn);
    return { wrap, btn };
  }

  function setTimelineExpandedState(paragraph, expanded) {
    const tl = paragraph.closest(".timeline");
    if (!tl) return;
    if (expanded) {
      tl.classList.add("expanded");
      tl.style.overflow = "visible";
    } else {
      tl.classList.remove("expanded");
      tl.style.overflow = "";
      resetScrollTop(tl);
    }
  }

  function processParagraph(p) {
    const container = p.closest(".job") || p.parentElement;
    const existing = container.querySelector(".read-more-wrap");
    const truncated = isTruncated(p);

    if (truncated && !existing) {
      const id = ensureId(p);
      const { wrap, btn } = createReadMoreButton(id);

      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        if (!expanded) {
          p.classList.add("expanded");
          btn.textContent = "Show less";
          btn.setAttribute("aria-expanded", "true");
          setTimelineExpandedState(p, true);
          p.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          p.classList.remove("expanded");
          btn.textContent = "Read more";
          btn.setAttribute("aria-expanded", "false");
          setTimelineExpandedState(p, false);
          p.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        scheduleProcessAll();
      });

      container.appendChild(wrap);
      return;
    }

    if (existing && !truncated && !p.classList.contains("expanded")) {
      existing.remove();
      p.classList.remove("expanded");
      setTimelineExpandedState(p, false);
    }

    if (p.classList.contains("expanded")) setTimelineExpandedState(p, true);
  }

  function processAll() {
    document.querySelectorAll(CLAMPED_SELECTOR).forEach(processParagraph);
  }

  function scheduleProcessAll() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processAll, CHECK_DEBOUNCE);
  }

  // watch timeline containers for changes
  function observeTimelines() {
    const timelines = document.querySelectorAll("#timeline, #projects-timeline");
    timelines.forEach((tl) => {
      const mo = new MutationObserver(scheduleProcessAll);
      mo.observe(tl, { childList: true, subtree: true, characterData: true });
    });
  }

  // keyboard support for small interactive elements
  function wireKeyboardAccessibility() {
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
  }

  // init
  window.addEventListener("load", adjustFontAndOverflow);
  window.addEventListener("resize", adjustFontAndOverflow);
  const ro = new ResizeObserver(adjustFontAndOverflow);
  ro.observe(document.body);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      processAll();
      observeTimelines();
      wireKeyboardAccessibility();
    });
  } else {
    processAll();
    observeTimelines();
    wireKeyboardAccessibility();
  }
})();
