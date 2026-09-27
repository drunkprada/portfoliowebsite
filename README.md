# Prada — Research & Engineering

An interactive React portfolio built with Vite, Motion, Radix Dialog and a Canvas research map.

## Run

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The production output is in `dist/`. Relative asset paths support hosting below a subdirectory. Case-study URLs use hash routing.

## Interactions

- Draggable research map with selectable themes
- Animated research cards and case-study dialogs
- Keyboard-accessible case-study tabs and focus handling
- Experience/education switch and expandable résumé entries
- Draggable skills with a reset control
- Persistent light/dark theme, motion pause, and reduced-motion support
- Responsive navigation and layouts

Edit content in `src/main.jsx` and styling in `src/styles.css`. Illustrations communicate concepts; they do not present measured research results.

## Update workflow

Canonical repository: https://github.com/drunkprada/portfoliowebsite

Build and check each completed change, commit to main using the repository's configured user identity, and verify the remote commit. Never force-push over unrelated work.
