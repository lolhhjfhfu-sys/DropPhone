/* PHONE DROP 2.0.0 — операционная система телефона: сцена, включение, загрузка, блокировка, рабочий стол, шторка */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u, esc = U.esc, ui = PD.ui, ic = PD.ic, eco = PD.eco;
  const $ = (s, r) => (r || document).querySelector(s);
  const os = PD.os = { apps: {}, order: ['camera', 'gallery', 'bench', 'settings', 'calc', 'clock', 'notes', 'avito'], dock: ['camera', 'gallery', 'bench', 'settings'] };
  const SHELL = {
    ios: { name: 'iOS', nav: 'pill', glow: '#7aa7ff' }, oneui: { name: 'One UI', nav: '3', glow: '#3e91ff' }, hyperos: { name: 'HyperOS', nav: 'pill', glow: '#ff6900' },
    pixel: { name: 'Android', nav: 'pill', glow: '#a8c7fa' }, oxygen: { name: 'OxygenOS', nav: 'pill', glow: '#f5010c' }, nothing: { name: 'Nothing OS', nav: 'pill', glow: '#ffffff' },
    coloros: { name: 'ColorOS', nav: '3', glow: '#00b25a' }, realme: { name: 'realme UI', nav: '3', glow: '#ffd400' }, xos: { name: 'XOS', nav: '3', glow: '#00d1ff' },
    magicos: { name: 'MagicOS', nav: 'pill', glow: '#1678ff' }, moto: { name: 'My UX', nav: '3', glow: '#5ac8fa' }
  };
  const WALLS = {
    ios: ['linear-gradient(160deg,#0f2b6b,#2a5298 40%,#b06ab3)', 'linear-gradient(170deg,#ff9a8b,#ff6a88 50%,#7b4397)', 'linear-gradient(160deg,#0c1f1a,#1f6b55 55%,#c7f464)', 'linear-gradient(160deg,#111,#3a3a52 60%,#8e9eab)', 'radial-gradient(circle at 30% 20%,#fcd34d,#f97316 40%,#7c2d12)'],
    oneui: ['linear-gradient(170deg,#5ee7df,#3b82f6 50%,#6d28d9)', 'linear-gradient(160deg,#1c1c3c,#4b3a8f 55%,#ff8fb1)', 'radial-gradient(circle at 70% 25%,#fde68a,#f59e0b 40%,#1e3a8a)', 'linear-gradient(160deg,#0f2027,#2c5364 60%,#7ed6c4)', 'linear-gradient(170deg,#232526,#414345)'],
    hyperos: ['linear-gradient(160deg,#ff9a3c,#ff5e62 50%,#3b1c5a)', 'linear-gradient(170deg,#0b132b,#1c2541 55%,#5bc0be)', 'linear-gradient(160deg,#a1ffce,#4facfe 60%,#1e3c72)', 'linear-gradient(160deg,#16222a,#3a6073)', 'radial-gradient(circle at 50% 80%,#ffd89b,#19547b)'],
    pixel: ['linear-gradient(170deg,#a8edea,#fed6e3 60%,#d4a5ff)', 'linear-gradient(160deg,#4776e6,#8e54e9)', 'linear-gradient(170deg,#d3ec9c,#7bb88a 60%,#245b6b)', 'linear-gradient(160deg,#141e30,#35577d)', 'linear-gradient(170deg,#ffecd2,#fcb69f 55%,#c06c84)'],
    nothing: ['#000', 'linear-gradient(160deg,#111,#2a2a2a)', 'linear-gradient(160deg,#e9e9e6,#bdbdb8)', 'radial-gradient(circle at 50% 30%,#2b2b2b,#000 70%)', 'linear-gradient(160deg,#1a1a1a,#3a0b0b)']
  };
  const wallsFor = shell => WALLS[shell] || WALLS.oneui;
  const LOGO = {
    Apple: '<svg viewBox="0 0 40 48" width="64%" style="width:calc(var(--u)*56px)"><path fill="#fff" d="M27.6 25.4c0-4.6 3.8-6.8 4-6.9-2.2-3.2-5.6-3.6-6.8-3.7-2.9-.3-5.7 1.7-7.1 1.7-1.5 0-3.7-1.7-6.1-1.6-3.1 0-6 1.8-7.6 4.6-3.3 5.7-.8 14 2.3 18.600 1.500 2.200 3.400 4.700 5.800 4.600 2.300-.1 3.200-1.500 6-1.500s3.600 1.500 6.100 1.400c2.500 0 4.100-2.300 5.600-4.500 1.800-2.600 2.500-5.100 2.500-5.200-.1 0-4.700-1.800-4.700-7.500zM23 11.700c1.300-1.500 2.100-3.700 1.900-5.800-1.800.1-4 1.200-5.300 2.800-1.200 1.400-2.200 3.600-1.900 5.700 2 .2 4-1 5.300-2.700z"/></svg>',
    Samsung: '<div style="font-size:calc(var(--u)*32px);font-weight:800;letter-spacing:calc(var(--u)*5px);color:#fff;font-family:Arial,sans-serif;transform:scaleX(1.12)">SAMSUNG</div>',
    Xiaomi: '<div style="width:calc(var(--u)*86px);height:calc(var(--u)*86px);border-radius:24%;background:#ff6900;display:grid;place-items:center;font:900 calc(var(--u)*44px)/1 Arial,sans-serif;color:#fff;letter-spacing:-2px">mi</div>',
    Redmi: '<div style="width:calc(var(--u)*86px);height:calc(var(--u)*86px);border-radius:24%;background:#ff6900;display:grid;place-items:center;font:900 calc(var(--u)*44px)/1 Arial,sans-serif;color:#fff;letter-spacing:-2px">mi</div>',
    POCO: '<div style="font:900 calc(var(--u)*50px)/1 Arial,sans-serif;color:#ffd800;letter-spacing:calc(var(--u)*3px)">POCO</div>',
    Google: '<div style="font:500 calc(var(--u)*64px)/1 Arial,sans-serif;letter-spacing:-2px"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></div>',
    OnePlus: '<div style="width:calc(var(--u)*84px);height:calc(var(--u)*84px);border-radius:22%;background:#f5010c;display:grid;place-items:center;font:900 calc(var(--u)*46px)/1 Arial,sans-serif;color:#fff">1+</div>',
    OPPO: '<div style="font:800 calc(var(--u)*46px)/1 Arial,sans-serif;color:#1ec26a;letter-spacing:calc(var(--u)*3px)">OPPO</div>',
    Realme: '<div style="font:800 calc(var(--u)*44px)/1 Arial,sans-serif;color:#ffd400;letter-spacing:-1px">realme</div>',
    Infinix: '<div style="font:800 calc(var(--u)*38px)/1 Arial,sans-serif;color:#00d1ff;letter-spacing:calc(var(--u)*4px)">INFINIX</div>',
    Honor: '<div style="font:800 calc(var(--u)*42px)/1 Arial,sans-serif;color:#fff;letter-spacing:calc(var(--u)*5px)">HONOR</div>',
    Motorola: '<div style="font:700 calc(var(--u)*40px)/1 Arial,sans-serif;color:#fff;letter-spacing:-1px">motorola</div>'
  };
  const SYS_VER = m => {
    const y = m.yr;
    if (m.shell === 'ios') return 'iOS ' + (y <= 2019 ? 18 : y === 2020 ? 18 : y === 2021 ? 18 : y === 2022 ? 18 : y === 2023 ? 26 : y === 2024 ? 26 : 26);
    if (m.shell === 'oneui') return 'One UI ' + (y <= 2021 ? '7.0' : y <= 2023 ? '8.0' : '8.5') + ' · Android ' + (y <= 2021 ? 15 : 16);
    if (m.shell === 'hyperos') return 'HyperOS ' + (y <= 2023 ? '2.0' : '3.0') + ' · Android ' + (y <= 2023 ? 15 : 16);
    if (m.shell === 'pixel') return 'Android 16 · Pixel UI';
    if (m.shell === 'oxygen') return 'OxygenOS 15 · Android 15';
    if (m.shell === 'nothing') return 'Nothing OS ' + (y <= 2023 ? '3.5' : '4.0') + ' · Android 15';
    if (m.shell === 'coloros') return 'ColorOS 15 · Android 15'; if (m.shell === 'realme') return 'realme UI 6.0 · Android 15';
    if (m.shell === 'xos') return 'XOS 15 · Android 15'; if (m.shell === 'magicos') return 'MagicOS 9.0 · Android 15'; return 'Hello UI · Android 15';
  };
  os.sysVer = SYS_VER;
  os.shellName = m => (SHELL[m.shell] || SHELL.oneui).name;
  os.wallsFor = wallsFor;
  os.appName = (id, shell) => { const a = os.apps[id]; if (!a) return id; return typeof a.name === 'function' ? a.name(shell) : a.name; };

  let R = null; // сессия
  const now = () => new Date(eco.now());
  const hhmm = d => d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateL = d => d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const gl = (n, w) => ic(n);

  /* ---------- запуск ---------- */
  os.launch = function (uid, opts) {
    const ph = eco.byUid(uid); if (!ph) return; if (R) os.close(true);
    const m = G.MODEL_BY_ID[ph.modelId], root = $('#os-root'), g = PD.screenGeom(m), sh = SHELL[m.shell] || SHELL.oneui;
    const vw = Math.min(innerWidth, 520), availW = vw - 30, availH = innerHeight - 190 - 30; const sc = Math.min(availW / g.vb[2], availH / g.vb[3]);
    const pwW = g.vb[2] * sc, pwH = g.vb[3] * sc, sx = (g.x - g.vb[0]) * sc, sy = (g.y - g.vb[1]) * sc, sw = g.w * sc, shh = g.h * sc;
    R = { ph, m, g, sh, uid, sc, on: false, locked: true, app: null, panel: false, recents: [], timers: [], st: { bright: ph.os.bright, vol: ph.os.vol, wifi: true, bt: true, air: false, torch: false, dnd: false, rot: false, save: false, dark: !!ph.os.dark, silent: false }, notifs: [], fresh: !ph.os.launched, pwW, pwH, sw, shh, u: sw / 390, volIdx: 0 };
    ph.os.bootCount = (ph.os.bootCount || 0);
    PD.snd.mul = Math.max(.08, R.st.vol / 100);
    document.body.classList.add('os-open'); root.hidden = false; $('#app').style.visibility = 'hidden';
    const btns = PD.art.buttons(m); let vi = 0;
    const hz = btns.map(b => { const x = (b.s === 'l' ? -2.6 : g.W - .2) - g.vb[0], y = b.y1 - g.vb[1], w = 2.8, h = b.y2 - b.y1; const kind = b.k === 'vol' ? 'vol' + (vi++) : b.k; return `<div class="hz ${b.k === 'pwr' ? 'hint' : ''}" data-hz="${kind}" style="left:${(x * sc - 7).toFixed(1)}px;top:${(y * sc - 3).toFixed(1)}px;width:${(w * sc + 14).toFixed(1)}px;height:${(h * sc + 6).toFixed(1)}px" title="${kind}"></div>`; }).join('');
    root.style.setProperty('--glow', sh.glow);
    root.innerHTML = `<div class="os-top"><button class="ib" data-os="exit" aria-label="Закрыть">${ic('back')}</button><b>${esc(m.n)}</b><span style="width:40px"></span></div>
      <div class="os-stage"><div class="os-glow"></div><div class="pw" id="pw" style="width:${pwW}px;height:${pwH}px"><img class="fr" src="${PD.art.uri(m.id, ph.colorIdx, 'front', ph.cond)}" alt="">
        <div class="scr" id="scr" style="left:${sx}px;top:${sy}px;width:${sw}px;height:${shh}px;border-radius:${g.r * sc}px;--u:${R.u}"><div id="osMount"></div></div>
        <img class="ov" src="${PD.art.overlayUri(m.id, ph.cond)}" alt="">${hz}</div>
        <button class="btn g power-cta" id="pcta" data-os="power">${ic('power', 'width="20" height="20" style="stroke:#001a0a;fill:none;stroke-width:2.4"')} Включить</button></div>
      <div class="os-bar"><button data-os="home">${ic('home')}Домой</button><button data-os="lock">${ic('lock')}Блок</button><button data-os="voldn"><svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4zM16 9.5a4 4 0 0 1 0 5"/></svg>Тише</button><button data-os="volup"><svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4zM16 9.5a4 4 0 0 1 0 5M18.5 7a8 8 0 0 1 0 10"/></svg>Громче</button><button data-os="shade">${ic('bell')}Шторка</button><button data-os="exit">${ic('close')}Выйти</button></div>`;
    root.onclick = e => { const b = e.target.closest('[data-os],[data-hz]'); if (!b) return; PD.snd.unlock(); const a = b.dataset.os || ('hz:' + b.dataset.hz); os.cmd(a); };
    R.alive = true;
    R.timers.push(setInterval(tickClock, 1000));
    if (opts && opts.fromBuy) setTimeout(() => ui.notify('Нажмите «Включить»', 'или боковую кнопку питания на телефоне', 'info'), 900);
  };
  os.cmd = function (a) {
    if (!R) return; PD.snd.play('tap');
    if (a === 'exit' || a === 'hz:cam' && false) return os.close();
    if (a === 'power' || a === 'hz:pwr') return R.on ? (R.locked ? unlock() : lockNow()) : powerOn();
    if (!R.on) { if (a.startsWith('hz:vol') || a === 'volup' || a === 'voldn') return volChange(a === 'hz:vol0' || a === 'volup' ? 8 : -8); return; }
    if (a === 'home') return goHome(); if (a === 'lock') return lockNow(); if (a === 'shade') return toggleShade();
    if (a === 'volup' || a === 'hz:vol0') return volChange(8); if (a === 'voldn' || a === 'hz:vol1') return volChange(-8);
    if (a === 'hz:mute' || a === 'hz:action' || a === 'hz:slider') { R.st.silent = !R.st.silent; PD.snd.mul = R.st.silent ? .0001 : Math.max(.08, R.st.vol / 100); toastIn(R.st.silent ? 'Беззвучный режим' : 'Звук включён'); return; }
    if (a === 'hz:cam') { if (R.locked) unlock(); openApp('camera'); }
  };
  os.close = function (silent) {
    if (!R) return; R.timers.forEach(clearInterval); R.timers.forEach(clearTimeout); if (R.app && os.apps[R.app.id] && os.apps[R.app.id].unmount) try { os.apps[R.app.id].unmount(R.app.ctx); } catch (e) { }
    R.ph.os.bright = R.st.bright; R.ph.os.vol = R.st.vol; R.ph.os.dark = R.st.dark; PD.save();
    PD.snd.mul = 1; document.body.classList.remove('os-open'); const root = $('#os-root'); root.hidden = true; root.innerHTML = ''; $('#app').style.visibility = '';
    const uid = R.uid; R = null; if (!silent) ui.rerender();
  };
  os.session = () => R;

  /* ---------- включение / загрузка ---------- */
  function powerOn() {
    if (R.on || R.booting) return; R.booting = true;
    const pc = $('#pcta'); if (pc) pc.style.display = 'none'; document.querySelectorAll('.hz.hint').forEach(h => h.classList.remove('hint'));
    const { m, ph } = R, fast = !R.fresh, dur = fast ? 3000 : 5200;
    const mount = $('#osMount');
    mount.innerHTML = `<div class="os os-${m.shell}" id="osr" style="--u:${R.u}"><div class="boot" id="boot"></div></div>`;
    const boot = $('#boot'); const br = m.br; const logo = LOGO[br] || LOGO.Motorola;
    PD.snd.play('boot', br);
    const wait = ms => new Promise(r => R.timers.push(setTimeout(r, ms)));
    let bits = '';
    if (m.shell === 'ios') bits = '<div class="pb"><i id="pbf"></i></div>';
    else if (br === 'Samsung') bits = '<div class="ring"></div><div class="sub">Galaxy</div>';
    else if (br === 'Google') bits = '<div class="dots"><i style="background:#4285f4"></i><i style="background:#ea4335"></i><i style="background:#fbbc05"></i><i style="background:#34a853"></i></div>';
    else if (br === 'Nothing') bits = '';
    else if (br === 'Xiaomi' || br === 'Redmi' || br === 'POCO') bits = `<div class="pb" style="width:30%"><i id="pbf" style="background:#ff6900"></i></div><div class="sub">${esc(os.shellName(m))}</div>`;
    else bits = '<div class="ring" style="border-top-color:' + (SHELL[m.shell] || SHELL.oneui).glow + '"></div>';
    if (br === 'Nothing') {
      let cells = ''; const lit = new Set([8, 9, 10, 11, 12, 15, 19, 22, 26, 29, 33, 36, 40, 43, 47, 50, 51, 52, 53, 54, 13, 20, 27, 34, 41]); for (let i = 0; i < 49; i++) cells += `<i class="${lit.has(i) ? 'on' : ''}" style="animation-delay:${(i % 7) * .08 + Math.floor(i / 7) * .05}s"></i>`;
      boot.innerHTML = `<div class="lg"><div class="dm">${cells}</div></div><div class="sub" style="letter-spacing:6px">NOTHING</div>`;
    } else boot.innerHTML = `<div class="lg">${logo}</div>${bits}${['Apple', 'Samsung', 'Xiaomi', 'Redmi', 'POCO'].includes(br) ? '' : `<div class="sub">${esc(m.n)}</div>`}`;
    const pbf = $('#pbf'); let t0 = performance.now();
    (function step(n) { if (!R || !R.booting) return; const t = Math.min(1, (n - t0) / (dur * .9)); if (pbf) pbf.style.width = (t * 100) + '%'; if (t < 1) requestAnimationFrame(step); })(t0);
    wait(dur).then(() => {
      if (!R) return; R.booting = false; R.on = true; ph.os.launched = true; ph.os.bootCount++; PD.save(); buildOS(); boot.classList.add('out'); setTimeout(() => boot.remove(), 650);
      $('#os-root .os-glow').style.opacity = '.4';
      if (!ph.os.gallery.length) seedGallery(ph);
      pushN('settings', 'Добро пожаловать!', 'Добро пожаловать в ' + os.shellName(m) + '. Телефон готов к работе.');
      pushN('bench', 'TYNTYTY Benchmark 11', 'Проверьте производительность вашего ' + m.n);
      PD.snd.play('unlock');
    });
  }
  function seedGallery(ph) { const t = Date.now(); ph.os.gallery.push({ id: U.uidGen(), ts: t - 86400000 * 2, seed: 11 + (U.hashStr(ph.uid) % 90), zoom: 1, kind: 'photo', demo: 1 }, { id: U.uidGen(), ts: t - 86400000, seed: 47 + (U.hashStr(ph.uid) % 90), zoom: 1, kind: 'photo', demo: 1 }); }

  /* ---------- построение ОС после загрузки ---------- */
  const STATUS = () => `<div class="st"><span class="clk">${hhmm(now())}</span><span class="sr"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8" opacity=".4"/></svg><svg viewBox="0 0 16 12" class="wf"><path d="M8 11.5l1.8-2a2.6 2.6 0 0 0-3.6 0zM3.8 7.6a6.2 6.2 0 0 1 8.4 0l1.2-1.4a8 8 0 0 0-10.8 0zM.9 4.7a10.200 10.200 0 0 1 14.200 0L16 3.500a12 12 0 0 0-16 0z"/></svg><span class="batt"><span class="bp">${R.ph.bat}</span><i><b style="width:${R.ph.bat}%"></b></i></span></span></div>`;
  function wallStyle() { const w = wallsFor(R.m.shell), i = (R.ph.os.wall || 0) % w.length; return w[i]; }
  function buildOS() {
    const { m, ph, st } = R, mount = $('#osMount'), osr = $('#osr');
    osr.className = 'os os-' + m.shell + (st.dark ? ' pdark' : '');
    const lightWall = m.shell === 'nothing' && (ph.os.wall || 0) === 2;
    osr.insertAdjacentHTML('afterbegin', `<div class="wall" id="wall" style="background:${wallStyle()}"></div>`);
    osr.insertAdjacentHTML('beforeend', `${homeHtml()}${lockHtml()}${STATUS()}<div class="stbar-hit" id="sthit"></div><div class="shade" id="shade"></div><div class="nav" id="osnav"></div><div class="vhud" id="vhud"><i style="height:${st.vol}%"></i></div><div class="torch" id="torch"></div><div class="dim" id="dim" style="opacity:${dimOp()}"></div>`);
    osr.addEventListener('click', osClick); bindGestures(); renderNav(); buildShade(); tickClock();
  }
  const dimOp = () => ((100 - R.st.bright) / 100 * .78).toFixed(2);
  const widgetHtml = () => {
    const s = R.m.shell, d = now(), t = hhmm(d);
    if (s === 'pixel') return `<div class="widget" style="margin-top:calc(var(--u)*10px)"><div style="font-size:calc(var(--u)*34px);font-weight:400" class="clk">${t}</div><div style="opacity:.9;font-size:calc(var(--u)*14px)">${dateL(d)} · ☀ 18°</div></div><div class="gsearch"><b style="color:#4285f4">G</b><span style="flex:1;opacity:.6">Поиск</span></div>`;
    if (s === 'nothing') return `<div class="widget" style="text-align:left"><div class="clk" style="font:700 calc(var(--u)*56px)/1 'Courier New',monospace;letter-spacing:4px">${t}</div><div style="letter-spacing:3px;font-size:calc(var(--u)*11px);opacity:.8;text-transform:uppercase">${dateL(d)}</div></div>`;
    if (s === 'ios') return `<div class="widget" style="display:flex;gap:calc(var(--u)*12px)"><div style="flex:1;border-radius:calc(var(--u)*22px);background:rgba(255,255,255,.22);backdrop-filter:blur(20px);padding:calc(var(--u)*12px);height:calc(var(--u)*140px)"><div style="font-size:calc(var(--u)*12px);opacity:.85">Аккумулятор</div><div style="font-size:calc(var(--u)*34px);font-weight:700;margin-top:calc(var(--u)*30px)">${R.ph.bat}%</div></div><div style="flex:1;border-radius:calc(var(--u)*22px);background:rgba(255,255,255,.22);backdrop-filter:blur(20px);padding:calc(var(--u)*12px);height:calc(var(--u)*140px)"><div style="font-size:calc(var(--u)*12px);opacity:.85;text-transform:capitalize">${d.toLocaleDateString('ru-RU', { weekday: 'long' })}</div><div style="font-size:calc(var(--u)*50px);font-weight:300;margin-top:calc(var(--u)*14px)">${d.getDate()}</div><div style="font-size:calc(var(--u)*12px);opacity:.85">${d.toLocaleDateString('ru-RU', { month: 'long' })}</div></div></div>`;
    return `<div class="widget" style="text-align:${s === 'oneui' || s === 'hyperos' ? 'center' : 'left'};padding:calc(var(--u)*6px) calc(var(--u)*8px)"><div class="clk" style="font-size:calc(var(--u)*64px);font-weight:300;line-height:1">${t}</div><div style="font-size:calc(var(--u)*14px);opacity:.9;text-transform:capitalize">${dateL(d)}</div></div>`;
  };
  const ICO = { camera: ['cam', 'linear-gradient(135deg,#6b7280,#374151)'], gallery: ['star', 'linear-gradient(135deg,#f59e0b,#ef4444 55%,#a855f7)'], bench: ['bolt', 'linear-gradient(135deg,#00e5ff,#7c4dff 60%,#ff3d9a)'], settings: ['gear', 'linear-gradient(135deg,#9ca3af,#4b5563)'], calc: ['plus', 'linear-gradient(135deg,#f59e0b,#d97706)'], clock: ['clock', 'linear-gradient(135deg,#1f2937,#0b0f19)'], notes: ['list', 'linear-gradient(135deg,#fde047,#f59e0b)'], avito: ['tag', 'linear-gradient(135deg,#0af,#7c4dff)'] };
  function appIcon(id) { const [g, bg] = ICO[id]; return `<button class="ap" data-app="${id}"><span class="ic" style="background:${bg}">${ic(g)}</span><span>${esc(os.appName(id, R.m.shell))}</span></button>`; }
  const homeHtml = () => `<div class="home" id="home">${widgetHtml()}<div class="hgrid">${['calc', 'clock', 'notes', 'avito'].map(appIcon).join('')}</div><div class="dock">${os.dock.map(appIcon).join('')}</div></div>`;
  function lockHtml() {
    const s = R.m.shell, d = now(), notif = '';
    const lines = s === 'nothing' ? `<div class="lk-clock"><div class="lk-d clk2">${dateL(d)}</div><div class="lk-t clk">${hhmm(d)}</div></div>` : `<div class="lk-clock"><div class="lk-d">${dateL(d).replace(/^./, c => c.toUpperCase())}</div><div class="lk-t clk">${hhmm(d)}</div></div>`;
    return `<div class="lock" id="lock"><div class="wall" style="background:${wallStyle()};filter:brightness(.88)"></div>${lines}<div class="lk-notifs" id="lkN" style="top:calc(var(--u)*${s === 'pixel' ? 250 : 270}px)"></div>
      <button class="lk-btn" style="left:calc(var(--u)*42px)" data-lk="torch" aria-label="Фонарик">${ic('bolt')}</button><button class="lk-btn" style="right:calc(var(--u)*42px)" data-lk="cam" aria-label="Камера">${ic('cam')}</button>
      <div class="lk-hint" data-lk="unlock">${s === 'ios' ? 'Проведите вверх, чтобы разблокировать' : 'Проведите вверх'}</div></div>`;
  }
  function renderNav() {
    const nav = $('#osnav'); if (!nav) return; const app = R.app, lightApp = app && os.apps[app.id] && !os.apps[app.id].dark;
    const gest = SHELL[R.m.shell].nav === 'pill'; nav.className = 'nav' + (gest ? '' : ' nav3') + (lightApp ? ' dark' : '');
    nav.innerHTML = gest ? '<div class="pill" data-nv="home"></div>' : `<button data-nv="back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button data-nv="home"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/></svg></button><button data-nv="rec"><svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button>`;
  }
  function osClick(e) {
    const t = e.target;
    let b;
    if ((b = t.closest('[data-app]'))) { PD.snd.play('tap'); return openApp(b.dataset.app, b); }
    if ((b = t.closest('[data-nv]'))) { PD.snd.play('tap'); const k = b.dataset.nv; if (k === 'home') return goHome(); if (k === 'back') return goBack(); if (k === 'rec') return showRecents(); }
    if ((b = t.closest('[data-lk]'))) { const k = b.dataset.lk; if (k === 'unlock') return unlock(); if (k === 'torch') { R.st.torch = !R.st.torch; $('#torch').classList.toggle('on', R.st.torch); return; } if (k === 'cam') { unlock(); return openApp('camera'); } }
    if ((b = t.closest('[data-q]'))) return quick(b.dataset.q, b);
    if ((b = t.closest('[data-sh]'))) { if (b.dataset.sh === 'close') return toggleShade(false); if (b.dataset.sh === 'clear') { R.notifs = []; buildShade(); return; } }
    if ((b = t.closest('[data-rc]'))) { const id = b.dataset.rc; $('.recents') && $('.recents').remove(); return openApp(id); }
  }
  /* жесты: свайп вверх — разблокировка, свайп вниз по статус-бару — шторка */
  function bindGestures() {
    const lock = $('#lock'), hit = $('#sthit'), shade = $('#shade'); let y0 = null, tgt = null;
    const down = (e, t) => { y0 = e.clientY; tgt = t; }; const up = e => {
      if (y0 == null) return; const dy = e.clientY - y0; const t = tgt; y0 = null;
      if (t === 'lock' && dy < -45) unlock(); else if (t === 'hit' && (dy > 25 || Math.abs(dy) < 6)) toggleShade(true); else if (t === 'shade' && dy < -45) toggleShade(false);
    };
    lock.addEventListener('pointerdown', e => { if (!e.target.closest('[data-lk]') || e.target.closest('[data-lk=unlock]')) down(e, 'lock'); }); hit.addEventListener('pointerdown', e => down(e, 'hit')); shade.addEventListener('pointerdown', e => { if (!e.target.closest('input,button')) down(e, 'shade'); });
    window.addEventListener('pointerup', up, { passive: true }); R.cleanup = () => window.removeEventListener('pointerup', up);
  }
  function unlock() { if (!R.locked) return; R.locked = false; $('#lock').classList.add('up'); PD.snd.play('unlock'); $('#home').classList.remove('under'); }
  function lockNow() { if (!R.on) return; if (R.app) closeApp(true); toggleShade(false); R.locked = true; const l = $('#lock'); l.classList.remove('up'); PD.snd.play('lock'); renderLockNotifs(); }
  function goHome() { if (R.locked) return unlock(); toggleShade(false); const rc = $('.recents'); if (rc) rc.remove(); if (R.app) closeApp(); }
  function goBack() { const rc = $('.recents'); if (rc) return rc.remove(); if (R.panel) return toggleShade(false); if (R.app) { const a = os.apps[R.app.id]; if (a && a.onBack && a.onBack(R.app.ctx)) return; return closeApp(); } }
  function showRecents() {
    if (R.recents.length === 0) return toastIn('Нет недавних приложений'); const osr = $('#osr');
    osr.insertAdjacentHTML('beforeend', `<div class="recents">${R.recents.map(id => `<button class="rc" data-rc="${id}"><span class="ic" style="width:calc(var(--u)*56px);height:calc(var(--u)*56px);border-radius:var(--ir);background:${ICO[id][1]};display:grid;place-items:center">${ic(ICO[id][0], 'width="30" height="30" style="stroke:#fff;fill:none;stroke-width:1.8"')}</span>${esc(os.appName(id, R.m.shell))}</button>`).join('')}</div>`);
    $('.recents').onclick = e => { if (e.target.classList.contains('recents')) e.target.remove(); };
  }

  /* ---------- приложения ---------- */
  function openApp(id, from) {
    const a = os.apps[id]; if (!a || R.locked) return; if (id === 'avito') { os.close(); ui.setTab('home'); return; }
    if (R.app) closeApp(true); toggleShade(false);
    const osr = $('#osr'), el = document.createElement('div'); el.className = 'app a-' + id + (a.cls ? ' ' + a.cls : ''); el.id = 'appw';
    if (from) { const r = from.getBoundingClientRect(), s = $('#scr').getBoundingClientRect(); el.style.setProperty('--ox', ((r.left + r.width / 2 - s.left) / s.width * 100) + '%'); el.style.setProperty('--oy', ((r.top + r.height / 2 - s.top) / s.height * 100) + '%'); }
    const ctx = { ph: R.ph, m: R.m, shell: R.m.shell, R, el, os, close: () => closeApp(), push: pushN, toast: toastIn, rerender: () => { const body = el.querySelector('.abody'); } };
    el.innerHTML = a.render(ctx); osr.insertBefore(el, $('#shade'));
    R.app = { id, el, ctx }; R.recents = [id].concat(R.recents.filter(x => x !== id)).slice(0, 5); $('#home').classList.add('under'); renderNav();
    if (a.mount) a.mount(el, ctx); PD.snd.play('nav');
    if (a.onClick) el.addEventListener('click', ev => a.onClick(ev, ctx));
  }
  function closeApp(instant) {
    if (!R.app) return; const { id, el, ctx } = R.app; const a = os.apps[id]; if (a.unmount) try { a.unmount(ctx); } catch (e) { } R.app = null;
    $('#home').classList.remove('under'); renderNav();
    if (instant) el.remove(); else { el.classList.add('closing'); setTimeout(() => el.remove(), 260); }
  }
  os.closeApp = closeApp;

  /* ---------- шторка и уведомления ---------- */
  function pushN(app, title, text) { if (!R) return; R.notifs.unshift({ id: U.uidGen(), app, title, text, ts: now() }); if (R.notifs.length > 12) R.notifs.length = 12; if (R.on) { buildShade(); renderLockNotifs(); if (!R.st.dnd && !R.locked) toastIn(title + ': ' + text); if (!R.st.dnd) PD.snd.play('msg'); } }
  function ncard(n) { const [g, bg] = ICO[n.app] || ICO.settings; return `<div class="ncard"><div class="ai" style="background:${bg}">${ic(g)}</div><div style="min-width:0"><b>${esc(n.title)}</b><span>${esc(n.text)}</span></div><time>${hhmm(n.ts)}</time></div>`; }
  function renderLockNotifs() { const b = $('#lkN'); if (b) b.innerHTML = R.notifs.slice(0, 3).map(ncard).join(''); }
  const QT = [['wifi', 'Wi-Fi', 'wifi'], ['bt', 'Bluetooth', 'bt'], ['air', 'Авиарежим', 'air'], ['torch', 'Фонарик', 'torch'], ['dnd', 'Не беспокоить', 'dnd'], ['dark', 'Тёмная тема', 'dark'], ['rot', 'Автоповорот', 'rot'], ['save', 'Экономия', 'save']];
  const QI = { wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.500a10 10 0 0 1 14 0M8.500 16a5 5 0 0 1 7 0M12 19.500h.01"/>', bt: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>', air: '<path d="M2 16l20-6-3-2-6 1.500-5-5-2 1 3 5.500-5 1.500-2-1.500z"/>', torch: '<path d="M8 3h8l-1 5H9zM9 8h6v4l-1 9h-4l-1-9z"/>', dnd: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>', dark: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="#fff"/>', rot: '<path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7"/>', save: '<path d="M12 21s-8-5.200-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z"/>' };
  function buildShade() {
    const s = $('#shade'); if (!s) return; const st = R.st;
    s.innerHTML = `<div style="display:flex;justify-content:space-between;margin:0 4px calc(var(--u)*10px)"><b class="clk" style="font-size:calc(var(--u)*30px);font-weight:300">${hhmm(now())}</b><span style="opacity:.8;font-size:calc(var(--u)*13px);align-self:flex-end;text-transform:capitalize">${dateL(now())}</span></div>
      <div class="qt">${QT.map(([k, n]) => `<button data-q="${k}" class="${st[k] ? 'on' : ''}"><svg viewBox="0 0 24 24">${QI[k]}</svg>${n}</button>`).join('')}</div>
      <div class="sh-sl"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.500 1.500M17.500 17.500L19 19M5 19l1.500-1.500M17.500 6.500L19 5"/></svg><input type="range" min="5" max="100" value="${st.bright}" data-sl="bright"></div>
      <div class="sh-sl"><svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4zM16 9.500a4 4 0 0 1 0 5"/></svg><input type="range" min="0" max="100" value="${st.vol}" data-sl="vol"></div>
      <div class="sh-n"><div style="display:flex;justify-content:space-between;font-size:calc(var(--u)*12px);opacity:.8"><span>Уведомления</span>${R.notifs.length ? '<button data-sh="clear" style="background:none;border:0;color:#fff;font-size:calc(var(--u)*12px);text-decoration:underline">Очистить</button>' : ''}</div>${R.notifs.length ? R.notifs.map(ncard).join('') : '<div style="text-align:center;opacity:.55;padding:calc(var(--u)*18px)">Нет уведомлений</div>'}</div>
      <button data-sh="close" style="margin:calc(var(--u)*14px) auto 0;width:calc(var(--u)*50px);height:calc(var(--u)*5px);border-radius:3px;background:rgba(255,255,255,.55);border:0;flex:none"></button>`;
    s.querySelectorAll('[data-sl]').forEach(r => r.addEventListener('input', () => setSlider(r.dataset.sl, +r.value)));
  }
  function setSlider(k, v) { if (k === 'bright') { R.st.bright = v; $('#dim').style.opacity = dimOp(); R.ph.os.bright = v; } else { R.st.vol = v; PD.snd.mul = R.st.silent ? .0001 : Math.max(.02, v / 100); R.ph.os.vol = v; showVol(); clearTimeout(R.vt); R.vt = setTimeout(() => PD.snd.play('ok'), 180); } syncSliders(k, v); }
  function syncSliders(k, v) { document.querySelectorAll(`[data-sl="${k}"]`).forEach(r => { if (+r.value !== v) r.value = v; }); }
  function showVol() { const h = $('#vhud'); if (!h) return; h.firstChild.style.height = R.st.vol + '%'; h.classList.add('on'); clearTimeout(R.vh); R.vh = setTimeout(() => h.classList.remove('on'), 1100); }
  function volChange(d) { R.st.vol = U.clamp(R.st.vol + d, 0, 100); R.st.silent = false; PD.snd.mul = Math.max(.02, R.st.vol / 100); R.ph.os.vol = R.st.vol; if (R.on) { showVol(); syncSliders('vol', R.st.vol); } PD.snd.play('ok'); }
  os.setSlider = setSlider; os.volChange = volChange;
  function toggleShade(v) { if (!R.on) return; const open = v == null ? !R.panel : v; if (open === R.panel) return; R.panel = open; if (open) buildShade(); $('#shade').classList.toggle('open', open); PD.snd.play(open ? 'nav' : 'tap'); }
  function quick(k, el) {
    const st = R.st; st[k] = !st[k];
    if (k === 'torch') $('#torch').classList.toggle('on', st.torch);
    if (k === 'air' && st.air) { st.wifi = false; st.bt = false; } else if (k === 'air') { st.wifi = true; st.bt = true; }
    if ((k === 'wifi' || k === 'bt') && st[k]) st.air = false;
    if (k === 'dark') { R.ph.os.dark = st.dark; $('#osr').classList.toggle('pdark', st.dark); }
    if (k === 'save') toastIn(st.save ? 'Режим экономии включён' : 'Режим экономии выключен');
    const wf = document.querySelector('.os .st .wf'); if (wf) wf.style.opacity = st.wifi ? 1 : .25;
    buildShade(); R.app && os.apps[R.app.id].onState && os.apps[R.app.id].onState(R.app.ctx);
  }
  os.state = () => R && R.st;
  function toastIn(txt) { if (!R) return; const osr = $('#osr'); if (!osr) return; const t = document.createElement('div'); t.className = 'ncard'; t.style.cssText = 'position:absolute;top:calc(var(--u)*40px);left:calc(var(--u)*14px);right:calc(var(--u)*14px);z-index:96;background:rgba(30,30,34,.92);animation:fadeIn .2s both;pointer-events:none'; t.innerHTML = `<b style="font-weight:600;font-size:calc(var(--u)*13px)">${esc(txt)}</b>`; osr.appendChild(t); setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = 0; setTimeout(() => t.remove(), 320); }, 1900); }
  os.toast = toastIn; os.push = pushN;
  function tickClock() { if (!R) return; const t = hhmm(now()); document.querySelectorAll('#osr .clk').forEach(e => { if (e.textContent !== t) e.textContent = t; }); }
  os.wallpaperChanged = () => { const w = wallStyle(); const a = $('#wall'); if (a) a.style.background = w; const l = document.querySelector('#lock .wall'); if (l) l.style.background = w; };
  os.wallStyle = () => R && wallStyle();
})(window);
