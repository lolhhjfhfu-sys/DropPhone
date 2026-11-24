/* PHONE DROP 2.0.0 — векторный рендер смартфонов (корпус, камеры, экран, расцветки).
   Каждая модель имеет собственную компоновку камерного блока. Рендер — стилизованный SVG, не фотографии. */
(function (G) {
  'use strict';
  const PD = G.PD = G.PD || {};

  /* ---------- цветовые утилиты ---------- */
  const h2r = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const r2h = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const x = h2r(a), y = h2r(b); return r2h(x.map((v, i) => v + (y[i] - v) * t)); };
  const lighten = (c, t) => mix(c, '#ffffff', t);
  const darken = (c, t) => mix(c, '#000000', t);
  const lum = c => { const [r, g, b] = h2r(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  PD.color = { mix, lighten, darken, lum };

  /* ---------- примитивы камерных блоков (координаты в системе шириной 200) ---------- */
  const L = (x, y, r, o) => Object.assign({ k: 'l', x, y, r }, o);          // объектив
  const F = (x, y, r, o) => Object.assign({ k: 'f', x, y, r: r || 5 }, o);  // вспышка
  const M = (x, y, r) => ({ k: 'm', x, y, r: r || 2 });                      // микрофон/датчик
  const R = (x, y, w, h, r, st, o) => Object.assign({ k: 'r', x, y, w, h, r, st }, o); // плита/выступ
  const C = (x, y, r, st, o) => Object.assign({ k: 'c', x, y, r, st }, o);  // круг-плита
  const T = (x, y, s, size, o) => Object.assign({ k: 't', x, y, s, size }, o); // надпись
  const P = (d, st, o) => Object.assign({ k: 'p', d, st }, o);               // произвольный контур

  const CAMS = {
    ip11: [R(14, 14, 82, 82, 22, 'glass'), L(40, 41, 15.5, { ring: 'metal' }), L(40, 74, 15.5, { ring: 'metal' }), F(77, 33, 6.5), M(77, 55, 2)],
    ip12: [R(14, 14, 86, 86, 21, 'glass'), L(42, 42, 16, { ring: 'metal' }), L(42, 77, 16, { ring: 'metal' }), F(80, 33, 6), M(80, 55, 2), M(80, 80, 2.5, 'lidar')],
    ip13: [R(14, 14, 88, 88, 22, 'glass'), L(39, 39, 16.5, { ring: 'metal' }), L(75, 75, 16.5, { ring: 'metal' }), F(77, 35, 5.5), M(39, 77, 2)],
    ip13p: [R(14, 14, 98, 98, 24, 'glass'), L(41, 41, 19, { ring: 'metal' }), L(41, 85, 19, { ring: 'metal' }), L(85, 63, 19, { ring: 'metal' }), F(88, 29, 5.5), M(88, 97, 5, 'lidar'), M(61, 99, 1.8)],
    ip14: [R(14, 14, 90, 90, 23, 'glass'), L(40, 40, 17.5, { ring: 'metal' }), L(78, 78, 17.5, { ring: 'metal' }), F(78, 35, 5.5), M(40, 79, 2)],
    ip14p: [R(14, 14, 104, 104, 26, 'glass'), L(44, 44, 20.5, { ring: 'metal' }), L(44, 90, 20.5, { ring: 'metal' }), L(90, 67, 20.5, { ring: 'metal' }), F(94, 31, 6), M(94, 103, 5.5, 'lidar'), M(67, 106, 2)],
    ip15: [R(14, 14, 92, 92, 24, 'glass'), L(41, 41, 18, { ring: 'metal' }), L(80, 80, 18, { ring: 'metal' }), F(80, 36, 5.5), M(41, 80, 2)],
    ip15p: [R(14, 14, 106, 106, 28, 'glass'), L(45, 45, 21, { ring: 'dark' }), L(45, 92, 21, { ring: 'dark' }), L(92, 68, 21, { ring: 'dark' }), F(96, 32, 6), M(96, 105, 5.5, 'lidar'), M(68, 108, 2)],
    ip16: [R(14, 14, 64, 118, 32, 'glass'), L(46, 46, 17.5, { ring: 'metal' }), L(46, 100, 17.5, { ring: 'metal' }), F(98, 34, 5.5), M(98, 52, 2)],
    ip16p: [R(14, 14, 110, 110, 29, 'glass'), L(46, 46, 22, { ring: 'dark' }), L(46, 94, 22, { ring: 'dark' }), L(96, 70, 22, { ring: 'dark' }), F(100, 33, 6), M(100, 108, 5.5, 'lidar'), M(72, 112, 2)],
    ip17: [R(14, 14, 74, 128, 34, 'glass'), L(51, 53, 19.5, { ring: 'metal' }), L(51, 105, 19.5, { ring: 'metal' }), F(110, 38, 5.5), M(110, 58, 2)],
    ip17pm: [R(6, 14, 188, 104, 24, 'glass'), L(46, 48, 21, { ring: 'dark' }), L(46, 94, 21, { ring: 'dark' }), L(94, 71, 21, { ring: 'dark' }), F(150, 42, 6), M(150, 74, 5.5, 'lidar'), M(172, 42, 2), M(172, 62, 2)],
    ip15pm: [R(14, 14, 106, 106, 28, 'glass'), L(45, 45, 21, { ring: 'dark' }), L(45, 92, 21, { ring: 'dark' }), L(92, 68, 21, { ring: 'dark' }), F(96, 32, 6), M(96, 105, 5.5, 'lidar'), M(68, 108, 2)],
    ip16pm: [R(14, 14, 110, 110, 29, 'glass'), L(46, 46, 22, { ring: 'dark' }), L(46, 94, 22, { ring: 'dark' }), L(96, 70, 22, { ring: 'dark' }), F(100, 33, 6), M(100, 108, 5.5, 'lidar'), M(72, 112, 2)],
    s24fe: [L(36, 40, 15.5, { ring: 'metal' }), L(36, 84, 15.5, { ring: 'metal' }), L(36, 128, 15.5, { ring: 'metal' }), F(74, 40, 4.5), M(74, 56, 2)],
    x14t: [R(12, 12, 112, 112, 26, 'dark'), L(47, 47, 23, { ring: 'dark' }), L(47, 99, 15, { ring: 'dark' }), L(95, 75, 15, { ring: 'dark' }), F(100, 32, 5), T(70, 118, 'LEICA', 6, { fill: '#e8e8e8', ls: 1.5 }), C(102, 104, 4, 'leica')],
    pix8p: [R(0, 66, 200, 58, 16, 'visor'), L(56, 95, 17, { ring: 'dark' }), L(102, 95, 15, { ring: 'dark' }), L(142, 95, 12, { ring: 'dark' }), F(172, 82, 4.5), M(172, 106, 3), M(172, 94, 1.8)],
    pf7p: [R(12, 12, 96, 96, 22, 'dark'), L(42, 42, 19, { ring: 'dark' }), L(42, 88, 13, { ring: 'dark' }), F(84, 30, 5), T(138, 330, 'POCO', 38, { fill: 'auto', weight: 800, rot: -90, ls: 4 })],
    nt2a: [R(10, 12, 180, 54, 27, 'dark'), L(44, 39, 17, { ring: 'dark' }), L(100, 39, 17, { ring: 'dark' }), F(150, 39, 4.5), M(168, 39, 2), T(100, 380, 'Nothing', 9, { fill: 'auto', ls: 2, weight: 600 })],
    op13r: [C(66, 68, 58, 'ring'), L(46, 45, 18, { ring: 'dark' }), L(46, 91, 18, { ring: 'dark' }), L(90, 68, 14, { ring: 'dark' }), T(96, 100, 'H', 6, { fill: '#f08a2a', weight: 700 }), F(136, 34, 5), M(136, 52, 2), T(100, 395, 'ONEPLUS', 9, { fill: 'auto', ls: 3, weight: 600 })],
    ipse3: [L(38, 36, 15, { ring: 'metal' }), F(70, 30, 5), M(70, 46, 1.8)],
    s21: [P('M0,16 H66 A28,28 0 0 1 94,44 V106 A28,28 0 0 1 66,134 H0 Z', 'contour'), L(40, 45, 17, { ring: 'dark' }), L(40, 87, 14.5, { ring: 'dark' }), L(40, 121, 12, { ring: 'dark' }), F(74, 38, 4.5), M(74, 52, 2)],
    s22: [L(35, 38, 15, { ring: 'metal' }), L(35, 80, 15, { ring: 'metal' }), L(35, 122, 15, { ring: 'metal' }), F(70, 38, 4.5), M(70, 52, 2)],
    s23: [L(35, 39, 15, { ring: 'body' }), L(35, 82, 15, { ring: 'body' }), L(35, 125, 15, { ring: 'body' }), F(72, 40, 4.5), M(72, 55, 2)],
    s23u: [L(36, 40, 17, { ring: 'body' }), L(36, 86, 17, { ring: 'body' }), L(36, 132, 17, { ring: 'body' }), L(82, 86, 13, { ring: 'body' }), F(84, 38, 4.5), M(84, 132, 3), M(84, 52, 2)],
    s24: [L(36, 40, 15.5, { ring: 'metal' }), L(36, 84, 15.5, { ring: 'metal' }), L(36, 128, 15.5, { ring: 'metal' }), F(74, 40, 4.5), M(74, 56, 2)],
    s24u: [L(36, 40, 17.5, { ring: 'metal' }), L(36, 87, 17.5, { ring: 'metal' }), L(36, 134, 17.5, { ring: 'metal' }), L(84, 70, 14, { ring: 'metal' }), F(86, 36, 4.5), M(86, 118, 3), M(86, 134, 2)],
    s25: [L(36, 40, 15.5, { ring: 'dark' }), L(36, 84, 15.5, { ring: 'dark' }), L(36, 128, 15.5, { ring: 'dark' }), F(74, 42, 4.5), M(74, 58, 2)],
    s25u: [L(36, 40, 18, { ring: 'dark' }), L(36, 88, 18, { ring: 'dark' }), L(36, 136, 18, { ring: 'dark' }), L(86, 72, 14.5, { ring: 'dark' }), F(88, 36, 4.5), M(88, 120, 3), M(88, 136, 2)],
    a55: [R(190, 98, 10, 80, 4, 'keyisland'), L(36, 38, 14, { ring: 'body' }), L(36, 76, 14, { ring: 'body' }), L(36, 114, 14, { ring: 'body' }), F(68, 36, 4)],
    x13: [R(12, 12, 108, 112, 28, 'dark'), L(46, 46, 21, { ring: 'dark' }), L(46, 96, 17, { ring: 'dark' }), L(92, 74, 15, { ring: 'dark' }), F(96, 32, 5), T(66, 116, 'LEICA', 6, { fill: '#e8e8e8', ls: 1.5 }), C(98, 102, 4, 'leica')],
    x14: [R(12, 12, 112, 116, 32, 'dark'), L(48, 48, 23, { ring: 'dark' }), L(48, 100, 17, { ring: 'dark' }), L(96, 76, 17, { ring: 'dark' }), F(100, 33, 5), T(68, 120, 'LEICA', 6.5, { fill: '#e8e8e8', ls: 1.5 }), C(102, 106, 4, 'leica')],
    x14u: [C(68, 72, 58, 'ultra'), L(68, 72, 25, { ring: 'dark' }), L(37, 44, 11, { ring: 'dark' }), L(99, 44, 11, { ring: 'dark' }), L(37, 100, 11, { ring: 'dark' }), L(99, 100, 11, { ring: 'dark' }), F(144, 30, 5), M(144, 48, 2), C(68, 126, 3.5, 'leica'), T(68, 12, 'VARIO-SUMMILUX 1:1.63-4.3/12-120 ASPH.', 4.2, { fill: '#d0d0d0', ls: 0.3 })],
    x15: [R(12, 12, 114, 118, 36, 'dark'), L(50, 50, 23, { ring: 'dark' }), L(50, 102, 17, { ring: 'dark' }), L(98, 78, 17, { ring: 'dark' }), F(102, 34, 5), T(70, 122, 'LEICA', 6.5, { fill: '#e8e8e8', ls: 1.5 }), C(104, 108, 4, 'leica')],
    rn12: [R(12, 12, 68, 134, 28, 'dark'), L(46, 44, 17, { ring: 'dark' }), L(46, 92, 14, { ring: 'dark' }), L(46, 130, 9, { ring: 'dark' }), F(104, 30, 4.5), T(100, 395, 'Redmi', 11, { fill: 'auto', weight: 600 })],
    rn13p: [R(12, 12, 104, 108, 30, 'dark'), L(44, 44, 20, { ring: 'dark' }), L(44, 90, 14, { ring: 'dark' }), L(88, 66, 14, { ring: 'dark' }), F(92, 30, 4.5), T(100, 395, 'Redmi', 11, { fill: 'auto', weight: 600 })],
    rn14p: [R(12, 12, 94, 124, 38, 'dark'), L(42, 44, 21, { ring: 'dark' }), L(42, 98, 21, { ring: 'dark' }), L(84, 40, 9, { ring: 'dark' }), F(84, 72, 4.5), T(100, 395, 'Redmi', 11, { fill: 'auto', weight: 600 })],
    px6p: [R(12, 12, 70, 120, 30, 'dark'), L(47, 46, 19, { ring: 'dark' }), L(47, 100, 14, { ring: 'dark' }), F(104, 28, 4.5), T(138, 330, 'POCO', 38, { fill: 'auto', weight: 800, rot: -90, ls: 4 })],
    px7p: [R(12, 12, 96, 96, 26, 'dark'), L(42, 42, 19, { ring: 'dark' }), L(42, 86, 13, { ring: 'dark' }), F(84, 30, 5), T(138, 330, 'POCO', 38, { fill: 'auto', weight: 800, rot: -90, ls: 4 })],
    pf6: [R(12, 12, 74, 104, 34, 'dark'), L(49, 49, 20, { ring: 'dark' }), L(49, 94, 14, { ring: 'dark' }), F(110, 30, 4.5), T(138, 330, 'POCO', 38, { fill: 'auto', weight: 800, rot: -90, ls: 4 })],
    pix7: [R(0, 70, 200, 52, 0, 'visor'), L(62, 96, 16, { ring: 'dark' }), L(106, 96, 16, { ring: 'dark' }), F(150, 85, 4), M(150, 105, 3)],
    pix8: [R(0, 66, 200, 56, 16, 'visor'), L(60, 94, 17, { ring: 'dark' }), L(108, 94, 17, { ring: 'dark' }), F(152, 82, 4.5), M(152, 104, 2.5)],
    pix9: [R(14, 64, 172, 58, 29, 'pill'), L(52, 93, 17, { ring: 'dark' }), L(100, 93, 17, { ring: 'dark' }), F(144, 82, 4.5), M(144, 104, 2.5)],
    pix9p: [R(12, 64, 176, 62, 31, 'pill'), L(48, 95, 18.5, { ring: 'dark' }), L(96, 95, 18.5, { ring: 'dark' }), L(140, 95, 12, { ring: 'dark' }), F(168, 84, 4), M(168, 106, 2.5)],
    op12: [C(66, 68, 58, 'ring'), L(46, 45, 18, { ring: 'dark' }), L(46, 91, 18, { ring: 'dark' }), L(90, 68, 16, { ring: 'dark' }), T(96, 100, 'H', 7, { fill: '#f08a2a', weight: 700 }), F(136, 34, 5), M(136, 52, 2), T(100, 395, 'ONEPLUS', 9, { fill: 'auto', ls: 3, weight: 600 })],
    op13: [R(10, 10, 126, 126, 54, 'ring'), L(48, 50, 19.5, { ring: 'dark' }), L(48, 96, 19.5, { ring: 'dark' }), L(96, 73, 19.5, { ring: 'dark' }), T(98, 108, 'H', 7, { fill: '#f08a2a', weight: 700 }), F(150, 36, 5), M(150, 54, 2), T(100, 400, 'ONEPLUS', 9, { fill: 'auto', ls: 3, weight: 600 })],
    nt2: [L(42, 44, 17, { ring: 'dark' }), L(42, 92, 17, { ring: 'dark' }), F(80, 34, 3.5), M(80, 48, 2), 'nt2glyph'],
    nt3: [R(12, 12, 70, 126, 35, 'dark'), L(47, 47, 17, { ring: 'dark' }), L(47, 94, 17, { ring: 'dark' }), L(47, 130, 0.1, { ring: 'dark' }), F(100, 30, 4), 'nt3glyph'],
    rno12: [R(12, 12, 74, 110, 37, 'dark'), L(49, 49, 19, { ring: 'dark' }), L(49, 96, 15, { ring: 'dark' }), F(112, 30, 4.5), T(100, 395, 'OPPO', 11, { fill: 'auto', ls: 3, weight: 700 })],
    rgt6: [R(12, 12, 76, 130, 26, 'dark'), L(50, 42, 17, { ring: 'dark' }), L(50, 88, 17, { ring: 'dark' }), L(50, 124, 9, { ring: 'dark' }), F(108, 28, 4.5), T(120, 360, 'GT', 18, { fill: 'auto', weight: 800, ls: 2 }), T(100, 395, 'realme', 10, { fill: 'auto', weight: 600 })],
    igt20: [R(12, 12, 104, 86, 16, 'dark'), L(40, 40, 16, { ring: 'dark' }), L(40, 78, 8, { ring: 'dark' }), L(84, 40, 8, { ring: 'dark' }), F(84, 76, 4.5), 'igtglow', T(100, 400, 'INFINIX', 9, { fill: 'auto', ls: 3, weight: 700 })],
    hm6p: [C(68, 70, 58, 'ocean'), L(46, 48, 17, { ring: 'dark' }), L(46, 92, 17, { ring: 'dark' }), L(92, 70, 17, { ring: 'dark' }), F(138, 32, 5), M(138, 50, 2), T(100, 395, 'HONOR', 10, { fill: 'auto', ls: 3, weight: 700 })],
    moe50: [R(12, 12, 64, 112, 32, 'dark'), L(44, 44, 15.5, { ring: 'dark' }), L(44, 82, 12, { ring: 'dark' }), L(44, 114, 8, { ring: 'dark' }), F(100, 30, 4.5), T(100, 380, 'moto', 14, { fill: 'auto', weight: 700 })]
  };

  /* ---------- боковые кнопки ---------- */
  function buttons(m, H) {
    const b = [];
    const L_ = (y1, y2, k) => b.push({ s: 'l', y1, y2, k });
    const R_ = (y1, y2, k) => b.push({ s: 'r', y1, y2, k });
    if (m.br === 'Apple') {
      const old = /^ip(11|12|13|13p|14|14p|se3)$/.test(m.id) || m.id === 'ipse3';
      if (old) { L_(H * .19, H * .215, 'mute'); L_(H * .26, H * .34, 'vol'); L_(H * .36, H * .44, 'vol'); }
      else { L_(H * .19, H * .22, 'action'); L_(H * .26, H * .34, 'vol'); L_(H * .36, H * .44, 'vol'); }
      R_(H * .30, H * .44, 'pwr');
      if (/^ip(16|16p|17|17pm)$/.test(m.id)) R_(H * .62, H * .71, 'cam');
    } else if (m.br === 'Google') { R_(H * .2, H * .3, 'vol'); R_(H * .34, H * .42, 'pwr'); }
    else if (m.br === 'OnePlus') { R_(H * .12, H * .17, 'slider'); R_(H * .22, H * .32, 'vol'); R_(H * .38, H * .46, 'pwr'); }
    else { R_(H * .22, H * .32, 'vol'); R_(H * .37, H * .45, 'pwr'); }
    return b;
  }

  /* ---------- геометрия экрана ---------- */
  function geom(m) {
    const W = 200, H = +(200 * m.h / m.w).toFixed(1);
    const rad = m.rad * W;
    const fw = { flat: 2.6, round: 3.2, steel: 3, titan: 2.6, alu: 2.4, plastic: 1.6 }[m.frame] || 2.4;
    const bz = m.bezel * W;
    let top = bz, bot = bz;
    if (m.notch === 'homebtn') { top = 34; bot = 36; }
    const sx = bz, sy = top, sw = W - bz * 2, sh = H - top - bot;
    const sr = m.flatScreen ? Math.max(6, rad * 0.35) : Math.max(8, rad - bz * 0.9);
    return { W, H, rad, fw, bz, sx, sy, sw, sh, sr, vb: [-8, -6, W + 16, H + 12] };
  }
  PD.screenGeom = m => { const g = geom(m); return { x: g.sx, y: g.sy, w: g.sw, h: g.sh, r: g.sr, W: g.W, H: g.H, vb: g.vb }; };

  /* ---------- сборка SVG ---------- */
  const cache = {};
  let uid = 0;

  function bodyBack(m, col, g) {
    const { W, H, rad, fw } = g;
    const fr = col.fr || col.c2;
    let s = '';
    // кнопки
    const btnCol = lighten(fr, m.frame === 'plastic' ? 0 : 0.1);
    buttons(m, H).forEach(b => {
      const x = b.s === 'l' ? -2.6 : W - 0.2;
      const bc = (b.k === 'pwr' && m.br === 'Google') ? mix(col.c1, '#ff9a3c', .35) : (b.k === 'cam' ? darken(fr, .25) : (b.k === 'action' ? darken(fr, .15) : btnCol));
      s += `<rect x="${x}" y="${b.y1.toFixed(1)}" width="2.8" height="${(b.y2 - b.y1).toFixed(1)}" rx="1.2" fill="${bc}"/>`;
    });
    // тень
    s += `<ellipse cx="${W / 2}" cy="${H + 2}" rx="${W * .46}" ry="5" fill="url(#§sh)"/>`;
    // рамка
    s += `<rect width="${W}" height="${H}" rx="${rad}" fill="url(#§fr)"/>`;
    if (m.frame === 'round' || m.frame === 'plastic') s += `<rect x="1.2" y="1.2" width="${W - 2.4}" height="${H - 2.4}" rx="${rad - 1.2}" fill="${darken(fr, .12)}" opacity=".55"/>`;
    // задняя панель
    const bx = fw, br = Math.max(4, rad - fw);
    s += `<rect x="${bx}" y="${bx}" width="${W - bx * 2}" height="${H - bx * 2}" rx="${br}" fill="url(#§bd)"/>`;
    return s;
  }

  function backFinish(m, col, g) {
    const { W, H, rad, fw } = g;
    let s = '';
    const bx = fw, bw = W - bx * 2, bh = H - bx * 2, br = Math.max(4, rad - fw);
    const dark = lum(col.c1) < 0.35;
    if (m.pocoSplit) {
      const black = col.c2 === '#2b2b2d' || col.c2 === '#2c2c2e';
      if (black) {
        s += `<clipPath id="§pc"><rect x="${bx}" y="${bx}" width="${bw}" height="${bh}" rx="${br}"/></clipPath><g clip-path="url(#§pc)"><path d="M0,0 H${W} V165 Q${W * .5},190 0,160 Z" fill="#1a1a1c"/></g>`;
      }
    }
    s += `<clipPath id="§bc"><rect x="${bx}" y="${bx}" width="${bw}" height="${bh}" rx="${br}"/></clipPath><g clip-path="url(#§bc)">`;
    if (m.frame === 'titan' || m.frame === 'steel') s += `<rect width="${W}" height="${H}" fill="url(#§br)" opacity="${dark ? .16 : .1}"/>`;
    if (m.vegan) s += `<rect width="${W}" height="${H}" fill="url(#§vg)" opacity=".5"/>`;
    if (m.matteGlass) s += `<rect width="${W}" height="${H}" fill="url(#§mt)" opacity=".5"/>`;
    else s += `<path d="M${W * .06},0 L${W * .62},0 L${W * .12},${H * .62} L0,${H * .62} L0,${H * .05}Z" fill="url(#§sh1)"/>`;
    s += `<path d="M${W},${H * .45} L${W},${H} L${W * .35},${H}Z" fill="url(#§sh2)"/>`;
    s += '</g>';
    return s;
  }

  function plateStyle(st, m, col, g) {
    const base = col.c1;
    const dk = lum(base) < 0.35;
    switch (st) {
      case 'glass': return { fill: `url(#§pg)`, stroke: dk ? lighten(base, .18) : darken(base, .08), sw: 1, op: 1 };
      case 'dark': return { fill: 'url(#§pd)', stroke: '#3b3c42', sw: 1 };
      case 'visor': return { fill: 'url(#§pv)', stroke: darken(col.fr, .2), sw: 1.2 };
      case 'pill': return { fill: 'url(#§pv)', stroke: lighten(col.c1, .08), sw: 1.2 };
      case 'ring': return { fill: 'url(#§pr)', stroke: lighten(col.fr, .1), sw: 2.2 };
      case 'keyisland': return { fill: lighten(col.fr, .1), stroke: darken(col.fr, .15), sw: .8 };
      default: return { fill: 'none', stroke: 'none', sw: 0 };
    }
  }

  function lensSVG(l, col) {
    const { x, y, r } = l; if (r < 1) return '';
    let ring = l.ring === 'dark' ? 'url(#§rd)' : l.ring === 'body' ? col.fr ? lighten(col.c1, .1) : '#bbb' : 'url(#§rm)';
    if (l.ring === 'body') ring = lum(col.c1) < .35 ? lighten(col.c1, .22) : darken(col.c1, .08);
    return `<circle cx="${x}" cy="${y}" r="${(r * 1.1).toFixed(1)}" fill="#000" opacity=".26"/>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${ring}"/>` +
      `<circle cx="${x}" cy="${y}" r="${(r * .84).toFixed(1)}" fill="#06070a"/>` +
      `<circle cx="${x}" cy="${y}" r="${(r * .72).toFixed(1)}" fill="url(#§lg)"/>` +
      `<circle cx="${x}" cy="${y}" r="${(r * .97).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="${Math.max(.4, r * .035).toFixed(1)}"/>` +
      `<circle cx="${x}" cy="${y}" r="${(r * .58).toFixed(1)}" fill="none" stroke="rgba(90,200,170,.28)" stroke-width="${Math.max(.4, r * .05).toFixed(1)}"/>` +
      `<circle cx="${x}" cy="${y}" r="${(r * .34).toFixed(1)}" fill="#0d1019" stroke="rgba(130,150,255,.4)" stroke-width=".5"/>` +
      `<circle cx="${x}" cy="${y}" r="${(r * .17).toFixed(1)}" fill="#05060a"/>` +
      `<circle cx="${(x - r * .3).toFixed(1)}" cy="${(y - r * .34).toFixed(1)}" r="${(r * .13).toFixed(1)}" fill="#fff" opacity=".6"/>` +
      `<path d="M${(x + r * .25).toFixed(1)},${(y + r * .5).toFixed(1)} A${(r * .56).toFixed(1)},${(r * .56).toFixed(1)} 0 0 0 ${(x + r * .52).toFixed(1)},${(y + r * .22).toFixed(1)}" stroke="rgba(160,120,255,.55)" stroke-width="${Math.max(.6, r * .06).toFixed(1)}" fill="none"/>`;
  }

  function camSVG(m, col, g) {
    const spec = CAMS[m.id] || [];
    let s = '';
    const autoFill = lum(col.c1) < 0.4 ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.55)';
    spec.forEach(e => {
      if (typeof e === 'string') { s += special(e, m, col, g); return; }
      switch (e.k) {
        case 'r': {
          const ps = plateStyle(e.st, m, col, g);
          s += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.r}" fill="${ps.fill}" stroke="${ps.stroke}" stroke-width="${ps.sw}"/>`;
          if (e.st === 'visor' || e.st === 'pill') s += `<rect x="${e.x + 1.2}" y="${e.y + 1.2}" width="${e.w - 2.4}" height="${Math.max(2, e.h * .35)}" rx="${Math.max(1, e.r - 1)}" fill="#fff" opacity=".05"/>`;
          if (e.st === 'glass') s += `<rect x="${e.x + 1}" y="${e.y + 1}" width="${e.w - 2}" height="${e.h - 2}" rx="${e.r - 1}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width=".8"/>`;
          break;
        }
        case 'c': {
          if (e.st === 'ultra') {
            s += `<circle cx="${e.x}" cy="${e.y}" r="${e.r + 6}" fill="url(#§rm)"/><circle cx="${e.x}" cy="${e.y}" r="${e.r + 2}" fill="#101114"/><circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="url(#§pd)" stroke="#3b3c42" stroke-width="1"/>`;
          } else if (e.st === 'ring') {
            s += `<circle cx="${e.x}" cy="${e.y}" r="${e.r + 2}" fill="${darken(col.fr, .2)}"/><circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="url(#§pr)" stroke="${lighten(col.fr, .15)}" stroke-width="2"/>`;
          } else if (e.st === 'ocean') {
            s += `<circle cx="${e.x}" cy="${e.y}" r="${e.r + 2}" fill="${lighten(col.fr, .1)}"/><circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="url(#§po)" stroke="#2c2d33" stroke-width="1.2"/><circle cx="${e.x}" cy="${e.y}" r="${e.r - 6}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="3"/>`;
          } else if (e.st === 'leica') {
            s += `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="#e2221b"/><text x="${e.x}" y="${e.y + 1.5}" font-size="3.6" fill="#fff" text-anchor="middle" font-family="serif" font-style="italic" font-weight="700">L</text>`;
          } else s += `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="${e.st}"/>`;
          break;
        }
        case 'l': s += lensSVG(e, col); break;
        case 'f': s += `<circle cx="${e.x}" cy="${e.y}" r="${e.r + 1.2}" fill="rgba(0,0,0,.3)"/><circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="url(#§fl)"/>`; break;
        case 'm': s += e.r > 3 ? `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="#0b0c0f" stroke="#2c2d33" stroke-width=".8"/><circle cx="${e.x}" cy="${e.y}" r="${e.r * .4}" fill="#1b2030"/>` : `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="#0b0c0f" opacity=".85"/>`; break;
        case 't': {
          const fill = e.fill === 'auto' ? autoFill : e.fill;
          s += `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${fill}" text-anchor="middle" font-family="Inter,Roboto,Arial,sans-serif" font-weight="${e.weight || 500}" letter-spacing="${e.ls || 0}"${e.rot ? ` transform="rotate(${e.rot} ${e.x} ${e.y})"` : ''}>${e.s}</text>`;
          break;
        }
        case 'p': {
          if (e.st === 'contour') s += `<path d="${e.d}" fill="url(#§rm)"/><path d="${e.d}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>`;
          break;
        }
      }
    });
    return s;
  }

  function special(key, m, col, g) {
    const { W, H } = g;
    if (key === 'nt2glyph') {
      let s = `<g fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2">` +
        `<circle cx="100" cy="${H * .42}" r="42"/><circle cx="100" cy="${H * .42}" r="28"/><circle cx="100" cy="${H * .42}" r="12"/></g>` +
        `<rect x="22" y="${H * .62}" width="156" height="64" rx="10" fill="#7d8087" opacity=".25"/>` +
        `<rect x="30" y="${H * .62 + 10}" width="50" height="44" rx="6" fill="#4a4d54" opacity=".35"/>` +
        `<g fill="#9fa3ab" opacity=".5"><circle cx="30" cy="${H - 34}" r="2.4"/><circle cx="170" cy="${H - 34}" r="2.4"/><circle cx="170" cy="${H * .62 + 8}" r="2.4"/></g>`;
      // световые полосы Glyph
      s += `<g fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity=".92">` +
        `<path d="M170,${H * .14} V${H * .3}"/><path d="M168,${H * .34} Q184,${H * .34} 184,${H * .4} V${H * .5}"/><path d="M100,${H - 26} H150"/><path d="M26,${H * .3} V${H * .5}" stroke-opacity=".8"/></g>` +
        `<circle cx="62" cy="${H - 26}" r="2.6" fill="#fff"/>`;
      return s;
    }
    if (key === 'nt3glyph') {
      let s = `<circle cx="146" cy="52" r="34" fill="#0b0c0f" opacity=".92" stroke="rgba(255,255,255,.15)"/>`;
      const lit = new Set(['2,2', '2,3', '2,4', '3,3', '3,4', '4,4', '4,5', '5,5', '5,6', '6,2', '6,3', '6,4', '6,5', '6,6']);
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
        const dx = (i - 4) * 6.4, dy = (j - 4) * 6.4; if (dx * dx + dy * dy > 27 * 27) continue;
        const on = (i === 2 || i === 6) && j >= 2 && j <= 6 || (i - 2 === j - 2 && i > 2 && i < 6 && j > 2 && j < 6);
        s += `<circle cx="${(146 + dx).toFixed(1)}" cy="${(52 + dy).toFixed(1)}" r="${on ? 1.9 : 1.1}" fill="${on ? '#fff' : '#3a3d45'}"/>`;
      }
      s += `<circle cx="100" cy="${H * .6}" r="9" fill="#f23b3b" opacity=".0"/><text x="100" y="${H - 24}" font-size="9" fill="${lum(col.c1) < .4 ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.45)'}" text-anchor="middle" font-family="monospace" letter-spacing="3">NOTHING</text>`;
      return s;
    }
    if (key === 'igtglow') {
      return `<rect x="9" y="9" width="110" height="92" rx="19" fill="none" stroke="url(#§rgb)" stroke-width="2.6"/>` +
        `<rect x="176" y="40" width="5" height="150" rx="2.5" fill="url(#§rgb)"/>` +
        `<path d="M130,150 L170,120 M130,175 L170,145 M130,200 L170,170" stroke="url(#§rgb)" stroke-width="1.4" opacity=".7"/>` +
        `<text x="150" y="${H - 80}" font-size="26" font-weight="800" fill="url(#§rgb)" font-family="Inter,Arial" text-anchor="middle" letter-spacing="2" transform="rotate(-90 150 ${H - 80})">GT</text>`;
    }
    return '';
  }

  function brandLogo(m, col, g) {
    const { W, H } = g;
    if (m.br !== 'Apple') return '';
    const c = lum(col.c1) < 0.4 ? 'rgba(255,255,255,.62)' : 'rgba(0,0,0,.28)';
    const cx = W / 2, cy = m.id === 'ip17pm' ? H * .55 : H * .52;
    const s = m.id === 'ipse3' ? .9 : 1;
    return `<g transform="translate(${cx} ${cy}) scale(${s * .95})" fill="${c}"><path d="M-1,-13 C-6,-14 -13,-10 -13,0 C-13,9 -7,17 -2,17 C0,17 1,16 4,16 C7,16 8,17 10,17 C13,17 17,11 18,8 C13,6 11,-1 15,-6 C13,-9 10,-10 7,-10 C4,-10 2,-9 -1,-9 Z M3,-13 C3,-17 6,-21 10,-21 C10,-17 7,-13 3,-13 Z" transform="scale(.9)"/></g>`;
  }

  function defs(m, col, g) {
    const fr = col.fr || col.c2;
    const dark = lum(col.c1) < 0.35;
    const f1 = lighten(fr, .28), f2 = fr, f3 = darken(fr, .22);
    const c1 = col.c1, c2 = col.c2;
    let d = '<defs>';
    d += `<linearGradient id="§fr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${f1}"/><stop offset=".08" stop-color="${f2}"/><stop offset=".5" stop-color="${lighten(fr, .08)}"/><stop offset=".92" stop-color="${f3}"/><stop offset="1" stop-color="${lighten(fr, .12)}"/></linearGradient>`;
    d += `<linearGradient id="§bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
    d += `<linearGradient id="§sh1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${dark ? .2 : .42}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    d += `<linearGradient id="§sh2" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="${dark ? .1 : .2}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    d += `<radialGradient id="§sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`;
    d += `<radialGradient id="§lg" cx=".38" cy=".34" r=".8"><stop offset="0" stop-color="#4a3f8c"/><stop offset=".45" stop-color="#17163a"/><stop offset="1" stop-color="#05060c"/></radialGradient>`;
    d += `<linearGradient id="§rm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0f1f4"/><stop offset=".5" stop-color="#8d9098"/><stop offset="1" stop-color="#d9dbe0"/></linearGradient>`;
    d += `<linearGradient id="§rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5c63"/><stop offset=".5" stop-color="#1b1c20"/><stop offset="1" stop-color="#4a4c52"/></linearGradient>`;
    d += `<radialGradient id="§fl" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#fffbe6"/><stop offset=".6" stop-color="#e8dca8"/><stop offset="1" stop-color="#9c9468"/></radialGradient>`;
    d += `<linearGradient id="§pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark ? lighten(c1, .1) : lighten(c1, .22)}"/><stop offset="1" stop-color="${dark ? lighten(c2, .04) : lighten(c2, .06)}"/></linearGradient>`;
    d += `<linearGradient id="§pd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26272c"/><stop offset="1" stop-color="#0d0e11"/></linearGradient>`;
    d += `<linearGradient id="§pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2e33"/><stop offset="1" stop-color="#0e0f12"/></linearGradient>`;
    d += `<linearGradient id="§pr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(fr, .12)}"/><stop offset=".5" stop-color="${darken(c1, .25)}"/><stop offset="1" stop-color="${darken(fr, .2)}"/></linearGradient>`;
    d += `<linearGradient id="§po" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b5649"/><stop offset=".5" stop-color="#16201b"/><stop offset="1" stop-color="#2f463b"/></linearGradient>`;
    d += `<linearGradient id="§rgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2ee6ff"/><stop offset=".5" stop-color="#b44bff"/><stop offset="1" stop-color="#ff3d8b"/></linearGradient>`;
    d += `<pattern id="§br" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height=".6" fill="#fff"/></pattern>`;
    d += `<pattern id="§vg" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".55" fill="#000" opacity=".5"/></pattern>`;
    d += `<linearGradient id="§mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>`;
    d += `<linearGradient id="§sc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14161d"/><stop offset="1" stop-color="#05060a"/></linearGradient>`;
    d += `<linearGradient id="§rf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".45" stop-color="#fff" stop-opacity=".02"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    d += '</defs>';
    return d;
  }

  function backSVG(m, ci) {
    const col = m.colors[ci % m.colors.length]; const g = geom(m);
    let body = bodyBack(m, col, g);
    if (m.transparent) {
      body = body.replace(/fill="url\(#§bd\)"/, `fill="${m.id === 'nt3' ? col.c1 : 'url(#§tr)'}"`);
    }
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.vb.join(' ')}" class="phone-svg" role="img" aria-label="${m.n}, ${col.name}, вид сзади">`;
    s += defs(m, col, g);
    if (m.transparent && m.id === 'nt2') s += `<defs><linearGradient id="§tr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(col.c1, .05)}" stop-opacity=".98"/><stop offset="1" stop-color="${col.c2}"/></linearGradient></defs>`;
    s += body + backFinish(m, col, g);
    if (m.pocoSplit && col.c2 !== '#2b2b2d' && col.c2 !== '#2c2c2e') { /* чёрные/серые без раздела */ }
    s += camSVG(m, col, g);
    s += brandLogo(m, col, g);
    // блик по краю
    s += `<rect x=".5" y=".5" width="${g.W - 1}" height="${g.H - 1}" rx="${g.rad}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>`;
    s += '</svg>';
    return s;
  }

  function frontSVG(m, ci, o) {
    const col = m.colors[ci % m.colors.length]; const g = geom(m);
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.vb.join(' ')}" class="phone-svg" role="img" aria-label="${m.n}, вид спереди">`;
    s += defs(m, col, g);
    s += bodyBack(m, col, g).replace(/fill="url\(#§bd\)"/, 'fill="#050609"');
    // рамка экрана (чёрная) и экран
    const { sx, sy, sw, sh, sr, W, H, bz } = g;
    s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="${sr}" fill="url(#§sc)"/>`;
    if (!o || !o.noGlare) s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="${sr}" fill="url(#§rf)"/>`;
    // вырезы
    const cx = W / 2;
    s += cutouts(m, g, cx);
    s += '<rect x=".5" y=".5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="' + g.rad + '" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1"/>';
    s += '</svg>';
    return s;
  }

  function cutouts(m, g, cx) {
    const { sy, sx, sw, W, H } = g; let s = '';
    const blk = '#000';
    switch (m.notch) {
      case 'wide': {
        const nw = W * .5, nh = 16;
        s += `<path d="M${cx - nw / 2 - 8},${sy - .2} h${nw + 16} q-8,0 -8,8 v0 q0,${nh - 8} -${nh - 4},${nh - 8} h-${nw - 2 * (nh - 4) - 0} q-${nh - 4},0 -${nh - 4},-${nh - 8} q0,-8 -8,-8 z" fill="${blk}"/>`;
        s += `<rect x="${cx - 14}" y="${sy + 4}" width="28" height="3" rx="1.5" fill="#1a1b20"/><circle cx="${cx + 20}" cy="${sy + 6}" r="2.4" fill="#12141c"/>`;
        break;
      }
      case 'small': {
        const nw = W * .34;
        s += `<path d="M${cx - nw / 2 - 6},${sy - .2} h${nw + 12} q-6,0 -6,6 q0,8 -10,8 h${-(nw - 8)} q-10,0 -10,-8 q0,-6 -6,-6 z" fill="${blk}"/>`;
        s += `<rect x="${cx - 11}" y="${sy + 3.5}" width="22" height="2.6" rx="1.3" fill="#1a1b20"/><circle cx="${cx + 14}" cy="${sy + 5}" r="2" fill="#12141c"/>`;
        break;
      }
      case 'island': {
        const iw = W * .31, ih = 11;
        s += `<rect x="${cx - iw / 2}" y="${sy + 5}" width="${iw}" height="${ih}" rx="${ih / 2}" fill="${blk}"/><circle cx="${cx + iw / 2 - 6}" cy="${sy + 5 + ih / 2}" r="2.3" fill="#10131c"/>`;
        break;
      }
      case 'punch': {
        const px = m.punch === 'l' ? sx + 12 : cx;
        s += `<circle cx="${px}" cy="${sy + 7}" r="3.4" fill="${blk}"/><circle cx="${px}" cy="${sy + 7}" r="1.4" fill="#10131c"/>`;
        break;
      }
      case 'pill': {
        s += `<rect x="${sx + 12}" y="${sy + 4}" width="26" height="9" rx="4.5" fill="${blk}"/><circle cx="${sx + 18}" cy="${sy + 8.5}" r="2" fill="#10131c"/>`;
        break;
      }
      case 'homebtn': {
        s += `<rect x="${cx - 14}" y="${sy - 14}" width="28" height="3" rx="1.5" fill="#1a1b20"/><circle cx="${cx}" cy="${H - 18}" r="11" fill="none" stroke="#2a2b30" stroke-width="2"/><circle cx="${cx - 26}" cy="${sy - 13}" r="2.4" fill="#12141c"/>`;
        break;
      }
    }
    return s;
  }

  /* ---------- износ: трещины и царапины по состоянию ---------- */
  function wear(m, cond, view, seed) {
    if (cond !== 'damaged' && cond !== 'good') return '';
    const g = geom(m), r = PD.u.mulberry(PD.u.hashStr(m.id + view + cond + (seed || '')));
    let s = '';
    if (cond === 'good') {
      for (let i = 0; i < 6; i++) { const x = g.W * (.15 + r() * .7), y = g.H * (.1 + r() * .8), l = 6 + r() * 16, a = (r() - .5) * 1.2;
        s += `<path d="M${x.toFixed(1)},${y.toFixed(1)} l${(Math.cos(a) * l).toFixed(1)},${(Math.sin(a) * l).toFixed(1)}" stroke="#fff" stroke-opacity="${(.18 + r() * .25).toFixed(2)}" stroke-width=".5" fill="none"/>`; }
      return s;
    }
    // повреждённое: сеть трещин из точки удара + скол в углу
    const cx = g.W * (.25 + r() * .5), cy = g.H * (.18 + r() * .5);
    s += `<g stroke="#fff" fill="none" stroke-linecap="round">`;
    for (let i = 0; i < 9; i++) {
      let a = i / 9 * Math.PI * 2 + r() * .5, x = cx, y = cy, d = `M${cx.toFixed(1)},${cy.toFixed(1)}`;
      const n = 3 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) { const l = 8 + r() * 22; a += (r() - .5) * .7; x += Math.cos(a) * l; y += Math.sin(a) * l; d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
        if (r() < .35) { const b = a + (r() < .5 ? 1 : -1) * (.6 + r() * .6); d += ` M${x.toFixed(1)},${y.toFixed(1)} l${(Math.cos(b) * 9).toFixed(1)},${(Math.sin(b) * 9).toFixed(1)} M${x.toFixed(1)},${y.toFixed(1)}`; } }
      s += `<path d="${d}" stroke-opacity=".78" stroke-width=".7"/><path d="${d}" stroke="#000" stroke-opacity=".35" stroke-width=".35" transform="translate(.5 .5)"/>`;
    }
    s += `</g><path d="M${g.W - 22},${g.H - 4} q8,-3 10,-10 q2,8 12,10 z" fill="#000" fill-opacity=".35"/>`;
    for (let i = 0; i < 10; i++) { const x = g.W * (.1 + r() * .8), y = g.H * (.08 + r() * .84), l = 5 + r() * 14; s += `<path d="M${x.toFixed(1)},${y.toFixed(1)} l${l.toFixed(1)},${(r() * 4 - 2).toFixed(1)}" stroke="#fff" stroke-opacity=".3" stroke-width=".45"/>`; }
    return s;
  }

  /* оверлей для экрана ОС: только вырез камеры + блик + износ (прозрачный фон) */
  function overlaySVG(m, cond) {
    const g = geom(m);
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.vb.join(' ')}" class="phone-svg">`;
    s += `<defs><linearGradient id="orf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity=".02"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
    s += cutouts(m, g, g.W / 2);
    s += `<rect x="${g.sx}" y="${g.sy}" width="${g.sw}" height="${g.sh}" rx="${g.sr}" fill="url(#orf)"/>`;
    s += wear(m, cond, 'front');
    return s + '</svg>';
  }

  const uriCache = {};
  function toUri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27'); }

  /* ---------- публичный API ---------- */
  PD.art = {
    /* data-URI для <img>: изолированный документ, кэшируется браузером (быстро в списках) */
    uri(modelId, colorIdx, view, cond) {
      const k = modelId + '|' + (colorIdx | 0) + '|' + (view || 'back') + '|' + (cond || '');
      if (uriCache[k]) return uriCache[k];
      const m = G.MODEL_BY_ID[modelId]; if (!m) return '';
      let svg = (view === 'front') ? frontSVG(m, colorIdx | 0) : backSVG(m, colorIdx | 0);
      svg = svg.replace(/§/g, 'u');
      const w = wear(m, cond, view || 'back'); if (w) svg = svg.replace(/<\/svg>\s*$/, w + '</svg>');
      return uriCache[k] = toUri(svg);
    },
    overlayUri(modelId, cond) { const k = 'ov|' + modelId + '|' + cond; return uriCache[k] || (uriCache[k] = toUri(overlaySVG(G.MODEL_BY_ID[modelId], cond))); },
    /* крупный план камерного блока: обрезка viewBox */
    macroUri(modelId, colorIdx, cond) {
      const k = 'mc|' + modelId + '|' + colorIdx + '|' + cond; if (uriCache[k]) return uriCache[k];
      const m = G.MODEL_BY_ID[modelId]; const g = geom(m);
      let svg = backSVG(m, colorIdx | 0).replace(/§/g, 'u');
      const spec = CAMS[m.id] || []; let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
      spec.forEach(e => { if (typeof e === 'string') return; if (e.k === 'l' || e.k === 'f' || e.k === 'm') { x1 = Math.min(x1, e.x - e.r); y1 = Math.min(y1, e.y - e.r); x2 = Math.max(x2, e.x + e.r); y2 = Math.max(y2, e.y + e.r); } else if (e.k === 'r') { x1 = Math.min(x1, e.x); y1 = Math.min(y1, e.y); x2 = Math.max(x2, e.x + e.w); y2 = Math.max(y2, e.y + e.h); } else if (e.k === 'c' && e.r < 70) { x1 = Math.min(x1, e.x - e.r); y1 = Math.min(y1, e.y - e.r); x2 = Math.max(x2, e.x + e.r); y2 = Math.max(y2, e.y + e.r); } });
      if (x1 > x2) { x1 = 0; y1 = 0; x2 = g.W; y2 = g.H * .4; }
      const pad = 10, w = Math.max(60, x2 - x1 + pad * 2), h = Math.min(g.H, Math.max(60, y2 - y1 + pad * 2)), side = Math.max(w, h);
      const vx = Math.max(-4, x1 - pad - (side - w) / 2), vy = Math.max(-4, y1 - pad - (side - h) / 2);
      svg = svg.replace(/viewBox="[^"]*"/, `viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}"`);
      return uriCache[k] = toUri(svg);
    },
    svg(modelId, colorIdx, view, opts) {
      const m = G.MODEL_BY_ID[modelId]; if (!m) return '';
      const key = modelId + '|' + (colorIdx | 0) + '|' + (view || 'back');
      let t = cache[key];
      if (!t) t = cache[key] = (view === 'front') ? frontSVG(m, colorIdx | 0, opts) : backSVG(m, colorIdx | 0);
      return t.replace(/§/g, 'p' + (++uid) + '_');
    },
    cams: CAMS,
    buttons: m => buttons(m, geom(m).H),
    geom: PD.screenGeom
  };
})(typeof window !== 'undefined' ? window : globalThis);
