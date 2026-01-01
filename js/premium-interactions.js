(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  // ---------- Card Tilt (glass)
  const cards = document.querySelectorAll(".scroll-3d, .project_card, .stack_card, .service_card, .process_card, .resume_card, .experience_card");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  cards.forEach((card) => {
    let raf = 0;
    let active = false;

    const onMove = (e) => {
      if (!active) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;   // 0..1
      const y = (e.clientY - r.top) / r.height;   // 0..1

      const rx = clamp((0.5 - y) * 12, -10, 10);  // rotateX
      const ry = clamp((x - 0.5) * 14, -12, 12);  // rotateY

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.setProperty("--rx", rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", ry.toFixed(2) + "deg");
        card.style.setProperty("--mx", (x * 100).toFixed(2) + "%");
        card.style.setProperty("--my", (y * 100).toFixed(2) + "%");
        card.classList.add("is-tilting");
      });
    };

    const onEnter = () => {
      active = true;
      card.classList.add("tilt-ready");
    };

    const onLeave = () => {
      active = false;
      card.classList.remove("is-tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    };

    card.addEventListener("pointerenter", onEnter, { passive: true });
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave, { passive: true });
  });

  // ---------- Magnetic buttons (subtle)
  const mags = document.querySelectorAll(".btn, .nav_cta");
  mags.forEach((btn) => {
    let raf = 0;
    const strength = btn.classList.contains("nav_cta") ? 10 : 14;

    const reset = () => {
      btn.style.transform = "";
      btn.style.setProperty("--bx", "50%");
      btn.style.setProperty("--by", "50%");
      btn.classList.remove("btn-live");
    };

    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;

      const tx = (x - 0.5) * strength;
      const ty = (y - 0.5) * strength;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        btn.classList.add("btn-live");
        btn.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
        btn.style.setProperty("--bx", (x * 100).toFixed(2) + "%");
        btn.style.setProperty("--by", (y * 100).toFixed(2) + "%");
      });
    }, { passive: true });

    btn.addEventListener("pointerleave", reset, { passive: true });
  });

  // ---------- Cursor Spotlight (luxury lighting)
  const spot = document.createElement("div");
  spot.className = "cursor-spotlight";
  document.body.appendChild(spot);

  let sx = innerWidth * 0.5, sy = innerHeight * 0.3;
  let tx = sx, ty = sy;

  addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  const tick = () => {
    sx += (tx - sx) * 0.12;
    sy += (ty - sy) * 0.12;
    spot.style.setProperty("--x", `${sx}px`);
    spot.style.setProperty("--y", `${sy}px`);
    requestAnimationFrame(tick);
  };
  tick();
})();
