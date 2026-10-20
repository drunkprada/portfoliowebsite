# Portfolio design

## Direction

The visual reference is the owner's sketch supplied on 19 October 2026: a
winding vertical stroke with alternating branches. Experience follows that shape
below the introduction and education overview. Keep the established Google Sans
typography, neutral surfaces, pastel skill colours and light/dark themes.

The stops contain work roles, society contributions and hackathon outcomes,
with relevant skill bubbles underneath each experience. Work dates and society
durations come from existing content; undated events do not receive invented
dates. A broader toolkit and current learning close the trail. Shared role and
society data keep the homepage aligned with the Experience tab.

## Layout and motion

- Desktop: alternating skill clusters beside a curved central spine.
- At 760px and below: a narrow trail on the left, with all clusters on the right.
- The SVG measures the actual marker positions after text reflows. Branches
  meet those markers at every width; ResizeObserver handles layout changes,
  with a window-resize fallback.
- A passive, animation-frame-throttled scroll listener draws the accent along
  the spine and branches as the reader moves through the section.
- Existing section reveals introduce each chapter. Skill bubbles pop into place
  with a small stagger, and gently lift on hover. The final marker has a soft
  halo. Reduced motion displays the full path and still bubbles immediately.
- Skill names remain normal text in an ordered list with nested skill lists.
  The path is decorative and hidden from assistive technology.

The curve geometry, arrangement and motion timings are original implementation
choices based on the supplied sketch.

## Glass navigation

The navigation uses a translucent surface, a fine highlight and a soft shadow.
On supporting browsers, its background is 62% surface colour with a 22px
backdrop blur and 180% saturation. These are implementation values. Browsers
without backdrop filtering receive the opaque theme surface. Navigation keeps
the existing Home, Research, Projects and Experience links and the phone layout
with 44px tap targets.

## Online reference inspected

[Magic UI Animated Beam](https://magicui.design/docs/components/animated-beam)
was inspected on 19 October 2026 at a 1440 x 1000 desktop viewport, including
its screenshot, documentation and HTML. The documentation describes light
travelling along connecting paths. That general motion idea informed the
exploration; this portfolio uses its own measured SVG and native browser APIs.
A still screenshot alone does not establish animation timing or phone behaviour.

## Content and assets

The uploaded resume, education, work, society contributions, project context
and paper assets stay available in their respective sections and routes.
The resume button opens the owner's original PDF. The sketch guides the curve
and is not published as a page image.
