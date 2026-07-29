# Cypher — futuristic robot hero

A 1:1 rebuild of the Figma frame `Desktop - 1` (1440×816) from
[Futuristic robot website (Community)](https://www.figma.com/design/suPnEzxdZGECwwQl6HXDDZ/Futuristic-robot-website--Community-?node-id=1-2),
responsive and shaped for a Lovable project.

## What's here

| Path | Purpose |
| --- | --- |
| `src/components/CypherHero.tsx` | The React component — this is what gets pushed to Lovable. |
| `src/components/CypherHero.css` | Every measurement from the Figma frame, tokenised to HSL variables. |
| `src/components/CypherMark.tsx` | The Cypher emblem, exported as SVG from the source file. |
| `src/index.css` | Design tokens + the Jost `@font-face`. |
| `preview/cypher-hero.html` | Standalone HTML mirror of the component, for quick visual review. |
| `preview/build.py` | Inlines the font and images into `cypher-hero.build.html` (self-contained). |
| `public/img/`, `public/fonts/` | Assets exported from the Figma file. |

## Values taken from the source

Read off the Figma layers rather than estimated from a screenshot:

- **Type** — Jost. H1 Regular 40 / auto line-height (57.6), `The future is now` Regular 16,
  wordmark Bold 25, nav + pills SemiBold 12, article body Regular 17 with 4.5% letter-spacing.
- **Colour** — background `#1E1E1E` under a `135deg` black→transparent gradient,
  brand `#7199FE` (the file's `blu` style), plate `#D9D9D9`, news surface `#111111`,
  date `#6E6E6E`.
- **Geometry** — search bar 441×46.85 r90 with 6px inner padding; model card 285×595 at
  (184,107); news card 285×242 r45 at (540,460) with the Read More button 139×27 straddling
  its top edge at (635,460); features group 263×188 at (1017,380); robot 637×707 at (900,109),
  clipped by the frame to 540×707.

## Motion

- **Entrance** — a staggered load sequence: header drops in, the rule draws out, the
  headline rises line by line, the three cards lift, the robot markers pop and the leader
  line draws itself.
- **Ambient** — the robot floats slowly, the markers pulse a halo ring.
- **Pointer parallax** — the stage reads the cursor and moves each layer at its own depth.
- **Micro-interactions** — search focus ring, nav underline wipe, button lifts, burger stagger.
- Entrance animates the independent `translate`/`scale` properties while parallax owns
  `transform`, so the two never overwrite each other. Everything runs on the compositor.
- `prefers-reduced-motion: reduce` collapses all of it and stops the carousel autoplay.

## Model carousel

The product card is a deck: two plates peek out behind the live card, and advancing turns
the whole card on its edge. The content — photo, name, blurb, product code and barcode — is
exchanged at the halfway point, while the card is side-on and nothing can give the swap
away. The deck straightens up as it deals, then settles back. Three units cycle:
S712X / R408V / K220D. Autoplay runs every 6s and yields to the
reader — hover, keyboard focus, a hidden tab or a card scrolled out of view all pause it.
Dots are real tabs, and the model name is announced through a polite live region.

> The Figma file ships one android render, so the three units are the same photo graded
> per model. Swap in real renders at `public/img/` when you have them.

## Responsive strategy

- **≥1024px** — a 1440×816 stage scaled by `--s` (`min(width/1440, 1.3334)`), so the desktop
  composition is exact at any width. `--s` is set in JS because CSS cannot divide a length by a
  length to produce a unitless number.
- **<1024px** — one non-scrolling frame pinned to `100dvh`. The news card is dropped, the
  fixed rows take what they need and the model card absorbs the remaining height, with its
  type scaling through container query units so it stays in proportion on any phone.
- Images are content, not structure: they keep their aspect ratio and are only ever cropped.

## Running it

```bash
npm install && npm run dev
```

> Requires Node 18+. This machine currently has Node 12, so the Vite build has **not** been run
> locally — the design was verified through `preview/cypher-hero.html`, which uses the identical
> CSS and markup.

To regenerate the self-contained preview:

```bash
npm run bundle:artifact
```
