/* PHONE DROP 2.0.0 — ядро: утилиты, звук, хранилище (IndexedDB + сервер + Telegram), состояние, миграция */
(function (G) {
  'use strict';
  const PD = G.PD = G.PD || {};
  const W = G;

  /* ---------- утилиты ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rub = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const uidGen = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  function mulberry(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function secureRand() { // равномерное число [0,1) из криптографического ГСЧ
    if (W.crypto && W.crypto.getRandomValues) { const a = new Uint32Array(2); W.crypto.getRandomValues(a); return (a[0] * 2097152 + (a[1] >>> 11)) / 9007199254740992; }
    return Math.random();
  }
  function ago(ts) {
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return 'только что'; if (d < 3600) return Math.floor(d / 60) + ' мин назад';
    if (d < 86400) return Math.floor(d / 3600) + ' ч назад'; if (d < 172800) return 'вчера';
    return Math.floor(d / 86400) + ' дн назад';
  }
  function dateStr(ts) { const d = new Date(ts); return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
  PD.u = { esc, rub, clamp, uidGen, mulberry, hashStr, secureRand, ago, dateStr, pick: (a, r) => a[Math.floor((r || Math.random)() * a.length)] };

  /* ---------- звук (WebAudio, всё синтезируется — файлов нет) ---------- */
  const Snd = {
    ctx: null, on: true, vol: .7,
    unlock() {
      if (!this.ctx) { const AC = W.AudioContext || W.webkitAudioContext; if (!AC) return; try { this.ctx = new AC(); } catch (e) { return; } }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone(f, d, o) {
      if (!this.on || !this.ctx) return; o = o || {};
      const c = this.ctx, t = c.currentTime + (o.at || 0);
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      const v = (o.v == null ? .18 : o.v) * this.vol * (this.mul == null ? 1 : this.mul);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, v), t + (o.a || .01));
      g.gain.exponentialRampToValueAtTime(.0001, t + d);
      osc.connect(g).connect(c.destination); osc.start(t); osc.stop(t + d + .05);
    },
    play(n, arg) {
      this.unlock(); if (!this.on || !this.ctx) return;
      const T = (f, d, o) => this.tone(f, d, o);
      switch (n) {
        case 'tap': T(520, .05, { type: 'triangle', v: .09 }); break;
        case 'nav': T(660, .06, { type: 'sine', v: .08 }); T(880, .06, { type: 'sine', v: .06, at: .04 }); break;
        case 'ok': T(660, .1, {}); T(990, .16, { at: .09 }); break;
        case 'buy': [784, 988, 1175, 1568].forEach((f, i) => T(f, .14, { type: 'triangle', at: i * .07, v: .16 })); break;
        case 'sell': [523, 659, 784, 1046].forEach((f, i) => T(f, .16, { type: 'sine', at: i * .08 })); T(2093, .3, { at: .34, v: .05 }); break;
        case 'err': T(220, .18, { type: 'sawtooth', v: .1 }); T(165, .24, { type: 'sawtooth', v: .1, at: .12 }); break;
        case 'msg': T(880, .09, { type: 'sine' }); T(1320, .14, { type: 'sine', at: .08, v: .12 }); break;
        case 'tick': T(300 + (arg || 0) * 18, .03, { type: 'square', v: .05 }); break;
        case 'rare': [660, 880, 1100].forEach((f, i) => T(f, .2, { at: i * .09 })); break;
        case 'epic': [523, 659, 784, 1046, 1318].forEach((f, i) => T(f, .22, { type: 'triangle', at: i * .08, v: .17 })); break;
        case 'legendary': [392, 523, 659, 784, 1046, 1318, 1568].forEach((f, i) => T(f, .3, { type: 'triangle', at: i * .07, v: .18 })); T(2093, .6, { at: .5, v: .08 }); break;
        case 'mythic': [196, 294, 392, 523, 659, 784, 1046, 1568].forEach((f, i) => T(f, .4, { type: 'sawtooth', at: i * .09, v: .1 })); T(110, 1.2, { type: 'sine', v: .3 }); T(2349, .8, { at: .7, v: .08 }); break;
        case 'boot': { // тема включения
          const b = arg || 'generic';
          if (b === 'Apple') { T(130, 1.8, { type: 'sine', v: .25, a: .05 }); T(196, 1.8, { type: 'sine', v: .18, a: .05 }); T(261, 1.8, { type: 'sine', v: .14, a: .05 }); T(392, 1.4, { type: 'sine', v: .08, at: .15 }); }
          else if (b === 'Samsung') { [523, 659, 784, 1046, 784].forEach((f, i) => T(f, .3, { at: i * .16, v: .14 })); }
          else if (b === 'Google') { [440, 554, 659, 880].forEach((f, i) => T(f, .28, { at: i * .12, type: 'triangle', v: .14 })); }
          else if (b === 'Nothing') { for (let i = 0; i < 8; i++) T(1800 + i * 90, .05, { type: 'square', v: .05, at: i * .09 }); T(440, .5, { at: .7, v: .12 }); }
          else if (b === 'Xiaomi' || b === 'Redmi' || b === 'POCO') { [392, 523, 659, 784].forEach((f, i) => T(f, .34, { at: i * .14, type: 'triangle', v: .15 })); }
          else { [330, 440, 554, 660].forEach((f, i) => T(f, .3, { at: i * .13, type: 'sine', v: .15 })); }
          break;
        }
        case 'shutter': T(2400, .03, { type: 'square', v: .09 }); T(1200, .05, { type: 'square', v: .09, at: .05 }); break;
        case 'lock': T(300, .08, { type: 'triangle', v: .12 }); T(200, .1, { type: 'triangle', v: .1, at: .06 }); break;
        case 'unlock': T(400, .08, { type: 'triangle', v: .12 }); T(600, .1, { type: 'triangle', v: .12, at: .07 }); break;
        case 'train': for (let i = 0; i < 6; i++) T(120, .08, { type: 'square', v: .06, at: i * .22 }); break;
        case 'plane': T(200, 1.4, { type: 'sawtooth', to: 700, v: .08 }); break;
        case 'bus': T(90, .9, { type: 'sawtooth', v: .08 }); break;
        case 'bench': T(1000, .04, { type: 'square', v: .04 }); break;
      }
    }
  };
  PD.snd = Snd;
  PD.hap = function (kind) {
    const S = PD.S; if (S && S.settings && !S.settings.haptic) return;
    try {
      const tg = W.Telegram && W.Telegram.WebApp; const hf = tg && tg.HapticFeedback;
      if (hf) { if (kind === 'ok') hf.notificationOccurred('success'); else if (kind === 'err') hf.notificationOccurred('error'); else if (kind === 'heavy') hf.impactOccurred('heavy'); else hf.impactOccurred('light'); }
      else if (navigator.vibrate) navigator.vibrate(kind === 'heavy' ? 30 : kind === 'err' ? [20, 40, 20] : 10);
    } catch (e) { }
  };

  /* ---------- состояние по умолчанию ---------- */
  function defaultState() {
    const now = Date.now();
    return {
      version: PD.APP_VERSION, schema: 2, createdAt: now, updatedAt: now, syncRev: 0,
      money: PD.START_MONEY, city: 'msk', timeShift: 0,
      phones: [], soldPhones: [], myListings: [], chats: {}, favs: [], views: [],
      tx: [], notifs: [], casesInv: { budget: 0, advanced: 0, flagship: 0 }, casesOpened: 0, caseHistory: [],
      promos: [], bench: [], taken: [], trips: [],
      stats: { deals: 0, bought: 0, sold: 0, spent: 0, earned: 0, trips: 0, bestProfit: 0, benches: 0 },
      xp: 0, daily: 0, onboarded: false, filters: {},
      settings: { theme: 'auto', sound: true, vol: 70, haptic: true }
    };
  }
  PD.defaultState = defaultState;

  /* ---------- IndexedDB ---------- */
  const IDB = {
    db: null,
    open() {
      return new Promise(res => {
        if (!W.indexedDB) return res(null);
        let r; try { r = indexedDB.open('phonedrop', 1); } catch (e) { return res(null); }
        r.onupgradeneeded = () => { r.result.createObjectStore('kv'); };
        r.onsuccess = () => { this.db = r.result; res(this.db); };
        r.onerror = () => res(null); r.onblocked = () => res(null);
      });
    },
    get(k) { return new Promise(res => { if (!this.db) return res(undefined); try { const q = this.db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); } catch (e) { res(undefined); } }); },
    set(k, v) { return new Promise(res => { if (!this.db) return res(false); try { const t = this.db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(true); t.onerror = t.onabort = () => res(false); } catch (e) { res(false); } }); }
  };
  const LS = {
    get(k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { W.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  };

  /* ---------- идентификация ---------- */
  const tg = () => W.Telegram && W.Telegram.WebApp;
  const Net = {
    online: false, deviceId: null, lastSync: 0, status: 'init', rev: 0, err: '', backoff: 0,
    headers() {
      const h = { 'content-type': 'application/json' };
      const t = tg(); if (t && t.initData) h['x-tg-init-data'] = t.initData;
      if (this.deviceId) h['x-device-id'] = this.deviceId;
      return h;
    },
    async req(method, url, body, o) {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const to = setTimeout(() => ctl && ctl.abort(), 9000);
      try {
        const r = await fetch(url, { method, headers: this.headers(), body: body ? JSON.stringify(body) : undefined, signal: ctl && ctl.signal, keepalive: !!(o && o.keepalive) });
        clearTimeout(to);
        if (!r.ok && r.status !== 409) { const e = new Error('http_' + r.status); e.status = r.status; throw e; }
        return await r.json();
      } catch (e) { clearTimeout(to); throw e; }
    }
  };
  PD.net = Net;

  /* ---------- хранилище ---------- */
  const Store = {
    saveTimer: null, syncTimer: null, dirty: false, syncing: false, localSaves: 0,
    async init() {
      await IDB.open();
      // device id: IndexedDB + localStorage + Telegram CloudStorage (на случай очистки)
      let dev = (await IDB.get('deviceId')) || LS.get('pd2_dev');
      if (!dev) { dev = (uidGen() + uidGen() + uidGen()).replace(/[^a-z0-9]/g, '').slice(0, 28).padEnd(20, 'x'); }
      Net.deviceId = dev; LS.set('pd2_dev', dev); IDB.set('deviceId', dev);
      const t = tg(); try { if (t && t.CloudStorage) t.CloudStorage.setItem('pd_dev', dev); } catch (e) { }

      // загрузка локального состояния
      let local = await IDB.get('state');
      if (!local) { const raw = LS.get('pd2_state'); if (raw) { try { local = JSON.parse(raw); } catch (e) { } } }
      if (!local) { const prev = await IDB.get('state_prev'); if (prev) local = prev; }
      let migrated = false;
      if (!local) { const leg = this.migrateLegacy(); if (leg) { local = leg; migrated = true; } }

      // сервер
      let server = null;
      try {
        const r = await Net.req('GET', '/api/save');
        Net.online = true; Net.status = 'online';
        if (r.exists) server = r;
      } catch (e) { Net.online = false; Net.status = 'offline'; Net.err = e.message; }

      let S;
      if (local && server) {
        const ls = score(local), ss = score(server.state);
        const localAhead = (local.syncRev || 0) >= server.rev && (ls > ss || (ls === ss && (local.updatedAt || 0) >= (server.state.updatedAt || 0)));
        if (localAhead || (local.syncRev || 0) > server.rev) { S = local; Net.rev = server.rev; this.dirty = true; }
        else if (server.rev > (local.syncRev || 0) && ss >= ls) { S = server.state; Net.rev = server.rev; if (ls > 0 || (local.tx || []).length) await IDB.set('conflict_local_' + Date.now(), local); }
        else { S = ls >= ss ? local : server.state; Net.rev = server.rev; this.dirty = true; if (S === local) { /* локальное богаче */ } else await IDB.set('conflict_local_' + Date.now(), local); }
      } else if (server) { S = server.state; Net.rev = server.rev; }
      else if (local) { S = local; Net.rev = local.syncRev || 0; this.dirty = !!Net.online; }
      else { S = defaultState(); this.dirty = true; }
      PD.S = this.upgrade(S);
      PD.migrated = migrated;
      S = PD.S; S.syncRev = Net.rev;
      this.persistLocal();
      if (this.dirty && Net.online) this.scheduleSync(800);
      this.watchLifecycle();
      if (!Net.online) this.retryLater();
      return S;
    },
    /* Обновление схемы: прогресс сохраняется, недостающие поля добавляются */
    upgrade(S) {
      const D = defaultState();
      for (const k in D) if (S[k] === undefined) S[k] = D[k];
      for (const k in D.stats) if (S.stats[k] === undefined) S.stats[k] = D.stats[k];
      for (const k in D.settings) if (S.settings[k] === undefined) S.settings[k] = D.settings[k];
      for (const k in D.casesInv) if (S.casesInv[k] === undefined) S.casesInv[k] = 0;
      if (!PD.CITY_BY_ID[S.city]) S.city = 'msk';
      S.phones = (S.phones || []).filter(p => G.MODEL_BY_ID[p.modelId]);
      S.phones.forEach(p => { if (!p.os) p.os = { wall: 0, bright: 70, vol: 50, gallery: [], launched: false }; if (p.rating == null) p.rating = 0; });
      S.version = PD.APP_VERSION; S.schema = 2;
      return S;
    },
    /* Перенос данных из предыдущих версий Phone Drop (поиск старых ключей localStorage) */
    migrateLegacy() {
      try {
        const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
        const cand = keys.filter(k => /phone.?drop|^pd_|^pd1|phonedrop/i.test(k) && !/^pd2_/.test(k));
        if (!cand.length) return null;
        let found = null;
        for (const k of cand) {
          let o; try { o = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
          if (!o || typeof o !== 'object') continue;
          const money = ['money', 'balance', 'cash', 'coins', 'rub', 'rubles'].map(f => o[f]).find(v => typeof v === 'number' && isFinite(v));
          const list = ['phones', 'inventory', 'collection', 'owned', 'items'].map(f => o[f]).find(v => Array.isArray(v));
          if (money != null || list) { found = { k, o, money, list }; break; }
        }
        if (!found) return null;
        const S = defaultState();
        if (found.money != null) S.money = Math.max(0, Math.round(found.money));
        const names = G.MODELS.map(m => ({ m, n: m.n.toLowerCase().replace(/\s+/g, '') }));
        (found.list || []).forEach(it => {
          const nm = String(it && (it.name || it.model || it.title || it.id || it) || '').toLowerCase().replace(/\s+/g, '');
          const hit = names.filter(x => nm.includes(x.n)).sort((a, b) => b.n.length - a.n.length)[0] || names.find(x => nm && x.n.includes(nm));
          if (hit) S.phones.push(PD.eco.makePhone(hit.m.id, { cond: 'good', src: 'Перенос из прошлой версии', price: 0 }));
        });
        S.legacy = { key: found.k, raw: JSON.stringify(found.o).slice(0, 20000) };
        S.notifs.push({ id: uidGen(), ts: Date.now(), title: 'Прогресс перенесён', text: 'Данные из прошлой версии Phone Drop сохранены. Баланс: ' + rub(S.money) + '.', kind: 'ok' });
        return S;
      } catch (e) { return null; }
    },
    touch() {
      const S = PD.S; S.updatedAt = Date.now(); this.dirty = true;
      clearTimeout(this.saveTimer); this.saveTimer = setTimeout(() => this.persistLocal(), 350);
      this.scheduleSync(4000);
    },
    async persistLocal() {
      const S = PD.S; if (!S) return;
      try {
        const prev = await IDB.get('state'); if (prev) await IDB.set('state_prev', prev);
      } catch (e) { }
      const ok = await IDB.set('state', S);
      this.localSaves++;
      // запасная копия в localStorage (может не поместиться — это нормально)
      const raw = JSON.stringify(S);
      if (!LS.set('pd2_state', raw) && !ok) { /* в крайнем случае хотя бы урезанная */ const slim = Object.assign({}, S, { tx: S.tx.slice(0, 80), notifs: [], chats: {}, views: [], bench: S.bench.slice(0, 10) }); LS.set('pd2_state', JSON.stringify(slim)); }
    },
    scheduleSync(ms) { clearTimeout(this.syncTimer); this.syncTimer = setTimeout(() => this.sync(), ms); },
    async sync(force) {
      if (this.syncing) return; if (!this.dirty && !force) return;
      this.syncing = true; Net.status = 'sync'; PD.ui && PD.ui.syncBadge && PD.ui.syncBadge();
      try {
        const S = PD.S;
        const r = await Net.req('PUT', '/api/save', { baseRev: Net.rev, state: S });
        Net.online = true; Net.err = ''; Net.backoff = 0;
        if (r.accepted === false && r.state) {
          // сервер оказался прогрессивнее — берём его, локальное сохраняем в резерв
          await IDB.set('conflict_local_' + Date.now(), S);
          PD.S = this.upgrade(r.state); PD.S.syncRev = r.rev; Net.rev = r.rev;
          this.dirty = false; await this.persistLocal();
          PD.ui && PD.ui.notify('Синхронизация', 'Загружен более новый прогресс с другого устройства', 'info'); PD.ui && PD.ui.rerender();
        } else { Net.rev = r.rev; PD.S.syncRev = r.rev; this.dirty = false; Net.lastSync = Date.now(); Net.status = 'online'; }
      } catch (e) {
        Net.online = false; Net.status = 'offline'; Net.err = e.message; this.retryLater();
      }
      this.syncing = false; PD.ui && PD.ui.syncBadge && PD.ui.syncBadge();
    },
    retryLater() {
      Net.backoff = Math.min(120000, (Net.backoff || 5000) * 1.7);
      clearTimeout(this.retryT); this.retryT = setTimeout(async () => {
        if (Net.online) return;
        try { await Net.req('GET', '/api/health'); Net.online = true; Net.status = 'online'; this.dirty = true; await this.sync(true); } catch (e) { this.retryLater(); }
        PD.ui && PD.ui.syncBadge && PD.ui.syncBadge();
      }, Net.backoff);
    },
    watchLifecycle() {
      const flush = () => { clearTimeout(this.saveTimer); this.persistLocal(); if (this.dirty && Net.online) { try { const S = PD.S; const body = JSON.stringify({ baseRev: Net.rev, state: S }); if (body.length < 60000) Net.req('PUT', '/api/save', { baseRev: Net.rev, state: S }, { keepalive: true }).catch(() => { }); else this.sync(); } catch (e) { } } };
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
      W.addEventListener('pagehide', flush);
      W.addEventListener('online', () => { Net.online = true; this.dirty = true; this.sync(true); });
      W.addEventListener('offline', () => { Net.online = false; Net.status = 'offline'; });
      const t = tg(); try { t && t.onEvent && t.onEvent('closing', flush); } catch (e) { }
    },
    async listBackups() { return (await Net.req('GET', '/api/backups')).backups; },
    async restoreBackup(id) {
      const r = await Net.req('POST', '/api/restore', { id });
      if (r && r.state) { PD.S = this.upgrade(r.state); Net.rev = r.rev; PD.S.syncRev = r.rev; this.dirty = false; await this.persistLocal(); return true; }
      return false;
    },
    exportJSON() { return JSON.stringify(PD.S); },
    async importJSON(txt) {
      const o = JSON.parse(txt);
      if (!o || typeof o.money !== 'number' || !Array.isArray(o.phones)) throw new Error('bad');
      const cur = PD.S; await IDB.set('conflict_local_' + Date.now(), cur);
      PD.S = this.upgrade(o); PD.S.syncRev = Net.rev; this.touch(); return true;
    }
  };
  function score(s) { try { return (s.stats && s.stats.deals || 0) * 5 + (s.phones ? s.phones.length : 0) * 3 + (s.tx ? s.tx.length : 0) + (s.casesOpened || 0) * 4; } catch (e) { return 0; } }
  PD.store = Store;
  PD.save = () => Store.touch();
})(typeof window !== 'undefined' ? window : globalThis);
