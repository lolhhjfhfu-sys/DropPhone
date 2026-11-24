/* PHONE DROP 2.0.0 — экраны игры: коллекция, телефон, кейсы, поездки, промокоды */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u, esc = U.esc, rub = U.rub, ui = PD.ui, ic = PD.ic, img = PD.img, eco = PD.eco, SC = PD.screens, A = ui.act;
  const $ = s => document.querySelector(s);
  const S = () => PD.S;
  const sIc = (n, w) => ic(n, `width="${w || 20}" height="${w || 20}" style="stroke:currentColor;fill:none;stroke-width:2"`);

  /* ---------- КОЛЛЕКЦИЯ ---------- */
  const SORT = { new: ['Новые', (a, b) => b.boughtAt - a.boughtAt], val: ['Дороже', (a, b) => eco.fair(b) - eco.fair(a)], rate: ['Рейтинг', (a, b) => eco.rating(b).score - eco.rating(a).score], name: ['Название', (a, b) => G.MODEL_BY_ID[a.modelId].n.localeCompare(G.MODEL_BY_ID[b.modelId].n)], cond: ['Состояние', (a, b) => PD.COND_ORDER.indexOf(a.cond) - PD.COND_ORDER.indexOf(b.cond)] };
  let colSort = 'new', colTab = 'mine';
  SC.collection = {
    render() {
      const s = S(), owned = new Set(s.phones.map(p => p.modelId)); const worth = s.phones.reduce((a, p) => a + eco.fair(p), 0);
      let body;
      if (colTab === 'mine') {
        const a = s.phones.slice().sort(SORT[colSort][1]);
        body = a.length ? `<div class="chips">${Object.keys(SORT).map(k => `<button class="chip ${colSort === k ? 'on' : ''}" data-act="colSort" data-arg="${k}">${SORT[k][0]}</button>`).join('')}</div><div class="grid">${a.map((p, i) => phoneCard(p, i)).join('')}</div>` : ui.empty('phone', 'Коллекция пуста', 'Купите первый телефон на Avito — у вас есть ' + rub(s.money), '<button class="btn" data-act="tab" data-arg="home">К объявлениям</button>');
      } else {
        const ms = G.MODELS.slice().sort((a, b) => a.br.localeCompare(b.br) || a.price - b.price);
        body = `<div class="grid" style="margin-top:6px">${ms.map((m, i) => `<button class="lc" data-act="modelInfo" data-arg="${m.id}" style="animation-delay:${Math.min(i, 12) * 20}ms"><div class="ph" style="${owned.has(m.id) ? '' : 'opacity:.55'}">${img(m.id, 0, 'back')}${owned.has(m.id) ? '<span class="tag deal">В коллекции</span>' : ''}</div><div class="nm" style="margin-top:6px;font-weight:600">${esc(m.n)}</div><div class="mt2s">${esc(m.br)} · от ${rub(Math.round(m.price * .52 / 100) * 100)}</div></button>`).join('')}</div>`;
      }
      return ui.header('Коллекция', { right: ui.balance() }) + `<div class="pad"><div class="card" style="margin:6px 0 10px;display:flex;gap:14px"><div class="sp"><div class="small muted">Телефонов</div><div class="b" style="font-size:22px">${s.phones.length}</div></div><div class="sp"><div class="small muted">Стоимость</div><div class="b" style="font-size:22px">${rub(worth)}</div></div><div class="sp"><div class="small muted">Каталог</div><div class="b" style="font-size:22px">${owned.size}/${G.MODELS.length}</div></div></div>
        <div class="seg" style="margin-bottom:8px"><button class="${colTab === 'mine' ? 'on' : ''}" data-act="colTab" data-arg="mine">Мои телефоны</button><button class="${colTab === 'cat' ? 'on' : ''}" data-act="colTab" data-arg="cat">Каталог моделей</button></div></div>` + body;
    }
  };
  function phoneCard(p, i) {
    const m = G.MODEL_BY_ID[p.modelId], r = eco.rating(p), rar = p.rarity && PD.RARITY[p.rarity];
    return `<button class="lc" data-act="phone" data-arg="${p.uid}" style="animation-delay:${Math.min(i, 12) * 25}ms"><div class="ph" style="${rar && p.rarity !== 'common' ? `box-shadow:inset 0 0 0 2.5px ${rar.color}` : ''}">${img(p.modelId, p.colorIdx, 'back', p.cond)}${p.listing ? '<span class="tag" style="background:var(--pri)">В продаже</span>' : p.os.launched ? '<span class="tag deal">Включён</span>' : ''}</div><div class="pr" style="font-size:15px">${esc(m.n)}</div><div class="mt2s">${PD.condTag(p.cond)} ${r.stars.toFixed(1)}★</div><div class="mt2s">≈ ${rub(eco.fair(p))}</div></button>`;
  }
  A.colSort = k => { colSort = k; ui.rerender(); }; A.colTab = k => { colTab = k; ui.rerender(); };
  A.phone = uid => ui.go('phone', { uid });
  A.modelInfo = id => {
    const m = G.MODEL_BY_ID[id], ref = eco.benchRef(m), rank = G.MODELS.slice().sort((a, b) => b.total - a.total).findIndex(x => x.id === id) + 1;
    const sc = ui.sheet(`<div style="text-align:center;background:var(--bg2);border-radius:18px;padding:10px">${img(id, 0, 'back').replace('<img', '<img style="height:200px;margin:auto"')}</div>
      <h3 class="h3" style="font-size:21px;margin-top:12px">${esc(m.n)}</h3><div class="muted small" style="margin-bottom:8px">${m.yr} г. · ${esc(m.br)}</div>
      ${specRows(m)}<div class="kv"><span>Рейтинг Benchmark</span><span>№${rank} из ${G.MODELS.length} · ${ref.total.toLocaleString('ru-RU')}</span></div>
      <div class="kv"><span>Цвета</span><span>${m.colors.map(c => `<i style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${c.c1};border:1px solid var(--line);margin-left:4px;vertical-align:-3px"></i>`).join('')}</span></div>
      <div class="kv"><span>Цена на рынке (отл.)</span><span>${rub(m.price)}</span></div>
      <button class="btn blk mt" data-act="findModel" data-arg="${id}">Найти в объявлениях</button>`);
    sc.querySelector('[data-act=findModel]').onclick = () => { ui.closeModal(sc); const f = S().filters; Object.assign(f, { cat: 'all', city: 'all', conds: [], min: 0, max: 0, tier: 0, q: m.n }); PD.save(); ui.setTab('home'); };
  };
  function specRows(m) {
    return `<div class="kv"><span>Процессор</span><span>${esc(m.chip)}</span></div><div class="kv"><span>Память</span><span>${m.st.map(v => v >= 1024 ? v / 1024 + ' ТБ' : v + ' ГБ').join(' / ')} · ОЗУ ${m.ram} ГБ</span></div><div class="kv"><span>Экран</span><span>${esc(m.scr)}</span></div><div class="kv"><span>Камера</span><span>${esc(m.cam)}</span></div><div class="kv"><span>Аккумулятор</span><span>${m.bat} мА·ч</span></div><div class="kv"><span>Размеры</span><span>${m.h} × ${m.w} мм</span></div>`;
  }
  PD.specRows = specRows;

  /* ---------- ТЕЛЕФОН (деталь) ---------- */
  let flip = false;
  SC.phone = {
    render(p) {
      const ph = eco.byUid(p.uid); if (!ph) return ui.header('Телефон') + ui.empty('phone', 'Телефон не найден', '');
      const m = G.MODEL_BY_ID[ph.modelId], r = eco.rating(ph), val = eco.fair(ph), col = m.colors[ph.colorIdx], rar = ph.rarity && PD.RARITY[ph.rarity];
      const prof = ph.paid ? val - ph.paid : null;
      return ui.header(m.n) + `<div id="stage" data-act="flipPhone" style="margin:0 12px;border-radius:22px;background:radial-gradient(circle at 50% 30%,var(--ph),var(--bg2));padding:18px 0 10px;text-align:center;position:relative;overflow:hidden;min-height:340px">
          ${rar ? `<span class="pill" style="position:absolute;left:12px;top:12px;background:${rar.color};color:#fff">${rar.name}</span>` : ''}
          <img id="bigPh" src="${PD.art.uri(ph.modelId, ph.colorIdx, flip ? 'front' : 'back', ph.cond)}" style="height:310px;margin:0 auto;filter:drop-shadow(0 18px 20px rgba(0,0,0,.3));transition:transform .4s" alt=""><div class="xs muted" style="margin-top:6px">Нажмите, чтобы повернуть · ${esc(col.name)}</div></div>
        <div class="pad mt"><div class="row"><div class="sp"><div class="small muted">Рейтинг телефона</div><div class="row" style="gap:8px">${PD.stars(r.stars)}<b>${r.score}/100</b></div></div><div style="text-align:right"><div class="small muted">Рыночная цена</div><div class="b" style="font-size:22px">${rub(val)}</div></div></div>
        ${prof != null ? `<div class="small mt" style="color:${prof >= 0 ? 'var(--grnD)' : 'var(--red)'}">${prof >= 0 ? '▲ Выросла' : '▼ Упала'} на ${rub(Math.abs(prof))} относительно покупки (${rub(ph.paid)})</div>` : ''}
        <div class="row mt">${ph.listing ? `<button class="btn s sp" data-act="go" data-arg="sell">Объявление активно</button>` : `<button class="btn sp" data-act="powerOn" data-arg="${ph.uid}">${ic('power', 'width="20" height="20" style="stroke:#fff;fill:none;stroke-width:2.2"')} ${ph.os.launched ? 'Открыть телефон' : 'Включить'}</button><button class="btn l" data-act="sellFrom" data-arg="${ph.uid}">Продать</button>`}</div></div>
        <div class="card" style="margin-top:16px"><h3 class="h3">О телефоне</h3><div class="kv"><span>Состояние</span><span>${PD.condTag(ph.cond)}</span></div><div class="kv"><span>Аккумулятор</span><span>${ph.bat}%</span></div><div class="kv"><span>Накопитель</span><span>${eco.storageLabel(m, ph.stIdx)}</span></div><div class="kv"><span>Получен</span><span>${esc(ph.src)}</span></div><div class="kv"><span>Дата</span><span>${U.dateStr(ph.boughtAt)}</span></div>${specRows(m)}</div>
        ${ph.os.bench && ph.os.bench.length ? '' : ''}<div style="height:12px"></div>`;
    }
  };
  A.flipPhone = () => { flip = !flip; const b = $('#bigPh'); if (!b) return; const uid = ui.current().params.uid, ph = eco.byUid(uid); b.style.transform = 'rotateY(90deg) scale(.96)'; setTimeout(() => { b.src = PD.art.uri(ph.modelId, ph.colorIdx, flip ? 'front' : 'back', ph.cond); b.style.transform = ''; }, 190); };
  A.sellFrom = uid => { ui.setTab('sell'); setTimeout(() => A.sellPick(uid), 120); };
  A.powerOn = uid => PD.os.launch(uid, {});

  /* ---------- КЕЙСЫ ---------- */
  const CASE_ICON = (c) => `<svg class="cv" viewBox="0 0 120 110"><defs><linearGradient id="cg${c.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient></defs><path d="M60 8L108 32v48L60 104 12 80V32z" fill="rgba(255,255,255,.18)" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 32l48 24 48-24M60 56v48" stroke="#fff" stroke-width="2.5" fill="none" stroke-opacity=".9"/><rect x="46" y="44" width="28" height="18" rx="4" fill="url(#cg${c.id})"/><circle cx="60" cy="53" r="3" fill="${c.accent}"/></svg>`;
  SC.cases = {
    render() {
      const s = S();
      return ui.header('Кейсы', { right: ui.balance() }) + `<p class="muted small pad" style="margin:2px 0 14px">В каждом кейсе — телефон. Шансы выпадения показаны честно и совпадают с реальными.</p>` +
        PD.CASES.map(c => `<button class="case" data-act="caseView" data-arg="${c.id}" style="background:linear-gradient(135deg,${c.accent},${darkenC(c.accent)})">${CASE_ICON(c)}<h3>${c.name}</h3><p>${esc(c.desc)}</p><span class="pr">${rub(c.price)}${(s.casesInv[c.id] || 0) ? ` · в инвентаре ${s.casesInv[c.id]}` : ''}</span></button>`).join('') +
        `<div class="h2">История открытий</div>` + (s.caseHistory.length ? s.caseHistory.slice(0, 8).map(h => { const m = G.MODEL_BY_ID[h.modelId], r = PD.RARITY[h.rarity]; return `<div class="hl" style="cursor:default"><div class="th" style="width:52px;height:60px;border-bottom:3px solid ${r.color}">${img(h.modelId, 0, 'back', h.cond)}</div><div class="tt"><b>${esc(m.n)}</b><div class="small"><span style="color:${r.color};font-weight:700">${r.name}</span> · ${PD.CONDITIONS[h.cond].name}</div></div><span class="xs muted">${U.ago(h.ts)}</span></div>`; }).join('') : '<p class="muted pad">Вы ещё не открывали кейсы</p>');
    }
  };
  const darkenC = c => PD.color.darken(c, .42);
  A.caseView = id => ui.go('caseView', { id });
  SC.caseView = {
    render(p) {
      const c = PD.CASE_BY_ID[p.id], s = S(), tab = eco.caseTable(p.id), inv = s.casesInv[p.id] || 0;
      return ui.header(c.name, { right: ui.balance() }) + `<div style="margin:0 12px 14px;border-radius:20px;padding:18px;color:#fff;background:linear-gradient(135deg,${c.accent},${darkenC(c.accent)});position:relative;overflow:hidden;min-height:120px">${CASE_ICON(c)}<div style="position:relative;max-width:60%"><b style="font-size:20px">${c.name}</b><div class="small" style="opacity:.9;margin-top:4px">${esc(c.desc)}</div></div></div>
        <div class="pad"><div class="row"><button class="btn sp" style="background:${c.accent}" data-act="openCase" data-arg="${p.id}|0">Открыть · ${rub(c.price)}</button></div>
        <div class="row mt"><button class="btn l sp" data-act="openCase" data-arg="${p.id}|1" ${inv ? '' : 'disabled'}>Из инвентаря · ${inv}</button><button class="btn l sp" data-act="buyCase" data-arg="${p.id}">В инвентарь +1</button></div></div>
        <div class="h2">Шансы выпадения</div>
        <div class="card">${tab.map(t => { const r = PD.RARITY[t.r]; return `<div style="margin-bottom:14px"><div class="row"><span class="rar" style="color:${r.color}"><i style="background:${r.color}"></i>${r.name}</span><span class="sp"></span><b>${t.pct.toFixed(t.pct < 1 ? 2 : t.pct < 10 ? 1 : 0)}%</b></div><div class="bar" style="margin:6px 0 8px"><i style="width:${Math.max(1.5, t.pct)}%;background:${r.color}"></i></div><div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px">${t.models.map(id => `<div style="flex:none;width:64px;text-align:center"><div style="height:68px;background:var(--bg2);border-radius:10px;display:grid;place-items:center">${img(id, 0, 'back').replace('<img', '<img style="height:58px"')}</div><div class="xs" style="margin-top:3px;line-height:1.15">${esc(G.MODEL_BY_ID[id].n.replace('Samsung ', ''))}</div><div class="xs muted">${t.each.toFixed(t.each < 1 ? 3 : 2)}%</div></div>`).join('')}</div></div>`; }).join('')}</div>
        <div class="h2" style="margin-top:6px">Состояние телефона</div><div class="card">${PD.COND_ORDER.map(k => `<div class="kv"><span>${PD.CONDITIONS[k].name}</span><span>${c.cond[k]}%</span></div>`).join('')}<div class="small muted" style="margin-top:8px">Внутри одной редкости все модели равновероятны. Розыгрыш использует криптографический генератор случайных чисел.</div></div>`;
    }
  };
  A.buyCase = async id => { const c = PD.CASE_BY_ID[id]; const ok = await ui.confirm({ title: 'Купить кейс?', html: `${c.name} за <b>${rub(c.price)}</b><br><span class="muted">Баланс после: ${rub(S().money - c.price)}</span>`, ok: 'Купить', icon: 'box' }); if (!ok) return; const r = eco.buyCase(id, 1); if (!r.ok) return ui.err(r.err); PD.snd.play('buy'); ui.rerender(); };
  A.openCase = async arg => {
    const [id, inv] = arg.split('|'); const c = PD.CASE_BY_ID[id], s = S(), fromInv = inv === '1';
    if (!fromInv) { if (s.money < c.price) return ui.err('Не хватает ' + rub(c.price - s.money)); const ok = await ui.confirm({ title: 'Открыть кейс?', html: `${c.name}<br>Стоимость: <b>${rub(c.price)}</b><br><span class="muted">Баланс после: ${rub(s.money - c.price)}</span>`, ok: 'Открыть', icon: 'box' }); if (!ok) return; }
    const r = eco.openCase(id, fromInv); if (!r.ok) return ui.err(r.err);
    runReel(c, r, fromInv);
  };
  // анимация открытия: лента рулетки + раскрытие
  function runReel(c, r, fromInv) {
    const ph = r.phone, m = G.MODEL_BY_ID[ph.modelId], rar = PD.RARITY[r.res.rarity];
    const total = c.drops.reduce((a, d) => a + d.w, 0), W = 44, WIN = 36;
    const rnd = () => { let x = Math.random() * total; for (const d of c.drops) { x -= d.w; if (x < 0) return { r: d.r, id: d.m[Math.floor(Math.random() * d.m.length)] }; } return { r: 'common', id: c.drops[0].m[0] }; };
    const items = []; for (let i = 0; i < W; i++) items.push(i === WIN ? { r: r.res.rarity, id: ph.modelId } : rnd());
    const ov = document.createElement('div'); ov.className = 'trip'; ov.style.cssText = `background:radial-gradient(circle at 50% 30%,${c.accent}55,#07080c 70%),#07080c;gap:20px;z-index:130`;
    ov.innerHTML = `<div style="font-weight:800;font-size:20px" id="rTitle">${c.name}</div><div class="reel-wrap" style="width:calc(100% - 24px);max-width:496px;background:#10121a"><div class="reel-ptr"></div><div class="reel" id="reel">${items.map(it => `<div class="ri" style="--c:${PD.RARITY[it.r].color}">${img(it.id, 0, 'back').replace('<img', '<img style="height:84px"')}<small style="color:${PD.RARITY[it.r].color}">${esc(G.MODEL_BY_ID[it.id].n)}</small></div>`).join('')}</div></div><div class="small" style="opacity:.7" id="rSub">Открываем…</div>`;
    document.body.appendChild(ov);
    const reel = ov.querySelector('#reel'), wrap = ov.querySelector('.reel-wrap');
    requestAnimationFrame(() => {
      const itemW = 112 + 8, wrapW = wrap.clientWidth, jitter = (Math.random() - .5) * 70;
      const target = WIN * itemW + 56 - wrapW / 2 + jitter, dur = 5600; let last = -1, t0 = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 4);
      (function step(now) {
        const t = Math.min(1, (now - t0) / dur), x = target * ease(t); reel.style.transform = `translate3d(${-x}px,0,0)`;
        const idx = Math.floor((x + wrapW / 2) / itemW); if (idx !== last) { last = idx; PD.snd.play('tick', idx % 12); }
        if (t < 1) requestAnimationFrame(step); else setTimeout(reveal, 350);
      })(t0);
    });
    function reveal() {
      PD.snd.play(r.res.rarity === 'common' ? 'ok' : r.res.rarity); PD.hap(r.res.rarity === 'common' ? 'light' : 'heavy');
      if (r.res.rarity !== 'common') ui.confetti([rar.color, '#fff', rar.glow], r.res.rarity === 'mythic' ? 90 : 50);
      ov.innerHTML = `<div class="drop-card" style="background:linear-gradient(160deg,${rar.color},#0c0d12 120%);width:calc(100% - 24px);max-width:480px"><div class="rays"></div><div style="position:relative"><span class="pill" style="background:rgba(0,0,0,.3);color:#fff">${rar.name}</span><div>${img(ph.modelId, ph.colorIdx, 'back', ph.cond)}</div><div style="font-size:24px;font-weight:800">${esc(m.n)}</div><div style="opacity:.9;margin:4px 0">${PD.CONDITIONS[ph.cond].name} · ${eco.storageLabel(m, ph.stIdx)} · ${esc(m.colors[ph.colorIdx].name)}</div><div style="font-size:15px;opacity:.9">Рыночная цена ≈ <b>${rub(eco.fair(ph))}</b>${ph.paid ? ` · кейс ${rub(ph.paid)}` : ''}</div></div></div>
        <div class="row" style="width:calc(100% - 24px);max-width:480px;flex-wrap:wrap"><button class="btn g sp" data-p>Включить</button><button class="btn l sp" data-c>В коллекцию</button></div><button class="btn sp" style="background:rgba(255,255,255,.14);width:calc(100% - 24px);max-width:480px" data-again>Открыть ещё раз</button>`;
      ov.querySelector('[data-p]').onclick = () => { ov.remove(); PD.os.launch(ph.uid, { fromBuy: true }); };
      ov.querySelector('[data-c]').onclick = () => { ov.remove(); ui.rerender(); };
      ov.querySelector('[data-again]').onclick = () => { ov.remove(); const cur = ui.current(); const inv = S().casesInv[c.id] || 0; if (inv > 0) A.openCase(c.id + '|1'); else A.openCase(c.id + '|0'); };
    }
  }

  /* ---------- ПОЕЗДКИ ---------- */
  const TICON = { bus: ['bus', '#0aa5e0'], train: ['train', '#2f9e5d'], plane: ['plane', '#965eeb'] };
  PD.routeRow = (r, dest) => `<button class="route" data-route="${r.type}"><span class="ri2" style="background:${TICON[r.type][1]}">${ic(TICON[r.type][0])}</span><div class="sp"><b>${r.name}</b><div class="small muted">${r.hours} ч в пути · ${r.km} км</div></div><b style="font-size:17px">${rub(r.price)}</b></button>`;
  SC.trips = {
    render() {
      const s = S(), cur = PD.CITY_BY_ID[s.city];
      const list = PD.CITIES.filter(c => c.id !== s.city).map(c => ({ c, d: PD.distKm(cur, c), n: eco.genCity(c.id, eco.epoch()).filter(l => !s.taken.includes(l.id)).length, b: eco.genCity(c.id, eco.epoch()).filter(l => l.bargain && !s.taken.includes(l.id)).length })).sort((a, b) => a.d - b.d);
      return ui.header('Путешествия', { right: ui.balance() }) + `<div class="card" style="background:linear-gradient(135deg,#965eeb,#5a3bd6);color:#fff;margin-top:4px"><div class="small" style="opacity:.85">Вы сейчас в городе</div><div style="font-size:26px;font-weight:800">${esc(cur.name)}</div><div class="small" style="opacity:.85;margin-top:4px">${eco.genCity(cur.id, eco.epoch()).filter(l => !s.taken.includes(l.id)).length} объявлений рядом · поездок: ${s.stats.trips}</div></div>
        <div class="h2" style="margin-top:6px">Куда поедем?</div><div class="pad">${list.map(x => `<button class="route" data-act="pickDest" data-arg="${x.c.id}"><span class="ri2" style="background:linear-gradient(135deg,#0af,#965eeb)">${ic('pin')}</span><div class="sp"><b>${esc(x.c.name)}</b><div class="small muted">${x.d} км · ${x.n} объявлений${x.b ? ` · <span style="color:var(--grnD);font-weight:700">${x.b} выгодных</span>` : ''}</div></div><span class="small muted">от ${rub(Math.min.apply(null, PD.routes(s.city, x.c.id).map(r => r.price)))}</span></button>`).join('')}</div>
        ${s.trips.length ? `<div class="h2">История поездок</div>${s.trips.slice(0, 6).map(t => `<div class="hl" style="cursor:default"><div class="th" style="width:44px;height:44px;border-radius:50%;background:var(--bg2)">${ic(TICON[t.type][0], 'width="22" height="22" style="stroke:var(--tx2);fill:none;stroke-width:1.9"')}</div><div class="tt"><b>${esc(PD.CITY_BY_ID[t.from].name)} → ${esc(PD.CITY_BY_ID[t.to].name)}</b><div class="small muted">${t.hours} ч · ${rub(t.price)}</div></div><span class="xs muted">${U.ago(t.ts)}</span></div>`).join('')}` : ''}`;
    }
  };
  A.pickDest = id => {
    const rt = PD.routes(S().city, id), c = PD.CITY_BY_ID[id];
    const sc = ui.sheet(`<h3 class="h3" style="font-size:20px">${esc(PD.CITY_BY_ID[S().city].name)} → ${esc(c.name)}</h3><p class="muted small" style="margin:2px 0 12px">Выберите транспорт. Время в пути сдвигает игровое время — рынок обновится.</p>${rt.map(r => PD.routeRow(r, id)).join('')}`);
    sc.querySelectorAll('[data-route]').forEach(b => b.onclick = () => { ui.closeModal(sc); A.doTravel(id + '|' + b.dataset.route); });
  };
  A.doTravel = async (arg, el, e, buyId) => {
    const [dest, type] = arg.split('|'), s = S(), r = PD.routes(s.city, dest).find(x => x.type === type), c = PD.CITY_BY_ID[dest];
    if (!r) return; if (s.money < r.price) return ui.err('Не хватает ' + rub(r.price - s.money) + ' на билет');
    const ok = await ui.confirm({ title: 'Купить билет?', html: `<b>${r.name}</b> · ${esc(PD.CITY_BY_ID[s.city].name)} → <b>${esc(c.name)}</b><br>${r.hours} ч в пути · <b>${rub(r.price)}</b><br><span class="muted">Баланс после: ${rub(s.money - r.price)}</span>`, ok: 'Купить билет', icon: r.type === 'plane' ? 'plane' : r.type, cls: 'p' });
    if (!ok) return;
    const res = eco.travel(dest, type); if (!res.ok) return ui.err(res.err);
    PD.snd.play(type);
    const ov = document.createElement('div'); ov.className = 'trip'; const grad = { bus: 'linear-gradient(180deg,#14305e,#2b6cb0 60%,#f2a65a)', train: 'linear-gradient(180deg,#0f2a2a,#1f6b55 65%,#9ad07a)', plane: 'linear-gradient(180deg,#071a3d,#1d5fc9 55%,#9fd0ff)' }[type]; ov.style.background = grad;
    ov.innerHTML = `<div class="clouds">${[0, 1, 2, 3, 4].map(i => `<i style="top:${10 + i * 14}%;width:${70 + i * 30}px;animation-duration:${6 + i * 2}s;animation-delay:-${i * 2}s"></i>`).join('')}</div><div class="small" style="opacity:.85;letter-spacing:2px">${r.name.toUpperCase()}</div><div class="vehicle">${ic(TICON[type][0])}</div><div style="font-size:23px;font-weight:800;text-align:center">${esc(PD.CITY_BY_ID[res.r ? PD.S.trips[0].from : ''].name)} → ${esc(c.name)}</div><div class="road"><i id="tp"></i></div><div class="small" id="tt" style="opacity:.9">В пути…</div>`;
    document.body.appendChild(ov);
    let t0 = performance.now(), dur = 3800; const tp = ov.querySelector('#tp'), tt = ov.querySelector('#tt');
    (function step(now) { const t = Math.min(1, (now - t0) / dur); tp.style.width = (t * 100) + '%'; tt.textContent = 'Осталось ' + Math.max(0, (r.hours * (1 - t))).toFixed(1) + ' ч'; if (t < 1) requestAnimationFrame(step); else done(); })(t0);
    function done() { PD.snd.play('ok'); ov.style.transition = 'opacity .4s'; ov.style.opacity = '0'; setTimeout(() => { ov.remove(); if (buyId) { ui.stack.pop && 0; ui.go('listing', { id: buyId }, { replace: ui.current().name === 'listing' || ui.current().name === 'chat' }); } else ui.rerender(); }, 400); }
  };

  /* ---------- ПРОМОКОДЫ ---------- */
  SC.promo = {
    render() {
      const s = S();
      return ui.header('Промокоды') + `<div class="card" style="margin-top:6px;background:linear-gradient(135deg,#04e061,#00a84a);color:#00220f"><div style="font-size:34px">🎟️</div><b style="font-size:18px">Активация промокода</b><div class="small" style="margin-top:2px">Получайте деньги, телефоны и кейсы. Каждый код действует один раз на аккаунт.</div></div>
        <div class="pad mt"><div class="field"><label>Введите код</label><input class="inp" id="promoIn" data-enter="redeem" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="PHONEDROP" maxlength="32" style="text-transform:uppercase;letter-spacing:2px;font-weight:700"></div><button class="btn blk g" data-act="redeemBtn" id="promoBtn">Активировать</button></div>
        <div class="h2">Использованные коды</div>${s.promos.length ? s.promos.map(p => `<div class="hl" style="cursor:default"><div class="th" style="width:44px;height:44px;border-radius:12px;background:rgba(4,224,97,.16);color:var(--grnD)">${sIc('check', 22)}</div><div class="tt"><b style="letter-spacing:1px">${esc(p.code)}</b><div class="small muted" style="white-space:normal">${esc(p.title)}${p.got && p.got.length ? ' — ' + esc(p.got.join(', ')) : ''}</div></div><span class="xs muted">${U.dateStr(p.ts)}</span></div>`).join('') : '<p class="muted pad">Вы ещё не активировали промокоды</p>'}`;
    },
    mount() { eco.syncPromos().then(() => { }); }
  };
  A.redeem = (v, el) => A.redeemBtn();
  let redeeming = false;
  A.redeemBtn = async () => {
    if (redeeming) return; const inp = $('#promoIn'), btn = $('#promoBtn'); const code = inp.value; if (!code.trim()) { inp.focus(); return PD.snd.play('err'); }
    redeeming = true; btn.classList.add('dis'); btn.textContent = 'Проверяем…';
    const r = await eco.redeem(code); redeeming = false;
    if (!r.ok) { PD.snd.play('err'); PD.hap('err'); btn.classList.remove('dis'); btn.textContent = 'Активировать'; inp.style.borderColor = 'var(--red)'; setTimeout(() => inp.style.borderColor = '', 1200); return ui.notify('Промокод не принят', r.err, 'err'); }
    PD.snd.play('sell'); ui.confetti(); const sc = ui.dialog(`<div class="ic ok">${ic('gift')}</div><h3>Промокод активирован!</h3><p><b>${esc(r.title)}</b><br>${r.lines.map(l => esc(l)).join('<br>')}</p><button class="btn blk g" data-ok>Отлично</button>`);
    sc.querySelector('[data-ok]').onclick = () => { ui.closeModal(sc); ui.rerender(); };
  };
})(window);
