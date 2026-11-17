# Design notes

**Direction:** a nocturnal research terminal. Near-black canvas, luminous type, and colour only where it carries meaning (the three data series). Calm authority, not decoration.

## References studied (16 Nov 2026)

| Source | What we took | What we left |
| --- | --- | --- |
| Refero Styles: **Fey** ("nocturnal Bloomberg terminal") | `#0b0b0b` canvas with `#131313` / `#191919` layers, white type with grey `#868f97` secondary text, tight display tracking, 16px cards, 99px pill controls, single deep black halo, chromatic accents only as meaning | Calibre font (licensed): we use Inter, Fey's listed fallback |
| Refero Styles: **Glassnode** ("research console") | Hairline borders, monumental numerals, alternating dark/light editorial bands (the Limits band) | 2px radii and light canvas |
| Scrolltide | Scroll-driven chapters: sticky finding on the left, evidence on the right; reveal-on-scroll; restraint ("doesn't look AI-made") | Paid templates: nothing copied |
| Scroll Shaders | Their performance rules for shader backgrounds: pause off-screen and in hidden tabs, cap DPR at 2, still frame under reduced motion. Contour/grain look | Paid shaders: ours (`HeroField.jsx`) is written from scratch, about 60 lines, WebGL1, hero only |
| footer.design | "Wordmark bleed" footer: link columns plus an oversized cropped wordmark | — |
| cta.gallery | One clear closing CTA with a specific promise, primary + ghost pill pair | Urgency gimmicks |

## Rules we follow

- **Colour carries meaning.** Blue = Ethereum USDT, orange = Tron USDT, green = Ethereum USDC, the same everywhere. Validated for colour-blind separation and contrast on `#131313` (all checks pass). Size bands use a single-hue blue ramp.
- **No shader behind data.** Animation lives in the hero only; charts sit on flat surfaces.
- **Every chart has a table view**, a written finding beside it, and its date range.
- **Motion respects `prefers-reduced-motion`**: reveals, count-ups, the shader and chart animations all switch off.
- **Copy is specific.** Headlines are computed findings with numbers, never slogans.
- **Accessibility:** skip link, visible focus ring, radiogroup/pressed states on controls, sufficient text contrast.
