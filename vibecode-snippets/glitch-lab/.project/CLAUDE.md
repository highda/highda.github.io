# GLITCH LAB — Agent Maintenance Guide

Read `.project/STRUCTURE.md` first for the full module map and dependency graph.

## Quick reference

- **Entry point:** `index.html` loads `js/app.js` as an ES module
- **Styles:** `css/style.css` (single file, CSS custom properties for theming)
- **State:** `js/state.js` — single shared mutable object, no reactivity
- **Global bridge:** `window._gl` in `js/app.js` — all inline DOM handlers use this

## Common tasks

### Adding a new effect

1. Create `js/effects/my-effect.js` following the effect contract (see STRUCTURE.md)
2. Register it in `js/effects/registry.js`:
   - Add entry to `EFFECT_PATHS`: `myEffect: './my-effect.js'`
   - Add entry to the appropriate `EFFECT_GROUPS` category
3. No other files need changes — the dropdown and lazy loading are automatic

### Modifying an existing effect

Each effect is self-contained in `js/effects/<name>.js`. Edit only that file. The `apply()` function receives `(srcData, params, width, height)` and must return a `Uint8ClampedArray` (or a Promise resolving to one).

### Adding a new parameter to an effect

Add the param definition to the effect's `params` array. The UI is generated automatically by `js/stack.js`. Supported param types:
- **Range slider:** `{ key, label, min, max, step, def }`
- **Select dropdown:** `{ key, label, type: 'select', options: [...], def }`
- **Binary input:** `{ key, label, type: 'binary', def: '11110000' }` — text field accepting only `0` and `1`, max 8 chars. Value stored as string, not coerced to number.

### Changing the UI layout or styles

- Layout structure: `index.html`
- All CSS: `css/style.css`
- Effect card rendering: `js/stack.js` → `renderStack()`
- Theme colors: CSS custom properties in `:root` at top of `css/style.css`

### Adding a new header button or control

1. Add the HTML in `index.html`, using `onclick="window._gl.myFunction()"`
2. Implement the function in the appropriate module
3. Export it and add it to `window._gl` in `js/app.js`

### Modifying canvas interaction (zoom, pan)

Edit `js/canvas.js`. It manages mouse wheel zoom, mouse drag pan, and touch pinch/pan.

### Modifying image loading or export

Edit `js/image.js`. Handles file input, drag-and-drop, image downscaling, and PNG export.

### Modifying the render pipeline

Edit `js/render.js`. Controls debounced live rendering, manual render, and the live/paused toggle.

## Important conventions

- **No build step.** Everything is vanilla ES modules served statically.
- **No `file://`.** Must be served over HTTP due to ES module CORS.
- **Inline handlers use `window._gl.`** — never bare function names.
- **Effects are lazy-loaded.** They load on first use via `dynamic import()`. Once loaded they're cached in `registry.js`.
- **`glitch-lab.html` is the original reference.** Do not edit it.
- **Effects must be deterministic.** Same input + same params = same output. No render history, timestamps, or random state without a seed parameter.
- **After structural changes**, update `.project/STRUCTURE.md` (directory tree and dependency graph).
- **After functional changes** (new effects, new features), update `.project/README.md`.
