# Portfolio

Personal portfolio site for Sahana Naganandh: an intro page plus Research and Projects pages.

Built with React and Vite. Deployed on Vercel from `main`.

## Getting started

```sh
npm ci
npm run dev
```

Open the local URL Vite prints (usually http://localhost:5173).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run test:e2e` | Run the Playwright browser tests |

Before running the tests for the first time, install the browser with `npx playwright install chromium`.

## Project structure

```
public/          Static assets (logo mark, project diagrams, paper PDF)
src/data.js      Content: papers, projects, achievements
src/main.jsx     Pages and components (hash routes: #home, #research, #projects)
src/styles.css   All styling, including light and dark themes
tests/           Playwright layout, navigation, theme and asset checks
```

## Editing content

Most updates only need `src/data.js`:

- **Papers:** title, authors, status, summary and links
- **Projects:** title, summary, tags, links and the diagram in `public/projects/`
- **Achievements:** hackathon results

To add your email or LinkedIn, set the `email` and `linkedin` constants at the top of `src/main.jsx`.

## Design notes

- Typeface: Google Sans, loaded from Google Fonts in `index.html`
- Light theme by default; the toggle in the nav remembers the choice
- Respects reduced-motion settings

The browser checks cover phone, landscape, tablet and desktop layouts, both themes,
keyboard focus around the sticky navigation, hash history, expandable details and
the local project diagrams and manuscript PDF. External requests are blocked.

The OS paper PDF is a conversion of the author's supplied ICNDA-formatted manuscript,
not a publisher-issued version. Paper summaries retain the study's limitations;
project diagrams illustrate workflows rather than production screenshots.
