const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav?.classList.toggle("open", !isOpen);
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("open");
  });
});

document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const projectsContainer = document.querySelector("#projects");
const filterButtons = document.querySelectorAll(".filter-button");
let repositories = [];

function projectCard(repo) {
  const language = repo.language || "Other";
  const description = repo.description || "A project exploring software engineering and problem solving.";
  const card = document.createElement("article");
  card.className = "project-card reveal visible";
  card.dataset.language = language;
  card.innerHTML = `<div class="project-number">↗</div><h2>${escapeHtml(repo.name)}</h2><p>${escapeHtml(description)}</p><div class="project-meta"><span>${escapeHtml(language)}</span><span>★ ${repo.stargazers_count}</span><span>${new Date(repo.updated_at).getFullYear()}</span></div><a href="${repo.html_url}" target="_blank" rel="noopener" aria-label="View ${escapeHtml(repo.name)} on GitHub">View repository <span aria-hidden="true">↗</span></a>`;
  return card;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

function renderProjects(filter = "all") {
  const filtered = repositories.filter((repo) => filter === "all" || repo.language === filter || (filter === "C++" && repo.language === "C"));
  projectsContainer.innerHTML = "";
  if (!filtered.length) {
    projectsContainer.innerHTML = "<p class=\"empty-state\">No public projects match this filter yet.</p>";
    return;
  }
  filtered.forEach((repo) => projectsContainer.appendChild(projectCard(repo)));
}

async function loadProjects() {
  if (!projectsContainer) return;
  try {
    const response = await fetch("https://api.github.com/users/Bencheaa/repos?sort=updated&per_page=100");
    if (!response.ok) throw new Error("GitHub returned an error.");
    repositories = (await response.json()).filter((repo) => !repo.fork);
    renderProjects();
  } catch (error) {
    projectsContainer.innerHTML = "";
    const status = document.querySelector("#projects-error");
    status.textContent = "Projects could not be loaded right now. Please visit GitHub directly to see the latest work.";
    status.classList.remove("hidden");
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProjects(button.dataset.filter);
  });
});
loadProjects();

const contactForm = document.querySelector("#contact-form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = ["name", "email", "message"];
  let valid = true;
  fields.forEach((fieldName) => {
    const field = contactForm.elements[fieldName];
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);
    let message = "";
    if (!field.value.trim()) message = "This field is required.";
    else if (fieldName === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) message = "Please enter a valid email address.";
    field.classList.toggle("invalid", Boolean(message));
    error.textContent = message;
    if (message) valid = false;
  });
  const status = document.querySelector("#form-status");
  if (!valid) {
    status.textContent = "Please fix the highlighted fields.";
    status.className = "form-status error";
    return;
  }
  status.textContent = "Thanks! Your message is ready to send.";
  status.className = "form-status success";
  contactForm.reset();
});
