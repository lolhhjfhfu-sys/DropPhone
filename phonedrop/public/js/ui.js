/* PHONE DROP 2.0.0 — UI-фреймворк: роутер, иконки, окна, уведомления */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u, esc = U.esc, rub = U.rub;
  const $ = s => document.querySelector(s);

  /* ---------- иконки (линейные, 24×24) ---------- */
  const IC = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>', gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 13h18M12 8c-3 0-5-1-5-3s3-2.5 5 3c2-5.5 5-5 5-3s-2 3-5 3z"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>', train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l2-4M15 21l-2-4"/><circle cx="9" cy="14" r=".6"/><circle cx="15" cy="14" r=".6"/>',
    bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M7 21v-3M17 21v-3"/><circle cx="8" cy="14.5" r=".7"/><circle cx="16" cy="14.5" r=".7"/>',
    plane: '<path d="M2 16l20-6-3-2-6 1.5-5-5-2 1 3 5.5-5 1.5-2-1.5z M10 20l3-5"/>', phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.3"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', warn: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.8-4.6 4.3 1.2 6.2L12 17.2 6.4 20l1.2-6.2L3 9.6l6.2-.8z"/>', pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>', trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', power: '<path d="M12 3v9M6.5 6.5a8 8 0 1 0 11 0"/>', cam: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>', send: '<path d="M21 3L3 11l7 3 3 7z M10 14l11-11"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>', cloud: '<path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1A4.5 4.5 0 0 1 17 18z"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>', ticket: '<path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z M13 6v12"/>', map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
    down: '<path d="M6 9l6 6 6-6"/>', chevr: '<path d="M9 5l7 7-7 7"/>', refresh: '<path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
  };
  const ic = (n, extra) => `<svg viewBox="0 0 24 24" ${extra || ''}>${IC[n] || ''}</svg>`;
  PD.ic = ic; PD.IC = IC;

  /* ---------- изображения телефонов ---------- */
  const img = (id, ci, view, cond, cls) => `<img ${cls ? `class="${cls}" ` : ''}src="${PD.art.uri(id, ci, view || 'back', cond)}" alt="" decoding="async" draggable="false">`;
  PD.img = img;
  const condTag = c => `<span class="cond" style="background:${PD.CONDITIONS[c].color}">${PD.CONDITIONS[c].name}</span>`;
  PD.condTag = condTag;
  const stars = r => { const full = Math.floor(r), half = r - full >= .5; return '<span class="stars">' + '★'.repeat(full) + (half ? '⯨' : '') + '<span style="opacity:.28">' + '★'.repeat(5 - full - (half ? 1 : 0)) + '</span></span>'; };
  PD.stars = stars;

  /* ---------- состояние UI ---------- */
  const ui = PD.ui = { tab: 'home', stack: [], screens: {}, act: {}, inp: {} };
  PD.screens = ui.screens; PD.act = ui.act;
  const TABS = [['home', 'Объявления', 'home'], ['favs', 'Избранное', 'heart'], ['sell', 'Продать', 'plus'], ['messages', 'Сообщения', 'chat'], ['profile', 'Профиль', 'user']];

  ui.unread = () => Object.values(PD.S.chats).reduce((a, c) => a + (c.unread || 0), 0);
  ui.renderNav = function () {
    const un = ui.unread();
    $('#nav').innerHTML = TABS.map(([id, nm, i]) => `<button data-act="tab" data-arg="${id}" class="${id === ui.tab ? 'on' : ''}${id === 'sell' ? ' plus' : ''}" aria-label="${nm}">${id === 'sell' ? `<span class="pl">${ic(i)}</span>` : ic(i)}<span>${id === 'sell' ? 'Продать' : nm}</span>${id === 'messages' && un ? `<i class="nb">${un > 9 ? '9+' : un}</i>` : ''}</button>`).join('');
  };
  ui.current = () => ui.stack[ui.stack.length - 1];
  ui.render = function (dir) {
    const cur = ui.current(), sc = ui.screens[cur.name]; const view = $('#view');
    if (!sc) { ui.go('home'); return; }
    const html = sc.render(cur.params || {}, cur);
    view.innerHTML = `<div class="page ${dir === 'back' ? 'back' : dir === 'fade' ? 'fade' : ''}">${html}</div>`;
    if (cur.scroll != null && dir === 'back') view.scrollTop = cur.scroll; else view.scrollTop = 0;
    if (sc.mount) sc.mount(view.firstChild, cur.params || {}, cur);
    $('#nav').style.display = (sc.hideNav ? 'none' : '');
    ui.renderNav();
  };
  ui.rerender = function () { const v = $('#view'), st = v.scrollTop; const cur = ui.current(); if (!cur) return; const sc = ui.screens[cur.name]; if (!sc) return; const first = v.firstChild; first.className = 'page fade'; first.innerHTML = sc.render(cur.params || {}, cur); v.scrollTop = st; if (sc.mount) sc.mount(first, cur.params || {}, cur); ui.renderNav(); ui.syncBadge(); };
  ui.go = function (name, params, o) {
    o = o || {}; const cur = ui.current(); if (cur) cur.scroll = $('#view').scrollTop;
    if (o.root) { ui.stack = []; if (o.tab) ui.tab = o.tab; }
    if (o.replace) ui.stack.pop();
    ui.stack.push({ name, params: params || {} }); ui.render(o.fade ? 'fade' : 'fwd'); ui.hapt();
  };
  ui.back = function () {
    if (ui.stack.length > 1) { ui.stack.pop(); ui.render('back'); }
    else if (ui.tab !== 'home') ui.setTab('home');
  };
  ui.setTab = function (t) {
    const map = { home: 'home', favs: 'favs', messages: 'messages', profile: 'profile', sell: 'sell' };
    const cur = ui.current(); if (cur) cur.scroll = $('#view').scrollTop;
    const same = ui.tab === t && ui.stack.length === 1 && ui.stack[0].name === map[t];
    ui.tab = t; ui.stack = [{ name: map[t], params: {} }];
    if (same) { $('#view').scrollTo({ top: 0, behavior: 'smooth' }); ui.renderNav(); return; }
    ui.render('fade');
  };
  ui.hapt = () => PD.hap('light');

  /* ---------- события ---------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const fn = ui.act[el.dataset.act]; if (!fn) return;
    if (el.dataset.snd !== 'none') PD.snd.play('tap');
    PD.snd.unlock();
    try { fn(el.dataset.arg, el, e); } catch (err) { console.error('act error', el.dataset.act, err); }
  });
  document.addEventListener('input', e => { const el = e.target.closest('[data-in]'); if (el && ui.inp[el.dataset.in]) ui.inp[el.dataset.in](el.value, el, e); });
  document.addEventListener('keydown', e => { const el = e.target.closest('[data-enter]'); if (el && e.key === 'Enter') { e.preventDefault(); const fn = ui.act[el.dataset.enter]; fn && fn(el.value, el, e); } });
  ui.act.tab = t => { PD.snd.play('nav'); ui.setTab(t); };
  ui.act.back = () => ui.back();
  ui.act.go = (arg, el) => { const [n, p] = arg.split('|'); ui.go(n, p ? JSON.parse(p) : {}); };

  /* ---------- окна ---------- */
  const layer = () => $('#layer');
  let modalStack = [];
  ui.sheet = function (html, o) {
    o = o || {}; const sc = document.createElement('div'); sc.className = 'scrim';
    sc.innerHTML = `<div class="sheet"><div class="grab"></div>${html}</div>`;
    sc.addEventListener('click', e => { if (e.target === sc && !o.sticky) ui.closeModal(sc); });
    layer().appendChild(sc); modalStack.push(sc); layer().style.pointerEvents = 'auto'; sc._o = o;
    if (o.mount) o.mount(sc.firstChild, sc); return sc;
  };
  ui.dialog = function (html, o) {
    o = o || {}; const sc = document.createElement('div'); sc.className = 'scrim mid';
    sc.innerHTML = `<div class="dlg">${html}</div>`;
    sc.addEventListener('click', e => { if (e.target === sc && !o.sticky) ui.closeModal(sc); });
    layer().appendChild(sc); modalStack.push(sc); layer().style.pointerEvents = 'auto'; return sc;
  };
  ui.closeModal = function (sc) {
    sc = sc || modalStack[modalStack.length - 1]; if (!sc) return;
    modalStack = modalStack.filter(x => x !== sc); sc.classList.add('out'); const sh = sc.firstChild; if (sh) sh.classList.add('out');
    setTimeout(() => { sc.remove(); if (!modalStack.length) layer().style.pointerEvents = 'none'; }, 210);
    if (sc._o && sc._o.onClose) sc._o.onClose();
  };
  ui.act.close = (a, el) => ui.closeModal(el.closest('.scrim'));
  ui.confirm = function (o) {
    return new Promise(res => {
      let done = false; const fin = v => { if (done) return; done = true; ui.closeModal(sc); res(v); };
      const sc = ui.dialog(`<div class="ic ${o.danger ? 'warn' : ''}">${ic(o.icon || (o.danger ? 'warn' : 'info'))}</div><h3>${esc(o.title)}</h3><p>${o.html || esc(o.text || '')}</p><div class="row"><button class="btn l" data-no>${esc(o.cancel || 'Отмена')}</button><button class="btn ${o.danger ? 'r' : o.cls || ''}" data-yes>${esc(o.ok || 'Подтвердить')}</button></div>`, { sticky: true });
      sc.querySelector('[data-no]').onclick = () => { PD.snd.play('tap'); fin(false); }; sc.querySelector('[data-yes]').onclick = () => { PD.snd.play('ok'); fin(true); };
    });
  };
  ui.alert = function (title, text, kind) { return new Promise(res => { const sc = ui.dialog(`<div class="ic ${kind || ''}">${ic(kind === 'ok' ? 'check' : kind === 'warn' ? 'warn' : 'info')}</div><h3>${esc(title)}</h3><p>${text}</p><button class="btn blk" data-ok>Понятно</button>`); sc.querySelector('[data-ok]').onclick = () => { ui.closeModal(sc); res(); }; }); };
  // ввод цены / суммы
  ui.askNumber = function (o) {
    return new Promise(res => {
      const sc = ui.sheet(`<h3 class="h3" style="font-size:19px">${esc(o.title)}</h3>${o.sub ? `<p class="muted small" style="margin:2px 0 12px">${o.sub}</p>` : ''}
      <div class="field"><input class="inp" id="askN" inputmode="numeric" pattern="[0-9]*" value="${o.value || ''}" placeholder="${esc(o.ph || 'Сумма, ₽')}" style="font-size:22px;font-weight:800;height:56px"></div>
      ${o.chips ? `<div class="chips" style="padding:0 0 10px">${o.chips.map(c => `<button class="chip" data-v="${c[1]}">${esc(c[0])}</button>`).join('')}</div>` : ''}
      <div id="askHint" class="small muted" style="min-height:20px;margin-bottom:10px"></div>
      <div class="row"><button class="btn l sp" data-no>Отмена</button><button class="btn sp" data-ok>${esc(o.ok || 'Готово')}</button></div>`, { sticky: true });
      const inp = sc.querySelector('#askN'), hint = sc.querySelector('#askHint');
      const upd = () => { const v = parseInt(inp.value.replace(/\D/g, '')) || 0; inp.value = v ? String(v) : ''; hint.innerHTML = o.hint ? o.hint(v) : (v ? rub(v) : ''); };
      inp.addEventListener('input', upd); upd(); setTimeout(() => inp.focus(), 250);
      sc.querySelectorAll('.chip').forEach(c => c.onclick = () => { PD.snd.play('tap'); inp.value = c.dataset.v; upd(); });
      const close = v => { ui.closeModal(sc); res(v); };
      sc.querySelector('[data-no]').onclick = () => close(null);
      sc.querySelector('[data-ok]').onclick = () => { const v = parseInt(inp.value) || 0; if (o.min && v < o.min) { PD.snd.play('err'); hint.innerHTML = `<span style="color:var(--red)">Минимум ${rub(o.min)}</span>`; return; } close(v); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') sc.querySelector('[data-ok]').click(); });
    });
  };

  /* ---------- уведомления ---------- */
  ui.notify = function (title, text, kind) {
    const t = document.createElement('div'); const k = kind === 'ok' ? 'ok' : kind === 'err' ? 'err' : kind === 'msg' ? 'msg' : 'info';
    t.className = 'toast ' + k;
    t.innerHTML = `<div class="ti">${ic(k === 'ok' ? 'check' : k === 'err' ? 'warn' : k === 'msg' ? 'chat' : 'bell')}</div><div><b>${esc(title)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
    const box = $('#toasts'); box.appendChild(t); while (box.children.length > 3) box.firstChild.remove();
    if (k === 'ok') PD.hap('ok'); else if (k === 'err') PD.hap('err');
    t.addEventListener('click', () => { t.classList.add('out'); setTimeout(() => t.remove(), 250); });
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, kind === 'err' ? 3800 : 3200);
    ui.renderNav && PD.S && ui.renderNav();
  };
  ui.err = (m) => { PD.snd.play('err'); ui.notify('Не получилось', m, 'err'); };
  ui.confetti = function (colors, n) {
    const c = document.createElement('div'); c.className = 'confetti'; colors = colors || ['#0af', '#04e061', '#965eeb', '#ff4053', '#ffb020'];
    let h = ''; for (let i = 0; i < (n || 46); i++) h += `<i style="left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-duration:${1.6 + Math.random() * 1.6}s;animation-delay:${Math.random() * .5}s;transform:rotate(${Math.random() * 360}deg)"></i>`;
    c.innerHTML = h; document.body.appendChild(c); setTimeout(() => c.remove(), 3800);
  };
  ui.syncBadge = function () {
    const N = PD.net, el = document.querySelectorAll('.sync'); const st = N.status;
    el.forEach(e => { e.className = 'sync ' + (st === 'online' ? '' : st === 'sync' ? 'sy' : 'off'); e.innerHTML = `<i></i>${st === 'online' ? 'Сохранено на сервере' : st === 'sync' ? 'Синхронизация…' : 'Офлайн — сохранено на устройстве'}`; });
  };
  ui.onChat = function (lid) { const cur = ui.current(); if (cur && cur.name === 'chat' && (cur.params.id === lid)) { PD.screens.chat.refresh && PD.screens.chat.refresh(); } ui.renderNav(); };
  ui.onTick = function () { const cur = ui.current(); if (!cur) return; if (cur.name === 'chat' || cur.name === 'messages') { cur.name === 'chat' ? PD.screens.chat.refresh && PD.screens.chat.refresh() : ui.rerender(); } ui.renderNav(); };

  /* ---------- тема ---------- */
  ui.applyTheme = function () {
    const t = PD.S.settings.theme; const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const bg = dark ? '#0d0e11' : '#ffffff';
    const tg = G.Telegram && G.Telegram.WebApp; try { if (tg) { tg.setHeaderColor && tg.setHeaderColor(bg); tg.setBackgroundColor && tg.setBackgroundColor(bg); } } catch (e) { }
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = bg;
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => PD.S && ui.applyTheme());

  /* ---------- общие компоненты ---------- */
  ui.header = (title, o) => { o = o || {}; return `<div class="top line">${o.noBack ? '' : `<button class="ib" data-act="back" aria-label="Назад">${ic('back')}</button>`}<h1>${esc(title)}</h1>${o.right || ''}</div>`; };
  ui.balance = () => `<button class="bal" data-act="go" data-arg="history"><i></i>${rub(PD.S.money)}</button>`;
  ui.empty = (icon, title, text, btn) => `<div class="empty"><div class="ei">${ic(icon)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${btn || ''}</div>`;
  ui.copy = async txt => { try { await navigator.clipboard.writeText(txt); ui.notify('Скопировано', txt, 'ok'); } catch (e) { ui.alert('Скопируйте вручную', `<code style="word-break:break-all;user-select:all">${esc(txt)}</code>`); } };

  ui.listingCard = function (l, i) {
    const s = PD.S, m = G.MODEL_BY_ID[l.modelId], fav = s.favs.includes(l.id), far = l.city !== s.city, c = PD.CITY_BY_ID[l.city], dl = (v => Math.abs(v) >= 6 ? v : 0)(Math.round((l.ask / l.fair - 1) * 100));
    return `<div class="lc" style="animation-delay:${Math.min(i || 0, 12) * 25}ms" data-act="listing" data-arg="${l.id}" role="button" tabindex="0">
      <div class="ph">${img(l.modelId, l.colorIdx, 'back', l.cond)}
        <button class="fav ${fav ? 'on' : ''}" data-act="fav" data-arg="${l.id}" data-snd="none" aria-label="В избранное">${ic('heart')}</button>
        ${l.bargain ? '<span class="tag deal">Выгодно</span>' : far ? `<span class="tag far">${esc(c.name)}</span>` : ''}</div>
      <div class="pr">${rub(l.ask)}${dl ? `<span class="dl ${dl < 0 ? 'dn' : 'up'}">${dl < 0 ? '↓' : '↑'}${Math.abs(dl)}%</span>` : ''}</div><div class="nm">${esc(m.n)}, ${esc(eco().storageLabel(m, l.stIdx))}</div>
      <div class="mt2s">${condTag(l.cond)} · ${l.bat}%</div><div class="mt2s loc">${esc(c.name)} · ${U.ago(l.posted)}</div></div>`;
  };
  const eco = () => PD.eco;
  ui.rowListing = (l) => { const m = G.MODEL_BY_ID[l.modelId]; return `<button class="hl" data-act="listing" data-arg="${l.id}"><div class="th">${img(l.modelId, l.colorIdx, 'back', l.cond)}</div><div class="tt"><b>${esc(m.n)}</b><span class="b">${rub(l.ask)}</span><div class="small muted">${PD.CONDITIONS[l.cond].name} · ${esc(PD.CITY_BY_ID[l.city].name)}</div></div></button>`; };

  /* ---------- тики ---------- */
  ui.startTicks = function () {
    setInterval(() => { try { PD.eco.tick(); } catch (e) { console.error(e); } }, 4000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { try { PD.eco.tick(); } catch (e) { } } });
  };
})(window);
