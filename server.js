/* PHONE DROP 2.0.0 — сервер синхронизации и хранения (Node 22+, без внешних зависимостей).
   БД: SQLite (node:sqlite). Таблицы: users, saves (актуальное состояние), backups (история снимков), promo_uses.
   Запуск:  BOT_TOKEN=123:ABC node server.js      (PORT по умолчанию 3000, DATA_DIR по умолчанию ./data) */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { DatabaseSync } = require('node:sqlite');

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const PUBLIC = path.join(__dirname, 'public');
const MAX_BODY = 2 * 1024 * 1024;
const BACKUPS_KEEP = 25;

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'phonedrop.db'));
db.exec(`
PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT, created_at INTEGER, last_seen INTEGER);
CREATE TABLE IF NOT EXISTS saves(user_id TEXT PRIMARY KEY, rev INTEGER NOT NULL, updated_at INTEGER NOT NULL, version TEXT, state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS backups(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, rev INTEGER, created_at INTEGER, reason TEXT, state TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_backups_user ON backups(user_id, id);
CREATE TABLE IF NOT EXISTS promo_uses(user_id TEXT NOT NULL, code TEXT NOT NULL, used_at INTEGER NOT NULL, PRIMARY KEY(user_id, code));
`);

/* ---------- промокоды (источник истины на сервере) ---------- */
const PROMOS = {
  'WELCOME2026': { title: 'Приветственный бонус', rewards: [{ t: 'money', v: 5000 }] },
  'PHONEDROP':   { title: 'Phone Drop', rewards: [{ t: 'case', id: 'budget', n: 1 }] },
  'RELEASE200':  { title: 'Релиз 2.0.0', rewards: [{ t: 'money', v: 15000 }, { t: 'case', id: 'advanced', n: 1 }] },
  'TYNTYTY':     { title: 'TYNTYTY Benchmark', rewards: [{ t: 'phone', id: 'rn14p', cond: 'new' }] },
  'FLAGSHIP':    { title: 'Флагманский подарок', rewards: [{ t: 'case', id: 'flagship', n: 1 }] },
  'BLACKFRIDAY': { title: 'Чёрная пятница', rewards: [{ t: 'money', v: 10000 }, { t: 'phone', id: 's22', cond: 'good' }] },
  'OBNOVA':      { title: 'Обновление Phone Drop', rewards: [{ t: 'money', v: 50000 }, { t: 'phone', id: 'ip13p', cond: 'new' }] },
  'AVITO2026':   { title: 'Скидка продавца', rewards: [{ t: 'money', v: 7500 }] }
};

/* ---------- Авторизация ---------- */
function verifyInitData(initData) {
  // https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
  try {
    const p = new URLSearchParams(initData);
    const hash = p.get('hash'); if (!hash) return null;
    p.delete('hash');
    const data = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calc = crypto.createHmac('sha256', secret).update(data).digest('hex');
    if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
    const authDate = +p.get('auth_date') || 0;
    if (Date.now() / 1000 - authDate > 7 * 24 * 3600) return null;
    const u = JSON.parse(p.get('user') || 'null'); if (!u || !u.id) return null;
    return { id: 'tg_' + u.id, name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Игрок' };
  } catch (e) { return null; }
}
function authenticate(req) {
  const h = req.headers['x-tg-init-data'];
  if (h) {
    if (BOT_TOKEN) { const u = verifyInitData(String(h)); if (u) return u; return null; }
    // BOT_TOKEN не задан (разработка): доверяем данным без проверки подписи
    try { const p = new URLSearchParams(String(h)); const u = JSON.parse(p.get('user') || 'null'); if (u && u.id) return { id: 'tg_' + u.id, name: u.first_name || 'Игрок', unverified: true }; } catch (e) { }
  }
  const dev = String(req.headers['x-device-id'] || '');
  if (/^[a-zA-Z0-9_-]{16,64}$/.test(dev)) return { id: 'dev_' + dev, name: 'Гость' };
  return null;
}

/* ---------- Хранилище ---------- */
const q = {
  getSave: db.prepare('SELECT rev, updated_at, version, state FROM saves WHERE user_id=?'),
  putSave: db.prepare('INSERT INTO saves(user_id,rev,updated_at,version,state) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET rev=excluded.rev, updated_at=excluded.updated_at, version=excluded.version, state=excluded.state'),
  addBackup: db.prepare('INSERT INTO backups(user_id,rev,created_at,reason,state) VALUES(?,?,?,?,?)'),
  trimBackups: db.prepare('DELETE FROM backups WHERE user_id=? AND id NOT IN (SELECT id FROM backups WHERE user_id=? ORDER BY id DESC LIMIT ?)'),
  listBackups: db.prepare('SELECT id, rev, created_at, reason, length(state) AS size FROM backups WHERE user_id=? ORDER BY id DESC LIMIT 30'),
  getBackup: db.prepare('SELECT state, rev FROM backups WHERE user_id=? AND id=?'),
  lastBackup: db.prepare('SELECT created_at FROM backups WHERE user_id=? ORDER BY id DESC LIMIT 1'),
  upUser: db.prepare('INSERT INTO users(id,name,created_at,last_seen) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET last_seen=excluded.last_seen, name=excluded.name'),
  promoUsed: db.prepare('SELECT 1 FROM promo_uses WHERE user_id=? AND code=?'),
  promoAdd: db.prepare('INSERT OR IGNORE INTO promo_uses(user_id,code,used_at) VALUES(?,?,?)'),
  promoList: db.prepare('SELECT code, used_at FROM promo_uses WHERE user_id=?')
};

function progressScore(s) {
  // «ценность прогресса» — защита от затирания сохранения более бедным состоянием
  try {
    return (s.stats && s.stats.deals || 0) * 5 + (s.phones ? s.phones.length : 0) * 3 + (s.tx ? s.tx.length : 0) + (s.casesOpened || 0) * 4;
  } catch (e) { return 0; }
}

function backup(uid, rev, reason, stateStr) {
  const last = q.lastBackup.get(uid);
  if (reason === 'auto' && last && Date.now() - last.created_at < 10 * 60 * 1000) return; // не чаще раза в 10 минут
  q.addBackup.run(uid, rev, Date.now(), reason, stateStr);
  q.trimBackups.run(uid, uid, BACKUPS_KEEP);
}

/* ---------- HTTP ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const staticCache = new Map();
function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
    const ext = path.extname(file);
    const key = file + st.mtimeMs;
    const ae = String(req.headers['accept-encoding'] || '');
    const wantGz = /gzip/.test(ae) && /^\.(html|js|css|svg|json|webmanifest)$/.test(ext);
    const hdr = { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600', 'x-content-type-options': 'nosniff' };
    let ent = staticCache.get(key);
    const send = e => {
      if (wantGz) { hdr['content-encoding'] = 'gzip'; hdr['vary'] = 'accept-encoding'; res.writeHead(200, hdr); res.end(e.gz); }
      else { res.writeHead(200, hdr); res.end(e.raw); }
    };
    if (ent) return send(ent);
    fs.readFile(file, (e2, raw) => {
      if (e2) { res.writeHead(500); return res.end(); }
      ent = { raw, gz: zlib.gzipSync(raw, { level: 6 }) };
      staticCache.set(key, ent); send(ent);
    });
  });
}

function json(res, code, obj) {
  const b = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(b);
}
function readBody(req) {
  return new Promise((ok, fail) => {
    let n = 0; const ch = [];
    req.on('data', c => { n += c.length; if (n > MAX_BODY) { fail(new Error('too_big')); req.destroy(); } else ch.push(c); });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(ch).toString('utf8') || '{}')); } catch (e) { fail(new Error('bad_json')); } });
    req.on('error', fail);
  });
}

const rate = new Map();
function limited(uid, cost) {
  const now = Date.now(); let r = rate.get(uid);
  if (!r || now - r.t > 60000) r = { t: now, n: 0 };
  r.n += cost; rate.set(uid, r);
  return r.n > 120;
}

async function api(req, res) {
  const url = req.url.split('?')[0];
  if (url === '/api/health') return json(res, 200, { ok: true, version: '2.1.0', botVerified: !!BOT_TOKEN, time: Date.now() });
  const user = authenticate(req);
  if (!user) return json(res, 401, { error: 'unauthorized' });
  if (limited(user.id, 1)) return json(res, 429, { error: 'rate_limited' });
  q.upUser.run(user.id, user.name, Date.now(), Date.now());

  if (url === '/api/save' && req.method === 'GET') {
    const r = q.getSave.get(user.id);
    if (!r) return json(res, 200, { exists: false, user });
    return json(res, 200, { exists: true, rev: r.rev, updatedAt: r.updated_at, version: r.version, state: JSON.parse(r.state), user });
  }
  if (url === '/api/save' && req.method === 'PUT') {
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const st = body.state;
    if (!st || typeof st !== 'object' || typeof st.money !== 'number' || !Array.isArray(st.phones)) return json(res, 400, { error: 'bad_state' });
    const cur = q.getSave.get(user.id);
    const incoming = JSON.stringify(st);
    if (!cur) {
      q.putSave.run(user.id, 1, Date.now(), st.version || '2.0.0', incoming);
      return json(res, 200, { ok: true, rev: 1, accepted: true });
    }
    const baseRev = +body.baseRev || 0;
    if (baseRev === cur.rev) {
      // обычный случай: клиент опирался на актуальную ревизию
      const nrev = cur.rev + 1;
      backup(user.id, cur.rev, 'auto', cur.state);
      q.putSave.run(user.id, nrev, Date.now(), st.version || '2.0.0', incoming);
      return json(res, 200, { ok: true, rev: nrev, accepted: true });
    }
    // конфликт (игра открыта на двух устройствах): побеждает состояние с большим прогрессом/свежестью, второе уходит в резервную копию
    const server = JSON.parse(cur.state);
    const cs = progressScore(st), ss = progressScore(server);
    const clientWins = cs > ss || (cs === ss && (st.updatedAt || 0) >= (server.updatedAt || 0));
    if (clientWins) {
      backup(user.id, cur.rev, 'conflict-server', cur.state);
      const nrev = cur.rev + 1;
      q.putSave.run(user.id, nrev, Date.now(), st.version || '2.0.0', incoming);
      return json(res, 200, { ok: true, rev: nrev, accepted: true, conflict: 'client_won' });
    }
    q.addBackup.run(user.id, cur.rev, Date.now(), 'conflict-client', incoming);
    return json(res, 200, { ok: true, rev: cur.rev, accepted: false, conflict: 'server_won', state: server });
  }
  if (url === '/api/backups' && req.method === 'GET') return json(res, 200, { backups: q.listBackups.all(user.id) });
  if (url === '/api/restore' && req.method === 'POST') {
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const b = q.getBackup.get(user.id, +body.id);
    if (!b) return json(res, 404, { error: 'no_backup' });
    const cur = q.getSave.get(user.id);
    if (cur) backup(user.id, cur.rev, 'before-restore', cur.state);
    const nrev = (cur ? cur.rev : 0) + 1;
    q.putSave.run(user.id, nrev, Date.now(), '2.0.0', b.state);
    return json(res, 200, { ok: true, rev: nrev, state: JSON.parse(b.state) });
  }
  if (url === '/api/promo' && req.method === 'POST') {
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    if (limited(user.id, 6)) return json(res, 429, { error: 'rate_limited' });
    const code = String(body.code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return json(res, 200, { ok: false, error: 'invalid' });
    const p = PROMOS[code];
    if (!p) return json(res, 200, { ok: false, error: 'not_found' });
    if (q.promoUsed.get(user.id, code)) return json(res, 200, { ok: false, error: 'used' });
    q.promoAdd.run(user.id, code, Date.now());
    return json(res, 200, { ok: true, code, title: p.title, rewards: p.rewards });
  }
  if (url === '/api/promos' && req.method === 'GET') return json(res, 200, { used: q.promoList.all(user.id) });
  return json(res, 404, { error: 'not_found' });
}

const server = http.createServer((req, res) => {
  res.setHeader('x-frame-options', 'ALLOWALL');
  if (req.url.startsWith('/api/')) {
    api(req, res).catch(e => { console.error('API error', e); try { json(res, 500, { error: 'server_error' }); } catch (_) { } });
  } else if (req.method === 'GET' || req.method === 'HEAD') serveStatic(req, res);
  else { res.writeHead(405); res.end(); }
});
server.listen(PORT, () => console.log(`Phone Drop 2.0.0 слушает порт ${PORT}. Проверка подписи Telegram: ${BOT_TOKEN ? 'ВКЛ' : 'ВЫКЛ (задайте BOT_TOKEN)'}`));
process.on('SIGTERM', () => { try { db.close(); } catch (e) { } process.exit(0); });
