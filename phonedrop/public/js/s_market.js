/* PHONE DROP 2.0.0 — экраны Avito: лента, поиск, объявление, торг, чат, обмен, продажа, избранное, сообщения */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u, esc = U.esc, rub = U.rub, ui = PD.ui, ic = PD.ic, img = PD.img, eco = PD.eco, SC = PD.screens, A = ui.act;
  const $ = s => document.querySelector(s);
  const S = () => PD.S;

  /* ---------- фильтрация ---------- */
  const CATS = [['all', 'Все'], ['Apple', 'iPhone'], ['Samsung', 'Samsung'], ['Xiaomi', 'Xiaomi'], ['Redmi', 'Redmi'], ['POCO', 'POCO'], ['Google', 'Pixel'], ['OnePlus', 'OnePlus'], ['Nothing', 'Nothing'], ['other', 'Другие']];
  const OTHER = ['OPPO', 'Realme', 'Infinix', 'Honor', 'Motorola'];
  const TIERS = [['Все', 0], ['Бюджетные', 1], ['Средний класс', 2], ['Верхний сегмент', 3], ['Флагманы', 4]];
  const SORTS = [['new', 'Новые'], ['cheap', 'Дешевле'], ['exp', 'Дороже'], ['deal', 'Выгодные']];
  function F() { const f = S().filters; if (!f.cat) { Object.assign(f, { cat: 'all', city: 'here', conds: [], min: 0, max: 0, sort: 'new', tier: 0, mem: 0, q: '' }); } return f; }
  const normQ = q => q.replace(/[-–_,.]/g, ' ').replace(/\bпро\b/g, 'pro').replace(/\bмакс\b/g, 'max').replace(/\bультра\b/g, 'ultra').replace(/\s+/g, ' ').trim();
  function filtered() {
    const f = F(), q = (f.q || '').toLowerCase().trim(), s = S();
    let a = eco.listings();
    if (f.city === 'here') a = a.filter(l => l.city === s.city); else if (f.city !== 'all') a = a.filter(l => l.city === f.city);
    if (f.cat === 'other') a = a.filter(l => OTHER.includes(G.MODEL_BY_ID[l.modelId].br)); else if (f.cat !== 'all') a = a.filter(l => G.MODEL_BY_ID[l.modelId].br === f.cat);
    if (f.conds.length) a = a.filter(l => f.conds.includes(l.cond));
    if (f.min) a = a.filter(l => l.ask >= f.min); if (f.max) a = a.filter(l => l.ask <= f.max);
    if (f.tier) a = a.filter(l => { const t = G.MODEL_BY_ID[l.modelId].tier; return f.tier === 4 ? t >= 4 : f.tier === 3 ? t === 3 : t === f.tier; });
    if (f.mem) a = a.filter(l => { const m = G.MODEL_BY_ID[l.modelId]; return m.st[l.stIdx] >= f.mem; });
    if (q) { const parts = normQ(q).split(/\s+/); a = a.filter(l => { const m = G.MODEL_BY_ID[l.modelId]; const hay = (m.n + ' ' + m.br + ' ' + m.colors[l.colorIdx].name + ' ' + eco.storageLabel(m, l.stIdx) + ' ' + PD.CITY_BY_ID[l.city].name + ' ' + m.chip).toLowerCase().replace(/iphone/, 'iphone айфон').replace(/samsung/, 'samsung самсунг галакси').replace(/xiaomi/, 'xiaomi сяоми ксиоми').replace(/pixel/, 'pixel пиксель гугл').replace(/oneplus/, 'oneplus ванплас').replace(/[-–]/g, ' '); return parts.every(p => hay.includes(p)); }); }
    const srt = { new: (x, y) => y.posted - x.posted, cheap: (x, y) => x.ask - y.ask, exp: (x, y) => y.ask - x.ask, deal: (x, y) => (x.ask / x.fair) - (y.ask / y.fair) }[f.sort];
    return a.sort(srt);
  }
  let shown = 24;
  function gridHtml() {
    const a = filtered(); const f = F();
    if (!a.length) return ui.empty('search', 'Ничего не найдено', 'Измените запрос или сбросьте фильтры', '<button class="btn s" data-act="resetF">Сбросить фильтры</button>');
    const part = a.slice(0, shown);
    return `<div class="grid">${part.map((l, i) => ui.listingCard(l, i)).join('')}</div>${a.length > shown ? `<div style="padding:16px 12px"><button class="btn l blk" data-act="more">Показать ещё (${a.length - shown})</button></div>` : ''}`;
  }
  const activeFilters = () => { const f = F(); return (f.conds.length ? 1 : 0) + (f.min || f.max ? 1 : 0) + (f.tier ? 1 : 0) + (f.mem ? 1 : 0) + (f.city !== 'here' ? 1 : 0); };

  /* ---------- ГЛАВНАЯ ---------- */
  SC.home = {
    render() {
      const s = S(), f = F(), city = PD.CITY_BY_ID[s.city]; const un = s.notifs.filter(n => !n.read).length;
      const daily = eco.dailyReady();
      return `<div class="top"><label class="search">${ic('search')}<input id="q" data-in="q" data-enter="blurq" value="${esc(f.q)}" placeholder="Поиск телефонов: iPhone 15, Galaxy…" enterkeyhint="search" autocomplete="off"></label>
        <button class="ib" data-act="go" data-arg="notifs" aria-label="Уведомления">${ic('bell')}${un ? `<i class="dot">${un}</i>` : ''}</button></div>
        <div class="row pad" style="margin:2px 0 6px"><button class="bal" data-act="go" data-arg="history"><i></i>${rub(s.money)}</button><button class="chip" data-act="go" data-arg="trips" style="height:32px;background:var(--priBg);color:var(--pri2)">${ic('pin', 'width="15" height="15" style="stroke:currentColor;fill:none;stroke-width:2"')}${esc(city.name)}</button><span class="sp"></span><span class="xs muted" id="epochT"></span><button class="ib" data-act="refreshMarket" aria-label="Обновить ленту" style="width:34px;height:34px">${ic('refresh')}</button></div>
        <div class="tiles">
          <button class="tile" data-act="go" data-arg="collection"><span class="ti" style="background:linear-gradient(135deg,#0af,#0070e0)">${ic('phone')}</span>Коллекция${s.phones.length ? `<i class="badge" style="background:var(--pri)">${s.phones.length}</i>` : ''}</button>
          <button class="tile" data-act="go" data-arg="cases"><span class="ti" style="background:linear-gradient(135deg,#ff3d5a,#ff8a3d)">${ic('box')}</span>Кейсы${Object.values(s.casesInv).reduce((a, b) => a + b, 0) ? `<i class="badge">${Object.values(s.casesInv).reduce((a, b) => a + b, 0)}</i>` : ''}</button>
          <button class="tile" data-act="go" data-arg="trips"><span class="ti" style="background:linear-gradient(135deg,#965eeb,#5a3bd6)">${ic('plane')}</span>Поездки</button>
          <button class="tile" data-act="go" data-arg="promo"><span class="ti" style="background:linear-gradient(135deg,#04e061,#00a84a)">${ic('gift')}</span>Промокод</button>
        </div>
        ${daily ? `<div class="card" style="margin-top:12px;background:linear-gradient(135deg,#04e061,#00b856);color:#00220f;display:flex;align-items:center;gap:12px"><div style="font-size:30px">🎁</div><div class="sp"><b>Ежедневный бонус</b><div class="small">Заберите 1 500 ₽ на покупки</div></div><button class="btn sm" style="background:#fff;color:#007a35" data-act="daily">Забрать</button></div>` : ''}
        <div class="chips" id="cats" style="margin-top:6px">${CATS.map(c => `<button class="chip ${f.cat === c[0] ? 'on' : ''}" data-act="cat" data-arg="${c[0]}">${c[1]}</button>`).join('')}</div>
        <div class="row pad" style="margin-bottom:10px"><button class="chip" data-act="filters" style="${activeFilters() ? 'background:var(--priBg);color:var(--pri2)' : ''}">${ic('filter', 'width="17" height="17" style="stroke:currentColor;fill:none;stroke-width:2"')}Фильтры${activeFilters() ? ' · ' + activeFilters() : ''}</button>
        <div class="seg sp" id="sortSeg">${SORTS.map(x => `<button class="${f.sort === x[0] ? 'on' : ''}" data-act="sort" data-arg="${x[0]}">${x[1]}</button>`).join('')}</div></div>
        <div id="count" class="xs muted pad" style="margin-bottom:8px"></div>
        <div id="gridBox">${gridHtml()}</div>`;
    },
    mount(el) { const upd = () => { const c = $('#count'); if (c) { const f = F(); c.textContent = `${filtered().length} объявлений · ${f.city === 'here' ? 'в городе ' + PD.CITY_BY_ID[S().city].name : f.city === 'all' ? 'во всех городах' : PD.CITY_BY_ID[f.city].name}`; } const t = $('#epochT'); if (t) { const m = Math.ceil(eco.epochLeft() / 60000); t.textContent = 'обновление через ' + m + ' мин'; } }; upd(); SC.home.upd = upd; }
  };
  let qT;
  ui.inp.q = v => { F().q = v; shown = 24; clearTimeout(qT); qT = setTimeout(() => { const b = $('#gridBox'); if (b) { b.innerHTML = gridHtml(); SC.home.upd && SC.home.upd(); } PD.save(); }, 160); };
  A.blurq = (v, el) => el.blur();
  A.cat = c => { F().cat = c; shown = 24; PD.save(); ui.rerender(); };
  A.sort = c => { F().sort = c; PD.save(); ui.rerender(); };
  A.more = () => { shown += 24; const b = $('#gridBox'); b.innerHTML = gridHtml(); };
  A.resetF = () => { Object.assign(S().filters, { cat: 'all', city: 'here', conds: [], min: 0, max: 0, sort: 'new', tier: 0, mem: 0, q: '' }); shown = 24; PD.save(); ui.rerender(); };
  A.daily = () => { if (eco.claimDaily()) { PD.snd.play('ok'); ui.confetti(null, 24); ui.rerender(); } };
  A.refreshMarket = () => { eco.refreshMarket(); PD.snd.play('nav'); ui.notify('Лента обновлена', 'Появились новые объявления', 'info'); shown = 24; ui.rerender(); };
  A.listing = id => { ui.go('listing', { id }); };
  A.fav = (id, el, e) => { e.stopPropagation(); const s = S(), i = s.favs.indexOf(id); if (i >= 0) s.favs.splice(i, 1); else { s.favs.unshift(id); PD.snd.play('ok'); } PD.save(); PD.hap('light'); document.querySelectorAll(`.fav[data-arg="${id}"]`).forEach(b => b.classList.toggle('on', i < 0)); const cur = ui.current(); if (cur.name === 'favs') ui.rerender(); };

  const PRICE_PRESETS = [['до 15 000', 0, 15000], ['15–30 тыс.', 15000, 30000], ['30–60 тыс.', 30000, 60000], ['от 60 000', 60000, 0]];
  A.filters = () => {
    const f = F();
    const sc = ui.sheet(`<h3 class="h3" style="font-size:20px">Фильтры</h3>
      <div class="field"><label>Цена, ₽</label><div class="row"><input class="inp" id="fmin" inputmode="numeric" placeholder="от" value="${f.min || ''}"><input class="inp" id="fmax" inputmode="numeric" placeholder="до" value="${f.max || ''}"></div><div class="chips" style="padding:8px 0 0;flex-wrap:wrap">${PRICE_PRESETS.map((p, i) => `<button class="chip" data-pp="${i}">${p[0]}</button>`).join('')}</div></div>
      <div class="field"><label>Память от</label><div class="chips" style="padding:0;flex-wrap:wrap">${[[0, 'Любая'], [128, '128 ГБ'], [256, '256 ГБ'], [512, '512 ГБ'], [1024, '1 ТБ']].map(t => `<button class="chip ${(f.mem || 0) === t[0] ? 'on' : ''}" data-m="${t[0]}">${t[1]}</button>`).join('')}</div></div>
      <div class="field"><label>Город</label><select class="inp" id="fcity"><option value="here" ${f.city === 'here' ? 'selected' : ''}>Мой город: ${esc(PD.CITY_BY_ID[S().city].name)}</option><option value="all" ${f.city === 'all' ? 'selected' : ''}>Все города</option>${PD.CITIES.map(c => `<option value="${c.id}" ${f.city === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
      <div class="field"><label>Состояние</label><div class="chips" style="padding:0;flex-wrap:wrap">${PD.COND_ORDER.map(c => `<button class="chip ${f.conds.includes(c) ? 'on' : ''}" data-c="${c}">${PD.CONDITIONS[c].name}</button>`).join('')}</div></div>
      <div class="field"><label>Класс</label><div class="chips" style="padding:0;flex-wrap:wrap">${TIERS.map(t => `<button class="chip ${f.tier === t[1] ? 'on' : ''}" data-t="${t[1]}">${t[0]}</button>`).join('')}</div></div>
      <div class="row"><button class="btn l sp" data-r>Сбросить</button><button class="btn sp" data-ok>Показать</button></div>`);
    let conds = f.conds.slice(), tier = f.tier, mem = f.mem || 0;
    sc.querySelectorAll('[data-pp]').forEach(b => b.onclick = () => { PD.snd.play('tap'); const p = PRICE_PRESETS[+b.dataset.pp]; sc.querySelector('#fmin').value = p[1] || ''; sc.querySelector('#fmax').value = p[2] || ''; });
    sc.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { PD.snd.play('tap'); mem = +b.dataset.m; sc.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); });
    sc.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { PD.snd.play('tap'); const c = b.dataset.c; const i = conds.indexOf(c); if (i >= 0) conds.splice(i, 1); else conds.push(c); b.classList.toggle('on'); });
    sc.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { PD.snd.play('tap'); tier = +b.dataset.t; sc.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('on', x === b)); });
    sc.querySelector('[data-r]').onclick = () => { ui.closeModal(sc); A.resetF(); };
    sc.querySelector('[data-ok]').onclick = () => { f.min = parseInt(sc.querySelector('#fmin').value) || 0; f.max = parseInt(sc.querySelector('#fmax').value) || 0; f.city = sc.querySelector('#fcity').value; f.conds = conds; f.tier = tier; f.mem = mem; shown = 24; PD.save(); ui.closeModal(sc); ui.rerender(); };
  };

  /* ---------- ОБЪЯВЛЕНИЕ ---------- */
  function marketLabel(l) { const d = Math.round((l.ask / l.fair - 1) * 100); return d <= -6 ? `<span class="pill" style="background:rgba(4,224,97,.16);color:var(--grnD)">Ниже рынка на ${-d}%</span>` : d >= 8 ? `<span class="pill" style="background:rgba(255,64,83,.12);color:var(--red)">Выше рынка на ${d}%</span>` : '<span class="pill">Рыночная цена</span>'; }
  SC.listing = {
    hideNav: true,
    render(p) {
      const l = eco.listing(p.id); if (!l) return ui.header('Объявление') + ui.empty('search', 'Объявление не найдено', '', '');
      const s = S(), m = G.MODEL_BY_ID[l.modelId], act = eco.isActive(l), city = PD.CITY_BY_ID[l.city], here = l.city === s.city, fav = s.favs.includes(l.id), ch = s.chats[l.id];
      if (!s.views.find(v => v.id === l.id)) { s.views.unshift({ id: l.id, ts: Date.now() }); if (s.views.length > 60) s.views.length = 60; PD.save(); } else { const v = s.views.find(v => v.id === l.id); v.ts = Date.now(); }
      const price = ch && ch.deal ? ch.deal.price : l.ask; const col = m.colors[l.colorIdx];
      return `<div class="top" style="position:absolute;left:0;right:0;background:transparent;z-index:22"><button class="ib" data-act="back" style="background:rgba(255,255,255,.85);color:#000;backdrop-filter:blur(8px)">${ic('back')}</button><span class="sp"></span><button class="ib" data-act="fav" data-arg="${l.id}" data-snd="none" id="favBtn" style="background:rgba(255,255,255,.85);color:${fav ? 'var(--red)' : '#000'};backdrop-filter:blur(8px)">${ic('heart', fav ? 'style="fill:var(--red);stroke:var(--red)"' : '')}</button></div>
      <div class="gal" id="gal"><div>${img(l.modelId, l.colorIdx, 'back', l.cond)}</div><div>${img(l.modelId, l.colorIdx, 'front', l.cond)}</div><div class="macro"><img src="${PD.art.macroUri(l.modelId, l.colorIdx, l.cond)}" alt=""></div></div>
      <div class="dots" id="dots"><i class="on"></i><i></i><i></i></div>
      <div class="thumbs" id="thumbs"><button class="on" data-th="0">${img(l.modelId, l.colorIdx, 'back', l.cond)}</button><button data-th="1">${img(l.modelId, l.colorIdx, 'front', l.cond)}</button><button data-th="2"><img src="${PD.art.macroUri(l.modelId, l.colorIdx, l.cond)}" alt=""></button></div>
      <div class="pad"><div class="row" style="align-items:flex-end"><div style="font-size:28px;font-weight:800;letter-spacing:-.5px">${rub(price)}</div>${ch && ch.deal ? '<span class="pill" style="background:var(--grn);color:#00220f">Цена согласована</span>' : ''}</div>
        <div style="font-size:19px;font-weight:600;margin:6px 0">${esc(m.n)}, ${esc(eco.storageLabel(m, l.stIdx))}, ${esc(col.name)}</div>
        <div class="row" style="flex-wrap:wrap;gap:6px">${PD.condTag(l.cond)}${marketLabel(l)}${!act ? '<span class="pill" style="background:var(--red);color:#fff">Снято с публикации</span>' : ''}</div>
        <div class="row small muted" style="margin-top:10px"><span>${ic('pin', 'width="15" height="15" style="stroke:currentColor;fill:none;stroke-width:2;vertical-align:-3px"')} ${esc(city.name)}${here ? '' : ` · <b style="color:var(--pur)">нужно доехать</b>`}</span><span>·</span><span>${U.ago(l.posted)}</span><span>·</span><span>${l.views} просмотров</span></div></div>
      <div class="specs"><div><b>${eco.storageLabel(m, l.stIdx)}</b><span>память</span></div><div><b>${m.ram} ГБ</b><span>ОЗУ</span></div><div><b>${l.bat}%</b><span>АКБ</span></div><div><b>${m.yr}</b><span>год</span></div></div>
      <div class="sec" style="margin-top:14px"></div>
      <div class="card" style="box-shadow:none;margin:14px 12px 0;padding:0"><h3 class="h3">Характеристики</h3>
        <div class="kv"><span>Состояние</span><span>${PD.CONDITIONS[l.cond].name}</span></div><div class="kv"><span>Аккумулятор</span><span>${l.bat}%</span></div><div class="kv"><span>Память</span><span>${eco.storageLabel(m, l.stIdx)} · ОЗУ ${m.ram} ГБ</span></div><div class="kv"><span>Процессор</span><span>${esc(m.chip)}</span></div><div class="kv"><span>Экран</span><span>${esc(m.scr)}</span></div><div class="kv"><span>Камера</span><span>${esc(m.cam)}</span></div><div class="kv"><span>Комплект</span><span>${l.box ? 'Коробка, кабель' : 'Только телефон'}</span></div></div>
      <div class="card" style="box-shadow:none;margin:6px 12px 0;padding:0"><h3 class="h3">Описание</h3><div style="line-height:1.5">${esc(l.note)} ${PD.CONDITIONS[l.cond].desc}. ${m.yr} г. выпуска.</div></div>
      <div class="sec" style="margin-top:16px"></div>
      <div class="card" style="box-shadow:none;margin:14px 12px 0;padding:0"><div class="row"><div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pur));display:grid;place-items:center;color:#fff;font-weight:800;font-size:20px">${esc(l.seller.name[0])}</div><div class="sp"><b>${esc(l.seller.name)}</b>${l.seller.shop ? ' <span class="pill" style="padding:1px 7px">Магазин</span>' : ''}<div class="small muted">${l.seller.rating.toFixed(1)} ${PD.stars(l.seller.rating)} · ${l.seller.deals} сделок · на Avito с ${l.seller.since}</div></div></div></div>
      <div class="sec" style="margin-top:16px"></div>
      <div class="h2" style="margin-top:14px">Похожие объявления</div><div class="grid">${eco.listings().filter(x => x.id !== l.id && (G.MODEL_BY_ID[x.modelId].br === m.br)).slice(0, 4).map((x, i) => ui.listingCard(x, i)).join('')}</div><div style="height:100px"></div>
      <div class="sticky-cta">${act ? `<button class="btn l" style="width:54px;padding:0" data-act="openChat" data-arg="${l.id}" aria-label="Написать">${ic('chat', 'width="22" height="22" style="stroke:currentColor;fill:none;stroke-width:2"')}</button><button class="btn s sp" data-act="bargain" data-arg="${l.id}">Торг</button><button class="btn p" data-act="tradeStart" data-arg="${l.id}" style="width:54px;padding:0" aria-label="Обмен">${ic('swap', 'width="22" height="22" style="stroke:#fff;fill:none;stroke-width:2"')}</button>
        ${here ? `<button class="btn g sp" style="flex:1.6" data-act="buy" data-arg="${l.id}">Купить</button>` : `<button class="btn sp" style="flex:1.6;background:var(--pur)" data-act="goThere" data-arg="${l.id}">Поехать · ${esc(city.name)}</button>`}` : '<button class="btn l blk dis">Объявление неактуально</button>'}</div>`;
    },
    mount(el) {
      const g = el.querySelector('#gal'), d = el.querySelectorAll('#dots i'); if (!g) return;
      const th = el.querySelectorAll('#thumbs button'); th.forEach(b => b.onclick = () => { PD.snd.play('tap'); g.scrollTo({ left: +b.dataset.th * g.clientWidth, behavior: 'smooth' }); });
      let raf; g.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const i = Math.round(g.scrollLeft / g.clientWidth); d.forEach((x, k) => x.classList.toggle('on', k === i)); th.forEach((x, k) => x.classList.toggle('on', k === i)); }); }, { passive: true });
    }
  };
  A.openChat = id => ui.go('chat', { id });
  A.buy = async id => {
    const l = eco.listing(id), s = S(), ch = s.chats[id]; const price = ch && ch.deal ? ch.deal.price : l.ask;
    if (s.money < price) return ui.err('Не хватает ' + rub(price - s.money) + '. Продайте телефон или откройте кейс.');
    const m = G.MODEL_BY_ID[l.modelId];
    const ok = await ui.confirm({ title: 'Подтвердите покупку', html: `<b>${esc(m.n)}</b>, ${PD.CONDITIONS[l.cond].name.toLowerCase()}<br>Цена: <b>${rub(price)}</b><br><span class="muted">Баланс после покупки: ${rub(s.money - price)}</span>`, ok: 'Купить за ' + rub(price), cls: 'g', icon: 'wallet' });
    if (!ok) return;
    const r = eco.buy(l, price); if (!r.ok) return ui.err(r.err);
    PD.snd.play('buy'); ui.confetti(); PD.hap('heavy');
    const go = await ui.confirm({ title: 'Телефон ваш!', html: `${esc(m.n)} добавлен в коллекцию.<br>Можно сразу включить его.`, ok: 'Включить', cancel: 'Позже', icon: 'check', cls: 'g' });
    if (go) PD.os.launch(r.phone.uid, { fromBuy: true }); else ui.back();
  };
  A.bargain = async id => {
    const l = eco.listing(id); const ch = eco.chat(l);
    if (ch.rounds >= 4) return ui.err('Продавец больше не готов торговаться');
    const v = await ui.askNumber({ title: 'Предложите свою цену', sub: `Цена в объявлении: <b>${rub(l.ask)}</b>`, chips: [-5, -10, -15, -20].map(p => [p + '%', Math.round(l.ask * (1 + p / 100) / 50) * 50]), ok: 'Отправить', min: 500, hint: v => v ? (v >= l.ask ? 'Это не ниже цены продавца' : `Скидка ${Math.round((1 - v / l.ask) * 100)}% · ${rub(v)}`) : '' });
    if (!v) return; const r = eco.offer(l, v);
    PD.snd.play(r.res === 'accept' ? 'ok' : r.res === 'counter' ? 'msg' : 'err'); ui.go('chat', { id });
  };
  A.goThere = async id => {
    const l = eco.listing(id), city = PD.CITY_BY_ID[l.city]; const rt = PD.routes(S().city, l.city);
    const sc = ui.sheet(`<h3 class="h3" style="font-size:20px">Поездка в ${esc(city.name)}</h3><p class="muted small" style="margin:2px 0 12px">Телефон находится в другом городе. Выберите транспорт — после приезда вы сможете купить его.</p>${rt.map(r => PD.routeRow(r, l.city)).join("")}`);
    sc.querySelectorAll('[data-route]').forEach(b => b.onclick = () => { ui.closeModal(sc); A.doTravel(l.city + '|' + b.dataset.route, null, null, id); });
  };
  A.tradeStart = id => {
    const l = eco.listing(id); const s = S();
    if (!eco.canBuyHere(l)) return ui.err('Для обмена нужно приехать в ' + PD.CITY_BY_ID[l.city].name);
    const mine = s.phones.filter(p => !p.listing);
    if (!mine.length) return ui.alert('Нечем меняться', 'У вас нет телефонов, свободных для обмена. Купите телефон или откройте кейс.');
    ui.go('trade', { id });
  };

  /* ---------- ЧАТ ---------- */
  SC.chat = {
    hideNav: true,
    render(p) {
      const s = S(); const mine = String(p.id).startsWith('my:'); const ch = s.chats[p.id];
      if (!ch) return ui.header('Чат') + ui.empty('chat', 'Чат не найден', '');
      ch.unread = 0; renderNav2();
      let head, l = null, ml = null;
      if (mine) { ml = s.myListings.find(x => x.id === ch.lid); const ph = ml && eco.byUid(ml.phoneUid); head = ml ? `<button class="hl" style="padding:8px 12px;border-bottom:1px solid var(--line);border-radius:0" data-act="myListing" data-arg="${ml.id}"><div class="th" style="width:48px;height:56px">${ph ? img(ph.modelId, ph.colorIdx, 'back', ph.cond) : ''}</div><div class="tt"><b>${ph ? esc(G.MODEL_BY_ID[ph.modelId].n) : 'Объявление'}</b><span class="b">${rub(ml.price)}</span> <span class="xs muted">· ${ml.status === 'active' ? 'активно' : ml.status === 'sold' ? 'продано' : 'снято'}</span></div></button>` : ''; }
      else { l = eco.listing(ch.id); const sn = ch.snap; head = `<button class="hl" style="padding:8px 12px;border-bottom:1px solid var(--line);border-radius:0" data-act="listing" data-arg="${ch.id}"><div class="th" style="width:48px;height:56px">${img(sn.modelId, sn.colorIdx, 'back', sn.cond)}</div><div class="tt"><b>${esc(G.MODEL_BY_ID[sn.modelId].n)}</b><span class="b">${rub(sn.ask)}</span> <span class="xs muted">· ${esc(sn.seller)}, ${esc(PD.CITY_BY_ID[sn.city].name)}</span></div></button>`; }
      const msgs = ch.msgs.map(m => {
        if (m.kind === 'boffer') {
          const open = m.status === 'open' && ml && ml.status === 'active';
          return `<div class="offer ${open ? '' : 'done'}"><div class="small muted">${esc(m.who)} · ${open ? 'ждёт ответа' : ({ accepted: 'принято', declined: 'отклонено', expired: 'истекло', countered: 'встречное' }[m.status] || '')}</div><div class="am">${rub(m.final || m.amount)}</div>${open ? `<div class="row"><button class="btn g sm sp" data-act="acceptOffer" data-arg="${ml.id}|${m.id}">Продать</button><button class="btn s sm sp" data-act="counterOffer" data-arg="${ml.id}|${m.id}">Своя цена</button><button class="btn l sm" data-act="declineOffer" data-arg="${ml.id}|${m.id}" aria-label="Отклонить">${ic('close', 'width="18" height="18" style="stroke:currentColor;fill:none;stroke-width:2.4"')}</button></div>` : ''}</div>`;
        }
        const t = new Date(m.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const extra = m.kind === 'counter' && !ch.closed && ch.counter === m.amount ? `<div class="row" style="margin-top:8px"><button class="btn g sm sp" data-act="acceptCounter" data-arg="${ch.id}">Согласен · ${rub(m.amount)}</button></div>` : '';
        return `<div class="msg ${m.from}">${esc(m.text)}${extra}${m.from !== 'sys' ? `<div class="t">${t}</div>` : ''}</div>`;
      }).join('');
      let comp = '';
      if (!mine && !ch.closed) {
        const deal = ch.deal ? `<div class="row" style="margin-bottom:8px;background:rgba(4,224,97,.14);border-radius:12px;padding:8px 10px"><div class="sp small"><b>Договорились: ${rub(ch.deal.price)}</b></div>${l && eco.canBuyHere(l) ? `<button class="btn g sm" data-act="buy" data-arg="${ch.id}">Купить</button>` : `<button class="btn sm" style="background:var(--pur)" data-act="goThere" data-arg="${ch.id}">Поехать</button>`}</div>` : '';
        comp = `<div class="composer">${deal}<div class="qr">${['Торг возможен?', 'Есть обмен?', 'Какое состояние?', 'Что с аккумулятором?', 'Коробка есть?'].map(t => `<button class="chip" data-act="quick" data-arg="${esc(t)}|${ch.id}">${t}</button>`).join('')}<button class="chip on" data-act="bargain" data-arg="${ch.id}">Предложить цену</button></div><div class="in"><input id="msgIn" data-enter="sendMsg" data-chat="${ch.id}" placeholder="Сообщение" autocomplete="off" maxlength="300"><button class="btn" style="width:46px;padding:0;border-radius:23px" data-act="sendMsg2" data-arg="${ch.id}" aria-label="Отправить">${ic('send', 'width="21" height="21" style="stroke:#fff;fill:none;stroke-width:2"')}</button></div></div>`;
      }
      return `<div class="top line"><button class="ib" data-act="back">${ic('back')}</button><h1>${mine ? 'Мои покупатели' : esc(ch.snap.seller)}</h1></div>${head}<div class="chat" id="chatBox" style="${comp ? '' : 'padding-bottom:30px'}">${msgs}</div>${comp}`;
    },
    mount(el, p) { const v = $('#view'); v.scrollTop = v.scrollHeight; SC.chat.refresh = () => { const cur = ui.current(); if (cur && cur.name === 'chat') { const st = $('#view'); const bottom = st.scrollHeight - st.scrollTop - st.clientHeight < 140; const val = ($('#msgIn') || {}).value; ui.rerender(); if (val && $('#msgIn')) $('#msgIn').value = val; if (bottom) st.scrollTop = st.scrollHeight; } }; }
  };
  function renderNav2() { setTimeout(() => ui.renderNav(), 0); }
  A.quick = arg => { const [t, id] = arg.split('|'); const l = eco.listing(id); eco.message(l, t); ui.rerender(); const v = $('#view'); v.scrollTop = v.scrollHeight; };
  A.sendMsg = (v, el) => { const id = el.dataset.chat; if (!v.trim()) return; eco.message(eco.listing(id), v.trim()); el.value = ''; ui.rerender(); const vw = $('#view'); vw.scrollTop = vw.scrollHeight; setTimeout(() => { const i = $('#msgIn'); i && i.focus(); }, 30); };
  A.sendMsg2 = id => { const i = $('#msgIn'); A.sendMsg(i.value, i); };
  A.acceptCounter = id => { eco.acceptCounter(eco.listing(id)); PD.snd.play('ok'); ui.rerender(); };
  A.acceptOffer = async arg => {
    const [lid, mid] = arg.split('|'); const s = S(), ch = s.chats['my:' + lid], m = ch.msgs.find(x => x.id === mid), l = s.myListings.find(x => x.id === lid), ph = eco.byUid(l.phoneUid);
    const profit = ph && ph.paid ? m.amount - ph.paid : null;
    const ok = await ui.confirm({ title: 'Продать телефон?', html: `${esc(G.MODEL_BY_ID[ph.modelId].n)} → <b>${esc(m.who)}</b><br>Вы получите <b>${rub(m.amount)}</b>${profit != null ? `<br><span style="color:${profit >= 0 ? 'var(--grnD)' : 'var(--red)'}">${profit >= 0 ? 'Прибыль' : 'Убыток'}: ${rub(profit)}</span>` : ''}`, ok: 'Продать', cls: 'g', icon: 'tag' });
    if (!ok) return; if (eco.acceptBuyerOffer(lid, mid)) { PD.snd.play('sell'); ui.confetti(['#04e061', '#0af', '#ffd23f']); ui.rerender(); }
  };
  A.declineOffer = arg => { const [lid, mid] = arg.split('|'); eco.declineBuyer(lid, mid); ui.rerender(); };
  A.counterOffer = async arg => {
    const [lid, mid] = arg.split('|'); const s = S(), l = s.myListings.find(x => x.id === lid), ph = eco.byUid(l.phoneUid), ch = s.chats['my:' + lid], m = ch.msgs.find(x => x.id === mid);
    const v = await ui.askNumber({ title: 'Ваша цена', sub: `Покупатель предлагает ${rub(m.amount)}. Рыночная цена ≈ ${rub(eco.fair(ph))}`, value: l.price, chips: [['Цена объявления', l.price], ['Рыночная', eco.fair(ph)]], ok: 'Отправить', min: 500 });
    if (!v) return; const r = eco.counterBuyer(lid, mid, v);
    if (r === 'accept') { PD.snd.play('sell'); ui.confetti(['#04e061', '#0af', '#ffd23f']); } else PD.snd.play(r === 'counter' ? 'msg' : 'err'); ui.rerender();
  };

  /* ---------- ОБМЕН ---------- */
  SC.trade = {
    hideNav: true,
    render(p) {
      const l = eco.listing(p.id), s = S(), m = G.MODEL_BY_ID[l.modelId]; const mine = s.phones.filter(x => !x.listing);
      return ui.header('Обмен') + `<div class="pad"><div class="card" style="margin:0 0 12px;display:flex;gap:12px;align-items:center"><div class="th" style="width:60px;height:70px;border-radius:12px;background:var(--ph);display:grid;place-items:center">${img(l.modelId, l.colorIdx, 'back', l.cond)}</div><div class="sp"><div class="small muted">Вы получите</div><b>${esc(m.n)}</b><div class="b">${rub(l.ask)}</div></div></div>
      <div class="h3" style="margin:6px 0 10px">Выберите свой телефон</div>
      ${mine.map(ph => { const ev = eco.tradeEval(l, ph); const mm = G.MODEL_BY_ID[ph.modelId]; return `<button class="hl card" style="width:calc(100% - 0px);margin:0 0 10px" data-act="tradePick" data-arg="${l.id}|${ph.uid}"><div class="th">${img(ph.modelId, ph.colorIdx, 'back', ph.cond)}</div><div class="tt"><b>${esc(mm.n)}</b><div class="small muted">${PD.CONDITIONS[ph.cond].name} · оценка ${rub(ev.val)}</div><div class="b" style="color:${ev.ok ? 'var(--grnD)' : 'var(--red)'}">${ev.ok ? (ev.change ? 'Вам доплатят ' + rub(ev.change) : 'Обмен без доплаты') : 'Доплата ' + rub(ev.extra)}</div></div>${ic('chevr', 'width="20" height="20" style="stroke:var(--tx3);fill:none;stroke-width:2"')}</button>`; }).join('')}</div>`;
    }
  };
  A.tradePick = async arg => {
    const [id, uid] = arg.split('|'); const l = eco.listing(id), p = eco.byUid(uid), s = S(); const ev = eco.tradeEval(l, p);
    const net = ev.ok ? ev.change : -ev.extra;
    if (s.money + net < 0) return ui.err('Не хватает ' + rub(-(s.money + net)) + ' для доплаты');
    const ok = await ui.confirm({ title: 'Подтвердите обмен', html: `<b>${esc(G.MODEL_BY_ID[p.modelId].n)}</b> → <b>${esc(G.MODEL_BY_ID[l.modelId].n)}</b><br>${net < 0 ? 'Доплата: <b>' + rub(-net) + '</b>' : net > 0 ? 'Вам доплатят: <b>' + rub(net) + '</b>' : 'Без доплаты'}<br><span class="muted">Сделку нельзя отменить после подтверждения</span>`, ok: 'Обменять', icon: 'swap', cls: 'p' });
    if (!ok) return; const r = eco.trade(l, uid, ev.extra); if (!r.ok) return ui.err(r.err);
    PD.snd.play('buy'); ui.confetti(['#965eeb', '#0af', '#ffd23f']);
    const go = await ui.confirm({ title: 'Обмен завершён', text: G.MODEL_BY_ID[r.phone.modelId].n + ' теперь у вас. Включить?', ok: 'Включить', cancel: 'Позже', icon: 'check', cls: 'g' });
    if (go) PD.os.launch(r.phone.uid, { fromBuy: true }); else ui.go('collection', {}, { root: true, tab: 'profile', replace: false });
  };

  /* ---------- ПРОДАЖА ---------- */
  SC.sell = {
    render() {
      const s = S(); const free = s.phones.filter(p => !p.listing); const act = s.myListings.filter(l => l.status === 'active');
      return ui.header('Продать телефон', { noBack: true, right: ui.balance() }) +
        (act.length ? `<div class="h2" style="margin-top:6px">Мои объявления</div>${act.map(l => { const p = eco.byUid(l.phoneUid); if (!p) return ''; const un = (s.chats['my:' + l.id] || {}).unread || 0; return `<div class="card" style="padding:12px"><div class="row"><div class="th" style="width:60px;height:70px;border-radius:12px;background:var(--ph);display:grid;place-items:center">${img(p.modelId, p.colorIdx, 'back', p.cond)}</div><div class="sp"><b>${esc(G.MODEL_BY_ID[p.modelId].n)}</b><div class="b" style="font-size:18px">${rub(l.price)}</div><div class="small muted">${l.views} просм. · ${l.offers} предл. · рынок ≈ ${rub(eco.fair(p))}</div></div></div><div class="row mt"><button class="btn s sm sp" data-act="openMy" data-arg="${l.id}">Предложения${un ? ` · ${un}` : ''}</button><button class="btn l sm sp" data-act="editPrice" data-arg="${l.id}">Цена</button><button class="btn l sm" data-act="unlist" data-arg="${l.id}">Снять</button></div></div>`; }).join('')}` : '') +
        `<div class="h2" style="margin-top:${act.length ? 8 : 6}px">${free.length ? 'Выберите, что продать' : 'Телефонов для продажи нет'}</div>` +
        (free.length ? free.map(p => { const m = G.MODEL_BY_ID[p.modelId]; return `<button class="hl card" style="width:calc(100% - 24px);margin:0 12px 10px" data-act="sellPick" data-arg="${p.uid}"><div class="th">${img(p.modelId, p.colorIdx, 'back', p.cond)}</div><div class="tt"><b>${esc(m.n)}</b><div class="small muted">${PD.CONDITIONS[p.cond].name} · ${eco.storageLabel(m, p.stIdx)}</div><div class="small">Рынок: <b>${rub(eco.fair(p))}</b></div></div>${ic('chevr', 'width="20" height="20" style="stroke:var(--tx3);fill:none;stroke-width:2"')}</button>`; }).join('') : ui.empty('tag', 'Пока нечего продавать', 'Купите телефон в ленте, откройте кейс или активируйте промокод.', '<button class="btn" data-act="tab" data-arg="home">В ленту</button>'));
    }
  };
  A.openMy = lid => ui.go('chat', { id: 'my:' + lid });
  A.myListing = lid => ui.go('chat', { id: 'my:' + lid });
  A.unlist = async lid => { if (await ui.confirm({ title: 'Снять объявление?', text: 'Телефон вернётся в коллекцию. Предложения покупателей будут отменены.', ok: 'Снять', danger: true })) { eco.unlist(lid); ui.rerender(); } };
  A.editPrice = async lid => { const l = S().myListings.find(x => x.id === lid), p = eco.byUid(l.phoneUid); const f = eco.fair(p); const v = await ui.askNumber({ title: 'Новая цена', sub: 'Рыночная цена ≈ ' + rub(f), value: l.price, chips: [['−5%', Math.round(l.price * .95 / 50) * 50], ['−10%', Math.round(l.price * .9 / 50) * 50], ['Рынок', f]], min: 500, ok: 'Сохранить' }); if (v && eco.setListingPrice(lid, v)) { PD.snd.play('ok'); ui.notify('Цена обновлена', rub(v), 'ok'); ui.rerender(); } };
  A.sellPick = uid => {
    const p = eco.byUid(uid), m = G.MODEL_BY_ID[p.modelId], fair = eco.fair(p), bb = eco.buyback(p);
    const sc = ui.sheet(`<div class="row" style="margin-bottom:12px"><div class="th" style="width:70px;height:84px;border-radius:12px;background:var(--ph);display:grid;place-items:center">${img(p.modelId, p.colorIdx, 'back', p.cond)}</div><div class="sp"><h3 class="h3" style="font-size:19px">${esc(m.n)}</h3><div class="small muted">${PD.CONDITIONS[p.cond].name} · ${eco.storageLabel(m, p.stIdx)} · АКБ ${p.bat}%</div>${p.paid ? `<div class="small">Куплен за ${rub(p.paid)}</div>` : ''}</div></div>
      <div class="field"><label>Ваша цена, ₽ <span class="muted">(рынок ≈ ${rub(fair)})</span></label><input class="inp" id="sp" inputmode="numeric" value="${Math.round(fair * 1.04 / 50) * 50}" style="font-size:22px;font-weight:800;height:56px"></div>
      <div class="chips" style="padding:0 0 8px">${[['Быстро −8%', .92], ['Рынок', 1], ['Выгодно +8%', 1.08], ['Смелая +20%', 1.2]].map(c => `<button class="chip" data-k="${c[1]}">${c[0]}</button>`).join('')}</div>
      <div id="spHint" class="small" style="min-height:38px;margin-bottom:8px"></div>
      <div class="field"><label>Описание</label><textarea class="inp" id="sd" maxlength="400" placeholder="Расскажите о состоянии, комплекте…">${esc(G.MODEL_BY_ID[p.modelId].n)} в ${PD.CONDITIONS[p.cond].name.toLowerCase()} состоянии. Аккумулятор ${p.bat}%.</textarea></div>
      <div class="row"><button class="btn g sp" data-pub>Опубликовать</button></div>
      <button class="btn l blk mt" data-qs>Скупка сразу за ${rub(bb)}</button>`);
    const inp = sc.querySelector('#sp'), hint = sc.querySelector('#spHint');
    const upd = () => { const v = parseInt(inp.value.replace(/\D/g, '')) || 0; inp.value = v || ''; const r = v / fair; hint.innerHTML = !v ? '' : r < .93 ? `<span style="color:var(--grnD)">⚡ Ниже рынка — покупатели появятся быстро</span>` : r <= 1.08 ? 'Рыночная цена — предложения придут в течение пары минут' : r <= 1.3 ? `<span style="color:var(--ora)">Выше рынка — покупатели будут торговаться</span>` : `<span style="color:var(--red)">Слишком дорого — предложений почти не будет</span>`; };
    inp.addEventListener('input', upd); upd();
    sc.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { PD.snd.play('tap'); inp.value = Math.round(fair * +b.dataset.k / 50) * 50; upd(); });
    sc.querySelector('[data-pub]').onclick = () => { const v = parseInt(inp.value) || 0; if (v < 500) { PD.snd.play('err'); return; } const l = eco.createListing(uid, v, sc.querySelector('#sd').value); ui.closeModal(sc); if (l) { PD.snd.play('ok'); ui.rerender(); } };
    sc.querySelector('[data-qs]').onclick = async () => { ui.closeModal(sc); const ok = await ui.confirm({ title: 'Продать скупке?', html: `${esc(m.n)} за <b>${rub(bb)}</b>.<br><span class="muted">Мгновенно, но ниже рынка (${rub(fair)}).</span>`, ok: 'Продать сразу', danger: true, icon: 'tag' }); if (ok) { eco.quickSell(uid); PD.snd.play('sell'); ui.rerender(); } };
  };

  /* ---------- ИЗБРАННОЕ / ИСТОРИЯ / СООБЩЕНИЯ ---------- */
  SC.favs = { render() { const s = S(); const a = s.favs.map(id => eco.listing(id)).filter(Boolean); return ui.header('Избранное', { noBack: true, right: ui.balance() }) + (a.length ? `<div class="grid" style="margin-top:6px">${a.map((l, i) => ui.listingCard(l, i)).join('')}</div>` : ui.empty('heart', 'В избранном пусто', 'Нажмите ♡ на объявлении, чтобы сохранить его', '<button class="btn" data-act="tab" data-arg="home">К объявлениям</button>')); } };
  SC.viewed = { render() { const a = S().views.map(v => eco.listing(v.id)).filter(Boolean); return ui.header('История просмотров') + (a.length ? a.map(l => ui.rowListing(l)).join('') : ui.empty('eye', 'Вы ещё ничего не смотрели', '')); } };
  SC.messages = {
    render() {
      const s = S(); const chats = Object.values(s.chats).sort((a, b) => (b.upd || 0) - (a.upd || 0)); const un = s.notifs.filter(n => !n.read).length;
      return ui.header('Сообщения', { noBack: true, right: ui.balance() }) + `<button class="hl" data-act="go" data-arg="notifs"><div class="th" style="width:52px;height:52px;border-radius:50%;background:var(--priBg);color:var(--pri)">${ic('bell', 'width="26" height="26" style="stroke:currentColor;fill:none;stroke-width:1.9"')}</div><div class="tt"><b>Уведомления</b><div class="small muted">Покупки, продажи, поездки</div></div>${un ? `<span class="pill" style="background:var(--red);color:#fff">${un}</span>` : ''}</button>` +
        (chats.length ? chats.map(c => { const last = c.msgs[c.msgs.length - 1]; const mine = c.kind === 'sell'; let th, nm; if (mine) { const l = s.myListings.find(x => x.id === c.lid), p = l && eco.byUid(l.phoneUid); th = p ? img(p.modelId, p.colorIdx, 'back', p.cond) : ''; nm = 'Покупатели: ' + (p ? G.MODEL_BY_ID[p.modelId].n : 'объявление'); } else { th = img(c.snap.modelId, c.snap.colorIdx, 'back', c.snap.cond); nm = c.snap.seller + ' · ' + G.MODEL_BY_ID[c.snap.modelId].n; }
          return `<button class="hl" data-act="openChatId" data-arg="${c.id}"><div class="th">${th}</div><div class="tt"><b>${esc(nm)}</b><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(last ? (last.text || '') : '')}</div></div><div class="xs muted" style="text-align:right">${U.ago(c.upd || 0)}${c.unread ? `<br><span class="pill" style="background:var(--pri);color:#fff;padding:1px 7px">${c.unread}</span>` : ''}</div></button>`; }).join('') : ui.empty('chat', 'Сообщений пока нет', 'Напишите продавцу или выставьте свой телефон на продажу', ''));
    }
  };
  A.openChatId = id => ui.go('chat', { id });
  SC.notifs = {
    render() { const n = S().notifs; setTimeout(() => { n.forEach(x => x.read = true); PD.save(); ui.renderNav(); }, 800); return ui.header('Уведомления', { right: n.length ? `<button class="btn l sm" data-act="clearN">Очистить</button>` : '' }) + (n.length ? n.map(x => `<div class="hl" style="cursor:default"><div class="th" style="width:44px;height:44px;border-radius:50%;background:${x.kind === 'ok' ? 'rgba(4,224,97,.16)' : x.kind === 'msg' ? 'rgba(150,94,235,.16)' : 'var(--priBg)'};color:${x.kind === 'ok' ? 'var(--grnD)' : x.kind === 'msg' ? 'var(--pur)' : 'var(--pri)'}">${ic(x.kind === 'ok' ? 'check' : x.kind === 'msg' ? 'chat' : 'bell', 'width="22" height="22" style="stroke:currentColor;fill:none;stroke-width:2"')}</div><div class="tt"><b style="white-space:normal">${esc(x.title)}</b><div class="small muted">${esc(x.text)}</div></div><span class="xs muted">${U.ago(x.ts)}</span></div>`).join('') : ui.empty('bell', 'Уведомлений нет', '')); }
  };
  A.clearN = () => { S().notifs = []; PD.save(); ui.rerender(); };
})(window);
