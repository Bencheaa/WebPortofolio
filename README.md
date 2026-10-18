# Benchea Portfolio

A responsive, accessible portfolio website for Benchea Larisa-Diana. The site is built with semantic HTML, vanilla CSS, and vanilla JavaScript — no build step or framework is required.

## Live site

https://bencheaa.github.io/ProiectWEB/

## Features

- Responsive fixed navigation with a mobile hamburger menu
- Hero section with calls to action and responsive typography
- About page with education and experience timeline
- Projects page populated exclusively from the public GitHub API
- Project filtering by language
- Accessible contact form with client-side validation and success/error states
- Scroll-triggered reveal animations and hover transitions
- Reduced layout and readable content at mobile breakpoints

## Project structure

```text
project-root/
├── index.html
├── about.html
├── projects.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
    ├── background.png
    └── profile.jpg
```

The projects page requests the latest public, non-fork repositories for the `Bencheaa` GitHub account. There is no local project data file or fallback list; the page displays a clear error state if GitHub is unavailable.

## Run locally

Use VS Code Live Server or any static HTTP server from the project root:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

Opening the pages directly with `file://` works for the static pages, but a local server is recommended so browser security rules do not interfere with API requests.

## Customization

- Update the GitHub username in `js/script.js` if the portfolio owner changes.
- Replace `assets/profile.jpg` with a square profile image.
- Adjust design tokens at the top of `css/style.css` to change colors and spacing.
