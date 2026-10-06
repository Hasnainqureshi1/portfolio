/* Homepage navigation is handled by portfolio-redesign.js. */
(() => {
  if (!document.body.classList.contains("content-page")) return;
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (!button || !nav) return;
  const close = () => { nav.classList.remove("is-open"); button.setAttribute("aria-expanded", "false"); button.setAttribute("aria-label", "Open menu"); };
  button.addEventListener("click", () => { const open = !nav.classList.contains("is-open"); nav.classList.toggle("is-open", open); button.setAttribute("aria-expanded", String(open)); button.setAttribute("aria-label", open ? "Close menu" : "Open menu"); });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
  document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
  document.addEventListener("click", event => { if (!event.target.closest(".shared-header")) close(); });
  window.matchMedia("(min-width:1101px)").addEventListener("change", close);
})();
