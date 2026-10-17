# Sahana Naganandh — Portfolio

Personal portfolio built with React, Vite and Motion. Deployed through Vercel from `main`.

## Development

```sh
npm ci
npm run dev
```

`npm run build` produces `dist/`.

## Browser tests

```sh
npx playwright install chromium
npm run test:e2e
```

The tests build and serve the production site locally. They check forward and
backward keyboard navigation on all five pages at phone, landscape, tablet and
desktop sizes, including expanded details. Focus must remain visible above the
bottom dock, with room for its outline at the top edge. They also check keyboard
route changes and detail toggles. External requests are blocked during tests.
Back-to-top checks cover keyboard and pointer activation, phone and desktop
layouts, and normal/reduced motion. Returning to the top also restores focus
to the content, so the next Tab continues there without resetting the current
page, expanded details or theme.

## Content

Research, projects, work experience and achievements are in `src/data.js`. The five hash-based pages live in `src/main.jsx`; visual styling lives in `src/styles.css`.

The site includes a fixed bottom navigation dock with icons, labels and an active-page indicator. It stays visible on every page and respects device safe areas, with bottom padding keeping content clear. The site also has expandable project and research details, a saved light/dark preference, and an opt-in playable piano. Reduced-motion preferences are respected. Google Fonts provides Newsreader and JetBrains Mono alongside a system sans-serif stack. The site starts in dark mode and remembers explicit light/dark selections using `portfolio-theme-v2`; the theme is set before rendering to prevent a light flash. The visual system uses restrained typography, neutral surfaces and a single green accent. The personal mark and project workflow diagrams are local SVG assets in `public/`.

The OS research summary is based on the supplied manuscript and avoids numerical headline claims because its baseline figures differ between tables. Publication status follows the author's supplied résumé. `public/papers/os-tuning-manuscript.pdf` is a PDF conversion of the supplied ICNDA-formatted manuscript, with table rows kept together; it is not a publisher-issued version. Research links open in a new tab.

Society context was checked against [IEEE Computer Society VIT](https://ieeecsvit.com/) and [CodeChef VIT's DevSOC](https://www.devsoc.codechefvit.com/). Personal contributions follow the author's account; hackathon judging is described as work in progress.

Project diagrams describe the current portfolio domain model, simulated arbitrage algorithm and resume-ingestion pipeline. They are workflow illustrations, not screenshots of a production interface. Planned APIs/risk analytics and live outbound calling are not depicted as completed features.
