# Portfolio design reference

Reference: https://gaurimenon.com/ · inspected 19 October 2026.
Firecrawl capture `01a155f3-3590-74a3-9cf7-bd04515ac0ab`, desktop viewport 1440 × 1000.
The full-page screenshot was downloaded and visually inspected during implementation.

## Observed reference

The page combines a compact personal introduction and a clear résumé action with
rounded white panels on a warm grey background. A skills panel uses colourful,
rotated pills. Adjacent panels summarise experience, education and leadership.
Section headings and generous gaps make the dense content easy to scan.

| Token | Captured value | Evidence |
| --- | --- | --- |
| Background | `#F4F4F3` | Branding extraction, consistent with screenshot |
| Main text / primary button | `#111111` | Branding extraction |
| Body text | `#444444` | Branding extraction |
| Accent | `#8338EC` | Branding extraction and purple skill pills |
| Typeface | Google Sans, then Inter/system fallbacks | Branding extraction |
| Primary button | Black, light text, pill radius | Branding extraction and screenshot |
| Panel corners | Approximately 18–22px | Visual estimate |
| Layout | Intro, featured work, overview panels, interactive exploration | Screenshot and page structure |

The captured DOM includes draggable skill pills and page-entry transforms. A
still screenshot does not establish exact animation timing or mobile behaviour.
The reference portrait and project images belong to the reference site and are
not used as assets in this portfolio.

## This implementation

Keep the existing four hash routes, paper screenshots, compact Home/Research/Projects/Experience navigation and
light/dark preference. The home page is a mini résumé: an introduction, the
uploaded PDF, pastel skill bubbles, education, work, society leadership and
hackathon outcomes. Research papers and project descriptions stay in their own
pages. Retain links to those pages from the introduction.

On phones, navigation uses a two-row layout with 44px minimum tap targets.

The skill palette, panel arrangement and animation timings are original choices
for this implementation, inspired by the reference rather than exact copies.
Use readable wrapping skill labels and gentle hover movement, with one-time
scroll reveals for sections. Respect reduced-motion preferences, keep content
visible without IntersectionObserver, and reveal keyboard-focused content
immediately. Avoid continuous physics loops and new animation dependencies.

## Content and assets

- `/resume/sahana-naganandh-resume.pdf` is the exact PDF uploaded on 19 October.
- Skills and the Nectar internship come from that résumé; existing web/design
  experience and current electronics learning are retained from the portfolio.
- The project pages retain their existing implementation-status limitations.
- The original paper screenshots and manuscript remain unchanged.
- The reference screenshot is an inspection aid, not a website asset.
