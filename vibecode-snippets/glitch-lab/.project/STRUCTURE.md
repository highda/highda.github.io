# Project Structure

```
glitch-lab/
├── index.html                  # App shell — layout, DOM elements, loads app.js
├── glitch-lab.html             # Original monolithic file (reference only, do not edit)
│
├── css/
│   └── style.css               # All styles: theme variables, layout, components
│
├── js/
│   ├── app.js                  # Entry point — wires modules, exposes window._gl
│   ├── state.js                # Shared mutable state object
│   ├── canvas.js               # Zoom, pan, mouse/touch handling
│   ├── image.js                # Image load, drop, export
│   ├── render.js               # Render engine (applies effect stack to pixels)
│   ├── stack.js                # Effect stack CRUD + sidebar UI rendering
│   │
│   └── effects/
│       ├── registry.js         # Effect registry, lazy loader, grouped dropdown list
│       │
│       │  Color
│       ├── channel-shift.js    # R/B channel displacement
│       ├── channel-swap.js     # Remap RGB channels
│       ├── posterize.js        # Reduce color levels
│       ├── channel-threshold-gate.js # Per-channel binary threshold
│       ├── chromatic-split.js  # Radial RGB channel displacement
│       ├── edge-glow.js        # Sobel edge detection + colorized glow
│       ├── color-cycle.js      # Hue rotation + saturation/lightness shift
│       │
│       │  Geometry
│       ├── pixel-sort.js       # Threshold-based pixel sorting
│       ├── scanlines.js        # Darken every Nth row
│       ├── slice-shuffle.js    # Shuffle horizontal slices
│       ├── pixel-drift.js      # Sine-wave row/col shift
│       ├── echo-shift.js       # Bitwise-blended offset copies
│       ├── block-scramble.js   # Swap random tile-grid blocks (seeded)
│       ├── mosaic-corrupt.js   # Per-tile random corruption (seeded)
│       ├── symmetry-force.js   # Force mirror symmetry (H/V/quad)
│       ├── kaleidoscope.js     # Wedge-mirror around center point
│       │
│       │  Data / Bit
│       ├── bit-shift.js        # Shift, rotate, XOR on channel bits
│       ├── bayer-dither.js     # Ordered Bayer dithering
│       ├── noise.js            # Mono/color noise injection
│       ├── overflow-wrap.js    # Modular add (wraps instead of clamps)
│       ├── xor-fold.js         # XOR with mirrored/offset pixels
│       ├── bit-mask-stencil.js # User-defined binary mask on bytes
│       ├── value-sort.js       # Sort channel values independently
│       ├── corrupt-diffusion.js # Error-diffusion dithering with corrupted propagation
│       │
│       │  Byte / Raw
│       ├── buffer-misalign.js  # Shift raw bytes, break RGBA alignment
│       ├── stride-corrupt.js   # Read with wrong stride (diagonal shear)
│       ├── runlength-smear.js  # Broken RLE decoder simulation
│       ├── byte-repeat.js      # Duplicate chunks (stuck read head)
│       ├── byte-reverse.js     # Reverse bytes within buffer chunks
│       ├── sector-fault.js     # Bad disk reads — wrong byte offset patches (seeded)
│       ├── packet-loss.js      # Streaming corruption — row band drop/shift/repeat/XOR (seeded)
│       │
│       │  Compression
│       ├── jpeg-crush.js       # Iterative JPEG re-encode
│       ├── quantization-blast.js # 8x8 DCT quantization
│       │
│       │  Meta
│       ├── feedback.js         # Recursive zoom/rotate overlay
│       ├── pixel-echo.js       # Multi-copy ghost layers with blend modes
│       ├── self-diff.js        # Diff image against transformed self
│       ├── recursive-crop.js   # Droste-like recursive image-in-image
│       └── convolution-corrupt.js # Broken convolution kernel (seeded)
│
└── .project/
    ├── README.md               # What the app does, how to run it
    ├── STRUCTURE.md             # This file
    └── CLAUDE.md               # Agent maintenance guide
```

## Module dependency graph

```
index.html
  └── js/app.js (type="module")
        ├── js/state.js          ← shared state, imported by most modules
        ├── js/canvas.js         ← imports state
        ├── js/image.js          ← imports state, canvas, render
        ├── js/render.js         ← imports state, effects/registry
        ├── js/stack.js          ← imports state, effects/registry, render
        └── js/effects/registry.js
              └── js/effects/*.js  (loaded lazily via dynamic import())
```

## Key architectural decisions

### ES Modules without a bundler
All JS uses native ES module syntax (`import`/`export`). The entry point is `<script type="module" src="js/app.js">`. This means the app must be served over HTTP (not `file://`).

### Lazy-loaded effects
Effect modules are loaded on first use via `dynamic import()` in `registry.js`. This keeps initial page load fast — only core modules load upfront. Once an effect is loaded, it stays cached in memory.

### Global bridge (`window._gl`)
Since ES modules don't pollute the global scope, inline DOM event handlers (`onclick`, `oninput`) can't directly call module functions. The `app.js` module exposes all handler functions on `window._gl`. All inline handlers use `window._gl.methodName(...)`.

### Single shared state object
`state.js` exports a single mutable object. All modules that need state import it. This avoids prop-drilling and keeps the code simple. There's no reactivity system — UI updates are triggered explicitly by calling `renderStack()` or `scheduleRender()`.

### Grouped dropdown
Effects are organized into categories in `registry.js` via `EFFECT_GROUPS`. The dropdown in `app.js` renders these as `<optgroup>` elements. Adding a new effect to a category only requires editing `registry.js`.

### Effect file contract
Each effect file in `js/effects/` is a self-contained ES module that default-exports an object:

```js
export default {
  name: 'Display Name',       // shown in UI
  badge: 'CATEGORY',          // badge label (COLOR, DATA, GEO, SORT, COMP, META, BYTE, BIT)
  badgeColor: '#hex',         // badge border/text color
  description: 'Short tooltip description', // shown on hover in dropdown & stack
  params: [                   // parameter definitions for the UI
    { key: 'paramName', label: 'Label', min: 0, max: 100, step: 1, def: 50 },
    { key: 'mode', label: 'Mode', type: 'select', options: ['a', 'b'], def: 'a' },
    { key: 'pattern', label: 'Bits', type: 'binary', def: '11110000' },
  ],
  apply(srcData, params, width, height) {
    // srcData: Uint8ClampedArray (RGBA)
    // Must return Uint8ClampedArray or Promise<Uint8ClampedArray>
  }
};
```

### All effects must be deterministic
Same input + same parameters = same output, every time. Effects must not depend on render history, timestamps, or other non-reproducible state.
