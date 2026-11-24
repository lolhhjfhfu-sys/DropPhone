/* PHONE DROP 2.0.0 — профиль, история сделок, рейтинг, настройки, резервные копии */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u, esc = U.esc, rub = U.rub, ui = PD.ui, ic = PD.ic, img = PD.img, eco = PD.eco, SC = PD.screens, A = ui.act;
  const $ = s => document.querySelector(s);
  const S = () => PD.S;
  const rowIc = (n, bg) => `<span class="th" style="width:40px;height:40px;border-radius:12px;background:${bg};color:#fff">${ic(n, 'width="22" height="22" style="stroke:#fff;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round"')}</span>`;
  const menu = (act, arg, icon, bg, title, sub, right) => `<button class="hl" data-act="${act}" data-arg="${arg}">${rowIc(icon, bg)}<div class="tt"><b>${title}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${right || ic('chevr', 'width="20" height="20" style="stroke:var(--tx3);fill:none;stroke-width:2"')}</button>`;

  function tgUser() { const t = G.Telegram && G.Telegram.WebApp; const u = t && t.initDataUnsafe && t.initDataUnsafe.user; return u ? (u.first_name + (u.last_name ? ' ' + u.last_name : '')) : 'Игрок'; }

  /* ---------- ПРОФИЛЬ ---------- */
  SC.profile = {
    render() {
      const s = S(), lv = eco.level(), st = s.stats, nw = eco.netWorth(), name = tgUser();
      const active = s.myListings.filter(l => l.status === 'active').length;
      return `<div class="top"><h1>Профиль</h1>${ui.balance()}<button class="ib" data-act="go" data-arg="settings" aria-label="Настройки">${ic('gear')}</button></div>
      <div class="card" style="margin-top:6px"><div class="row"><div style="width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pur));display:grid;place-items:center;color:#fff;font-size:26px;font-weight:800">${esc(name[0].toUpperCase())}</div><div class="sp"><div class="b" style="font-size:19px">${esc(name)}</div><div class="small muted">Уровень ${lv.lvl} · ${lv.title}</div><div class="bar" style="margin-top:7px"><i style="width:${Math.min(100, lv.cur / lv.need * 100)}%"></i></div><div class="xs muted" style="margin-top:3px">${lv.cur} / ${lv.need} опыта</div></div></div>
        <div class="row mt" style="gap:8px"><div class="sp" style="background:var(--bg2);border-radius:12px;padding:10px"><div class="xs muted">Состояние</div><div class="b">${rub(nw)}</div></div><div class="sp" style="background:var(--bg2);border-radius:12px;padding:10px"><div class="xs muted">Сделок</div><div class="b">${st.deals}</div></div><div class="sp" style="background:var(--bg2);border-radius:12px;padding:10px"><div class="xs muted">Лучшая прибыль</div><div class="b">${rub(st.bestProfit)}</div></div></div></div>
      ${menu('go', 'collection', 'phone', 'linear-gradient(135deg,#0af,#0070e0)', 'Моя коллекция', `${s.phones.length} телефонов`)}
      ${menu('tab', 'sell', 'tag', 'linear-gradient(135deg,#04e061,#00a84a)', 'Мои объявления', active ? `${active} активных` : 'Продать телефон')}
      ${menu('go', 'viewed', 'eye', 'linear-gradient(135deg,#8a94a6,#5c6678)', 'История просмотров', `${s.views.length} объявлений`)}
      ${menu('go', 'history', 'wallet', 'linear-gradient(135deg,#ffb020,#ff8a00)', 'История сделок', `${s.tx.length} операций`)}
      ${menu('go', 'ranking', 'trophy', 'linear-gradient(135deg,#965eeb,#5a3bd6)', 'Рейтинг телефонов', 'Топ производительности TYNTYTY')}
      ${menu('go', 'cases', 'box', 'linear-gradient(135deg,#ff3d5a,#ff8a3d)', 'Кейсы', `Открыто: ${s.casesOpened}`)}
      ${menu('go', 'trips', 'plane', 'linear-gradient(135deg,#0aa5e0,#5a3bd6)', 'Путешествия', `Поездок: ${st.trips} · сейчас: ${esc(PD.CITY_BY_ID[s.city].name)}`)}
      ${menu('go', 'promo', 'gift', 'linear-gradient(135deg,#04e061,#009f45)', 'Промокоды', `Активировано: ${s.promos.length}`)}
      ${menu('go', 'settings', 'gear', 'linear-gradient(135deg,#6b7686,#434b59)', 'Настройки', 'Тема, звук, сохранения')}
      <div class="pad mt2 center" style="text-align:center"><span class="sync"></span><div class="xs muted" style="margin-top:6px">Phone Drop ${PD.APP_VERSION}</div></div>`;
    },
    mount() { ui.syncBadge(); }
  };

  /* ---------- ИСТОРИЯ СДЕЛОК ---------- */
  let hf = 'all';
  const TXI = { buy: ['phone', '#0af'], sell: ['tag', '#04e061'], trade: ['swap', '#965eeb'], trip: ['plane', '#0aa5e0'], case: ['box', '#ff3d5a'], drop: ['gift', '#ffb020'], promo: ['gift', '#04e061'], bonus: ['gift', '#04e061'], list: ['tag', '#8a94a6'] };
  SC.history = {
    render() {
      const s = S(); const f = { all: () => true, buy: t => t.type === 'buy' || t.type === 'trade', sell: t => t.type === 'sell', other: t => !['buy', 'sell', 'trade'].includes(t.type) }[hf];
      const a = s.tx.filter(f); const inc = s.tx.filter(t => t.amount > 0).reduce((x, t) => x + t.amount, 0), out = s.tx.filter(t => t.amount < 0).reduce((x, t) => x + t.amount, 0);
      return ui.header('История сделок', { right: ui.balance() }) + `<div class="pad"><div class="row" style="margin:4px 0 12px"><div class="card sp" style="margin:0;padding:12px"><div class="xs muted">Доходы</div><div class="b" style="color:var(--grnD);font-size:17px">+${rub(inc)}</div></div><div class="card sp" style="margin:0;padding:12px"><div class="xs muted">Расходы</div><div class="b" style="color:var(--red);font-size:17px">${rub(out)}</div></div></div>
      <div class="seg" style="margin-bottom:6px">${[['all', 'Все'], ['buy', 'Покупки'], ['sell', 'Продажи'], ['other', 'Прочее']].map(x => `<button class="${hf === x[0] ? 'on' : ''}" data-act="hf" data-arg="${x[0]}">${x[1]}</button>`).join('')}</div></div>` +
        (a.length ? a.slice(0, 120).map(t => { const [i, c] = TXI[t.type] || ['wallet', '#888']; return `<div class="hl" style="cursor:default"><span class="th" style="width:42px;height:42px;border-radius:50%;background:${c}22;color:${c}">${ic(i, 'width="21" height="21" style="stroke:currentColor;fill:none;stroke-width:2"')}</span><div class="tt"><b style="white-space:normal;font-size:14.5px">${esc(t.title)}</b><div class="xs muted">${U.dateStr(t.ts)}${t.profit != null ? ` · ${t.profit >= 0 ? 'прибыль' : 'убыток'} ${rub(Math.abs(t.profit))}` : ''}</div></div><div style="text-align:right"><b style="color:${t.amount > 0 ? 'var(--grnD)' : t.amount < 0 ? 'var(--tx)' : 'var(--tx3)'}">${t.amount > 0 ? '+' : ''}${t.amount ? rub(t.amount) : '—'}</b><div class="xs muted">${rub(t.bal)}</div></div></div>`; }).join('') : ui.empty('wallet', 'Операций пока нет', 'Здесь появятся ваши покупки, продажи и поездки'));
    }
  };
  A.hf = k => { hf = k; ui.rerender(); };

  /* ---------- РЕЙТИНГ ТЕЛЕФОНОВ ---------- */
  let rb = 'all';
  SC.ranking = {
    render() {
      const mine = new Set(S().phones.map(p => p.modelId)); let ms = G.MODELS.slice().sort((a, b) => b.total - a.total); const max = ms[0].total; const rank = {}; ms.forEach((m, i) => rank[m.id] = i + 1);
      if (rb !== 'all') ms = ms.filter(m => m.br === rb);
      return ui.header('Рейтинг производительности') + `<p class="muted small pad" style="margin:2px 0 8px">Рейтинг по баллам TYNTYTY Benchmark 11 (CPU + GPU + RAM + UX). Ваши модели выделены.</p><div class="chips">${['all'].concat(G.BRANDS).map(b => `<button class="chip ${rb === b ? 'on' : ''}" data-act="rb" data-arg="${b}">${b === 'all' ? 'Все' : b}</button>`).join('')}</div>` +
        ms.map(m => `<button class="hl" data-act="modelInfo" data-arg="${m.id}" style="${mine.has(m.id) ? 'background:var(--priBg)' : ''}"><div style="width:30px;font-weight:800;color:${rank[m.id] <= 3 ? 'var(--ora)' : 'var(--tx3)'};font-size:17px">${rank[m.id]}</div><div class="th" style="width:44px;height:52px">${img(m.id, 0, 'back')}</div><div class="tt"><b>${esc(m.n)}</b><div class="bar" style="margin:5px 0 2px;height:6px"><i style="width:${m.total / max * 100}%"></i></div><span class="xs muted">${esc(m.chip)}</span></div><b>${(m.total * 100).toLocaleString('ru-RU')}</b></button>`).join('');
    }
  };
  A.rb = k => { rb = k; ui.rerender(); };

  /* ---------- НАСТРОЙКИ ---------- */
  const sw = (on, act, arg) => `<button class="sw ${on ? 'on' : ''}" data-act="${act}" data-arg="${arg || ''}" role="switch" aria-checked="${on}"></button>`;
  SC.settings = {
    render() {
      const s = S(), st = s.settings, N = PD.net;
      return ui.header('Настройки') + `<div class="h3 pad" style="margin-top:8px">Оформление</div><div class="pad"><div class="seg">${[['auto', 'Авто'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(x => `<button class="${st.theme === x[0] ? 'on' : ''}" data-act="theme" data-arg="${x[0]}">${x[1]}</button>`).join('')}</div></div>
      <div class="h3 pad" style="margin-top:18px">Звук и отклик</div>
      <div class="hl" style="cursor:default"><div class="tt"><b>Звуки</b><div class="small muted">Нажатия, покупки, кейсы</div></div>${sw(st.sound, 'tgl', 'sound')}</div>
      <div class="pad" style="margin:4px 0 8px"><div class="small muted" style="margin-bottom:6px">Громкость: <b id="volV">${st.vol}%</b></div><input type="range" min="0" max="100" value="${st.vol}" data-in="vol"></div>
      <div class="hl" style="cursor:default"><div class="tt"><b>Вибрация</b><div class="small muted">Тактильный отклик</div></div>${sw(st.haptic, 'tgl', 'haptic')}</div>
      <div class="h3 pad" style="margin-top:18px">Сохранение</div>
      <div class="card"><div class="row"><span class="sync"></span><span class="sp"></span><button class="btn s sm" data-act="syncNow">Синхронизировать</button></div>
        <div class="kv" style="margin-top:8px"><span>Хранение</span><span>База данных на сервере + IndexedDB</span></div><div class="kv"><span>Ревизия сервера</span><span>#${N.rev}</span></div><div class="kv"><span>Последняя синхр.</span><span>${N.lastSync ? U.ago(N.lastSync) : '—'}</span></div><div class="kv"><span>Аккаунт</span><span>${(G.Telegram && G.Telegram.WebApp && G.Telegram.WebApp.initData) ? 'Telegram' : 'Устройство'}</span></div></div>
      <button class="hl" data-act="backups"><span class="th" style="width:40px;height:40px;border-radius:12px;background:var(--priBg);color:var(--pri)">${ic('shield', 'width="22" height="22" style="stroke:currentColor;fill:none;stroke-width:1.9"')}</span><div class="tt"><b>Резервные копии</b><div class="small muted">Восстановить прогресс на сервере</div></div>${ic('chevr', 'width="20" height="20" style="stroke:var(--tx3);fill:none;stroke-width:2"')}</button>
      <button class="hl" data-act="exportData"><span class="th" style="width:40px;height:40px;border-radius:12px;background:var(--priBg);color:var(--pri)">${ic('copy', 'width="22" height="22" style="stroke:currentColor;fill:none;stroke-width:1.9"')}</span><div class="tt"><b>Экспорт / импорт</b><div class="small muted">Файл-копия прогресса (JSON)</div></div>${ic('chevr', 'width="20" height="20" style="stroke:var(--tx3);fill:none;stroke-width:2"')}</button>
      <div class="h3 pad" style="margin-top:18px">Опасная зона</div><div class="pad"><button class="btn r blk" data-act="resetAll">Сбросить весь прогресс</button></div>
      <div class="pad mt2 muted small" style="text-align:center">Phone Drop ${PD.APP_VERSION} · схема данных ${s.schema}</div>`;
    },
    mount() { ui.syncBadge(); }
  };
  A.theme = t => { S().settings.theme = t; PD.save(); ui.applyTheme(); ui.rerender(); };
  A.tgl = k => { const st = S().settings; st[k] = !st[k]; if (k === 'sound') PD.snd.on = st.sound; PD.save(); if (st[k]) PD.snd.play('ok'); ui.rerender(); };
  ui.inp.vol = (v, el) => { const st = S().settings; st.vol = +v; PD.snd.vol = st.vol / 100; const e = $('#volV'); if (e) e.textContent = v + '%'; clearTimeout(ui.inp._vt); ui.inp._vt = setTimeout(() => { PD.snd.play('ok'); PD.save(); }, 250); };
  A.syncNow = async () => { PD.store.dirty = true; await PD.store.sync(true); ui.syncBadge(); ui.rerender(); PD.net.online ? ui.notify('Синхронизировано', 'Прогресс сохранён на сервере', 'ok') : ui.err('Нет связи с сервером. Данные сохранены на устройстве.'); };
  A.backups = async () => {
    const sc = ui.sheet(`<h3 class="h3" style="font-size:20px">Резервные копии</h3><div id="bk" class="muted small" style="padding:10px 0">Загрузка…</div>`);
    try {
      const list = await PD.store.listBackups(); const box = sc.querySelector('#bk');
      box.innerHTML = list.length ? `<p class="muted small" style="margin:0 0 8px">Сервер автоматически сохраняет снимки прогресса. Текущее состояние перед восстановлением тоже копируется.</p>` + list.map(b => `<div class="hl" style="padding:10px 0"><div class="tt"><b>${U.dateStr(b.created_at)}</b><div class="xs muted">ревизия #${b.rev} · ${({ auto: 'автокопия', 'conflict-server': 'конфликт (сервер)', 'conflict-client': 'конфликт (устройство)', 'before-restore': 'перед восстановлением' }[b.reason] || b.reason)} · ${(b.size / 1024).toFixed(1)} КБ</div></div><button class="btn s sm" data-id="${b.id}">Восстановить</button></div>`).join('') : 'Копий пока нет — они появятся после нескольких сохранений.';
      box.querySelectorAll('[data-id]').forEach(b => b.onclick = async () => { if (!await ui.confirm({ title: 'Восстановить копию?', text: 'Текущий прогресс будет заменён выбранной копией (с резервом текущего).', ok: 'Восстановить', danger: true })) return; try { const ok = await PD.store.restoreBackup(+b.dataset.id); ui.closeModal(sc); if (ok) { ui.applyTheme(); ui.notify('Прогресс восстановлен', '', 'ok'); ui.setTab('profile'); } } catch (e) { ui.err('Не удалось восстановить'); } });
    } catch (e) { sc.querySelector('#bk').innerHTML = 'Нет связи с сервером. Копии доступны только онлайн.'; }
  };
  A.exportData = () => {
    const sc = ui.sheet(`<h3 class="h3" style="font-size:20px">Экспорт / импорт</h3><p class="muted small" style="margin:2px 0 10px">Скопируйте содержимое, чтобы сохранить прогресс отдельно, или вставьте ранее сохранённую копию.</p><textarea class="inp" id="exp" style="height:120px;font-size:12px"></textarea><div class="row mt"><button class="btn s sp" data-cp>Скопировать</button><button class="btn sp" data-imp>Импортировать</button></div>`);
    const ta = sc.querySelector('#exp'); ta.value = PD.store.exportJSON();
    sc.querySelector('[data-cp]').onclick = () => ui.copy(ta.value);
    sc.querySelector('[data-imp]').onclick = async () => { if (!await ui.confirm({ title: 'Импортировать прогресс?', text: 'Текущий прогресс заменится данными из поля. Его копия сохранится на устройстве.', ok: 'Импортировать', danger: true })) return; try { await PD.store.importJSON(ta.value); ui.closeModal(sc); ui.applyTheme(); ui.notify('Импорт выполнен', '', 'ok'); ui.setTab('profile'); } catch (e) { ui.err('Неверный формат данных'); } };
  };
  A.resetAll = async () => {
    if (!await ui.confirm({ title: 'Сбросить прогресс?', text: 'Баланс, телефоны, история — всё вернётся к началу.', ok: 'Продолжить', danger: true })) return;
    if (!await ui.confirm({ title: 'Точно сбросить?', text: 'Копия сохранится на сервере, но игра начнётся с 10 000 ₽.', ok: 'Да, сбросить', danger: true })) return;
    const old = PD.S; const n = PD.defaultState(); n.settings = old.settings; n.syncRev = old.syncRev; n.promos = old.promos; PD.S = n; PD.store.dirty = true; await PD.store.persistLocal(); await PD.store.sync(true); ui.notify('Прогресс сброшен', 'Начните заново: у вас 10 000 ₽', 'info'); ui.setTab('home');
  };
})(window);
