// Error diffusion dithering (Floyd-Steinberg, Atkinson, Sierra) with
// intentional corruption: amplified error, reversed direction, wrong kernels.

// Diffusion kernels: [dx, dy, weight] relative to current pixel
const KERNELS = {
  'floyd-steinberg': [
    [1, 0, 7/16], [-1, 1, 3/16], [0, 1, 5/16], [1, 1, 1/16]
  ],
  'atkinson': [
    [1, 0, 1/8], [2, 0, 1/8], [-1, 1, 1/8], [0, 1, 1/8], [1, 1, 1/8], [0, 2, 1/8]
  ],
  'sierra': [
    [1, 0, 5/32], [2, 0, 3/32],
    [-2, 1, 2/32], [-1, 1, 4/32], [0, 1, 5/32], [1, 1, 4/32], [2, 1, 2/32],
    [-1, 2, 2/32], [0, 2, 3/32], [1, 2, 2/32]
  ],
  'sierra-lite': [
    [1, 0, 2/4], [0, 1, 1/4], [-1, 1, 1/4]
  ],
};

export default {
  name: 'Corrupt Diffusion',
  badge: 'DATA',
  badgeColor: '#ff9900',
  params: [
    { key: 'algo',      label: 'Algo',   type: 'select', options: ['floyd-steinberg', 'atkinson', 'sierra', 'sierra-lite'], def: 'floyd-steinberg' },
    { key: 'levels',    label: 'Levels', min: 2, max: 16, step: 1, def: 2 },
    { key: 'errMul',    label: 'Err Mul', min: 10, max: 400, step: 10, def: 100 },
    { key: 'direction', label: 'Dir',    type: 'select', options: ['normal', 'reverse', 'down-up', 'outward'], def: 'normal' },
    { key: 'channel',   label: 'Channel', type: 'select', options: ['all', 'red', 'green', 'blue'], def: 'all' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const channels = p.channel === 'all' ? [0, 1, 2] :
      p.channel === 'red' ? [0] : p.channel === 'green' ? [1] : [2];
    const step = 255 / (p.levels - 1);
    const errMul = p.errMul / 100;
    const baseKernel = KERNELS[p.algo];

    // Build corrupted kernel based on direction
    const kernel = baseKernel.map(([dx, dy, wt]) => {
      switch (p.direction) {
        case 'reverse':  return [-dx, -dy, wt];     // diffuse backwards
        case 'down-up':  return [dx, -dy, wt];       // flip vertical
        case 'outward':  return [dy, dx, wt];         // rotate 90°
        default:         return [dx, dy, wt];
      }
    });

    for (const ch of channels) {
      // Working copy as floats to accumulate error
      const buf = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) buf[i] = out[i * 4 + ch];

      // Scan order depends on direction (reverse scans bottom-right to top-left)
      const reverse = p.direction === 'reverse';
      const yStart = reverse ? h - 1 : 0;
      const yEnd = reverse ? -1 : h;
      const yStep = reverse ? -1 : 1;
      const xStart = reverse ? w - 1 : 0;
      const xEnd = reverse ? -1 : w;
      const xStep = reverse ? -1 : 1;

      for (let y = yStart; y !== yEnd; y += yStep) {
        for (let x = xStart; x !== xEnd; x += xStep) {
          const idx = y * w + x;
          const oldVal = buf[idx];
          const newVal = Math.round(oldVal / step) * step;
          buf[idx] = newVal;
          const err = (oldVal - newVal) * errMul;

          // Diffuse error to neighbors
          for (const [dx, dy, wt] of kernel) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              buf[ny * w + nx] += err * wt;
            }
          }
        }
      }

      // Write back clamped
      for (let i = 0; i < w * h; i++) {
        out[i * 4 + ch] = buf[i] < 0 ? 0 : buf[i] > 255 ? 255 : Math.round(buf[i]);
      }
    }
    return out;
  }
};
