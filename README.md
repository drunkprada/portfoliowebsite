# Sahana Naganandh — Portfolio

Personal portfolio built with React, Vite and Motion. Deployed through Vercel from `main`.

## Development

```sh
npm ci
npm run dev
```

`npm run build` produces `dist/`.

## Content

Research, projects, work experience and achievements are in `src/data.js`. The five hash-based pages live in `src/main.jsx`; visual styling lives in `src/styles.css`.

The site includes animated navigation, expandable project and research details, a saved light/dark preference, and an opt-in playable piano. Reduced-motion preferences are respected. Google Fonts provides Bricolage Grotesque with a sans-serif fallback. The site starts in dark mode and remembers explicit light/dark selections using portfolio-theme-v2; the theme is set before rendering to prevent a light flash. Black-and-white surfaces, contextual icons, technology badges and coloured underlines follow the supplied style references.

The OS research summary is based on the supplied manuscript and avoids numerical headline claims because its baseline figures differ between tables. Publication status follows the author's supplied résumé. The manuscript itself is not distributed with this site.
