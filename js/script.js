function initNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) return;
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    toggle.classList.remove("active");
    nav.classList.remove("open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    toggle.classList.toggle("active", !open);
    nav.classList.toggle("open", !open);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  document.addEventListener("click", (event) => { if (!nav.contains(event.target) && !toggle.contains(event.target)) close(); });
}

function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
    observer.observe(element);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

function repositoryCard(repository) {
  const language = repository.language || "Other";
  const description = repository.description || "A public repository by Larisa-Diana Benchea.";
  const updatedYear = new Date(repository.updated_at).getFullYear();
  const topics = (repository.topics || []).slice(0, 3);
  const tags = topics.length ? topics : [language];
  const card = document.createElement("article");
  card.className = "project-card reveal";
  card.dataset.language = language;
  card.innerHTML = `<p class="project-category">${escapeHtml(language)} · ${updatedYear}</p><h2>${escapeHtml(repository.name)}</h2><p>${escapeHtml(description)}</p><div class="tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div><div class="project-links"><a href="${escapeHtml(repository.html_url)}" target="_blank" rel="noopener">View on GitHub</a></div>`;
  return card;
}

function initProjectFilter() {
  const filterBar = document.querySelector(".filter-bar");
  const projectGrid = document.querySelector("#github-projects");
  const count = document.querySelector("#project-count");
  const empty = document.querySelector(".empty-state");
  if (!filterBar || !projectGrid) return;
  const render = (language) => {
    const cards = projectGrid.querySelectorAll(".project-card");
    let visible = 0;
    cards.forEach((card) => {
      const show = language === "all" || card.dataset.language === language;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = `${visible} project${visible === 1 ? "" : "s"} shown`;
    if (empty) empty.hidden = visible !== 0;
  };
  const bindButtons = () => filterBar.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => {
    filterBar.querySelectorAll(".filter-button").forEach((item) => {
      const active = item === button;
      item.setAttribute("aria-pressed", String(active));
      item.classList.toggle("active", active);
    });
    render(button.dataset.language);
  }));
  const loadRepositories = async () => {
    try {
      const response = await fetch("https://api.github.com/users/Bencheaa/repos?sort=updated&per_page=100");
      if (!response.ok) throw new Error("GitHub request failed.");
      const repositories = (await response.json()).filter((repository) => !repository.fork);
      const languages = [...new Set(repositories.map((repository) => repository.language || "Other"))].sort();
      filterBar.innerHTML = `<button class="filter-button active" type="button" data-language="all" aria-pressed="true">All languages</button>${languages.map((language) => `<button class="filter-button" type="button" data-language="${escapeHtml(language)}" aria-pressed="false">${escapeHtml(language)}</button>`).join("")}`;
      bindButtons();
      projectGrid.replaceChildren(...repositories.map(repositoryCard));
      render("all");
      initScrollReveal();
    } catch (error) {
      projectGrid.replaceChildren();
      if (count) count.textContent = "GitHub projects unavailable";
      const errorMessage = document.querySelector("#projects-error");
      if (errorMessage) errorMessage.hidden = false;
    }
  };
  loadRepositories();
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const fields = ["name", "email", "phone", "message"].map((name) => form.elements[name]).filter(Boolean);
  const status = document.querySelector("#form-status");
  const counter = document.querySelector("#message-count");
  const rules = {
    name: (value) => !value ? "Name is required." : value.length < 2 ? "Name must be at least 2 characters." : !/^[\p{L}\s]+$/u.test(value) ? "Use letters and spaces only." : "",
    email: (value) => !value ? "Email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Enter a valid email address." : "",
    phone: (value) => value && !/^\+?[0-9\s\-()]+$/.test(value) ? "Enter a valid phone number." : "",
    message: (value) => !value ? "Message is required." : value.length < 10 ? "Message must be at least 10 characters." : ""
  };
  const validate = (field) => {
    const message = rules[field.name](field.value.trim());
    const error = document.querySelector(`#${field.name}-error`);
    field.classList.toggle("invalid", Boolean(message));
    field.classList.toggle("valid", !message && Boolean(field.value.trim()));
    if (error) error.textContent = message;
    return !message;
  };
  const updateCounter = () => {
    if (!counter) return;
    const length = form.elements.message.value.length;
    counter.textContent = `${length} / 1000`;
    counter.classList.toggle("near-limit", length >= 900);
  };
  fields.forEach((field) => {
    field.addEventListener("input", () => { updateCounter(); if (field.dataset.touched) validate(field); });
    field.addEventListener("blur", () => { field.dataset.touched = "true"; validate(field); });
  });
  updateCounter();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      if (status) { status.className = "form-status error"; status.textContent = "Please fix the highlighted fields."; }
      fields.find((field) => field.classList.contains("invalid"))?.focus();
      return;
    }
    const submit = form.querySelector("button[type=submit]");
    if (submit) { submit.disabled = true; submit.textContent = "Sending..."; }
    try {
      // Replace this simulated request with a real Formspree, EmailJS or fetch endpoint.
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (status) { status.className = "form-status success"; status.textContent = "Thank you! Your message was sent."; }
      form.reset();
      fields.forEach((field) => field.classList.remove("valid", "invalid"));
      updateCounter();
    } catch {
      if (status) { status.className = "form-status error"; status.textContent = "Something went wrong, please try again."; }
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = "Send message"; }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach((year) => { year.textContent = new Date().getFullYear(); });
  initNav();
  initScrollReveal();
  initProjectFilter();
  initContactForm();
});
