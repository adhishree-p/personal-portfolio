/* ============================================================
   Adhishree Patil — Portfolio
   Vanilla JavaScript, no libraries.

   Contents:
   1.  Helpers
   2.  Footer year
   3.  Header scroll state
   4.  Mobile navigation
   5.  Scroll reveal (IntersectionObserver)
   6.  Skills ticker (duplicate track for seamless loop)
   7.  About terminal typing effect
   8.  Neural-network background canvas
   9.  Project-card cursor glow
   10. Copy-email button
   ============================================================ */

"use strict";

/* ------------------------------------------------------------
   1. Helpers
   ------------------------------------------------------------ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   2. Footer year — always current
   ------------------------------------------------------------ */
const yearEl = $("#footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ------------------------------------------------------------
   3. Header — frosted glass once the page is scrolled
   ------------------------------------------------------------ */
const header = $("#site-header");

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}
updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

/* ------------------------------------------------------------
   4. Mobile navigation (hamburger)
   ------------------------------------------------------------ */
const navToggle = $("#nav-toggle");
const navLinks  = $("#nav-links");

if (navToggle && navLinks) {
  const setMenuOpen = (open) => {
    navLinks.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  };

  navToggle.addEventListener("click", () => {
    setMenuOpen(!navLinks.classList.contains("is-open"));
  });

  // Close after tapping a link
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenuOpen(false);
  });

  // Close when clicking outside the nav bar
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("is-open") && !e.target.closest(".nav")) {
      setMenuOpen(false);
    }
  });

  // Close with Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });
}

/* ------------------------------------------------------------
   5. Scroll reveal — fade/slide sections in as they appear
   ------------------------------------------------------------ */
const revealEls = $$(".reveal");

if (revealEls.length) {
  if (REDUCED_MOTION) {
    // Show everything immediately when animations are disabled
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // reveal only once
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }
}

/* ------------------------------------------------------------
   6. Skills ticker — clone the sequence for a seamless loop.
      The CSS animates the track to -50%, so the track must
      contain exactly two copies of the same content.
   ------------------------------------------------------------ */
const tickerTrack = $(".ticker__track");
if (tickerTrack) {
  const seq = tickerTrack.querySelector(".ticker__seq");
  if (seq) tickerTrack.appendChild(seq.cloneNode(true));
}

/* ------------------------------------------------------------
   7. About terminal — playful typing effect
   ------------------------------------------------------------ */
const terminalCode = $("#terminal-code");

if (terminalCode) {
  const LINES = [
    { text: "$ whoami", cmd: true },
    { text: "Adhishree Patil — engineering student, professional question-asker" },
    { text: "$ cat interests.txt", cmd: true },
    { text: "machine learning · artificial intelligence · dsa · clean code" },
    { text: "$ uptime --curiosity", cmd: true },
    { text: "3rd year @ Vidyalankar · curiosity at 100%, always on" },
    { text: "$ make future", cmd: true },
    { text: "compiling… ▓▓▓▓▓▓░░░ 71% — check back soon" },
  ];

  const COMMAND_COLOR = "#e879f9";

  const renderInstantly = () => {
    terminalCode.textContent = LINES.map((l) => l.text).join("\n");
  };

  const typeLine = (line, done) => {
    const span = document.createElement("span");
    if (line.cmd) span.style.color = COMMAND_COLOR;
    terminalCode.appendChild(span);

    let i = 0;
    const tick = () => {
      // Type a few characters per frame for a natural rhythm
      span.textContent = line.text.slice(0, i + 2);
      i += 2;
      if (i < line.text.length) {
        setTimeout(tick, 24);
      } else {
        span.textContent = line.text;
        terminalCode.appendChild(document.createTextNode("\n"));
        setTimeout(done, 320);
      }
    };
    tick();
  };

  const typeAll = (index = 0) => {
    if (index >= LINES.length) return; // done — cursor keeps blinking
    typeLine(LINES[index], () => typeAll(index + 1));
  };

  if (REDUCED_MOTION) {
    renderInstantly();
  } else {
    // Start typing the first time the terminal scrolls into view
    const once = new IntersectionObserver(
      (entries, observer) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          typeAll();
        }
      },
      { threshold: 0.3 }
    );
    once.observe(terminalCode.closest(".terminal"));
  }
}

/* ------------------------------------------------------------
   8. Neural-network background canvas
      Lightweight constellation of drifting nodes connected by
      lines — pure canvas, no libraries. Pauses when the tab is
      hidden and renders a single static frame if the visitor
      prefers reduced motion.
   ------------------------------------------------------------ */
const canvas = $("#neural-canvas");

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");
  const LINK_DIST = 130;           // max distance at which nodes connect
  let nodes = [];
  let width = 0;
  let height = 0;
  let rafId = null;
  const mouse = { x: null, y: null };

  const buildNodes = () => {
    // Scale node count with viewport area (capped for performance)
    const count = Math.min(90, Math.round((width * height) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
    }));
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width  = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width  = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    buildNodes();
    if (REDUCED_MOTION) drawFrame(true); // one static frame, no loop
  };

  const drawFrame = (staticFrame = false) => {
    ctx.clearRect(0, 0, width, height);

    if (!staticFrame) {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // Bounce softly off the edges
        if (n.x < 0 || n.x > width)  n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
    }

    // Connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.28;
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`; // violet
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Brighter pink links from the cursor to nearby nodes
    if (mouse.x !== null) {
      for (const n of nodes) {
        const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (dist < LINK_DIST * 1.25) {
          const alpha = (1 - dist / (LINK_DIST * 1.25)) * 0.5;
          ctx.strokeStyle = `rgba(251, 113, 133, ${alpha})`; // pink
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // The nodes themselves
    for (const n of nodes) {
      ctx.fillStyle = "rgba(216, 180, 254, 0.85)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = () => {
    drawFrame();
    rafId = requestAnimationFrame(loop);
  };

  // Track the cursor so nodes can "reach out" to it
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  // Save battery: pause the loop when the tab is not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!REDUCED_MOTION && rafId === null) {
      rafId = requestAnimationFrame(loop);
    }
  });

  // Debounced resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  if (!REDUCED_MOTION) rafId = requestAnimationFrame(loop);
}

/* ------------------------------------------------------------
   9. Project cards — soft gradient glow that follows the cursor
      (sets --mx / --my custom properties used by the CSS)
   ------------------------------------------------------------ */
const glowCards = $$(".project-card");

if (glowCards.length && !REDUCED_MOTION && window.matchMedia("(pointer: fine)").matches) {
  glowCards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

/* ------------------------------------------------------------
   10. Copy-email button (with fallback for older browsers)
   ------------------------------------------------------------ */
const copyBtn  = $("#copy-email");
const copyNote = $("#copy-note");
const copyLbl  = $("#copy-email-label");

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.email || "";
    let copied = false;

    // Preferred path — modern Clipboard API
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(email);
        copied = true;
      }
    } catch {
      copied = false;
    }

    // Fallback — hidden textarea + execCommand
    if (!copied) {
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { copied = document.execCommand("copy"); } catch { copied = false; }
      ta.remove();
    }

    if (copyNote) {
      copyNote.textContent = copied
        ? "→ copied to clipboard ✓"
        : `→ couldn't copy automatically — it's ${email}`;
      setTimeout(() => { copyNote.textContent = ""; }, 3200);
    }
    if (copyLbl) {
      copyLbl.textContent = copied ? "Copied ✓" : "Copy email address";
      setTimeout(() => { copyLbl.textContent = "Copy email address"; }, 3200);
    }
  });
}

/* ------------------------------------------------------------
   11. Certificate lightbox
       Opens the full-size certificate image in an accessible modal:
       Escape / backdrop / × to close, focus is trapped while open.
   ------------------------------------------------------------ */
const lightbox = $("#lightbox");

if (lightbox) {
  const lbImg   = $("#lightbox-img");
  const lbTitle = $("#lightbox-title");
  const lbClose = lightbox.querySelector(".lightbox__close");
  let lastFocused = null;

  const openLightbox = (trigger) => {
    lastFocused = document.activeElement;
    lbImg.src = trigger.dataset.full || "";
    lbImg.alt = trigger.getAttribute("aria-label") || trigger.dataset.title || "Certificate";
    lbTitle.textContent = trigger.dataset.title || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden"; // lock page scroll while open
    lbClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lbImg.src = ""; // free memory
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  // One delegated listener handles every open/close trigger
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-lightbox-open]");
    if (opener) {
      openLightbox(opener);
      return;
    }
    if (e.target.closest("[data-lightbox-close]")) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;

    if (e.key === "Escape") {
      closeLightbox();
      return;
    }
    // Simple focus trap: the close button is the only focusable element
    if (e.key === "Tab") {
      e.preventDefault();
      lbClose.focus();
    }
  });
}
