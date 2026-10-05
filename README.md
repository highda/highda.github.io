# highda.github.io

Source for [highda.github.io](https://highda.github.io) — a small collection of client-side browser tools.

| Tool | Path |
| --- | --- |
| Glitch Lab | [`/vibecode-snippets/glitch-lab/`](https://highda.github.io/vibecode-snippets/glitch-lab/) (submodule: [highda/glitch-lab](https://github.com/highda/glitch-lab)) |
| Pixel Sorter | [`/vibecode-snippets/pixel-sorter.html`](https://highda.github.io/vibecode-snippets/pixel-sorter.html) |
| CGA Converter | [`/vibecode-snippets/convertto-cga-v2.html`](https://highda.github.io/vibecode-snippets/convertto-cga-v2.html) |
| CGA Converter, classic | [`/vibecode-snippets/convertto-cga.html`](https://highda.github.io/vibecode-snippets/convertto-cga.html) |
| Mask Compositor | [`/vibecode-snippets/gradient-maskimage-compositor.html`](https://highda.github.io/vibecode-snippets/gradient-maskimage-compositor.html) |
| Font Ripper | [`/vibecode-snippets/font-ripper.html`](https://highda.github.io/vibecode-snippets/font-ripper.html) |
| Chord Transition Trainer | [`/vibecode-snippets/chords-trainer/`](https://highda.github.io/vibecode-snippets/chords-trainer/) (submodule: [highda/chords-trainer](https://github.com/highda/chords-trainer)) |

## Structure

- `index.html`, `404.html` — landing and not-found pages
- `assets/` — shared stylesheet, theme toggle, favicon
- `vibecode-snippets/` — standalone tools; `chords-trainer` and `glitch-lab` are git submodules
- `svg-mapper-113/` — unlisted preview build of the SVG mapper editor

## Deployment

- **Deploy GitHub Pages** (`.github/workflows/pages.yml`) builds with Jekyll on every push to `main`, including submodules.
- **Sync Submodule Pointers** (`.github/workflows/sync-submodules.yml`) bumps a submodule to its latest `main` when the source repo sends a `submodule-sync` `repository_dispatch` (or on manual run). Requires the `PAGES_SYNC_TOKEN` secret.

Clone with submodules:

```sh
git clone --recurse-submodules https://github.com/highda/highda.github.io.git
```
