export default {
  name: 'Channel Swap',
  badge: 'COLOR',
  badgeColor: '#ff3366',
  params: [
    {
      key: 'mode', label: 'Mode', type: 'select',
      options: ['RGB→BRG', 'RGB→GBR', 'RGB→RBG', 'RGB→BGR', 'RGB→GRB'], def: 'RGB→BRG'
    },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    const maps = {
      'RGB→BRG': [2, 0, 1], 'RGB→GBR': [1, 2, 0], 'RGB→RBG': [0, 2, 1],
      'RGB→BGR': [2, 1, 0], 'RGB→GRB': [1, 0, 2],
    };
    const m = maps[p.mode] || [0, 1, 2];
    for (let i = 0; i < src.length; i += 4) {
      out[i] = src[i + m[0]]; out[i + 1] = src[i + m[1]];
      out[i + 2] = src[i + m[2]]; out[i + 3] = src[i + 3];
    }
    return out;
  }
};
