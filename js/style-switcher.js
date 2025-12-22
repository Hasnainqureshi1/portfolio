const styleSwitcher = document.querySelector(".style_switcher");
const styleSwitcherToggle = document.querySelector(".style_switch_toggler");
const alternateStyle = document.querySelectorAll(".alternate-style");
const dayNight = document.querySelector(".day-night");

const setActiveStyle = (color) => {
  localStorage.setItem("color", color);
  applyActiveStyle();
};

const applyActiveStyle = () => {
  alternateStyle.forEach((style) => {
    if (localStorage.getItem("color") === style.getAttribute("title")) {
      style.removeAttribute("disabled");
    } else {
      style.setAttribute("disabled", "disabled");
    }
  });
};

styleSwitcherToggle.addEventListener("click", () => {
  styleSwitcher.classList.toggle("open");
});

window.addEventListener("scroll", () => {
  if (styleSwitcher.classList.contains("open")) {
    styleSwitcher.classList.remove("open");
  }
});

const setThemeIcon = () => {
  const icon = dayNight.querySelector("i");
  icon.classList.remove("fa-sun", "fa-moon");
  if (document.body.classList.contains("dark")) {
    icon.classList.add("fa-sun");
  } else {
    icon.classList.add("fa-moon");
  }
};

const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  document.body.classList.toggle("dark", storedTheme === "dark");
}

const storedColor = localStorage.getItem("color");
if (!storedColor) {
  localStorage.setItem("color", "color-1");
}

applyActiveStyle();
setThemeIcon();

dayNight.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  setThemeIcon();
});

window.setActiveStyle = setActiveStyle;
