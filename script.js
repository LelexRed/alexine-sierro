// ✅ Run everything AFTER the HTML is loaded
window.addEventListener("DOMContentLoaded", () => {
  // -----------------
  // Default section = WORK when arriving on the site
  // Only if there is NO hash at all
  // -----------------
  if (!location.hash || location.hash === "#/" || location.hash === "#") {
    location.hash = "#/work";
  }

  const sectionLinks = document.querySelectorAll("[data-section]");
  const contentBlocks = document.querySelectorAll("[data-content]");

  let workPreviewsReady = false;

  function hideAllContent() {
    contentBlocks.forEach((b) => b.classList.remove("visible"));
  }

  function clearActiveLinks() {
    sectionLinks.forEach((l) => l.classList.remove("active"));
  }

  function setSection(section) {
    clearActiveLinks();
    hideAllContent();

    const link = document.querySelector(`[data-section="${section}"]`);
    const target = document.querySelector(`[data-content="${section}"]`);

    link?.classList.add("active");
    target?.classList.add("visible");

    if (section === "work" && !workPreviewsReady) {
      setupInlineWorkPreviews();
      workPreviewsReady = true;
    }
  }

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    const part = raw.split("/")[0];
    return part || "";
  }

  function handleRoute() {
    const section = parseHash();

    if (section === "work" || section === "about" || section === "cv") {
      setSection(section);
    } else {
      // empty state
      clearActiveLinks();
      hideAllContent();
    }
  }

  // -----------------
  // LIGHTBOX (project pages only)
  // -----------------
  (function setupLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return; // ✅ not on project page

    const lbImg = lightbox.querySelector(".lightbox-img");
    if (!lbImg) return;

    function openLightbox(src, alt = "") {
      lbImg.src = src;
      lbImg.alt = alt;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      lbImg.src = "";
    }

    // Click on any project image (hero + gallery) opens
    document.addEventListener("click", (e) => {
      const img = e.target.closest(".project-hero img, .project-gallery img");
      if (!img) return;

      // If already open, do nothing
      if (lightbox.classList.contains("is-open")) return;

      openLightbox(img.currentSrc || img.src, img.alt || "");
    });

    // ✅ Click ANYWHERE in the lightbox closes (including on the image)
    lightbox.addEventListener("click", () => {
      closeLightbox();
    });

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  })();

  // -----------------
  // Menu clicks
  // -----------------
  sectionLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;

      // If already active → go to empty state
      if (link.classList.contains("active")) {
        location.hash = ""; // empty state
        clearActiveLinks();
        hideAllContent();
        return;
      }

      // Otherwise open normally
      location.hash = `#/${section}`;
    });
  });

  window.addEventListener("hashchange", handleRoute);

  // -----------------
  // Inline work previews
  // -----------------
  function setupInlineWorkPreviews() {
    const workPanel = document.querySelector('[data-content="work"]');
    if (!workPanel) return;

    const items = workPanel.querySelectorAll(".work-item");
    const previews = workPanel.querySelectorAll(".work-preview");

    // Preload
    const preload = new Set();
    items.forEach((item) => {
      const src = item.dataset.preview;
      if (!src || preload.has(src)) return;
      preload.add(src);
      const im = new Image();
      im.decoding = "async";
      im.src = src;
    });

    function applyOrientationClass(imgEl) {
      imgEl.classList.remove("is-landscape");
      if (imgEl.naturalWidth > imgEl.naturalHeight) {
        imgEl.classList.add("is-landscape");
      }
    }

    function closePreview(previewRow) {
      const spacer = previewRow.querySelector(".preview-spacer");
      if (!spacer) return;

      if (!previewRow.classList.contains("is-open")) return;

      spacer.style.height = spacer.scrollHeight + "px";
      spacer.offsetHeight; // reflow

      previewRow.classList.remove("is-open");
      spacer.style.height = "0px";

      const onEnd = (e) => {
        if (e.propertyName !== "height") return;
        spacer.removeEventListener("transitionend", onEnd);
      };

      spacer.addEventListener("transitionend", onEnd);
    }

    function closeAllPreviews() {
      previews.forEach((p) => closePreview(p));
    }

    function openPreview(previewRow, img, src) {
      const spacer = previewRow.querySelector(".preview-spacer");
      if (!spacer) return;

      previewRow.classList.add("is-open");
      spacer.style.height = "0px";

      img.classList.remove("is-landscape");

      if (src) img.src = src;

      const setHeight = () => {
        requestAnimationFrame(() => {
          spacer.style.height = spacer.scrollHeight + "px";
        });
      };

      const onReady = () => {
        applyOrientationClass(img);
        setHeight();
      };

      if (img.complete && img.naturalWidth) {
        onReady();
      } else {
        img.onload = onReady;
      }
    }

    items.forEach((item) => {
      const previewSrc = item.dataset.preview;
      const href = item.dataset.href;

      const previewRow = item.nextElementSibling;
      const img = previewRow?.querySelector(".preview-inline-img");

      if (!previewRow || !previewRow.classList.contains("work-preview")) return;
      if (!img) return;

      item.addEventListener("mouseenter", () => {
        closeAllPreviews();
        openPreview(previewRow, img, previewSrc);
      });

      item.addEventListener("click", () => {
        if (href) window.location.href = href;
      });

      img.addEventListener("click", (e) => {
        e.stopPropagation();
        if (href) window.location.href = href;
      });
    });

    workPanel.addEventListener("mouseleave", () => {
      closeAllPreviews();
    });
  }

  // -----------------
  // Init
  // -----------------
  handleRoute();
});
