/* PHONE DROP 2.0.0 — приложения внутри телефона */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u, esc = U.esc, ic = PD.ic, eco = PD.eco, os = PD.os, A = os.apps;
  const $ = (s, r) => (r || document).querySelector(s);
  const I = (n, a) => ic(n, a || '');
  const swt = (on, k) => `<button class="osw ${on ? 'on' : ''}" data-s="tg:${k}"></button>`;
  const nm = (id, ctx) => os.appName(id, ctx.shell);

  /* ===== процедурная «сцена» для фото ===== */
  function drawScene(c, w, h, seed, t, zoom, mode, front) {
    const r = U.mulberry(seed * 7919), kind = Math.floor(r() * 4), night = mode === 'night' || kind === 3;
    const z = zoom || 1; c.save(); c.translate(w / 2, h / 2); c.scale(z, z); c.translate(-w / 2, -h / 2);
    if (front) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6b5b8c'); g.addColorStop(1, '#e8b4a0'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#2d2a3e'; c.beginPath(); c.arc(w / 2, h * .62, w * .28, Math.PI, 0); c.lineTo(w / 2 + w * .28, h); c.lineTo(w / 2 - w * .28, h); c.fill(); c.fillStyle = '#f1c9a5'; c.beginPath(); c.arc(w / 2, h * .46, w * .17, 0, 7); c.fill(); c.fillStyle = '#3a2a24'; c.beginPath(); c.arc(w / 2, h * .42, w * .18, Math.PI, 0); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(w / 2 - w * .06, h * .46, 3, 0, 7); c.arc(w / 2 + w * .06, h * .46, 3, 0, 7); c.fill(); c.strokeStyle = '#a0522d'; c.lineWidth = 2; c.beginPath(); c.arc(w / 2, h * .5, w * .06, .2, Math.PI - .2); c.stroke(); c.restore(); return; }
    const pal = [['#ff9966', '#ff5e62', '#2b1055'], ['#56ccf2', '#2f80ed', '#1b3a6b'], ['#f6d365', '#fda085', '#6a3f5e'], ['#0b1026', '#1b2a5c', '#3b2f6b']][kind];
    const g = c.createLinearGradient(0, 0, 0, h * .75); g.addColorStop(0, pal[2]); g.addColorStop(.55, pal[1]); g.addColorStop(1, pal[0]); c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (night) { c.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { c.globalAlpha = .4 + r() * .6; c.fillRect(r() * w, r() * h * .6, 1.4, 1.4); } c.globalAlpha = 1; }
    const sx = w * (.25 + r() * .5) + Math.sin(t / 3000) * 4, sy = h * (.28 + r() * .12);
    const sg = c.createRadialGradient(sx, sy, 2, sx, sy, w * .22); sg.addColorStop(0, night ? '#fffbe0' : '#fff7c2'); sg.addColorStop(1, 'rgba(255,255,200,0)'); c.fillStyle = sg; c.fillRect(0, 0, w, h);
    c.fillStyle = night ? '#fffde8' : '#fff4b0'; c.beginPath(); c.arc(sx, sy, w * .05, 0, 7); c.fill();
    for (let l = 0; l < 3; l++) { c.fillStyle = ['#3b2f5a', '#2a2145', '#171230'][l]; if (kind === 1) c.fillStyle = ['#2d6a8f', '#1f4e70', '#12304a'][l]; c.beginPath(); c.moveTo(0, h); const base = h * (.55 + l * .12), off = Math.sin(t / 4000 + l) * 2 * (l + 1); c.lineTo(0, base); for (let x = 0; x <= w; x += 12) c.lineTo(x + off, base - Math.abs(Math.sin(x * .02 + seed + l * 2)) * h * (.12 - l * .02) - r() * 3); c.lineTo(w, h); c.fill(); }
    if (kind !== 3) { c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 3; i++) { const bx = ((t / 40 + i * 90 + seed * 13) % (w + 60)) - 30, by = h * (.15 + i * .06); c.beginPath(); c.ellipse(bx, by, 26, 7, 0, 0, 7); c.fill(); } }
    if (mode === 'portrait') { c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, 0, w, h); }
    c.restore();
  }
  const thumbCache = {};
  function thumb(p, size) { const k = p.id + size; if (thumbCache[k]) return thumbCache[k]; const cv = document.createElement('canvas'); cv.width = size; cv.height = Math.round(size * 1.2); drawScene(cv.getContext('2d'), cv.width, cv.height, p.seed, 0, p.zoom, p.mode, p.front); return thumbCache[k] = cv.toDataURL('image/jpeg', .7); }

  const bar = (title, o) => `<div class="abar">${o && o.back ? `<button class="abtn" data-s="back">${I('back')}</button>` : ''}<h2>${esc(title)}</h2>${(o && o.right) || ''}</div>`;
  const grp = c => `<div class="sx-g">${c}</div>`;
  const row = (i, bg, t, v, act) => `<button class="sx-r" data-s="${act}">${i ? `<span class="si" style="background:${bg}">${I(i)}</span>` : ''}<span>${t}</span><span class="v">${v || ''}</span></button>`;

  /* ===== НАСТРОЙКИ ===== */
  const CLR = { gear: '#8e8e93', bolt: '#34c759', eye: '#0a84ff', star: '#ff9f0a', wallet: '#5e5ce6', phone: '#ff375f', info: '#8e8e93', cloud: '#32ade6' };
  function storageInfo(ctx) { const m = ctx.m, tot = m.st[ctx.ph.stIdx], sys = Math.min(tot * .22, 26), photos = ctx.ph.os.gallery.length * 0.006; return { tot, sys, photos, app: Math.min(tot * .08, 9), free: Math.max(0, tot - sys - photos - Math.min(tot * .08, 9)) }; }
  function setBody(ctx) {
    const p = ctx.page, m = ctx.m, ph = ctx.ph, st = os.state();
    if (p === 'root') return grp(row('phone', '#ff375f', 'О телефоне', esc(m.n), 's:about') + row('info', '#8e8e93', 'Характеристики', '', 's:specs')) + grp(row('cloud', '#32ade6', 'Wi-Fi и Bluetooth', st.wifi ? 'Wi-Fi вкл.' : 'выкл.', 's:conn') + row('eye', '#0a84ff', 'Экран и яркость', st.bright + '%', 's:display') + row('bell', '#ff3b30', 'Звук', st.vol + '%', 's:sound') + row('star', '#ff9f0a', 'Обои', '', 's:wall')) + grp(row('bolt', '#34c759', 'Аккумулятор', ph.bat + '%', 's:battery') + row('wallet', '#5e5ce6', 'Хранилище', storageInfo(ctx).tot + ' ГБ', 's:storage')) + grp(row('refresh', '#8e8e93', 'Обновление ПО', os.sysVer(m).split(' · ')[0], 's:update'));
    if (p === 'about') return grp([['Название', esc(m.n)], ['Производитель', esc(m.br)], ['Версия ПО', esc(os.sysVer(m))], ['Модель (год)', m.yr], ['Цвет', esc(m.colors[ph.colorIdx].name)], ['Состояние', PD.CONDITIONS[ph.cond].name], ['Серийный номер', ph.serial], ['IMEI', ph.imei]].map(x => `<div class="sx-r"><span>${x[0]}</span><span class="v">${x[1]}</span></div>`).join('')) + `<div class="sx-h">Рейтинг телефона</div>` + grp(`<div class="sx-r"><span>Оценка</span><span class="v">${eco.rating(ph).score}/100 · ${eco.rating(ph).stars}★</span></div><div class="sx-r"><span>Рыночная цена</span><span class="v">${U.rub(eco.fair(ph))}</span></div>`);
    if (p === 'specs') return grp([['Процессор', m.chip], ['Оперативная память', m.ram + ' ГБ'], ['Накопитель', storageInfo(ctx).tot + ' ГБ'], ['Экран', m.scr], ['Камеры', m.cam], ['Аккумулятор', m.bat + ' мА·ч'], ['Размеры', m.h + ' × ' + m.w + ' мм'], ['Год выпуска', m.yr], ['Оценка Benchmark', (m.total * 100).toLocaleString('ru-RU')]].map(x => `<div class="sx-r"><span>${x[0]}</span><span class="v">${esc(String(x[1]))}</span></div>`).join(''));
    if (p === 'conn') return grp(`<div class="sx-r"><span>Wi-Fi</span>${swt(st.wifi, 'wifi')}</div><div class="sx-r"><span>Bluetooth</span>${swt(st.bt, 'bt')}</div><div class="sx-r"><span>Авиарежим</span>${swt(st.air, 'air')}</div>`);
    if (p === 'display') return grp(`<div class="sx-r" style="flex-direction:column;align-items:stretch"><span>Яркость <b>${st.bright}%</b></span><input type="range" min="5" max="100" value="${st.bright}" data-s="sl:bright"></div><div class="sx-r"><span>Тёмная тема</span>${swt(st.dark, 'dark')}</div>`) + `<div class="sx-h">Экран</div>` + grp(`<div class="sx-r"><span>Тип</span><span class="v">${esc(m.scr)}</span></div>`);
    if (p === 'sound') return grp(`<div class="sx-r" style="flex-direction:column;align-items:stretch"><span>Громкость <b>${st.vol}%</b></span><input type="range" min="0" max="100" value="${st.vol}" data-s="sl:vol"></div><div class="sx-r"><span>Не беспокоить</span>${swt(st.dnd, 'dnd')}</div>`) + `<div class="sx-h" style="text-transform:none">Громкость меняется и боковыми кнопками телефона</div>`;
    if (p === 'wall') return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--u)*10px);padding:calc(var(--u)*14px)">${os.wallsFor(m.shell).map((w, i) => `<button data-s="wall:${i}" style="aspect-ratio:9/16;border-radius:calc(var(--u)*14px);border:calc(var(--u)*3px) solid ${((ph.os.wall || 0) % os.wallsFor(m.shell).length) === i ? '#0a84ff' : 'transparent'};background:${w}"></button>`).join('')}</div>`;
    if (p === 'battery') { const h = Math.min(100, ph.bat + 3); return `<div style="text-align:center;padding:calc(var(--u)*20px)"><div style="font-size:calc(var(--u)*56px);font-weight:700">${ph.bat}%</div><div class="bar" style="height:calc(var(--u)*10px);margin:10px 0;border-radius:6px;background:rgba(128,128,128,.25);overflow:hidden"><i style="display:block;height:100%;width:${ph.bat}%;background:#34c759"></i></div></div>` + grp(`<div class="sx-r"><span>Ёмкость</span><span class="v">${m.bat} мА·ч</span></div><div class="sx-r"><span>Состояние АКБ</span><span class="v">${ph.bat}% от нового</span></div><div class="sx-r"><span>Режим экономии</span>${swt(st.save, 'save')}</div>`); }
    if (p === 'storage') { const s = storageInfo(ctx), pc = x => Math.max(1, x / s.tot * 100); return `<div style="padding:calc(var(--u)*16px)"><b style="font-size:calc(var(--u)*22px)">${(s.tot - s.free).toFixed(1)} ГБ</b> <span style="opacity:.6">из ${s.tot} ГБ</span><div style="display:flex;height:calc(var(--u)*14px);border-radius:8px;overflow:hidden;margin-top:10px;background:rgba(128,128,128,.25)"><i style="width:${pc(s.sys)}%;background:#8e8e93"></i><i style="width:${pc(s.app)}%;background:#0a84ff"></i><i style="width:${pc(s.photos)}%;background:#ff9f0a"></i></div></div>` + grp(`<div class="sx-r"><span>Система</span><span class="v">${s.sys.toFixed(1)} ГБ</span></div><div class="sx-r"><span>Приложения</span><span class="v">${s.app.toFixed(1)} ГБ</span></div><div class="sx-r"><span>Фото и видео (${ph.os.gallery.length})</span><span class="v">${s.photos.toFixed(2)} ГБ</span></div><div class="sx-r"><span>Свободно</span><span class="v">${s.free.toFixed(1)} ГБ</span></div>`); }
    if (p === 'update') return `<div style="text-align:center;padding:calc(var(--u)*30px)" id="updBox"><div style="font-size:calc(var(--u)*44px)">✅</div><b>${esc(os.sysVer(m).split(' · ')[0])}</b><div style="opacity:.6;margin:6px 0 16px">Установлена последняя версия</div><button class="sx-r" style="justify-content:center;background:#0a84ff;color:#fff;border-radius:calc(var(--u)*14px)" data-s="upd">Проверить обновления</button></div>`;
    return '';
  }
  const TITLES = { root: 'Настройки', about: 'О телефоне', specs: 'Характеристики', conn: 'Подключения', display: 'Экран и яркость', sound: 'Звук', wall: 'Обои', battery: 'Аккумулятор', storage: 'Хранилище', update: 'Обновление ПО' };
  A.settings = {
    name: s => s === 'ios' || s === 'pixel' || s === 'nothing' ? 'Настройки' : 'Настройки',
    render(ctx) { ctx.page = 'root'; return bar('Настройки') + `<div class="abody" id="sBody">${setBody(ctx)}</div>`; },
    mount(el, ctx) { el.addEventListener('input', e => { const t = e.target.closest('[data-s^="sl:"]'); if (t) { os.setSlider(t.dataset.s.slice(3), +t.value); const b = t.closest('.sx-r').querySelector('b'); if (b) b.textContent = t.value + '%'; } }); },
    onClick(e, ctx) {
      const b = e.target.closest('[data-s]'); if (!b || b.tagName === 'INPUT') return; const a = b.dataset.s;
      const re = () => { const el = ctx.el; el.querySelector('h2').textContent = TITLES[ctx.page]; const bar2 = el.querySelector('.abar'); const hasBack = bar2.querySelector('[data-s=back]'); if (ctx.page !== 'root' && !hasBack) bar2.insertAdjacentHTML('afterbegin', `<button class="abtn" data-s="back">${I('back')}</button>`); if (ctx.page === 'root' && hasBack) hasBack.remove(); el.querySelector('#sBody').innerHTML = setBody(ctx); };
      if (a === 'back') { ctx.page = 'root'; return re(); }
      if (a.startsWith('s:')) { ctx.page = a.slice(2); PD.snd.play('tap'); return re(); }
      if (a.startsWith('tg:')) { const k = a.slice(3); const fake = document.createElement('div'); fake.dataset.q = k; const q = os.state(); q[k] = !q[k]; if (k === 'air') { q.wifi = !q.air; q.bt = !q.air; } if (k === 'dark') { ctx.ph.os.dark = q.dark; $('#osr').classList.toggle('pdark', q.dark); } if (k === 'dnd' || k === 'save') { } PD.snd.play('tap'); return re(); }
      if (a.startsWith('wall:')) { ctx.ph.os.wall = +a.slice(5); PD.save(); os.wallpaperChanged(); return re(); }
      if (a === 'upd') { const bx = ctx.el.querySelector('#updBox'); bx.innerHTML = '<div style="padding:30px;opacity:.7">Проверка…</div>'; setTimeout(() => { if (ctx.el.isConnected) { ctx.page = 'update'; re(); os.toast('Обновлений нет'); } }, 1400); }
    },
    onBack(ctx) { if (ctx.page && ctx.page !== 'root') { ctx.page = 'root'; ctx.el.querySelector('h2').textContent = 'Настройки'; const bk = ctx.el.querySelector('[data-s=back]'); bk && bk.remove(); ctx.el.querySelector('#sBody').innerHTML = setBody(ctx); return true; } return false; }
  };

  /* ===== КАМЕРА ===== */
  function zoomOpts(m) { const z = ['1']; const n = m.cam.split('+').length; if (n >= 2 && /сверхш|диагон|вертик/.test(m.cam) === false || n >= 3) z.unshift('.5'); else if (/сверхш/.test(m.cam)) z.unshift('.5'); const t = m.cam.match(/(\d+(?:\.\d)?)×/g); if (t) t.forEach(x => z.push(x.replace('×', ''))); else if (n >= 3) z.push('2'); return [...new Set(z)]; }
  A.camera = {
    dark: true, name: s => 'Камера', cls: 'cam',
    render(ctx) {
      ctx.cs = { zoom: 1, mode: 'photo', front: false, rec: false, flash: false, grid: false, t0: 0, seed: Math.floor(Math.random() * 90) + 5 };
      const m = ctx.m, mp = (m.cam.match(/(\d+) Мп/) || [0, 12])[1], ios = ctx.shell === 'ios', modes = ios ? [['photo', 'Фото'], ['video', 'Видео'], ['portrait', 'Портрет'], ['night', 'Ночь']] : [['photo', 'Фото'], ['video', 'Видео'], ['portrait', 'Портрет'], ['night', 'Ночь']];
      const last = ctx.ph.os.gallery[ctx.ph.os.gallery.length - 1];
      return `<div class="vf" style="border-radius:${ios ? 'calc(var(--u)*14px)' : '0'};${ios ? '' : 'top:0'}"><canvas id="cv"></canvas><div class="grid" id="cgr" style="display:none"></div><div class="flashfx" id="ffx"></div></div>
      <div class="ctop"><button data-c="flash">${ctx.shell === 'ios' ? '⚡' : '⚡'} Вспышка: <span id="fl">выкл</span></button><button data-c="grid">Сетка</button><button data-c="hdr" style="color:#ffd60a">${mp} Мп · HDR</button></div>
      <div class="timer" id="rtm" style="display:none">● 00:00</div><div class="zm" id="zm">${zoomOpts(m).map(z => `<button data-c="z:${z}" class="${z === '1' ? 'on' : ''}">${z === '1' ? '1×' : z + '×'}</button>`).join('')}</div>
      <div class="ctl"><div class="modes" id="modes">${modes.map(x => `<button data-c="m:${x[0]}" class="${x[0] === 'photo' ? 'on' : ''}">${x[1]}</button>`).join('')}</div><div class="row3"><button class="thumb" data-c="gal" id="thb">${last ? `<img src="${thumb(last, 80)}">` : ''}</button><button class="shut" id="sh" data-c="shut"><i></i></button><button class="flip" data-c="flip">${I('refresh')}</button></div></div>`;
    },
    mount(el, ctx) {
      const cv = $('#cv', el), c = cv.getContext('2d'), cs = ctx.cs; const w = cv.width = Math.round(cv.clientWidth * .6) || 220, h = cv.height = Math.round(cv.clientHeight * .6) || 300; let last = 0, raf;
      (function loop(t) { if (!el.isConnected) return; if (t - last > 60) { last = t; drawScene(c, w, h, cs.seed, t, cs.zoom, cs.mode, cs.front); if (cs.mode === 'night') { c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(0, 0, w, h); } } raf = requestAnimationFrame(loop); })(0); ctx.raf = () => cancelAnimationFrame(raf);
      ctx.recT = null;
    },
    unmount(ctx) { ctx.raf && ctx.raf(); clearInterval(ctx.recT); },
    onClick(e, ctx) {
      const b = e.target.closest('[data-c]'); if (!b) return; const k = b.dataset.c, cs = ctx.cs, el = ctx.el;
      if (k.startsWith('z:')) { cs.zoom = +k.slice(2); el.querySelectorAll('#zm button').forEach(x => x.classList.toggle('on', x === b)); PD.snd.play('tap'); return; }
      if (k.startsWith('m:')) { cs.mode = k.slice(2); el.querySelectorAll('#modes button').forEach(x => x.classList.toggle('on', x === b)); el.querySelector('#sh').classList.toggle('rec', false); PD.snd.play('tap'); return; }
      if (k === 'flip') { cs.front = !cs.front; PD.snd.play('nav'); return; }
      if (k === 'grid') { const g = el.querySelector('#cgr'); g.style.display = g.style.display === 'none' ? 'block' : 'none'; return; }
      if (k === 'flash') { cs.flash = !cs.flash; el.querySelector('#fl').textContent = cs.flash ? 'вкл' : 'выкл'; return; }
      if (k === 'gal') { ctx.os.closeApp(); setTimeout(() => { const ic2 = document.querySelector('[data-app=gallery]'); ic2 && ic2.click(); }, 300); return; }
      if (k === 'shut') {
        const gal = ctx.ph.os.gallery;
        if (cs.mode === 'video') {
          if (!cs.rec) { cs.rec = true; cs.t0 = Date.now(); el.querySelector('#sh').classList.add('rec'); const tm = el.querySelector('#rtm'); tm.style.display = 'block'; PD.snd.play('ok'); ctx.recT = setInterval(() => { const s = Math.floor((Date.now() - cs.t0) / 1000); tm.textContent = '● ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 500); return; }
          cs.rec = false; clearInterval(ctx.recT); el.querySelector('#sh').classList.remove('rec'); el.querySelector('#rtm').style.display = 'none'; const dur = Math.max(1, Math.round((Date.now() - cs.t0) / 1000));
          gal.push({ id: U.uidGen(), ts: Date.now(), seed: cs.seed, zoom: cs.zoom, kind: 'video', dur, front: cs.front }); PD.snd.play('shutter'); finish(ctx); return;
        }
        PD.snd.play('shutter'); const f = el.querySelector('#ffx'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
        gal.push({ id: U.uidGen(), ts: Date.now(), seed: cs.seed, zoom: cs.zoom, kind: 'photo', mode: cs.mode, front: cs.front, flash: cs.flash }); finish(ctx); cs.seed = Math.floor(Math.random() * 900) + 5;
      }
    }
  };
  function finish(ctx) { const g = ctx.ph.os.gallery; if (g.length > 60) g.splice(0, g.length - 60); PD.save(); const t = $('#thb', ctx.el); if (t) t.innerHTML = `<img src="${thumb(g[g.length - 1], 80)}">`; os.push('gallery', 'Фото сохранено', 'Новый снимок добавлен в «' + os.appName('gallery', ctx.shell) + '»'); }

  /* ===== ГАЛЕРЕЯ ===== */
  A.gallery = {
    name: s => s === 'ios' || s === 'pixel' ? 'Фото' : 'Галерея',
    render(ctx) { return galBody(ctx); },
    onClick(e, ctx) {
      const b = e.target.closest('[data-g]'); if (!b) return; const k = b.dataset.g, g = ctx.ph.os.gallery;
      if (k.startsWith('o:')) { ctx.view = k.slice(2); return redraw(ctx); } if (k === 'close') { ctx.view = null; return redraw(ctx); }
      if (k === 'cam') { ctx.os.closeApp(); setTimeout(() => { const i = document.querySelector('[data-app=camera]'); i && i.click(); }, 300); return; }
      const idx = g.findIndex(x => x.id === ctx.view);
      if (k === 'prev' && idx > 0) { ctx.view = g[idx - 1].id; return redraw(ctx); } if (k === 'next' && idx < g.length - 1) { ctx.view = g[idx + 1].id; return redraw(ctx); }
      if (k === 'fav') { g[idx].fav = !g[idx].fav; PD.save(); return redraw(ctx); }
      if (k === 'del') { g.splice(idx, 1); PD.save(); ctx.view = g.length ? g[Math.min(idx, g.length - 1)].id : null; return redraw(ctx); }
      if (k === 'info') { const p = g[idx]; os.toast(`${p.kind === 'video' ? 'Видео ' + p.dur + ' с' : ((ctx.m.cam.match(/(\d+) Мп/) || [0, 12])[1] + ' Мп')} · ${new Date(p.ts).toLocaleString('ru-RU')} · ${ctx.m.n}`); }
    },
    onBack(ctx) { if (ctx.view) { ctx.view = null; redraw(ctx); return true; } return false; }
  };
  function redraw(ctx) { ctx.el.innerHTML = galBody(ctx); const cv = ctx.el.querySelector('#vcv'); if (cv) { const p = ctx.ph.os.gallery.find(x => x.id === ctx.view); cv.width = 360; cv.height = 460; drawScene(cv.getContext('2d'), 360, 460, p.seed, 0, p.zoom, p.mode, p.front); } }
  function galBody(ctx) {
    const g = ctx.ph.os.gallery.slice().reverse(), full = ctx.ph.os.gallery;
    if (ctx.view) { const p = full.find(x => x.id === ctx.view); if (p) return `<div class="viewer"><div class="abar" style="padding-top:calc(var(--u)*40px)"><button class="abtn" data-g="close">${I('back')}</button><h2 style="font-size:calc(var(--u)*15px)">${new Date(p.ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</h2><button class="abtn" data-g="prev">${I('back')}</button><button class="abtn" data-g="next" style="transform:rotate(180deg)">${I('back')}</button></div><div class="vimg"><canvas id="vcv" width="360" height="460"></canvas></div><div class="vb"><button data-g="fav">${I('heart', p.fav ? 'style="fill:#ff375f;stroke:#ff375f"' : '')}В избранное</button><button data-g="info">${I('info')}Инфо</button><button data-g="del">${I('trash')}Удалить</button></div></div>`; }
    return bar(os.appName('gallery', ctx.shell), { right: `<button class="abtn" data-g="cam">${I('cam')}</button>` }) + `<div class="abody">${g.length ? `<div class="sx-h" style="margin-top:0">Недавние · ${g.length}</div><div class="gal3">${g.map(p => `<button data-g="o:${p.id}"><img src="${thumb(p, 120)}" alt="">${p.kind === 'video' ? `<span class="vd">▶ ${p.dur}с</span>` : ''}${p.fav ? '<span class="fv">♥</span>' : ''}</button>`).join('')}</div>` : `<div style="text-align:center;padding:calc(var(--u)*60px) calc(var(--u)*20px);opacity:.7">Нет фото.<br>Сделайте первый снимок в «Камере».<br><br><button class="sx-r" style="justify-content:center;background:#0a84ff;color:#fff;border-radius:14px" data-g="cam">Открыть камеру</button></div>`}</div>`;
  }
  const _gm = A.gallery.render; A.gallery.mount = (el, ctx) => { ctx.view = null; };

  /* ===== TYNTYTY BENCHMARK 11 ===== */
  const BT = [['test', 'Тест', 'bolt'], ['rank', 'Рейтинг', 'trophy'], ['cmp', 'Сравнение', 'chart'], ['hist', 'История', 'clock']];
  A.bench = {
    dark: true, name: () => 'Benchmark', cls: 'bm',
    render(ctx) { ctx.tab = 'test'; ctx.cmp = null; return `<div class="abar"><div class="bmlogo"><i>T</i><span>TYNTYTY <span style="color:#00e5ff">Benchmark 11</span></span></div></div><div class="abody" id="bBody">${bBody(ctx)}</div><div class="bmtabs">${BT.map(t => `<button data-b="tab:${t[0]}" class="${t[0] === 'test' ? 'on' : ''}">${I(t[2])}${t[1]}</button>`).join('')}</div>`; },
    onClick(e, ctx) {
      const b = e.target.closest('[data-b]'); if (!b) return; const k = b.dataset.b;
      if (k.startsWith('tab:')) { if (ctx.running) return os.toast('Дождитесь окончания теста'); ctx.tab = k.slice(4); ctx.el.querySelectorAll('.bmtabs button').forEach(x => x.classList.toggle('on', x === b)); ctx.res = null; $('#bBody', ctx.el).innerHTML = bBody(ctx); return; }
      if (k === 'run') return runBench(ctx); if (k === 'again') { ctx.res = null; $('#bBody', ctx.el).innerHTML = bBody(ctx); return; }
      if (k.startsWith('cmp:')) { ctx.cmp = k.slice(4); $('#bBody', ctx.el).innerHTML = bBody(ctx); return; }
      if (k === 'clr') { PD.S.bench = PD.S.bench.filter(x => x.uid !== ctx.ph.uid); PD.save(); $('#bBody', ctx.el).innerHTML = bBody(ctx); }
    },
    onBack(ctx) { if (ctx.running) { os.toast('Тест выполняется…'); return true; } return false; }, unmount(ctx) { ctx.running = false; ctx.stopGpu && ctx.stopGpu(); }
  };
  const bestOf = ctx => PD.S.bench.filter(x => x.uid === ctx.ph.uid).sort((a, b) => b.total - a.total)[0];
  function rankOf(total) { return G.MODELS.filter(m => m.total * 100 > total).length + 1; }
  function bBody(ctx) {
    const m = ctx.m, ph = ctx.ph, tab = ctx.tab;
    if (tab === 'test') {
      if (ctx.res) { const r = ctx.res, ref = eco.benchRef(m), rk = rankOf(r.total); return `<div class="bcard" style="text-align:center"><div class="xs" style="opacity:.6;letter-spacing:2px">ИТОГОВЫЙ РЕЗУЛЬТАТ</div><div class="big" id="bigN">0</div><div style="opacity:.7">${esc(m.n)} · место №${rk} из ${G.MODELS.length}</div></div><div class="bcard">${[['CPU · процессор', 'cpu'], ['GPU · графика', 'gpu'], ['MEM · память', 'mem'], ['UX · интерфейс', 'ux']].map(([n, k]) => `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span>${n}</span><b>${r[k].toLocaleString('ru-RU')}</b></div><div class="bb"><i style="width:${Math.min(100, r[k] / (ref[k] * 1.1) * 100)}%"></i></div></div>`).join('')}</div><div style="padding:0 14px"><button class="sx-r" style="justify-content:center;background:linear-gradient(90deg,#00e5ff,#7c4dff);color:#000;font-weight:800;border-radius:14px" data-b="again">Повторить тест</button></div>`; }
      const best = bestOf(ctx);
      return `<div style="text-align:center;padding-top:calc(var(--u)*10px)"><button class="go" data-b="run">СТАРТ</button><div style="opacity:.65;font-size:calc(var(--u)*12px);padding:0 20px">${esc(m.chip)} · ${m.ram} ГБ ОЗУ<br>${best ? 'Лучший результат: <b style="color:#00e5ff">' + best.total.toLocaleString('ru-RU') + '</b>' : 'Тест ещё не проходился'}</div></div>`;
    }
    if (tab === 'rank') { const arr = G.MODELS.map(x => ({ n: x.n, t: x.total * 100, me: x.id === m.id })).sort((a, b) => b.t - a.t); const best = bestOf(ctx); return `<div class="sx-h" style="margin:8px 16px">Рейтинг производительности</div>` + arr.map((x, i) => `<div class="rk ${x.me ? 'me' : ''}"><span class="n">${i + 1}</span><span style="flex:1">${esc(x.n)}${x.me ? ' <b style="color:#00e5ff">(ваш)</b>' : ''}</span><b>${x.t.toLocaleString('ru-RU')}</b></div>`).join('') + (best ? `<div class="sx-h" style="margin:8px 16px">Ваш лучший замер: ${best.total.toLocaleString('ru-RU')} (место №${rankOf(best.total)})</div>` : ''); }
    if (tab === 'cmp') {
      const mine = bestOf(ctx) || Object.assign({}, eco.benchRef(m)), oth = ctx.cmp && G.MODEL_BY_ID[ctx.cmp];
      let h = `<div class="bcard"><div class="xs" style="opacity:.6">Сравните ${esc(m.n)} с другой моделью</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-height:calc(var(--u)*130px);overflow:auto">${G.MODELS.filter(x => x.id !== m.id).map(x => `<button data-b="cmp:${x.id}" style="border:0;border-radius:14px;padding:5px 10px;font-size:calc(var(--u)*11px);background:${ctx.cmp === x.id ? '#00e5ff' : '#1f2540'};color:${ctx.cmp === x.id ? '#000' : '#fff'}">${esc(x.n)}</button>`).join('')}</div></div>`;
      if (oth) { const o = eco.benchRef(oth); h += `<div class="bcard"><div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:8px"><span style="color:#00e5ff">${esc(m.n)}</span><span style="color:#ff3d9a">${esc(oth.n)}</span></div>${[['CPU', 'cpu'], ['GPU', 'gpu'], ['MEM', 'mem'], ['UX', 'ux'], ['Итого', 'total']].map(([n, k]) => { const mx = Math.max(mine[k], o[k]); return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:calc(var(--u)*12px)"><span>${mine[k].toLocaleString('ru-RU')}</span><span style="opacity:.6">${n}</span><span>${o[k].toLocaleString('ru-RU')}</span></div><div style="display:flex;gap:3px;margin-top:3px"><div class="bb" style="flex:1;direction:rtl"><i style="width:${mine[k] / mx * 100}%"></i></div><div class="bb" style="flex:1"><i style="width:${o[k] / mx * 100}%;background:linear-gradient(90deg,#ff3d9a,#ff8a3d)"></i></div></div></div>`; }).join('')}<div style="text-align:center;font-weight:700">${mine.total === o.total ? 'Ничья' : mine.total > o.total ? esc(m.n) + ' быстрее на ' + Math.round((mine.total / o.total - 1) * 100) + '%' : esc(oth.n) + ' быстрее на ' + Math.round((o.total / mine.total - 1) * 100) + '%'}</div></div>`; }
      return h;
    }
    const hist = PD.S.bench.filter(x => x.uid === ph.uid);
    return hist.length ? hist.map(x => `<div class="bcard" style="display:flex;align-items:center;gap:12px"><div style="flex:1"><b style="font-size:calc(var(--u)*20px)">${x.total.toLocaleString('ru-RU')}</b><div class="xs" style="opacity:.6">${new Date(x.ts).toLocaleString('ru-RU')}</div></div><div class="xs" style="text-align:right;opacity:.8">CPU ${x.cpu.toLocaleString('ru-RU')}<br>GPU ${x.gpu.toLocaleString('ru-RU')}<br>MEM ${x.mem.toLocaleString('ru-RU')}</div></div>`).join('') + `<div style="padding:0 14px"><button class="sx-r" style="justify-content:center;background:#2a1020;color:#ff6b8b;border-radius:14px" data-b="clr">Очистить историю</button></div>` : `<div style="text-align:center;padding:calc(var(--u)*60px) 20px;opacity:.6">История пуста. Запустите первый тест.</div>`;
  }
  function runBench(ctx) {
    if (ctx.running) return; ctx.running = true; const res = eco.benchRun(ctx.ph), body = $('#bBody', ctx.el);
    body.innerHTML = `<div class="bcard"><div id="bst" style="font-weight:700;margin-bottom:6px">Подготовка…</div><div class="bb" style="height:calc(var(--u)*10px)"><i id="bpr" style="width:0"></i></div><div style="text-align:right;font-size:calc(var(--u)*12px);opacity:.7;margin-top:4px" id="bpc">0%</div></div><div class="bcard"><canvas class="gpu" id="gpu"></canvas></div><div class="bcard">${[['cpu', 'Тест процессора'], ['gpu', 'Тест графики'], ['mem', 'Тест памяти'], ['ux', 'UX-тест интерфейса']].map(([k, n]) => `<div class="stg" id="s_${k}"><span class="dot"></span><span style="flex:1">${n}</span><b id="v_${k}">—</b></div>`).join('')}</div>`;
    const gc = $('#gpu', ctx.el), g = gc.getContext('2d'); gc.width = gc.clientWidth || 300; gc.height = gc.clientHeight || 150; let stage = 0, pts = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), v: .002 + Math.random() * .004 })), gpuLoad = 0.2, raf;
    ctx.stopGpu = () => cancelAnimationFrame(raf);
    (function draw(t) { if (!ctx.running || !gc.isConnected) return; g.fillStyle = 'rgba(6,7,12,.35)'; g.fillRect(0, 0, gc.width, gc.height); const n = Math.floor(pts.length * (stage === 1 ? 1 : .5 + gpuLoad * .5)); for (let i = 0; i < n; i++) { const p = pts[i]; p.z -= p.v * (stage === 1 ? 3 : 1); if (p.z <= 0) { p.z = 1; p.x = Math.random(); p.y = Math.random(); } const s = 1 / p.z, x = (p.x - .5) * gc.width * s * .4 + gc.width / 2, y = (p.y - .5) * gc.height * s * .4 + gc.height / 2; g.fillStyle = `hsl(${180 + p.z * 140},90%,${50 + 20 * (1 - p.z)}%)`; g.fillRect(x, y, 1 + s * 1.2, 1 + s * 1.2); } if (stage === 1) { const cx = gc.width / 2, cy = gc.height / 2, a = t / 400, sz = 36; g.strokeStyle = '#00e5ff'; g.lineWidth = 1.5; g.beginPath(); for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; g.lineTo(cx + Math.cos(an) * sz, cy + Math.sin(an) * sz * .5 - 12); } g.closePath(); g.stroke(); g.beginPath(); for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; g.lineTo(cx + Math.cos(an) * sz, cy + Math.sin(an) * sz * .5 + 12); } g.closePath(); g.stroke(); } raf = requestAnimationFrame(draw); })(0);
    const stages = [['cpu', 'Тест процессора…', 2600], ['gpu', 'Тест графики…', 3200], ['mem', 'Тест оперативной памяти…', 2200], ['ux', 'UX-тест интерфейса…', 1600]]; const totalT = stages.reduce((a, s) => a + s[2], 0); let done = 0, i = 0;
    const next = () => {
      if (!ctx.running || !ctx.el.isConnected) return; if (i >= stages.length) return fin(); const [k, label, ms] = stages[i]; stage = i; $('#bst', ctx.el).textContent = label; $('#s_' + k, ctx.el).classList.add('on'); const t0 = performance.now(), vEl = $('#v_' + k, ctx.el);
      (function step(n) { if (!ctx.running || !ctx.el.isConnected) return; const t = Math.min(1, (n - t0) / ms), p = (done + t * ms) / totalT * 100; $('#bpr', ctx.el).style.width = p + '%'; $('#bpc', ctx.el).textContent = Math.round(p) + '%'; vEl.textContent = Math.round(res[k] * t * (0.9 + Math.random() * .1)).toLocaleString('ru-RU'); if (Math.random() < .25) PD.snd.play('bench'); if (t < 1) requestAnimationFrame(step); else { vEl.textContent = res[k].toLocaleString('ru-RU'); $('#s_' + k, ctx.el).classList.replace('on', 'done'); done += ms; i++; next(); } })(t0);
    };
    function fin() {
      ctx.running = false; ctx.stopGpu(); ctx.res = res; PD.S.bench.unshift(Object.assign({ uid: ctx.ph.uid, modelId: ctx.ph.modelId, ts: Date.now() }, res)); if (PD.S.bench.length > 80) PD.S.bench.length = 80; PD.S.stats.benches = (PD.S.stats.benches || 0) + 1; eco.addXp(5); PD.save(); PD.snd.play('ok');
      os.push('bench', 'Тест завершён', 'Результат: ' + res.total.toLocaleString('ru-RU') + ' баллов'); body.innerHTML = bBody(ctx);
      const big = $('#bigN', ctx.el); const t0 = performance.now(); (function c(n) { const t = Math.min(1, (n - t0) / 1200); big.textContent = Math.round(res.total * (1 - Math.pow(1 - t, 3))).toLocaleString('ru-RU'); if (t < 1) requestAnimationFrame(c); })(t0);
    }
    next();
  }

  /* ===== КАЛЬКУЛЯТОР ===== */
  A.calc = {
    dark: true, name: () => 'Калькулятор', cls: 'calc',
    render(ctx) { ctx.d = '0'; ctx.acc = null; ctx.op = null; ctx.fresh = true; const keys = [['AC', 'fn'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'], ['7'], ['8'], ['9'], ['×', 'op'], ['4'], ['5'], ['6'], ['−', 'op'], ['1'], ['2'], ['3'], ['+', 'op'], ['0'], [','], ['⌫', 'fn'], ['=', 'op']]; return `<div style="background:#000;color:#fff;height:100%;display:flex;flex-direction:column"><div style="flex:1;display:flex;align-items:flex-end;justify-content:flex-end;padding:calc(var(--u)*20px);font-size:calc(var(--u)*64px);font-weight:300;overflow:hidden" id="cd">0</div><div class="keys" style="padding-bottom:calc(var(--u)*40px)">${keys.map(k => `<button class="${k[1] || ''}" data-k="${k[0]}">${k[0]}</button>`).join('')}</div></div>`; },
    onClick(e, ctx) {
      const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; const show = () => { let s = String(ctx.d).replace('.', ','); $('#cd', ctx.el).textContent = s.length > 11 ? Number(ctx.d).toExponential(4) : s; $('#cd', ctx.el).style.fontSize = s.length > 8 ? 'calc(var(--u)*40px)' : ''; };
      const calc = () => { const a = ctx.acc, x = parseFloat(ctx.d); if (a == null || !ctx.op) return x; const r = ctx.op === '+' ? a + x : ctx.op === '−' ? a - x : ctx.op === '×' ? a * x : x === 0 ? NaN : a / x; return r; };
      if (/\d/.test(k)) { ctx.d = ctx.fresh || ctx.d === '0' ? k : ctx.d + k; ctx.fresh = false; } else if (k === ',') { if (ctx.fresh) { ctx.d = '0.'; ctx.fresh = false; } else if (!ctx.d.includes('.')) ctx.d += '.'; } else if (k === 'AC') { ctx.d = '0'; ctx.acc = null; ctx.op = null; ctx.fresh = true; } else if (k === '⌫') { ctx.d = ctx.d.length > 1 ? ctx.d.slice(0, -1) : '0'; } else if (k === '±') { ctx.d = String(-parseFloat(ctx.d)); } else if (k === '%') { ctx.d = String(parseFloat(ctx.d) / 100); } else if (k === '=') { const r = calc(); ctx.d = isFinite(r) ? String(+r.toFixed(10)) : 'Ошибка'; ctx.acc = null; ctx.op = null; ctx.fresh = true; } else { const r = calc(); ctx.acc = isFinite(r) ? r : 0; ctx.d = isFinite(r) ? String(+r.toFixed(10)) : 'Ошибка'; ctx.op = k; ctx.fresh = true; }
      PD.snd.play('tap'); show();
    }
  };

  /* ===== ЧАСЫ ===== */
  A.clock = {
    dark: true, name: () => 'Часы', cls: '',
    render(ctx) { ctx.sw = { run: false, t0: 0, acc: 0 }; return `<div style="background:#000;color:#fff;height:100%;display:flex;flex-direction:column;align-items:center;padding-top:calc(var(--u)*60px)"><canvas id="ac" width="240" height="240" style="width:calc(var(--u)*220px);height:calc(var(--u)*220px)"></canvas><div id="dg" style="font-size:calc(var(--u)*34px);font-weight:300;margin:calc(var(--u)*14px) 0 0">--:--:--</div><div class="xs" style="opacity:.6;text-transform:capitalize" id="dd"></div><div style="margin-top:calc(var(--u)*30px);text-align:center"><div style="opacity:.6;font-size:calc(var(--u)*12px);letter-spacing:2px">СЕКУНДОМЕР</div><div id="swt" style="font-size:calc(var(--u)*46px);font-weight:200;font-variant-numeric:tabular-nums;margin:calc(var(--u)*6px) 0">00:00.0</div><div style="display:flex;gap:calc(var(--u)*20px);justify-content:center"><button class="sx-r" style="width:calc(var(--u)*110px);justify-content:center;background:#222;border-radius:30px;color:#fff" data-k="rst">Сброс</button><button class="sx-r" id="swb" style="width:calc(var(--u)*110px);justify-content:center;background:#0a4d1f;border-radius:30px;color:#4cd964" data-k="go">Старт</button></div></div></div>`; },
    mount(el, ctx) {
      const cv = $('#ac', el), c = cv.getContext('2d'); let raf; (function loop() { if (!el.isConnected) return; const d = new Date(eco.now()), s = d.getSeconds() + d.getMilliseconds() / 1000, mi = d.getMinutes() + s / 60, h = d.getHours() % 12 + mi / 60; c.clearRect(0, 0, 240, 240); c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.arc(120, 120, 112, 0, 7); c.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.strokeStyle = '#aaa'; c.lineWidth = 2; c.beginPath(); c.moveTo(120 + Math.sin(a) * 100, 120 - Math.cos(a) * 100); c.lineTo(120 + Math.sin(a) * 108, 120 - Math.cos(a) * 108); c.stroke(); } const hand = (v, max, l, w, col) => { const a = v / max * Math.PI * 2; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(120, 120); c.lineTo(120 + Math.sin(a) * l, 120 - Math.cos(a) * l); c.stroke(); }; hand(h, 12, 56, 6, '#fff'); hand(mi, 60, 84, 4, '#fff'); hand(s, 60, 96, 2, '#ff9f0a'); c.fillStyle = '#ff9f0a'; c.beginPath(); c.arc(120, 120, 5, 0, 7); c.fill(); $('#dg', el).textContent = d.toLocaleTimeString('ru-RU'); $('#dd', el).textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }); const sw = ctx.sw, ms = sw.acc + (sw.run ? Date.now() - sw.t0 : 0); $('#swt', el).textContent = String(Math.floor(ms / 60000)).padStart(2, '0') + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0') + '.' + Math.floor(ms / 100) % 10; raf = requestAnimationFrame(loop); })();
    },
    onClick(e, ctx) { const b = e.target.closest('[data-k]'); if (!b) return; const sw = ctx.sw; if (b.dataset.k === 'go') { if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; b.textContent = 'Старт'; } else { sw.t0 = Date.now(); sw.run = true; b.textContent = 'Стоп'; } } else { sw.run = false; sw.acc = 0; $('#swb', ctx.el).textContent = 'Старт'; } PD.snd.play('tap'); }
  };

  /* ===== ЗАМЕТКИ ===== */
  A.notes = {
    name: () => 'Заметки',
    render(ctx) { ctx.ph.os.notes = ctx.ph.os.notes || []; ctx.edit = null; return notesBody(ctx); },
    onClick(e, ctx) {
      const b = e.target.closest('[data-n]'); if (!b) return; const k = b.dataset.n, ns = ctx.ph.os.notes;
      if (k === 'new') { ns.unshift({ id: U.uidGen(), t: '', ts: Date.now() }); ctx.edit = ns[0].id; PD.save(); } else if (k.startsWith('o:')) ctx.edit = k.slice(2);
      else if (k === 'done') { const n = ns.find(x => x.id === ctx.edit); const ta = ctx.el.querySelector('textarea'); if (n && ta) { n.t = ta.value; n.ts = Date.now(); if (!n.t.trim()) ns.splice(ns.indexOf(n), 1); } PD.save(); ctx.edit = null; } else if (k === 'del') { const i = ns.findIndex(x => x.id === ctx.edit); if (i >= 0) ns.splice(i, 1); PD.save(); ctx.edit = null; }
      ctx.el.innerHTML = notesBody(ctx); const ta = ctx.el.querySelector('textarea'); ta && ta.focus();
    },
    onBack(ctx) { if (ctx.edit) { ctx.el.querySelector('[data-n=done]').click(); return true; } return false; }
  };
  function notesBody(ctx) {
    const ns = ctx.ph.os.notes;
    if (ctx.edit) { const n = ns.find(x => x.id === ctx.edit); return bar('Заметка', { right: `<button class="abtn" data-n="del">${I('trash')}</button><button class="abtn" data-n="done" style="font-weight:700;width:auto">Готово</button>` }) + `<div class="abody"><textarea style="width:calc(100% - 28px);height:calc(var(--u)*380px);margin:calc(var(--u)*8px) calc(var(--u)*14px);border:0;background:transparent;color:inherit;font:inherit;font-size:calc(var(--u)*16px);outline:none;resize:none" placeholder="Начните писать…">${esc(n.t)}</textarea></div>`; }
    return bar('Заметки', { right: `<button class="abtn" data-n="new">${I('plus')}</button>` }) + `<div class="abody">${ns.length ? grp(ns.map(n => `<button class="sx-r" data-n="o:${n.id}" style="flex-direction:column;align-items:flex-start;gap:2px"><b>${esc((n.t.split('\n')[0] || 'Без названия').slice(0, 40))}</b><span style="opacity:.55;font-size:calc(var(--u)*12px)">${new Date(n.ts).toLocaleDateString('ru-RU')} · ${esc((n.t.split('\n')[1] || '').slice(0, 30))}</span></button>`).join('')) : `<div style="text-align:center;padding:calc(var(--u)*60px) 20px;opacity:.6">Заметок нет. Нажмите «+».</div>`}</div>`;
  }
  A.avito = { name: () => 'Avito', render: () => '' };
})(window);
