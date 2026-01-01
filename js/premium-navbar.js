(() => {
  const header = document.querySelector(".header");
  const nav = document.querySelector(".nav");
  if (!header || !nav) return;

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  // Indicator element
  const indicator = document.createElement("span");
  indicator.className = "nav_indicator";
  nav.appendChild(indicator);

  let activeLink = links[0];

  function moveIndicator(el, immediate = false) {
    if (!el) return;
    const rNav = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left - rNav.left;
    const w = r.width;

    if (immediate) {
      indicator.style.transform = `translate3d(${x}px,0,0)`;
      indicator.style.width = `${w}px`;
      return;
    }

    gsap.to(indicator, {
      duration: 0.35,
      ease: "power3.out",
      x,
      width: w,
    });
  }

  // Hover behavior (designer feel)
  links.forEach((a) => {
    a.addEventListener("mouseenter", () => moveIndicator(a));
    a.addEventListener("focus", () => moveIndicator(a));
  });

  nav.addEventListener("mouseleave", () => moveIndicator(activeLink));

  // Active section highlight
  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
    activeLink = links.find((a) => a.getAttribute("href") === `#${id}`) || activeLink;
    moveIndicator(activeLink);
  };

  // ScrollTriggers for each section
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (!sec) return;

    ScrollTrigger.create({
      trigger: sec,
      start: "top 35%",
      end: "bottom 35%",
      onEnter: () => setActive(id),
      onEnterBack: () => setActive(id),
    });
  });

  // Initial position
  requestAnimationFrame(() => moveIndicator(activeLink, true));

  // Header glass on scroll
  const onScroll = () => header.classList.toggle("header--scrolled", window.scrollY > 6);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reposition on resize
  addEventListener("resize", () => moveIndicator(activeLink, true), { passive: true });
})();
