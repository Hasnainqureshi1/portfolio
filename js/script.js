const revealElements = document.querySelectorAll(".reveal");
const canGsapScroll = Boolean(window.gsap && window.ScrollTrigger);
const parallaxElements = document.querySelectorAll(".parallax");

const revealOnScroll = () => {
  if (canGsapScroll) return;
  revealElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      if (!element.dataset.revealSet) {
        element.dataset.revealSet = "true";
        element.classList.add(index % 2 === 0 ? "from-left" : "from-right");
      }
      element.classList.add("is-visible");
    }
  });
};

window.addEventListener("load", revealOnScroll);
window.addEventListener("scroll", revealOnScroll);

const initScrollGsap = () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".scroll-in").forEach((element) => {
    gsap.fromTo(
      element,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        clearProps: "transform",
        immediateRender: false,
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  gsap.utils.toArray(".scroll-3d").forEach((element) => {
    gsap.fromTo(
      element,
      { autoAlpha: 0, y: 70, z: -80, rotateX: 18, rotateY: -12, transformPerspective: 1100 },
      {
        autoAlpha: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 1.35,
        ease: "power3.out",
        clearProps: "transform",
        immediateRender: false,
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  gsap.utils.toArray(".stack_grid, .service_grid, .project_grid, .experience_grid, .reviews_track").forEach((grid) => {
    const items = grid.children;
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 60, z: -60, rotateX: 14, transformPerspective: 1100 },
      {
        autoAlpha: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        duration: 1.25,
        ease: "power3.out",
        stagger: 0.14,
        clearProps: "transform",
        immediateRender: false,
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  gsap.utils.toArray(".section-divider").forEach((divider) => {
    const path = divider.querySelector("path");
    gsap.fromTo(
      divider,
      { autoAlpha: 0, y: 24, rotateX: 22, transformPerspective: 900 },
      {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: divider,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );
    if (path) {
      const length = path.getTotalLength();
      gsap.fromTo(
        path,
        { strokeDasharray: length, strokeDashoffset: length, opacity: 0.2 },
        {
          strokeDashoffset: 0,
          opacity: 0.55,
          duration: 1.4,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: divider,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  });

  ScrollTrigger.refresh();
};

// const initSkillsLogoScroll = () => {
//   if (!window.gsap || !window.ScrollTrigger) return;
//   const panel = document.querySelector(".skills_logo_panel");
//   const projectsSection = document.querySelector("#projects");
//   if (!panel || !projectsSection) return;

//   gsap.timeline({
//     scrollTrigger: {
//       trigger: panel,
//       start: "top 90%",
//       endTrigger: projectsSection,
//       end: "top 70%",
//       scrub: true,
//       pin: panel,
//       pinSpacing: true
//     }
//   }).to(panel, {
//     y: 40,
//     ease: "none"
//   });
// };

const initShowcase = () => {
  if (!showcaseTabs.length || !showcasePanel) return;
  const updatePanel = (tab) => {
    showcaseTabs.forEach((btn) => btn.classList.remove("active"));
    tab.classList.add("active");
    if (showcaseMedia) showcaseMedia.src = tab.dataset.media || "";
    if (showcaseTitle) showcaseTitle.textContent = tab.dataset.title || "";
    if (showcaseDesc) showcaseDesc.textContent = tab.dataset.desc || "";
    if (showcaseMeta) showcaseMeta.textContent = tab.dataset.tech || "";
    if (showcaseLink) {
      if (tab.dataset.link) {
        showcaseLink.href = tab.dataset.link;
        showcaseLink.style.display = "inline-flex";
      } else {
        showcaseLink.style.display = "none";
      }
    }
    if (window.gsap) {
      gsap.fromTo(
        showcasePanel,
        { autoAlpha: 0, y: 20, rotateX: 6, transformPerspective: 900 },
        { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  };

  showcaseTabs.forEach((tab) => {
    tab.addEventListener("click", () => updatePanel(tab));
  });

  updatePanel(showcaseTabs[0]);
};

const initCounters = () => {
  if (!window.gsap || !window.ScrollTrigger || !impactValues.length) return;
  impactValues.forEach((value) => {
    const target = Number(value.dataset.count || "0");
    gsap.fromTo(
      value,
      { innerText: 0 },
      {
        innerText: target,
        duration: 1.6,
        ease: "power3.out",
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: value,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
};

const updateParallax = () => {
  if (!parallaxElements.length) return;
  const scrollY = window.scrollY;
  parallaxElements.forEach((element) => {
    const speed = Number(element.dataset.speed || 0.12);
    const offset = scrollY * speed;
    element.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
};

window.addEventListener("scroll", updateParallax);
window.addEventListener("load", updateParallax);
window.addEventListener("resize", updateParallax);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroFlip = document.querySelector(".hero_flip");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorGlow = document.querySelector(".cursor-glow");

const typeWord = (element, word, speed) =>
  new Promise((resolve) => {
    element.textContent = "";
    let index = 0;
    const step = () => {
      element.textContent = word.slice(0, index);
      index += 1;
      if (index <= word.length) {
        setTimeout(step, speed);
      } else {
        resolve();
      }
    };
    step();
  });

const deleteWord = (element, speed) =>
  new Promise((resolve) => {
    let index = element.textContent.length;
    const step = () => {
      element.textContent = element.textContent.slice(0, index);
      index -= 1;
      if (index >= 0) {
        setTimeout(step, speed);
      } else {
        resolve();
      }
    };
    step();
  });

const runHeroFlip = async () => {
  if (!heroFlip) return;
  const words = (heroFlip.dataset.words || "").split(",").map((word) => word.trim()).filter(Boolean);
  if (!words.length) return;
  const delay = Number(heroFlip.dataset.delay || 2200);
  const restartDelay = Number(heroFlip.dataset.restartDelay || 500);
  const maxLen = Math.max(...words.map((word) => word.length));
  heroFlip.style.minWidth = `${maxLen}ch`;
  let index = 0;
  while (true) {
    const word = words[index % words.length];
    await new Promise((resolve) => setTimeout(resolve, restartDelay));
    await typeWord(heroFlip, word, 60);
    await new Promise((resolve) => setTimeout(resolve, delay));
    await deleteWord(heroFlip, 35);
    await new Promise((resolve) => setTimeout(resolve, 120));
    index += 1;
  }
};

if (prefersReducedMotion) {
  if (heroFlip) {
    const words = (heroFlip.dataset.words || "").split(",").map((word) => word.trim()).filter(Boolean);
    heroFlip.textContent = words[0] || "";
  }
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
} else {
  runHeroFlip();
}

const markLoaded = () => {
  document.body.classList.add("is-loaded");
  document.body.classList.remove("is-loading");
};

const runGsapIntro = () => {
  const overlay = document.querySelector(".intro-overlay");
  const panels = document.querySelectorAll(".intro-panel");
  const badge = document.querySelector(".intro-badge");
  const site = document.querySelector(".site");
  const header = document.querySelector(".header");
  const heroCopy = document.querySelector(".hero_copy");
  const heroMedia = document.querySelector(".hero_media");
  const heroLines = document.querySelectorAll(".hero-line-inner");

  if (!overlay || !site  || !window.gsap) {
    markLoaded();
    return;
  }

  document.body.classList.add("is-loading");
  // gsap.set(site, { opacity: 0, z: -180, scale: 0.97, filter: "blur(10px)" });
  gsap.set([header, heroCopy, heroMedia], { opacity: 0, y: 46, z: -120 });
  gsap.set(heroLines, { yPercent: 120 });
  gsap.set(panels, { opacity: 0, filter: "blur(10px)" });
  gsap.set(badge, { opacity: 0, y: -10 });

  const tl = gsap.timeline({
    defaults: { ease: "power4.out" },
    onComplete: () => {
      document.body.classList.add("is-loaded");
      document.body.classList.remove("is-loading");
    }
  });

  tl.to(badge, { opacity: 1, y: 0, duration: 0.6 })
    .to(panels, {
      opacity: 1,
      duration: 1.6,
      z: 0,
      rotateX: 0,
      rotateY: 0,
      filter: "blur(0px)",
      stagger: 0.22
    }, "-=0.3")
    .to(overlay, { opacity: 0, duration: 1.2 }, "-=0.6")
    // .to(site, { opacity: 1, z: 0, scale: 1, filter: "blur(0px)", duration: 1.4 }, "-=0.9")
    .to([header, heroCopy], { opacity: 1, y: 0, z: 0, duration: 1.1 }, "-=0.9")
    .to(heroMedia, { opacity: 1, y: 0, z: 0, duration: 1.1 }, "-=1")
    .to(heroLines, { yPercent: 0, stagger: 0.18, duration: 1, ease: "power3.out" }, "-=0.8");

  setTimeout(() => overlay.remove(), 3200);
};

window.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  initProjectModal();
  initShowcase();
  if (prefersReducedMotion) {
    markLoaded();
    return;
  }
  runGsapIntro();
  initScrollGsap();
  initSkillsLogoScroll();
  initCounters();
});

window.addEventListener("load", () => {
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

window.addEventListener("hashchange", () => {
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

// window.addEventListener("load", () => {
//   if (prefersReducedMotion) return;
//   if (!cursorDot || !cursorRing || !cursorGlow) return;

//   const root = document.documentElement;

//   let mouseX = window.innerWidth / 2;
//   let mouseY = window.innerHeight / 2;
//   let ringX = mouseX;
//   let ringY = mouseY;

//   let rafId = null;
//   let lastGridUpdate = 0;

//   // tell browser what will animate
//   cursorDot.style.willChange = "transform";
//   cursorRing.style.willChange = "transform";

//   function updateCursor(time) {
//     // smooth follow ONLY for ring
//     ringX += (mouseX - ringX) * 0.12;
//     ringY += (mouseY - ringY) * 0.12;

//     // GPU-only transforms
//     cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
//     cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

//     // glow once (don’t animate opacity every frame)
//     cursorGlow.style.opacity = "1";

//     // throttle expensive CSS variable updates (~30fps)
//     if (time - lastGridUpdate > 33) {
//       root.style.setProperty("--cursor-x", `${mouseX}px`);
//       root.style.setProperty("--cursor-y", `${mouseY}px`);

//       root.style.setProperty(
//         "--grid-x",
//         `${(mouseX / window.innerWidth - 0.5) * 12}px`
//       );
//       root.style.setProperty(
//         "--grid-y",
//         `${(mouseY / window.innerHeight - 0.5) * 12}px`
//       );

//       lastGridUpdate = time;
//     }

//     rafId = requestAnimationFrame(updateCursor);
//   }

//   window.addEventListener("mousemove", (e) => {
//     mouseX = e.clientX;
//     mouseY = e.clientY;

//     // lazy-start RAF
//     if (!rafId) {
//       rafId = requestAnimationFrame(updateCursor);
//     }
//   });
// });

const modal = document.getElementById("projectModal");
const modalTitle = document.querySelector(".modal_title");
const modalSummary = document.querySelector(".modal_summary");
const modalProblem = document.querySelector(".modal_problem");
const modalSolution = document.querySelector(".modal_solution");
const modalTech = document.querySelector(".modal_tech");
const modalImpact = document.querySelector(".modal_impact");
const modalLink = document.querySelector(".modal_link");
const modalMediaSlot = document.querySelector(".modal_media_slot");
const modalPrev = document.querySelector("[data-modal-prev]");
const modalNext = document.querySelector("[data-modal-next]");
const modalCloseTriggers = document.querySelectorAll("[data-close-modal]");
const sliderModal = document.getElementById("imageSlider");
const sliderWrapper = document.querySelector(".image_swiper .swiper-wrapper");
const sliderCloseTriggers = document.querySelectorAll("[data-close-slider]");
const showcaseTabs = document.querySelectorAll(".showcase_tab");
const showcasePanel = document.querySelector(".showcase_panel");
const showcaseMedia = document.querySelector(".showcase_media img");
const showcaseTitle = document.querySelector(".showcase_title");
const showcaseDesc = document.querySelector(".showcase_desc");
const showcaseMeta = document.querySelector(".showcase_meta span");
const showcaseLink = document.querySelector(".showcase_link");
const impactValues = document.querySelectorAll(".impact_value");
const projectGrid = document.querySelector("[data-project-grid]");

let modalMedia = [];
let modalIndex = 0;
let swiperInstance = null;

const createProjectCard = (project) => {
  const article = document.createElement("article");
  const isPlaceholder = project && project.placeholder;
  const baseClass = "project_card reveal scroll-3d";
  article.className = isPlaceholder ? baseClass : `${baseClass} project_modal_trigger`;

  if (isPlaceholder) {
    const media = document.createElement("div");
    media.className = "project_media placeholder";
    const placeholderCopy = document.createElement("div");
    placeholderCopy.className = "placeholder_copy";
    placeholderCopy.textContent = project.placeholderText || "More projects incoming";
    media.appendChild(placeholderCopy);

    const body = document.createElement("div");
    body.className = "project_body";
    const title = document.createElement("h3");
    title.textContent = project.title || "Next Project Drop";
    body.appendChild(title);

    const statusBlock = document.createElement("div");
    statusBlock.className = "project_block";
    const statusLabel = document.createElement("span");
    statusLabel.className = "project_label";
    statusLabel.textContent = "Status";
    const statusText = document.createElement("p");
    statusText.textContent = project.status || "Sharing more products and visuals soon.";
    statusBlock.appendChild(statusLabel);
    statusBlock.appendChild(statusText);

    const expectBlock = document.createElement("div");
    expectBlock.className = "project_block";
    const expectLabel = document.createElement("span");
    expectLabel.className = "project_label";
    expectLabel.textContent = "What to expect";
    const expectText = document.createElement("p");
    expectText.textContent = project.expect || "Startup MVPs, SaaS dashboards, and mobile apps.";
    expectBlock.appendChild(expectLabel);
    expectBlock.appendChild(expectText);

    body.appendChild(statusBlock);
    body.appendChild(expectBlock);

    article.appendChild(media);
    article.appendChild(body);
    return article;
  }

  article.dataset.title = project.title || "";
  article.dataset.summary = project.description || "";
  article.dataset.link = project.link || "";
  article.dataset.media = (project.media || []).join(",");
  article.dataset.problem = project.problem || "";
  article.dataset.solution = project.solution || "";
  article.dataset.tech = project.tech || "";
  article.dataset.impact = (project.impact || []).join("|");

  const media = document.createElement("div");
  media.className = "project_media";
  const thumb = project.thumbnail || (project.media && project.media[0]) || "";
  if (thumb) {
    const img = document.createElement("img");
    img.src = thumb;
    img.alt = project.title ? `${project.title} preview` : "Project preview";
    media.appendChild(img);
    const overlay = document.createElement("div");
    overlay.className = "project_overlay";
    const overlayText = document.createElement("span");
    overlayText.textContent = "View case study";
    overlay.appendChild(overlayText);
    media.appendChild(overlay);
  } else {
    media.classList.add("placeholder");
    const placeholderCopy = document.createElement("div");
    placeholderCopy.className = "placeholder_copy";
    placeholderCopy.textContent = "Project preview";
    media.appendChild(placeholderCopy);
  }

  const body = document.createElement("div");
  body.className = "project_body";
  const title = document.createElement("h3");
  title.textContent = project.title || "Project Title";
  const excerpt = document.createElement("p");
  excerpt.className = "project_excerpt";
  excerpt.textContent = project.excerpt || project.description || "";
  const meta = document.createElement("div");
  meta.className = "project_meta";
  (project.tags || []).forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag;
    meta.appendChild(span);
  });

  body.appendChild(title);
  if (excerpt.textContent) {
    body.appendChild(excerpt);
  }
  if (meta.childElementCount) {
    body.appendChild(meta);
  }

  article.appendChild(media);
  article.appendChild(body);
  return article;
};

const renderProjects = () => {
  if (!projectGrid) return;
  const data = Array.isArray(window.projectsData) ? window.projectsData : [];
  const projects = data.length
    ? data
    : [{ placeholder: true }];

  projectGrid.innerHTML = "";
  projects.forEach((project) => {
    projectGrid.appendChild(createProjectCard(project));
  });
};

const renderModalMedia = () => {
  if (!modalMediaSlot) return;
  modalMediaSlot.innerHTML = "";
  modalMediaSlot.classList.remove("is-tall-media");
  const src = modalMedia[modalIndex];
  if (!src) return;
  if (src.endsWith(".mp4") || src.endsWith(".webm")) {
    const video = document.createElement("video");
    video.src = src;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    modalMediaSlot.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Project media";
    const applyOrientationClass = () => {
      const isTall = img.naturalHeight / img.naturalWidth > 1.2;
      modalMediaSlot.classList.toggle("is-tall-media", isTall);
    };
    if (img.complete) {
      applyOrientationClass();
    } else {
      img.addEventListener("load", applyOrientationClass);
    }
    modalMediaSlot.appendChild(img);
  }
};

const buildSliderSlides = () => {
  if (!sliderWrapper) return;
  sliderWrapper.innerHTML = "";
  modalMedia.forEach((src) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    if (src.endsWith(".mp4") || src.endsWith(".webm")) {
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.playsInline = true;
      slide.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Project media";
      slide.appendChild(img);
    }
    sliderWrapper.appendChild(slide);
  });
};

const openSlider = (startIndex) => {
  if (!sliderModal || !sliderWrapper || !window.Swiper) return;
  if (!modalMedia.length) return;
  buildSliderSlides();
  sliderModal.classList.add("open");
  sliderModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }
  swiperInstance = new Swiper(".image_swiper", {
    loop: modalMedia.length > 1,
    initialSlide: Math.max(0, startIndex || 0),
    navigation: {
      nextEl: ".image_swiper .swiper-button-next",
      prevEl: ".image_swiper .swiper-button-prev"
    },
    pagination: {
      el: ".image_swiper .swiper-pagination",
      clickable: true
    },
    keyboard: {
      enabled: true
    }
  });
};

const closeSlider = () => {
  if (!sliderModal) return;
  sliderModal.classList.remove("open");
  sliderModal.setAttribute("aria-hidden", "true");
  if (modal && modal.classList.contains("open")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

const openModal = (card) => {
  if (!modal) return;
  modalMedia = (card.dataset.media || "").split(",").map((item) => item.trim()).filter(Boolean);
  modalIndex = 0;

  modalTitle.textContent = card.dataset.title || "";
  modalSummary.textContent = card.dataset.summary || "";
  modalProblem.textContent = card.dataset.problem || "";
  modalSolution.textContent = card.dataset.solution || "";
  modalTech.textContent = card.dataset.tech || "";
  modalLink.href = card.dataset.link || "#";
  modalLink.style.display = card.dataset.link ? "inline-flex" : "none";

  modalImpact.innerHTML = "";
  (card.dataset.impact || "").split("|").map((item) => item.trim()).filter(Boolean).forEach((impact) => {
    const li = document.createElement("li");
    li.textContent = impact;
    modalImpact.appendChild(li);
  });

  renderModalMedia();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const initProjectModal = () => {
  const modalTriggers = document.querySelectorAll(".project_modal_trigger");
  const projectCards = document.querySelectorAll(".project_card");

  modalTriggers.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
  });

  projectCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      card.style.setProperty("--shine-x", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--shine-y", `${(y / rect.height) * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
};

modalCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (sliderModal && sliderModal.classList.contains("open")) {
      closeSlider();
      return;
    }
    closeModal();
  }
});

if (modalPrev && modalNext) {
  modalPrev.addEventListener("click", () => {
    if (!modalMedia.length) return;
    modalIndex = (modalIndex - 1 + modalMedia.length) % modalMedia.length;
    renderModalMedia();
  });

  modalNext.addEventListener("click", () => {
    if (!modalMedia.length) return;
    modalIndex = (modalIndex + 1) % modalMedia.length;
    renderModalMedia();
  });
}

if (modalMediaSlot) {
  modalMediaSlot.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.tagName === "IMG") {
      openSlider(modalIndex);
    }
  });
}

sliderCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeSlider);
});
