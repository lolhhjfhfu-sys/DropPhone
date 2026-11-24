/* PHONE DROP 2.0.0 — TYNTYTY Benchmark 11, Калькулятор, Часы, Заметки */
(function (G) {
  'use strict';
  const PD = G.PD, U = PD.u, esc = U.esc, OS = PD.os, ic = PD.ic, eco = PD.eco;
  const $ = s => document.querySelector(s);
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const cl = a => w => { w._cl = a; };

  /* ---------- TYNTYTY BENCHMARK 11 ---------- */
  OS.reg({
    id: 'bench',
    open(w, ctx) {
      const ph = ctx.ph, m = ctx.m; let tab = 'test', running = false, res = null, cmpId = null, raf = 0, tms = [];
      const MAXREF = Math.max.apply(null, G.MODELS.map(x => x.total)) * 100;
      const hist = () => PD.S.bench.filter(b => b.uid === ph.uid);
      const best = () => hist().slice().sort((a, b) => b.total - a.total)[0];
      const TABS = [['test', 'Тест', 'bolt'], ['rank', 'Рейтинг', 'trophy'], ['cmp', 'Сравнение', 'swap'], ['hist', 'История', 'clock']];
      function shell(body) {
        w.className = 'appwin'; w.innerHTML = `<div class="bm"><div class="bmb" id="bmb">${body}</div><div class="tabs">${TABS.map(t => `<button data-t="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${ic(t[2])}${t[1]}</button>`).join('')}</div></div>`;
      }
      const brand = `<div class="brand"><div class="hx">T</div><div><b>TYNTYTY</b><span>Benchmark 11 · ${esc(m.n)}</span></div></div>`;
      const gauge = (v, label) => { const C = 2 * Math.PI * 100, p = Math.min(1, v / MAXREF); return `<div class="gauge"><svg viewBox="0 0 230 230"><circle cx="115" cy="115" r="100" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="14"/><circle id="gc" cx="115" cy="115" r="100" fill="none" stroke="url(#gg)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}"/><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00d0ff"/><stop offset="1" stop-color="#8a4dff"/></linearGradient></defs></svg><div class="gv"><b id="gn">${fmt(v)}</b><span>${label}</span></div></div>`; };
      function pageTest() {
        const b = best();
        shell(`${brand}${gauge(b ? b.total : 0, b ? 'лучший результат' : 'баллов')}<div class="card2"><div class="st"><span>⚙️ CPU</span><b>${b ? fmt(b.cpu) : '—'}</b></div><div class="st"><span>🎮 GPU</span><b>${b ? fmt(b.gpu) : '—'}</b></div><div class="st"><span>💾 RAM</span><b>${b ? fmt(b.mem) : '—'}</b></div><div class="st"><span>✨ UX</span><b>${b ? fmt(b.ux) : '—'}</b></div></div><button class="obtn" style="width:100%;background:linear-gradient(90deg,#00d0ff,#6a4dff);height:calc(var(--u)*50)" data-b="start">▶ Запустить тест</button><div style="text-align:center;opacity:.5;font-size:calc(var(--u)*11);margin-top:calc(var(--u)*10)">${esc(m.chip)} · ${m.ram} ГБ ОЗУ · ~14 сек</div>`);
      }
      function runTest() {
        if (running) return; running = true; res = eco.benchRun(ph); tms = [];
        const stages = [['cpu', '⚙️ Процессор', 3200], ['gpu', '🎮 Графика', 3800], ['mem', '💾 Память', 2600], ['ux', '✨ Интерфейс', 1800]];
        shell(`${brand}<div class="card2" id="stl">${stages.map(s => `<div class="st" id="st_${s[0]}"><i></i><span>${s[1]}</span><b id="sv_${s[0]}">—</b></div>`).join('')}</div><div class="card2" id="vis" style="min-height:calc(var(--u)*170)"></div><div class="bar2" style="height:calc(var(--u)*8);background:rgba(255,255,255,.12)"><i id="tp" style="width:0;background:linear-gradient(90deg,#00d0ff,#8a4dff)"></i></div><div id="tl" style="text-align:center;opacity:.6;font-size:calc(var(--u)*12);margin-top:calc(var(--u)*8)">Подготовка…</div>`);
        w.querySelector('.tabs').style.display = 'none';
        let si = 0, t0 = performance.now(), totalMs = stages.reduce((a, s) => a + s[2], 0), acc = 0;
        const vis = w.querySelector('#vis');
        function setup(k) {
          if (k === 'cpu') vis.innerHTML = `<div class="small" style="opacity:.7;font-size:calc(var(--u)*12)">Многопоточные вычисления · 12 потоков</div><div class="cpugrid">${Array.from({ length: 72 }, () => '<i></i>').join('')}</div>`;
          else if (k === 'gpu') vis.innerHTML = `<canvas class="gpuc" id="cv" width="320" height="180"></canvas>`;
          else if (k === 'mem') vis.innerHTML = `<div class="small" style="opacity:.7;font-size:calc(var(--u)*12)">Пропускная способность ОЗУ: <b id="mbs">0</b> МБ/с</div><div class="ramb">${Array.from({ length: 24 }, () => '<i style="height:10%"></i>').join('')}</div>`;
          else vis.innerHTML = `<div style="text-align:center;padding:calc(var(--u)*30) 0"><div class="spin" style="margin:0 auto"></div><div style="margin-top:calc(var(--u)*14);opacity:.7">Плавность анимаций и отклик…</div></div>`;
        }
        let cur = null, sStart = t0;
        function begin(i) { cur = stages[i]; sStart = performance.now(); setup(cur[0]); w.querySelector('#st_' + cur[0]).className = 'st on'; w.querySelector('#tl').textContent = cur[1] + '…'; PD.snd.play('bench'); }
        begin(0);
        (function frame(now) {
          if (!OS.cur || !w.isConnected) { running = false; return; }
          const el = now - sStart, p = Math.min(1, el / cur[2]), k = cur[0];
          acc = stages.slice(0, si).reduce((a, s) => a + s[2], 0) + el; w.querySelector('#tp').style.width = Math.min(100, acc / totalMs * 100) + '%';
          const val = res[k] * (1 - Math.pow(1 - p, 2)); w.querySelector('#sv_' + k).textContent = fmt(val);
          if (k === 'cpu') { const cells = vis.querySelectorAll('.cpugrid i'); if (Math.floor(now / 90) !== frame.l) { frame.l = Math.floor(now / 90); cells.forEach(c => { c.style.background = Math.random() < .35 + p * .35 ? `hsl(${190 + Math.random() * 70},90%,${50 + Math.random() * 20}%)` : 'rgba(255,255,255,.1)'; }); PD.snd.play('bench'); } }
          else if (k === 'gpu') drawCube(vis.querySelector('#cv'), now / 1000, p);
          else if (k === 'mem') { if (Math.floor(now / 110) !== frame.m) { frame.m = Math.floor(now / 110); vis.querySelectorAll('.ramb i').forEach(b => { b.style.height = (20 + Math.random() * 75 * (.4 + p * .6)) + '%'; }); const mb = vis.querySelector('#mbs'); if (mb) mb.textContent = fmt((m.ram * 2400 + m.mem * 90) * (.8 + Math.random() * .2)); } }
          if (p >= 1) { w.querySelector('#st_' + k).className = 'st done'; w.querySelector('#sv_' + k).textContent = fmt(res[k]); si++; if (si >= stages.length) return done(); begin(si); }
          raf = requestAnimationFrame(frame);
        })(performance.now());
      }
      function drawCube(cv, t, p) {
        if (!cv) return; const c = cv.getContext('2d'), W = cv.width, H = cv.height; c.fillStyle = '#05060c'; c.fillRect(0, 0, W, H);
        const V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        const n = 1 + Math.floor(p * 5);
        for (let k = 0; k < n; k++) {
          const a = t * (1 + k * .3) + k, b = t * .7 + k * 1.3, sc = 28 + k * 7, ox = W / 2 + Math.sin(t + k) * 80 * (k ? 1 : 0), oy = H / 2 + Math.cos(t * 1.2 + k) * 30 * (k ? 1 : 0);
          const P = V.map(v => { let [x, y, z] = v; let x1 = x * Math.cos(a) - z * Math.sin(a), z1 = x * Math.sin(a) + z * Math.cos(a); let y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b); const f = 3.5 / (3.5 + z2 * .5); return [ox + x1 * sc * f, oy + y1 * sc * f]; });
          c.strokeStyle = `hsl(${(t * 60 + k * 50) % 360},90%,62%)`; c.lineWidth = 1.6; c.beginPath(); E.forEach(e => { c.moveTo(P[e[0]][0], P[e[0]][1]); c.lineTo(P[e[1]][0], P[e[1]][1]); }); c.stroke();
        }
        c.fillStyle = '#6bf'; c.font = '11px monospace'; c.fillText(Math.round(50 + p * 10 + Math.random() * 5) + ' FPS · ' + n * 2400 + ' polys', 8, 14);
      }
      function done() {
        running = false; cancelAnimationFrame(raf); const r = res, id = U.uidGen();
        PD.S.bench.unshift({ id, uid: ph.uid, modelId: ph.modelId, ts: Date.now(), cpu: r.cpu, gpu: r.gpu, mem: r.mem, ux: r.ux, total: r.total }); if (PD.S.bench.length > 80) PD.S.bench.length = 80; PD.S.stats.benches = (PD.S.stats.benches || 0) + 1; eco.addXp(3); PD.save();
        PD.snd.play('ok'); OS.push('TYNTYTY Benchmark', 'Тест завершён: ' + fmt(r.total) + ' баллов', '📊'); resultPage(r);
      }
      function resultPage(r) {
        const all = G.MODELS.map(x => x.total * 100).sort((a, b) => a - b), below = all.filter(v => v < r.total).length, pct = Math.round(below / all.length * 100), rank = all.length - below;
        shell(`${brand}${gauge(0, 'итоговый результат')}<div class="card2">${[['CPU', 'cpu', '#00d0ff'], ['GPU', 'gpu', '#8a4dff'], ['RAM', 'mem', '#2ecc71'], ['UX', 'ux', '#ffb020']].map(x => `<div class="sbar2"><span>${x[0]}</span><div class="bar2"><i style="width:${Math.min(100, r[x[1]] / (m[x[1]] * 100 * 1.08) * 100)}%;background:${x[2]}"></i></div><b>${fmt(r[x[1]])}</b></div>`).join('')}</div><div class="card2" style="text-align:center"><div style="font-size:calc(var(--u)*13);opacity:.7">Место в мировом рейтинге</div><div style="font-size:calc(var(--u)*28);font-weight:800">№${rank} <span style="font-size:calc(var(--u)*14);opacity:.6">из ${all.length}</span></div><div style="opacity:.75;font-size:calc(var(--u)*12)">Быстрее, чем ${pct}% моделей каталога</div></div><div style="display:flex;gap:calc(var(--u)*8)"><button class="obtn sec" style="flex:1" data-b="again">Повторить</button><button class="obtn" style="flex:1" data-t="cmp">Сравнить</button></div>`);
        const gn = w.querySelector('#gn'), gc = w.querySelector('#gc'), C = 2 * Math.PI * 100; let t0 = performance.now();
        (function a(now) { if (!w.isConnected) return; const p = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - p, 3); gn.textContent = fmt(r.total * e); gc.style.strokeDashoffset = C * (1 - Math.min(1, r.total * e / MAXREF)); if (p < 1) requestAnimationFrame(a); })(t0);
      }
      function pageRank() {
        const b = best(); const list = G.MODELS.map(x => ({ n: x.n, t: x.total * 100, me: false })); if (b) list.push({ n: m.n + ' (ваш результат)', t: b.total, me: true }); list.sort((a, c) => c.t - a.t);
        shell(`${brand}<div style="opacity:.65;font-size:calc(var(--u)*12);margin-bottom:calc(var(--u)*8)">Рейтинг производительности · эталонные результаты каталога</div>${list.map((x, i) => `<div class="rk ${x.me ? 'me' : ''}"><span class="n">${i + 1}</span><div class="sp"><div>${esc(x.n)}</div><div class="bar2" style="height:calc(var(--u)*5);margin-top:3px;background:rgba(255,255,255,.1)"><i style="width:${x.t / MAXREF * 100}%"></i></div></div><b>${fmt(x.t)}</b></div>`).join('')}`);
        const me = w.querySelector('.rk.me'); if (me) me.scrollIntoView({ block: 'center' });
      }
      function pageCmp() {
        const b = best(), mine = b ? { cpu: b.cpu, gpu: b.gpu, mem: b.mem, ux: b.ux, total: b.total } : eco.benchRef(m);
        if (!cmpId) cmpId = G.MODELS.slice().sort((a, c) => c.total - a.total).find(x => x.id !== m.id).id;
        const o2 = G.MODEL_BY_ID[cmpId], r2 = eco.benchRef(o2), diff = Math.round((mine.total / r2.total - 1) * 100);
        shell(`${brand}<div class="card2"><div style="opacity:.65;font-size:calc(var(--u)*12);margin-bottom:calc(var(--u)*6)">Сравнить ${esc(m.n)} (${b ? 'ваш результат' : 'эталон'}) с:</div><select class="sel" id="cs">${G.MODELS.filter(x => x.id !== m.id).sort((a, c) => a.n.localeCompare(c.n)).map(x => `<option value="${x.id}" ${x.id === cmpId ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select></div>
          <div class="card2" style="text-align:center;background:${diff >= 0 ? 'rgba(46,204,113,.14)' : 'rgba(255,64,83,.14)'}"><b style="font-size:calc(var(--u)*17)">${diff >= 0 ? esc(m.n) + ' быстрее на ' + diff + '%' : esc(o2.n) + ' быстрее на ' + (-diff) + '%'}</b></div>
          <div class="card2">${[['CPU', 'cpu'], ['GPU', 'gpu'], ['RAM', 'mem'], ['UX', 'ux'], ['Итого', 'total']].map(x => { const a = mine[x[1]], c = r2[x[1]], mx = Math.max(a, c); return `<div style="margin-bottom:calc(var(--u)*12)"><div style="font-size:calc(var(--u)*12);opacity:.7;margin-bottom:3px">${x[0]}</div><div class="sbar2"><span style="width:calc(var(--u)*60);overflow:hidden;white-space:nowrap">${esc(m.n.split(' ').slice(-2).join(' '))}</span><div class="bar2"><i style="width:${a / mx * 100}%;background:${a >= c ? '#2ecc71' : '#00d0ff'}"></i></div><b>${fmt(a)}</b></div><div class="sbar2"><span style="width:calc(var(--u)*60);overflow:hidden;white-space:nowrap">${esc(o2.n.split(' ').slice(-2).join(' '))}</span><div class="bar2"><i style="width:${c / mx * 100}%;background:${c > a ? '#2ecc71' : '#8a4dff'}"></i></div><b>${fmt(c)}</b></div></div>`; }).join('')}</div>
          <div class="card2" style="font-size:calc(var(--u)*12.5)"><div class="kvo" style="background:none;padding:calc(var(--u)*4) 0"><span>Процессор</span><span>${esc(o2.chip)}</span></div><div class="kvo" style="background:none;padding:calc(var(--u)*4) 0"><span>ОЗУ</span><span>${o2.ram} ГБ</span></div><div class="kvo" style="background:none;padding:calc(var(--u)*4) 0"><span>Экран</span><span>${esc(o2.scr)}</span></div><div class="kvo" style="background:none;padding:calc(var(--u)*4) 0"><span>Аккумулятор</span><span>${o2.bat} мА·ч</span></div></div>`);
      }
      function pageHist() {
        const h = hist(); const mx = Math.max.apply(null, h.map(x => x.total).concat([1]));
        shell(`${brand}${h.length ? `<div class="card2"><div style="opacity:.65;font-size:calc(var(--u)*12)">Динамика результатов</div><svg viewBox="0 0 300 70" style="width:100%;height:calc(var(--u)*70)"><polyline fill="none" stroke="#6bf" stroke-width="2.5" points="${h.slice().reverse().map((x, i, a) => `${a.length > 1 ? i / (a.length - 1) * 290 + 5 : 150},${62 - x.total / mx * 52}`).join(' ')}"/></svg></div>${h.map(x => `<div class="card2"><div class="st" style="padding:0"><span>${U.dateStr(x.ts)}</span><b style="font-size:calc(var(--u)*17)">${fmt(x.total)}</b></div><div style="font-size:calc(var(--u)*11.5);opacity:.65;margin-top:3px">CPU ${fmt(x.cpu)} · GPU ${fmt(x.gpu)} · RAM ${fmt(x.mem)} · UX ${fmt(x.ux)}</div></div>`).join('')}<button class="obtn sec" style="width:100%" data-b="clr">Очистить историю этого телефона</button>` : `<div style="text-align:center;opacity:.55;padding:calc(var(--u)*50) 0">Тестов пока нет.<br>Запустите первый на вкладке «Тест».</div>`}`);
      }
      const PAGES = { test: pageTest, rank: pageRank, cmp: pageCmp, hist: pageHist };
      function go(t) { tab = t; PAGES[t](); }
      go('test');
      w.onclick = e => { const b = e.target.closest('[data-b],[data-t]'); if (!b) return; PD.snd.play('tap'); if (running) return; if (b.dataset.t) return go(b.dataset.t); const a = b.dataset.b; if (a === 'start' || a === 'again') runTest(); else if (a === 'clr') { PD.S.bench = PD.S.bench.filter(x => x.uid !== ph.uid); PD.save(); go('hist'); } };
      w.onchange = e => { if (e.target.id === 'cs') { cmpId = e.target.value; pageCmp(); } };
      w._cl = () => { running = false; cancelAnimationFrame(raf); };
      ctx.win._back = () => { if (running) return true; if (tab !== 'test') { go('test'); return true; } return false; };
    },
    back(app) { return app.win._back ? app.win._back() : false; }, onClose(app) { app.win._cl && app.win._cl(); }
  });

  /* ---------- КАЛЬКУЛЯТОР ---------- */
  OS.reg({
    id: 'calc',
    open(w) {
      let cur = '0', prev = null, op = null, fresh = true, expr = '';
      const show = v => { const s = String(v); const n = parseFloat(s); if (!isFinite(n)) return 'Ошибка'; if (s.endsWith('.') || /\.\d*0$/.test(s) && s.includes('.') && !fresh) return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); const out = Math.abs(n) >= 1e12 ? n.toExponential(4) : (+n.toFixed(8)).toLocaleString('ru-RU', { maximumFractionDigits: 8 }); return out.replace(/ /g, ' '); };
      function draw() { const d = w.querySelector('.disp b'); d.textContent = cur === 'Ошибка' ? cur : show(cur); const L = d.textContent.length; d.style.fontSize = `calc(var(--u)*${L > 12 ? 30 : L > 9 ? 42 : L > 6 ? 54 : 64})`; w.querySelector('.disp small').textContent = expr; }
      const K = ['AC', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', ',', '='];
      w.className = 'appwin';
      w.innerHTML = `<div class="calc"><div class="disp"><small></small><b>0</b></div><div class="keys">${K.map(k => `<button data-k="${k}" class="${'÷×−+='.includes(k) ? 'op' : 'AC±%'.includes(k) ? 'fn' : ''} ${k === '0' ? 'z' : ''}">${k === 'AC' ? 'C' : k}</button>`).join('')}</div></div>`;
      const calc = (a, b, o) => o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : o === '÷' ? (b === 0 ? NaN : a / b) : b;
      w.onclick = e => {
        const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; PD.snd.play('tap');
        if (/\d/.test(k)) { if (cur === 'Ошибка') cur = '0'; if (fresh) { cur = k; fresh = false; } else if (cur.replace(/[-.,]/g, '').length < 12) cur = cur === '0' ? k : cur + k; }
        else if (k === ',') { if (fresh) { cur = '0.'; fresh = false; } else if (!cur.includes('.')) cur += '.'; }
        else if (k === 'AC') { cur = '0'; prev = null; op = null; fresh = true; expr = ''; }
        else if (k === '±') { if (cur !== '0' && cur !== 'Ошибка') cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur; }
        else if (k === '%') { cur = String(parseFloat(cur) / 100); fresh = true; }
        else if ('÷×−+'.includes(k)) { if (op && !fresh) { const r = calc(prev, parseFloat(cur), op); cur = isFinite(r) ? String(r) : 'Ошибка'; } prev = parseFloat(cur); op = k; fresh = true; expr = show(cur) + ' ' + k; }
        else if (k === '=') { if (op != null && prev != null) { const bb = parseFloat(cur); const r = calc(prev, bb, op); expr = show(prev) + ' ' + op + ' ' + show(bb) + ' ='; cur = isFinite(r) ? String(+r.toFixed(10)) : 'Ошибка'; prev = null; op = null; fresh = true; } }
        draw();
      };
      draw();
    }
  });

  /* ---------- ЧАСЫ ---------- */
  OS.reg({
    id: 'clock',
    open(w, ctx) {
      let tab = 'clock', sw = { run: false, t0: 0, acc: 0, laps: [] }, tm = { left: 0, run: false, end: 0, set: 300 }, iv = null;
      const zones = [['Москва', 'Europe/Moscow'], ['Екатеринбург', 'Asia/Yekaterinburg'], ['Новосибирск', 'Asia/Novosibirsk'], ['Владивосток', 'Asia/Vladivostok'], ['Калининград', 'Europe/Kaliningrad'], ['Лондон', 'Europe/London'], ['Нью-Йорк', 'America/New_York'], ['Токио', 'Asia/Tokyo'], ['Дубай', 'Asia/Dubai']];
      const fm = ms => { const t = Math.floor(ms / 10), cs = t % 100, s = Math.floor(t / 100) % 60, m = Math.floor(t / 6000); return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`; };
      const ftm = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      function draw() {
        const tabs = [['clock', 'Часы'], ['sw', 'Секундомер'], ['tm', 'Таймер']];
        let body = '';
        if (tab === 'clock') body = `<div class="bigt clk" id="ct">${new Date().toLocaleTimeString('ru-RU')}</div>${zones.map(z => `<div class="kvo"><span>${z[0]}</span><span class="clk" data-z="${z[1]}">${new Date().toLocaleTimeString('ru-RU', { timeZone: z[1], hour: '2-digit', minute: '2-digit' })}</span></div>`).join('')}`;
        else if (tab === 'sw') body = `<div class="bigt clk" id="swt">${fm(sw.run ? sw.acc + performance.now() - sw.t0 : sw.acc)}</div><div style="display:flex;gap:calc(var(--u)*10);justify-content:center"><button class="obtn sec" data-c="lap">${sw.run ? 'Круг' : 'Сброс'}</button><button class="obtn" data-c="sw" style="${sw.run ? 'background:#ff453a' : ''}">${sw.run ? 'Стоп' : 'Старт'}</button></div><div style="margin-top:calc(var(--u)*16)">${sw.laps.map((l, i) => `<div class="kvo"><span>Круг ${sw.laps.length - i}</span><span class="clk">${fm(l)}</span></div>`).join('')}</div>`;
        else body = `<div class="bigt clk" id="tmt">${ftm(tm.run ? Math.max(0, Math.ceil((tm.end - Date.now()) / 1000)) : tm.set)}</div>${tm.run ? '' : `<div style="display:flex;gap:calc(var(--u)*8);justify-content:center;flex-wrap:wrap;margin-bottom:calc(var(--u)*14)">${[10, 30, 60, 180, 300, 600].map(s => `<button class="obtn sec" style="height:calc(var(--u)*36);padding:0 calc(var(--u)*14);${tm.set === s ? 'outline:2px solid var(--acc)' : ''}" data-s="${s}">${s < 60 ? s + ' с' : s / 60 + ' мин'}</button>`).join('')}</div>`}<div style="text-align:center"><button class="obtn" data-c="tm" style="${tm.run ? 'background:#ff453a' : ''}">${tm.run ? 'Отмена' : 'Старт'}</button></div>`;
        w.className = 'appwin' + (ctx.ph.os.dark ? '' : ' light'); w.innerHTML = `<div class="ahead"><span style="flex:1">${tabs.find(t => t[0] === tab)[1]}</span></div><div class="abody" id="abody">${body}</div><div style="position:absolute;bottom:calc(var(--u)*24);left:0;right:0;display:flex;background:rgba(128,128,128,.2);height:calc(var(--u)*48)">${tabs.map(t => `<button data-t="${t[0]}" style="flex:1;font-weight:${tab === t[0] ? 700 : 400};opacity:${tab === t[0] ? 1 : .6};font-size:calc(var(--u)*13)">${t[1]}</button>`).join('')}</div>`;
      }
      draw();
      w.onclick = e => {
        const b = e.target.closest('[data-t],[data-c],[data-s]'); if (!b) return; PD.snd.play('tap');
        if (b.dataset.t) { tab = b.dataset.t; draw(); } else if (b.dataset.s) { tm.set = +b.dataset.s; draw(); }
        else if (b.dataset.c === 'sw') { if (sw.run) { sw.acc += performance.now() - sw.t0; sw.run = false; } else { sw.t0 = performance.now(); sw.run = true; } draw(); }
        else if (b.dataset.c === 'lap') { if (sw.run) sw.laps.unshift(sw.acc + performance.now() - sw.t0); else { sw.acc = 0; sw.laps = []; } draw(); }
        else if (b.dataset.c === 'tm') { if (tm.run) tm.run = false; else { tm.run = true; tm.end = Date.now() + tm.set * 1000; } draw(); }
      };
      iv = setInterval(() => {
        if (!w.isConnected) return clearInterval(iv); const ct = w.querySelector('#ct'); if (ct) { ct.textContent = new Date().toLocaleTimeString('ru-RU'); w.querySelectorAll('[data-z]').forEach(z => { z.textContent = new Date().toLocaleTimeString('ru-RU', { timeZone: z.dataset.z, hour: '2-digit', minute: '2-digit' }); }); }
        const s = w.querySelector('#swt'); if (s && sw.run) s.textContent = fm(sw.acc + performance.now() - sw.t0);
        const t = w.querySelector('#tmt'); if (t && tm.run) { const left = Math.max(0, Math.ceil((tm.end - Date.now()) / 1000)); t.textContent = ftm(left); if (left <= 0) { tm.run = false; PD.snd.play('legendary'); OS.push('Часы', 'Таймер завершён', '⏰'); draw(); } }
      }, 100);
      w._cl = () => clearInterval(iv);
    }, light: true, onClose(app) { app.win._cl && app.win._cl(); }
  });

  /* ---------- ЗАМЕТКИ ---------- */
  OS.reg({
    id: 'notes', light: true,
    open(w, ctx) {
      const ph = ctx.ph; let edit = null;
      function list() { const n = ph.os.notes; w.className = 'appwin' + (ph.os.dark ? '' : ' light'); w.innerHTML = `<div class="ahead"><span style="flex:1">Заметки</span><button data-n2="new">${ic('plus')}</button></div><div class="abody" id="abody">${n.length ? n.map(x => `<div class="note" data-id="${x.id}">${esc(x.text.slice(0, 140))}<small>${U.dateStr(x.ts)}</small></div>`).join('') : '<div style="text-align:center;opacity:.55;padding:calc(var(--u)*60) 0">Заметок пока нет.<br>Нажмите «+», чтобы создать.</div>'}</div>`; }
      function editor(id) { const n = id ? ph.os.notes.find(x => x.id === id) : null; edit = id || 'new'; w.innerHTML = `<div class="ahead"><button data-n2="back">${ic('back')}</button><span style="flex:1">${n ? 'Заметка' : 'Новая заметка'}</span>${n ? `<button data-n2="del">${ic('trash')}</button>` : ''}<button data-n2="save" style="width:auto;padding:0 calc(var(--u)*14);border-radius:calc(var(--u)*17);background:var(--acc);color:#fff;font-size:calc(var(--u)*13);font-weight:700">Сохранить</button></div><div class="abody"><textarea id="nt" style="height:calc(var(--u)*320)" placeholder="Текст заметки…" maxlength="2000">${n ? esc(n.text) : ''}</textarea></div>`; setTimeout(() => { const t = w.querySelector('#nt'); t && t.focus(); }, 300); }
      list();
      w.onclick = e => {
        const c = e.target.closest('[data-n2]'), nd = e.target.closest('.note'); if (nd && !c) { PD.snd.play('tap'); return editor(nd.dataset.id); } if (!c) return; PD.snd.play('tap'); const a = c.dataset.n2;
        if (a === 'new') editor(null); else if (a === 'back') { edit = null; list(); } else if (a === 'save') { const t = w.querySelector('#nt').value.trim(); if (t) { if (edit && edit !== 'new') { const n = ph.os.notes.find(x => x.id === edit); n.text = t; n.ts = Date.now(); } else ph.os.notes.unshift({ id: U.uidGen(), text: t, ts: Date.now() }); PD.save(); PD.snd.play('ok'); } edit = null; list(); } else if (a === 'del') { ph.os.notes = ph.os.notes.filter(x => x.id !== edit); PD.save(); edit = null; list(); }
      };
      ctx.win._back = () => { if (edit) { edit = null; list(); return true; } return false; };
    },
    back(app) { return app.win._back ? app.win._back() : false; }
  });
})(window);
