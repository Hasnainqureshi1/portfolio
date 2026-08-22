(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mobileAppLayout = window.matchMedia("(max-width: 760px)").matches;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const intro = document.querySelector("[data-intro]");
  const introOutput = intro?.querySelector("output");
  const introSeen = sessionStorage.getItem("hq-intro-seen") === "1";

  const finishIntro = () => {
    if (!intro || intro.classList.contains("is-complete")) return;
    intro.style.setProperty("--load", "100%");
    if (introOutput) introOutput.textContent = "100%";
    intro.classList.add("is-complete");
    sessionStorage.setItem("hq-intro-seen", "1");
  };

  if (intro) {
    if (reducedMotion || introSeen) {
      finishIntro();
    } else {
      const startedAt = performance.now();
      const duration = 820;
      const animateIntro = (now) => {
        const progress = clamp((now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const percent = Math.round(eased * 100);
        intro.style.setProperty("--load", `${percent}%`);
        if (introOutput) introOutput.textContent = `${percent}%`;
        if (progress < 1) {
          requestAnimationFrame(animateIntro);
        } else {
          window.setTimeout(finishIntro, 120);
        }
      };
      requestAnimationFrame(animateIntro);
      window.setTimeout(finishIntro, 1300);
    }
  }

  const topbar = document.querySelector(".topbar");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const topnav = document.querySelector("[data-nav]");
  const mobileDock = document.querySelector(".mobile-dock");

  const closeMenu = () => {
    topnav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = !topnav?.classList.contains("is-open");
    topnav?.classList.toggle("is-open", willOpen);
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", willOpen);
  });

  topnav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  mobileDock?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const textRevealSelectors = [
    ".hero__copy > *",
    ".hero__edge > *",
    ".proof-strip > span",
    ".word-bridge__intro > *",
    ".word-bridge__path > li",
    ".manifesto__label",
    ".manifesto__copy h2",
    ".manifesto__aside > *",
    ".manifesto__ledger > span",
    ".section-intro > *",
    ".case__copy > *",
    ".more-work > *",
    ".stack-story__head > *",
    ".stack-chapter > *",
    ".stack-proof > *",
    ".stack-cta",
    ".process__intro > *",
    ".process__steps > li",
    ".process__cta > *",
    ".experience__head > *",
    ".role > *",
    ".contact__intro > *",
    ".contact__promise > *",
    ".contact__links > *",
    ".contact-form > *",
    ".footer > *"
  ];
  const textRevealItems = [...new Set(document.querySelectorAll(textRevealSelectors.join(",")))].filter(
    (item) => !(mobileAppLayout && item.closest(".case__copy"))
  );

  textRevealItems.forEach((item, index) => {
    item.classList.add("scroll-text");
    item.style.setProperty("--text-delay", `${(index % 4) * 65}ms`);

    if (item.matches("h1, h2, h3, .manifesto__copy, .case__title")) {
      item.classList.add("scroll-text--heading");
    } else if (item.matches(".eyebrow, small, .case__meta, .case__result, .manifesto__label")) {
      item.classList.add("scroll-text--meta");
    }
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    textRevealItems.forEach((item) => item.classList.add("is-text-visible"));
  } else {
    const textRevealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-text-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px 6% 0px" }
    );
    textRevealItems.forEach((item) => textRevealObserver.observe(item));
  }

  const sections = [...document.querySelectorAll("[data-section][id]")];
  const navLinks = [...document.querySelectorAll('.topnav a[href^="#"], .mobile-dock a[href^="#"]')];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.hash === `#${visible.target.id}`);
        });
      },
      { threshold: 0, rootMargin: "-24% 0px -68% 0px" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const heroStage = document.querySelector("[data-depth-stage]");
  const depthLayers = heroStage ? [...heroStage.querySelectorAll("[data-depth]")] : [];

  if (heroStage && finePointer && !reducedMotion) {
    let pointerFrame = 0;
    let targetX = 0;
    let targetY = 0;

    const paintDepth = () => {
      pointerFrame = 0;
      depthLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0);
        layer.style.setProperty("--depth-x", `${(targetX * depth).toFixed(2)}px`);
        layer.style.setProperty("--depth-y", `${(targetY * depth).toFixed(2)}px`);
      });
    };

    heroStage.addEventListener(
      "pointermove",
      (event) => {
        const rect = heroStage.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 22;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
        if (!pointerFrame) pointerFrame = requestAnimationFrame(paintDepth);
      },
      { passive: true }
    );

    heroStage.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(paintDepth);
    });
  }

  const projectCases = [...document.querySelectorAll("[data-case]")];
  let scrollFrame = 0;

  const paintScroll = () => {
    scrollFrame = 0;
    topbar?.classList.toggle("is-scrolled", window.scrollY > 22);
    const viewport = window.innerHeight;

    if (!reducedMotion) {
      projectCases.forEach((project) => {
        const rect = project.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > viewport + 120) return;

        const progress = clamp((viewport - rect.top) / (viewport + rect.height));
        const shift = (0.5 - progress) * 34;
        project.style.setProperty("--case-shift", `${shift.toFixed(1)}px`);
      });
    }
  };

  const scheduleScrollPaint = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll);
  };

  window.addEventListener("scroll", scheduleScrollPaint, { passive: true });
  window.addEventListener("resize", scheduleScrollPaint, { passive: true });
  paintScroll();

  const stackStory = document.querySelector("[data-stack-story]");
  const stackVisual = stackStory?.querySelector(".stack-visual");
  const stackChapters = stackStory ? [...stackStory.querySelectorAll("[data-stack-index]")] : [];
  const stackStatus = stackStory?.querySelector("[data-stack-status]");
  const stackLabels = [
    "01 / INTERFACE",
    "02 / API + AUTH",
    "03 / REALTIME + DATA",
    "04 / RELEASE"
  ];

  const setActiveStack = (index) => {
    const safeIndex = clamp(index, 0, stackChapters.length - 1);
    stackStory?.setAttribute("data-stack-active", String(safeIndex));
    stackChapters.forEach((chapter, chapterIndex) => {
      chapter.classList.toggle("is-active", chapterIndex === safeIndex);
    });
    stackStory?.querySelectorAll(".stack-console__rail span").forEach((item, itemIndex) => {
      item.classList.toggle("is-current", itemIndex === safeIndex);
    });
    if (stackStatus) stackStatus.textContent = stackLabels[safeIndex] || stackLabels[0];
  };

  setActiveStack(0);

  if (stackChapters.length && "IntersectionObserver" in window) {
    const stackObserver = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!activeEntry) return;
        setActiveStack(Number(activeEntry.target.dataset.stackIndex));
      },
      { threshold: [0.3, 0.48, 0.62], rootMargin: "-18% 0px -32% 0px" }
    );
    stackChapters.forEach((chapter) => stackObserver.observe(chapter));
  }

  if (stackVisual && finePointer && !reducedMotion) {
    let stackFrame = 0;
    let stackX = 0;
    let stackY = 0;

    const paintStack = () => {
      stackFrame = 0;
      stackVisual.style.setProperty("--stack-px", stackX.toFixed(3));
      stackVisual.style.setProperty("--stack-py", stackY.toFixed(3));
    };

    stackVisual.addEventListener(
      "pointermove",
      (event) => {
        const rect = stackVisual.getBoundingClientRect();
        stackX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        stackY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        if (!stackFrame) stackFrame = requestAnimationFrame(paintStack);
      },
      { passive: true }
    );

    stackVisual.addEventListener("pointerleave", () => {
      stackX = 0;
      stackY = 0;
      if (!stackFrame) stackFrame = requestAnimationFrame(paintStack);
    });
  }

  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".tilt-panel").forEach((panel) => {
      let tiltFrame = 0;
      let rotateX = 0;
      let rotateY = 0;

      const paintTilt = () => {
        tiltFrame = 0;
        panel.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`;
      };

      panel.addEventListener(
        "pointermove",
        (event) => {
          const rect = panel.getBoundingClientRect();
          rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 3.6;
          rotateX = -((event.clientY - rect.top) / rect.height - 0.5) * 3.2;
          if (!tiltFrame) tiltFrame = requestAnimationFrame(paintTilt);
        },
        { passive: true }
      );

      panel.addEventListener("pointerleave", () => {
        rotateX = 0;
        rotateY = 0;
        if (!tiltFrame) tiltFrame = requestAnimationFrame(paintTilt);
      });
    });

    document.querySelectorAll(".magnetic").forEach((element) => {
      let magneticFrame = 0;
      let translateX = 0;
      let translateY = 0;

      const paintMagnetic = () => {
        magneticFrame = 0;
        element.style.translate = `${translateX.toFixed(1)}px ${translateY.toFixed(1)}px`;
      };

      element.addEventListener(
        "pointermove",
        (event) => {
          const rect = element.getBoundingClientRect();
          translateX = (event.clientX - rect.left - rect.width / 2) * 0.12;
          translateY = (event.clientY - rect.top - rect.height / 2) * 0.12;
          if (!magneticFrame) magneticFrame = requestAnimationFrame(paintMagnetic);
        },
        { passive: true }
      );

      element.addEventListener("pointerleave", () => {
        translateX = 0;
        translateY = 0;
        if (!magneticFrame) magneticFrame = requestAnimationFrame(paintMagnetic);
      });
    });
  }

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.closest(".case__media")?.classList.add("has-image-error");
        image.hidden = true;
      },
      { once: true }
    );
  });

  const contactForm = document.querySelector("#contactForm");
  const contactStatus = document.querySelector("#contactStatus");

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (contactStatus) contactStatus.textContent = "Sending your project brief...";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Form submission failed");
      contactForm.reset();
      if (contactStatus) {
        contactStatus.textContent =
          "Thanks — your message is on its way. I will reply personally.";
      }
    } catch (error) {
      if (contactStatus) {
        contactStatus.innerHTML =
          'The form could not send. Email <a href="mailto:husnainqureshi134@gmail.com">husnainqureshi134@gmail.com</a> directly.';
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
})();
