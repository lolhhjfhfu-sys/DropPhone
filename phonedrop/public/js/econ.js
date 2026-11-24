/* PHONE DROP 2.0.0 — экономика: рынок, торг, обмен, продажи, кейсы, промокоды, поездки */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u;
  const EPOCH_MS = 20 * 60 * 1000;   // рынок обновляется каждые 20 игровых минут
  const MAXTOTAL = Math.max.apply(null, G.MODELS.map(m => m.total));
  const eco = PD.eco = {};
  const S = () => PD.S;

  /* ---------- время ---------- */
  eco.now = () => Date.now() + (S().timeShift || 0);
  eco.epoch = () => Math.floor(eco.now() / EPOCH_MS);
  eco.epochLeft = () => EPOCH_MS - (eco.now() % EPOCH_MS);
  eco.refreshMarket = () => { S().timeShift += eco.epochLeft() + 1000; PD.save(); };

  /* ---------- цены ---------- */
  function drift(modelId, epoch) { return 0.97 + U.mulberry(U.hashStr(modelId + ':' + Math.floor(epoch / 6)))() * 0.07; }
  eco.priceOf = function (modelId, cond, stIdx, bat, cityPm, ep) {
    const m = G.MODEL_BY_ID[modelId];
    let p = m.price * PD.CONDITIONS[cond].mul * (PD.STORAGE_MUL[stIdx] || 1) * (0.94 + (bat || 90) * 0.0006);
    p *= (cityPm || 1) * drift(modelId, ep == null ? eco.epoch() : ep);
    return Math.max(500, Math.round(p / 50) * 50);
  };
  eco.fair = function (p) { // рыночная стоимость телефона игрока в его текущем городе
    const c = PD.CITY_BY_ID[S().city];
    return eco.priceOf(p.modelId, p.cond, p.stIdx, p.bat, c.pm);
  };
  eco.buyback = p => Math.max(300, Math.round(eco.fair(p) * 0.66 / 50) * 50);   // мгновенная скупка
  eco.storageLabel = (m, i) => { const v = m.st[i]; return v >= 1024 ? (v / 1024) + ' ТБ' : v + ' ГБ'; };

  /* ---------- телефон (экземпляр) ---------- */
  eco.makePhone = function (modelId, o) {
    o = o || {}; const m = G.MODEL_BY_ID[modelId];
    const cond = o.cond || 'excellent', cr = PD.CONDITIONS[cond].bat;
    const bat = o.bat || Math.round(cr[0] + Math.random() * (cr[1] - cr[0]));
    const d = () => Math.floor(Math.random() * 10);
    return {
      uid: U.uidGen(), modelId, colorIdx: o.colorIdx != null ? o.colorIdx : Math.floor(Math.random() * m.colors.length),
      stIdx: o.stIdx != null ? o.stIdx : 0, cond, bat, paid: o.price || 0, boughtAt: Date.now(), src: o.src || 'Покупка', city: o.city || S().city,
      imei: '35' + Array.from({ length: 13 }, d).join(''), serial: (m.br === 'Apple' ? 'F' : 'R') + Math.random().toString(36).slice(2, 12).toUpperCase(),
      os: { wall: 0, bright: 70, vol: 50, gallery: [], launched: false, bootCount: 0, dark: false }, listing: null
    };
  };
  eco.rating = function (p) {
    const m = G.MODEL_BY_ID[p.modelId];
    const cw = { new: 100, excellent: 90, good: 72, damaged: 38 }[p.cond];
    const perf = Math.min(100, m.total / MAXTOTAL * 100);
    const score = Math.round(cw * 0.4 + perf * 0.4 + p.bat * 0.2);
    return { score, stars: Math.max(1, Math.min(5, Math.round(score / 20 * 2) / 2)) };
  };
  eco.phoneName = p => { const m = G.MODEL_BY_ID[p.modelId]; return m.n; };
  eco.phoneFull = p => { const m = G.MODEL_BY_ID[p.modelId]; return `${m.n}, ${eco.storageLabel(m, p.stIdx)}, ${m.colors[p.colorIdx].name}`; };
  eco.byUid = uid => S().phones.find(p => p.uid === uid);

  /* ---------- объявления рынка ---------- */
  const lcache = {};
  function pickWeighted(r, arr, wf) { let t = 0; const w = arr.map(a => { const v = wf(a); t += v; return v; }); let x = r() * t; for (let i = 0; i < arr.length; i++) { x -= w[i]; if (x <= 0) return arr[i]; } return arr[arr.length - 1]; }
  const NEWSET = new Set(['ip15pm', 'ip16pm', 's24fe', 'x14t', 'pix8p', 'pf7p', 'nt2a', 'op13r']);
  const LEGACY = G.MODELS.filter(a => !NEWSET.has(a.id));
  eco.genCity = function (cityId, epoch) {
    const key = cityId + ':' + epoch; if (lcache[key]) return lcache[key];
    const r = U.mulberry(U.hashStr('pd2|' + key)), city = PD.CITY_BY_ID[cityId];
    const n = 11 + Math.round(Math.min(7, city.pop * 0.75));
    const out = [];
    const used = new Set();
    for (let i = 0; i < n; i++) {
      let m, tries = 0;
      const starter = i < 2; // в каждом городе всегда есть доступные варианты для стартового бюджета
      if (starter) { const pool = G.MODELS.filter(a => a.tier === 1); do { m = pool[Math.floor(r() * pool.length)]; tries++; } while (used.has(m.id) && tries < 8); }
      else do { m = pickWeighted(r, LEGACY, a => (1 / (1 + (a.tier - 1) * 0.28)) * (a.br === 'Apple' ? 1.5 : a.br === 'Samsung' ? 1.3 : 1)); tries++; } while (used.has(m.id) && tries < 5);
      if (!starter) { const r2 = U.mulberry(U.hashStr('pd21|' + key + ':' + i)); if (r2() < 0.24) { const pool = G.MODELS.filter(a => NEWSET.has(a.id) && !used.has(a.id)); if (pool.length) m = pool[Math.floor(r2() * pool.length)]; } }
      used.add(m.id);
      const condR = r(); let cond = condR < 0.08 ? 'new' : condR < 0.38 ? 'excellent' : condR < 0.76 ? 'good' : 'damaged';
      if (starter) { cond = r() < .5 ? 'damaged' : 'good'; if (m.price * PD.CONDITIONS[cond].mul * city.pm * 1.07 > 9800) cond = 'damaged'; }
      const sr = r(); const stIdx = Math.min(m.st.length - 1, sr < .5 ? 0 : sr < .8 ? 1 : sr < .95 ? 2 : 3);
      const cr = PD.CONDITIONS[cond].bat; const bat = Math.round(cr[0] + r() * (cr[1] - cr[0]));
      const fair = eco.priceOf(m.id, cond, stIdx, bat, city.pm, epoch);
      const kind = r(); const f = starter ? .84 + r() * .16 : kind < .22 ? .76 + r() * .15 : kind < .78 ? .95 + r() * .13 : 1.1 + r() * .2;
      const ask = Math.max(500, Math.round(fair * f / 100) * 100 - (r() < .5 ? 10 : 0));
      const reserve = Math.max(Math.round(fair * 0.7), Math.round(ask * (0.82 + r() * 0.12)));
      const male = r() < .62; const nm = (male ? PD.NAMES_M : PD.NAMES_F)[Math.floor(r() * (male ? PD.NAMES_M.length : PD.NAMES_F.length))];
      const posted = epoch * EPOCH_MS - Math.floor(r() * 3 * 86400000) + Math.floor(r() * EPOCH_MS);
      out.push({
        id: key + ':' + i, city: cityId, modelId: m.id, colorIdx: Math.floor(r() * m.colors.length), stIdx, cond, bat, ask, reserve, fair,
        seller: { name: nm, rating: +(3.9 + r() * 1.1).toFixed(1), deals: Math.floor(r() * 120) + 1, since: 2016 + Math.floor(r() * 10), shop: r() < .12 },
        note: PD.SELLER_NOTES[Math.floor(r() * PD.SELLER_NOTES.length)], posted, views: 20 + Math.floor(r() * 400), box: cond === 'new' || r() < .5,
        bargain: ask <= fair * 0.92
      });
    }
    lcache[key] = out; return out;
  };
  eco.listings = function () {
    const ep = eco.epoch(), taken = new Set(S().taken);
    let all = []; PD.CITIES.forEach(c => { all = all.concat(eco.genCity(c.id, ep)); });
    return all.filter(l => !taken.has(l.id));
  };
  eco.listing = function (id) {
    const parts = String(id).split(':'); if (parts.length < 3) return null;
    const arr = eco.genCity(parts[0], +parts[1]); return arr.find(l => l.id === id) || null;
  };
  eco.isActive = l => l && +l.id.split(':')[1] === eco.epoch() && !S().taken.includes(l.id);

  /* ---------- операции ---------- */
  eco.tx = function (type, title, amount, extra) {
    const t = Object.assign({ id: U.uidGen(), ts: Date.now(), type, title, amount, bal: S().money }, extra || {});
    S().tx.unshift(t); if (S().tx.length > 400) S().tx.length = 400; return t;
  };
  eco.notify = function (title, text, kind) {
    S().notifs.unshift({ id: U.uidGen(), ts: Date.now(), title, text, kind: kind || 'info', read: false });
    if (S().notifs.length > 80) S().notifs.length = 80;
    PD.ui && PD.ui.notify(title, text, kind);
  };
  eco.addXp = function (n) {
    const s = S(), before = eco.level().lvl; s.xp += n; const after = eco.level().lvl;
    if (after > before) setTimeout(() => PD.ui && PD.ui.notify('Новый уровень!', 'Вы достигли уровня ' + after + ' — «' + eco.level().title + '»', 'ok'), 600);
  };
  eco.level = function () {
    const xp = S().xp, titles = ['Новичок', 'Перекупщик', 'Знаток рынка', 'Опытный флиппер', 'Коллекционер', 'Эксперт Avito', 'Магнат гаджетов', 'Легенда рынка'];
    const lvl = Math.floor(Math.sqrt(xp / 40)) + 1, base = (lvl - 1) ** 2 * 40, next = lvl ** 2 * 40;
    return { lvl, xp, cur: xp - base, need: next - base, title: titles[Math.min(titles.length - 1, lvl - 1)] };
  };
  eco.netWorth = () => S().money + S().phones.reduce((a, p) => a + eco.fair(p), 0);

  eco.canBuyHere = l => l.city === S().city;
  eco.buy = function (l, price) {
    const s = S();
    if (!eco.isActive(l)) return { ok: false, err: 'Объявление уже неактуально' };
    if (!eco.canBuyHere(l)) return { ok: false, err: 'Телефон в другом городе: ' + PD.CITY_BY_ID[l.city].name };
    if (s.money < price) return { ok: false, err: 'Не хватает ' + U.rub(price - s.money) };
    s.money -= price; s.taken.push(l.id); if (s.taken.length > 600) s.taken.splice(0, 200);
    const ph = eco.makePhone(l.modelId, { colorIdx: l.colorIdx, stIdx: l.stIdx, cond: l.cond, bat: l.bat, price, src: 'Avito · ' + l.seller.name, city: l.city });
    s.phones.unshift(ph);
    s.stats.deals++; s.stats.bought++; s.stats.spent += price;
    eco.tx('buy', 'Покупка: ' + eco.phoneName(ph), -price, { phoneUid: ph.uid, modelId: ph.modelId, cond: ph.cond });
    eco.addXp(10 + Math.round(price / 4000));
    const ch = s.chats[l.id]; if (ch) { ch.closed = 'bought'; ch.msgs.push({ id: U.uidGen(), from: 'sys', text: 'Сделка завершена: вы купили телефон за ' + U.rub(price), ts: Date.now() }); }
    eco.notify('Покупка завершена', eco.phoneName(ph) + ' за ' + U.rub(price), 'ok');
    PD.save(); return { ok: true, phone: ph };
  };

  /* ---------- чаты и торг ---------- */
  eco.chat = function (l) {
    const s = S(); let ch = s.chats[l.id];
    if (!ch) {
      ch = s.chats[l.id] = { id: l.id, kind: 'buy', snap: { modelId: l.modelId, colorIdx: l.colorIdx, stIdx: l.stIdx, cond: l.cond, bat: l.bat, ask: l.ask, city: l.city, seller: l.seller.name }, msgs: [], rounds: 0, deal: null, unread: 0, upd: Date.now(), closed: null };
      ch.msgs.push({ id: U.uidGen(), from: 'seller', ts: Date.now(), text: 'Здравствуйте! Объявление актуально. ' + l.note });
      PD.save();
    }
    return ch;
  };
  eco.offer = function (l, offer) {
    const s = S(), ch = eco.chat(l);
    offer = Math.round(offer);
    ch.msgs.push({ id: U.uidGen(), from: 'me', ts: Date.now(), text: 'Предлагаю ' + U.rub(offer), kind: 'offer', amount: offer });
    let reply, res;
    if (!eco.isActive(l)) { reply = 'Извините, телефон уже продан.'; res = 'gone'; }
    else if (ch.rounds >= 4) { reply = 'Давайте закончим, цена окончательная.'; res = 'block'; }
    else {
      ch.rounds++;
      const reserve = l.reserve;
      if (offer >= l.ask) { reply = 'Отлично, договорились! Забирайте за ' + U.rub(l.ask) + '.'; ch.deal = { price: l.ask, ts: Date.now() }; res = 'accept'; }
      else if (offer >= reserve) { reply = ['Хорошо, по рукам — ' + U.rub(offer) + '.', 'Ладно, согласен на ' + U.rub(offer) + '. Когда заберёте?', 'Идёт, уступлю до ' + U.rub(offer) + '.'][ch.rounds % 3]; ch.deal = { price: offer, ts: Date.now() }; res = 'accept'; }
      else if (offer >= reserve * 0.9) { const c = Math.max(reserve, Math.round((offer + l.ask) / 2 / 50) * 50); const cc = Math.min(l.ask, Math.max(c, reserve)); reply = 'Могу уступить до ' + U.rub(cc) + ', дешевле не получится.'; ch.counter = cc; res = 'counter'; ch.deal = null; }
      else if (offer >= reserve * 0.75) { reply = ['Это слишком низко, давайте ближе к ' + U.rub(Math.round((reserve * 1.04) / 50) * 50) + '.', 'Нет, за такие деньги не отдам.', 'Почти торг, но ниже рынка. Предложите больше.'][ch.rounds % 3]; res = 'reject'; ch.deal = null; }
      else { reply = 'Вы шутите? Это в разы ниже цены.'; res = 'reject'; ch.deal = null; }
    }
    ch.msgs.push({ id: U.uidGen(), from: 'seller', ts: Date.now() + 1, text: reply, kind: res === 'counter' ? 'counter' : (res === 'accept' ? 'accept' : undefined), amount: res === 'counter' ? ch.counter : (res === 'accept' ? ch.deal.price : undefined) });
    ch.upd = Date.now(); PD.save(); return { res, reply };
  };
  eco.acceptCounter = function (l) { const ch = eco.chat(l); if (!ch.counter) return false; ch.deal = { price: ch.counter, ts: Date.now() }; ch.msgs.push({ id: U.uidGen(), from: 'me', ts: Date.now(), text: 'Согласен на ' + U.rub(ch.counter) }); ch.msgs.push({ id: U.uidGen(), from: 'seller', ts: Date.now() + 1, text: 'Отлично! Жду вас, цена ' + U.rub(ch.counter) + '.', kind: 'accept', amount: ch.counter }); ch.counter = null; PD.save(); return true; };
  eco.message = function (l, text) {
    const ch = eco.chat(l); text = String(text).slice(0, 300);
    ch.msgs.push({ id: U.uidGen(), from: 'me', ts: Date.now(), text });
    const t = text.toLowerCase(); let reply;
    if (/торг|скидк|уступ|дешевле/.test(t)) reply = 'Торг возможен — напишите свою цену кнопкой «Предложить цену».';
    else if (/обмен|махн|трейд/.test(t)) reply = 'Рассмотрю обмен. Нажмите «Обмен» и выберите свой телефон — оценю.';
    else if (/состоян|царап|трещ|скол/.test(t)) reply = 'Состояние: ' + PD.CONDITIONS[l.cond].name.toLowerCase() + '. ' + PD.CONDITIONS[l.cond].desc + '.';
    else if (/акб|аккум|батаре/.test(t)) reply = 'Ёмкость аккумулятора ' + l.bat + '%.';
    else if (/коробк|комплект|заряд/.test(t)) reply = l.box ? 'Коробка и кабель в комплекте.' : 'Только телефон, коробки нет.';
    else if (/где|адрес|встреч|город/.test(t)) reply = 'Встреча в городе: ' + PD.CITY_BY_ID[l.city].name + ', у метро/в ТЦ.';
    else if (/привет|здравств|добр/.test(t)) reply = 'Здравствуйте! Слушаю вас.';
    else reply = ['Да, всё актуально.', 'Звоните/пишите, отвечу.', 'Готов показать телефон при встрече.'][Math.floor(Math.random() * 3)];
    setTimeout(() => { ch.msgs.push({ id: U.uidGen(), from: 'seller', ts: Date.now(), text: reply }); ch.upd = Date.now(); ch.unread = (ch.unread || 0) + 1; PD.save(); PD.ui && PD.ui.onChat && PD.ui.onChat(l.id); PD.snd.play('msg'); }, 700 + Math.random() * 700);
    ch.upd = Date.now(); PD.save();
  };

  /* ---------- обмен ---------- */
  eco.tradeValue = p => Math.round(eco.fair(p) * 0.92 / 50) * 50;
  eco.tradeEval = function (l, phone) {
    const val = eco.tradeValue(phone), need = Math.round(l.reserve * 1.03 / 50) * 50;
    if (val >= need) {
      const change = Math.max(0, Math.round(Math.min(val - l.ask, val - need) * 0.5 / 50) * 50);
      return { ok: true, extra: 0, change: val > l.ask ? change : 0, val, need };
    }
    return { ok: false, extra: need - val, val, need };
  };
  eco.trade = function (l, phoneUid, extra) {
    const s = S(), p = eco.byUid(phoneUid);
    if (!p) return { ok: false, err: 'Телефон не найден' };
    if (p.listing) return { ok: false, err: 'Телефон выставлен на продажу — снимите объявление' };
    if (!eco.isActive(l)) return { ok: false, err: 'Объявление уже неактуально' };
    if (!eco.canBuyHere(l)) return { ok: false, err: 'Для обмена нужно быть в городе ' + PD.CITY_BY_ID[l.city].name };
    const ev = eco.tradeEval(l, p); const pay = Math.max(ev.extra, +extra || 0);
    if (!ev.ok && (+extra || 0) < ev.extra) return { ok: false, err: 'Нужна доплата ' + U.rub(ev.extra) };
    const net = ev.ok ? ev.change : -pay;
    if (s.money + net < 0) return { ok: false, err: 'Не хватает ' + U.rub(-(s.money + net)) };
    s.phones = s.phones.filter(x => x.uid !== p.uid);
    s.soldPhones.unshift({ uid: p.uid, modelId: p.modelId, cond: p.cond, paid: p.paid, price: ev.val, ts: Date.now(), via: 'trade' }); if (s.soldPhones.length > 200) s.soldPhones.length = 200;
    s.money += net; s.taken.push(l.id);
    const ph = eco.makePhone(l.modelId, { colorIdx: l.colorIdx, stIdx: l.stIdx, cond: l.cond, bat: l.bat, price: l.ask, src: 'Обмен · ' + l.seller.name, city: l.city });
    s.phones.unshift(ph);
    s.stats.deals++; s.stats.bought++; s.stats.sold++;
    eco.tx('trade', 'Обмен: ' + eco.phoneName(p) + ' → ' + eco.phoneName(ph), net, { phoneUid: ph.uid });
    eco.addXp(18);
    eco.notify('Обмен завершён', eco.phoneName(p) + ' → ' + eco.phoneName(ph) + (net ? ' (' + (net > 0 ? '+' : '') + U.rub(net) + ')' : ''), 'ok');
    const ch = s.chats[l.id]; if (ch) { ch.closed = 'traded'; ch.msgs.push({ id: U.uidGen(), from: 'sys', text: 'Обмен завершён', ts: Date.now() }); }
    PD.save(); return { ok: true, phone: ph, net };
  };

  /* ---------- продажа ---------- */
  eco.completeSale = function (p, price, who, via) {
    const s = S();
    s.phones = s.phones.filter(x => x.uid !== p.uid);
    s.money += price; s.stats.deals++; s.stats.sold++; s.stats.earned += price;
    const profit = price - (p.paid || 0); if (p.paid && profit > s.stats.bestProfit) s.stats.bestProfit = profit;
    s.soldPhones.unshift({ uid: p.uid, modelId: p.modelId, cond: p.cond, paid: p.paid, price, ts: Date.now(), via, buyer: who }); if (s.soldPhones.length > 200) s.soldPhones.length = 200;
    eco.tx('sell', 'Продажа: ' + eco.phoneName(p), price, { phoneUid: p.uid, modelId: p.modelId, profit: p.paid ? profit : null, via });
    eco.addXp(12 + Math.round(price / 4000));
    eco.notify('Телефон продан', eco.phoneName(p) + ' — ' + U.rub(price) + (who ? ' · ' + who : ''), 'ok');
    PD.save();
  };
  eco.quickSell = function (uid) { const p = eco.byUid(uid); if (!p) return false; if (p.listing) eco.unlist(p.listing); eco.completeSale(p, eco.buyback(p), 'Скупка «ТехноЛом»', 'buyback'); return true; };
  eco.createListing = function (uid, price, desc) {
    const s = S(), p = eco.byUid(uid); if (!p || p.listing) return null;
    price = Math.round(price); if (!(price >= 500)) return null;
    const l = { id: 'my' + U.uidGen(), phoneUid: uid, price, desc: String(desc || '').slice(0, 400), created: Date.now(), status: 'active', offers: 0, views: 0, favs: 0, city: s.city, nextOfferAt: Date.now() + 8000 + Math.random() * 14000, hinted: false };
    s.myListings.unshift(l); p.listing = l.id;
    s.chats['my:' + l.id] = { id: 'my:' + l.id, kind: 'sell', lid: l.id, msgs: [{ id: U.uidGen(), from: 'sys', text: 'Объявление опубликовано за ' + U.rub(price) + '. Покупатели скоро напишут.', ts: Date.now() }], unread: 0, upd: Date.now() };
    eco.tx('list', 'Объявление: ' + eco.phoneName(p), 0, { phoneUid: uid, price });
    eco.notify('Объявление опубликовано', eco.phoneName(p) + ' — ' + U.rub(price), 'ok'); PD.save(); return l;
  };
  eco.unlist = function (lid) {
    const s = S(), l = s.myListings.find(x => x.id === lid); if (!l) return;
    const p = eco.byUid(l.phoneUid); if (p) p.listing = null;
    l.status = 'closed'; const ch = s.chats['my:' + lid]; if (ch) { ch.msgs.push({ id: U.uidGen(), from: 'sys', text: 'Объявление снято с публикации', ts: Date.now() }); ch.msgs.forEach(m => { if (m.kind === 'boffer' && m.status === 'open') m.status = 'expired'; }); }
    PD.save();
  };
  eco.setListingPrice = function (lid, price) { const l = S().myListings.find(x => x.id === lid); if (!l || !(price >= 500)) return false; l.price = Math.round(price); l.nextOfferAt = Date.now() + 6000 + Math.random() * 10000; l.offers = Math.min(l.offers, 3); PD.save(); return true; };
  function buyerName() { const m = Math.random() < .6; const a = m ? PD.NAMES_M : PD.NAMES_F; return a[Math.floor(Math.random() * a.length)]; }
  // Игровой тик: покупатели присылают предложения по твоим объявлениям
  eco.tick = function () {
    const s = S(), now = Date.now(); let changed = false;
    s.myListings.forEach(l => {
      if (l.status !== 'active') return;
      const p = eco.byUid(l.phoneUid); if (!p) { l.status = 'closed'; return; }
      const ch = s.chats['my:' + l.id]; if (!ch) return;
      // старые неотвеченные офферы истекают
      ch.msgs.forEach(m => { if (m.kind === 'boffer' && m.status === 'open' && now > m.exp) { m.status = 'expired'; changed = true; } });
      if (now < l.nextOfferAt) return;
      const fair = eco.fair(p), ratio = l.price / fair;
      const open = ch.msgs.filter(m => m.kind === 'boffer' && m.status === 'open').length;
      if (open >= 2 || l.offers >= 7) { l.nextOfferAt = now + 20000; return; }
      if (ratio > 1.32) {
        if (!l.hinted) { l.hinted = true; ch.msgs.push({ id: U.uidGen(), from: 'sys', text: 'Просмотры есть, но предложений нет: цена выше рыночной (≈' + U.rub(fair) + '). Попробуйте снизить.', ts: now }); ch.unread = (ch.unread || 0) + 1; changed = true; }
        l.nextOfferAt = now + 25000; return;
      }
      const maxPay = Math.round(fair * (0.97 + Math.random() * 0.08) / 50) * 50;
      let f = ratio <= .9 ? .97 + Math.random() * .03 : ratio <= 1.05 ? .88 + Math.random() * .09 : .78 + Math.random() * .12;
      let amount = Math.min(l.price, Math.round(l.price * f / 50) * 50);
      if (ratio > 1.15 && Math.random() < .45) { l.nextOfferAt = now + 15000 + Math.random() * 15000; return; }
      l.offers++; l.views += 3 + Math.floor(Math.random() * 12);
      const who = buyerName();
      ch.msgs.push({ id: U.uidGen(), from: 'buyer', who, ts: now, kind: 'boffer', amount, max: maxPay, status: 'open', exp: now + 6 * 60 * 1000, text: who + ' предлагает ' + U.rub(amount) });
      ch.unread = (ch.unread || 0) + 1; ch.upd = now;
      l.nextOfferAt = now + (ratio <= 1 ? 14000 : 26000) + Math.random() * 20000;
      eco.notify('Новое предложение', who + ' хочет купить ' + eco.phoneName(p) + ' за ' + U.rub(amount), 'msg');
      PD.snd.play('msg'); changed = true;
    });
    if (changed) { PD.save(); PD.ui && PD.ui.onTick && PD.ui.onTick(); }
  };
  eco.acceptBuyerOffer = function (lid, mid, price) {
    const s = S(), l = s.myListings.find(x => x.id === lid), ch = s.chats['my:' + lid]; if (!l || !ch || l.status !== 'active') return false;
    const m = ch.msgs.find(x => x.id === mid); if (!m || m.status !== 'open') return false;
    const p = eco.byUid(l.phoneUid); if (!p) return false;
    const amt = price != null ? price : m.amount;
    m.status = 'accepted'; m.final = amt; l.status = 'sold'; p.listing = null;
    ch.msgs.push({ id: U.uidGen(), from: 'sys', ts: Date.now(), text: 'Продано ' + m.who + ' за ' + U.rub(amt) });
    eco.completeSale(p, amt, m.who, 'listing'); return true;
  };
  eco.counterBuyer = function (lid, mid, price) {
    const s = S(), ch = s.chats['my:' + lid]; if (!ch) return null;
    const m = ch.msgs.find(x => x.id === mid); if (!m || m.status !== 'open') return null;
    price = Math.round(price);
    ch.msgs.push({ id: U.uidGen(), from: 'me', ts: Date.now(), text: 'Контрпредложение: ' + U.rub(price) });
    if (price <= m.max) { ch.msgs.push({ id: U.uidGen(), from: 'buyer', who: m.who, ts: Date.now() + 1, text: m.who + ': «Согласен!»' }); PD.save(); eco.acceptBuyerOffer(lid, mid, price); return 'accept'; }
    if (price <= m.max * 1.06) { const c = Math.round(m.max / 50) * 50; m.status = 'countered'; ch.msgs.push({ id: U.uidGen(), from: 'buyer', who: m.who, ts: Date.now() + 1, kind: 'boffer', status: 'open', amount: c, max: c, exp: Date.now() + 5 * 60000, text: m.who + ' готов дать максимум ' + U.rub(c) }); PD.save(); return 'counter'; }
    m.status = 'declined'; ch.msgs.push({ id: U.uidGen(), from: 'buyer', who: m.who, ts: Date.now() + 1, text: m.who + ': «Слишком дорого, спасибо.»' }); PD.save(); return 'reject';
  };
  eco.declineBuyer = function (lid, mid) { const ch = S().chats['my:' + lid]; const m = ch && ch.msgs.find(x => x.id === mid); if (!m) return; m.status = 'declined'; PD.save(); };

  /* ---------- кейсы ---------- */
  eco.caseTable = function (id) {
    const c = PD.CASE_BY_ID[id], tot = c.drops.reduce((a, d) => a + d.w, 0);
    return c.drops.map(d => ({ r: d.r, pct: d.w / tot * 100, models: d.m, each: d.w / tot * 100 / d.m.length }));
  };
  eco.roll = function (id, rnd) {
    const c = PD.CASE_BY_ID[id], tot = c.drops.reduce((a, d) => a + d.w, 0);
    rnd = rnd || U.secureRand;
    let x = rnd() * tot, drop = c.drops[c.drops.length - 1];
    for (const d of c.drops) { x -= d.w; if (x < 0) { drop = d; break; } }
    const modelId = drop.m[Math.floor(rnd() * drop.m.length)];
    let y = rnd() * 100, cond = 'damaged';
    for (const k of PD.COND_ORDER) { y -= c.cond[k]; if (y < 0) { cond = k; break; } }
    return { rarity: drop.r, modelId, cond };
  };
  eco.openCase = function (id, fromInv) {
    const s = S(), c = PD.CASE_BY_ID[id];
    if (fromInv) { if ((s.casesInv[id] || 0) < 1) return { ok: false, err: 'Нет такого кейса в инвентаре' }; }
    else if (s.money < c.price) return { ok: false, err: 'Не хватает ' + U.rub(c.price - s.money) };
    const res = eco.roll(id);
    const m = G.MODEL_BY_ID[res.modelId];
    if (fromInv) s.casesInv[id]--; else { s.money -= c.price; eco.tx('case', 'Покупка кейса: ' + c.name, -c.price, { caseId: id }); }
    const ph = eco.makePhone(res.modelId, { cond: res.cond, stIdx: Math.floor(Math.random() * Math.min(2, m.st.length)), price: fromInv ? 0 : c.price, src: c.name });
    ph.rarity = res.rarity; s.phones.unshift(ph);
    s.casesOpened++; s.stats.cases = (s.stats.cases || 0) + 1;
    s.caseHistory.unshift({ ts: Date.now(), caseId: id, modelId: res.modelId, cond: res.cond, rarity: res.rarity, uid: ph.uid }); if (s.caseHistory.length > 100) s.caseHistory.length = 100;
    eco.tx('drop', 'Кейс: выпал ' + m.n, 0, { phoneUid: ph.uid, rarity: res.rarity });
    eco.addXp({ common: 4, rare: 8, epic: 16, legendary: 30, mythic: 60 }[res.rarity]);
    PD.save(); return { ok: true, phone: ph, res };
  };
  eco.buyCase = function (id, n) { const s = S(), c = PD.CASE_BY_ID[id]; n = n || 1; const cost = c.price * n; if (s.money < cost) return { ok: false, err: 'Не хватает ' + U.rub(cost - s.money) }; s.money -= cost; s.casesInv[id] = (s.casesInv[id] || 0) + n; eco.tx('case', 'Покупка кейса: ' + c.name + (n > 1 ? ' ×' + n : ''), -cost, { caseId: id }); PD.save(); return { ok: true }; };

  /* ---------- промокоды ---------- */
  eco.applyRewards = function (title, rewards) {
    const s = S(), lines = [];
    rewards.forEach(r => {
      if (r.t === 'money') { s.money += r.v; eco.tx('promo', 'Промокод: ' + title, r.v); lines.push('+' + U.rub(r.v)); }
      else if (r.t === 'case') { const c = PD.CASE_BY_ID[r.id]; if (c) { s.casesInv[r.id] = (s.casesInv[r.id] || 0) + (r.n || 1); lines.push((r.n || 1) + '× ' + c.name); } }
      else if (r.t === 'phone') { const m = G.MODEL_BY_ID[r.id]; if (m) { const ph = eco.makePhone(r.id, { cond: r.cond || 'excellent', src: 'Промокод', price: 0 }); s.phones.unshift(ph); eco.tx('promo', 'Промокод: ' + m.n, 0, { phoneUid: ph.uid }); lines.push(m.n + ' (' + PD.CONDITIONS[ph.cond].name.toLowerCase() + ')'); } }
    });
    return lines;
  };
  eco.redeem = async function (raw) {
    const s = S(), code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { ok: false, err: 'Неверный формат кода' };
    if (s.promos.some(p => p.code === code)) return { ok: false, err: 'Этот промокод уже активирован' };
    let r;
    try { r = await PD.net.req('POST', '/api/promo', { code }); PD.net.online = true; }
    catch (e) { // офлайн-режим: проверяем по встроенному списку
      const p = PD.PROMOS[code]; if (!p) return { ok: false, err: 'Промокод не найден (нет связи с сервером)' };
      r = { ok: true, code, title: p.title, rewards: p.rewards, offline: true };
    }
    if (!r.ok) return { ok: false, err: r.error === 'used' ? 'Этот промокод уже активирован' : r.error === 'not_found' ? 'Промокод не найден' : r.error === 'invalid' ? 'Неверный формат кода' : 'Ошибка активации' };
    if (s.promos.some(p => p.code === code)) return { ok: false, err: 'Этот промокод уже активирован' };
    const lines = eco.applyRewards(r.title, r.rewards);
    s.promos.unshift({ code, ts: Date.now(), title: r.title, got: lines });
    eco.addXp(6); eco.notify('Промокод активирован', r.title + ': ' + lines.join(', '), 'ok'); PD.save();
    return { ok: true, title: r.title, lines };
  };
  eco.syncPromos = async function () { // подтягиваем с сервера коды, использованные на другом устройстве
    try { const r = await PD.net.req('GET', '/api/promos'); (r.used || []).forEach(u => { if (!S().promos.some(p => p.code === u.code)) S().promos.push({ code: u.code, ts: u.used_at, title: 'Активирован ранее', got: [] }); }); } catch (e) { }
  };

  /* ---------- ежедневный бонус ---------- */
  eco.dailyReady = () => new Date(S().daily || 0).toDateString() !== new Date().toDateString();
  eco.claimDaily = function () { if (!eco.dailyReady()) return false; const s = S(); s.daily = Date.now(); const v = 1500; s.money += v; eco.tx('bonus', 'Ежедневный бонус', v); eco.notify('Ежедневный бонус', '+' + U.rub(v), 'ok'); PD.save(); return true; };

  /* ---------- поездки ---------- */
  eco.travel = function (destId, type) {
    const s = S(), r = PD.routes(s.city, destId).find(x => x.type === type);
    if (!r) return { ok: false, err: 'Маршрут недоступен' };
    if (s.money < r.price) return { ok: false, err: 'Не хватает ' + U.rub(r.price - s.money) };
    const from = s.city; s.money -= r.price; s.city = destId; s.timeShift += Math.round(r.hours * 3600000);
    s.stats.trips++; s.trips.unshift({ ts: Date.now(), from, to: destId, type, price: r.price, hours: r.hours }); if (s.trips.length > 50) s.trips.length = 50;
    eco.tx('trip', r.name + ': ' + PD.CITY_BY_ID[from].name + ' → ' + PD.CITY_BY_ID[destId].name, -r.price);
    eco.addXp(8 + Math.round(r.km / 400)); eco.notify('Вы прибыли в ' + PD.CITY_BY_ID[destId].name, r.name + ' · ' + r.hours + ' ч в пути', 'ok');
    PD.save(); return { ok: true, r };
  };

  /* ---------- бенчмарк (движок результатов) ---------- */
  eco.benchRun = function (p, kind) {
    const m = G.MODEL_BY_ID[p.modelId], cf = { new: 1, excellent: .995, good: .98, damaged: .94 }[p.cond] * (0.97 + p.bat * 0.0003);
    const j = () => 0.965 + Math.random() * 0.07;
    const cpu = Math.round(m.cpu * 100 * cf * j()), gpu = Math.round(m.gpu * 100 * cf * j()), mem = Math.round(m.mem * 100 * cf * j()), ux = Math.round(m.ux * 100 * cf * j());
    return { cpu, gpu, mem, ux, total: cpu + gpu + mem + ux };
  };
  eco.benchRef = m => ({ cpu: m.cpu * 100, gpu: m.gpu * 100, mem: m.mem * 100, ux: m.ux * 100, total: m.total * 100 });
})(typeof window !== 'undefined' ? window : globalThis);
