/* PHONE DROP 2.0.0 — запуск: загрузочный экран, Telegram WebApp, восстановление прогресса */
(function (G) {
  'use strict';
  const PD = G.PD, ui = PD.ui, U = PD.u;
  const $ = s => document.querySelector(s);
  let pct = 0;
  function prog(p, txt) { pct = Math.max(pct, p); $('#spFill').style.width = pct + '%'; $('#spPct').textContent = Math.round(pct) + '%'; if (txt) $('#spText').textContent = txt; }
  const tick = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));

  async function boot() {
    const t0 = performance.now();
    prog(8, 'Подготовка интерфейса…');
    const tg = G.Telegram && G.Telegram.WebApp;
    try { if (tg) { tg.ready(); tg.expand(); tg.disableVerticalSwipes && tg.disableVerticalSwipes(); tg.enableClosingConfirmation && 0; } } catch (e) { }
    await frame(); prog(22, 'Открываем базу данных…');
    try { await PD.store.init(); } catch (e) { console.error('init failed', e); PD.S = PD.S || PD.store.upgrade(PD.defaultState()); }
    prog(55, PD.net.online ? 'Синхронизация с сервером…' : 'Офлайн-режим: данные с устройства…');
    PD.snd.on = PD.S.settings.sound; PD.snd.vol = PD.S.settings.vol / 100;
    ui.applyTheme(); await frame();
    prog(72, 'Загружаем объявления…');
    PD.eco.listings(); // прогрев кэша рынка
    await frame(); prog(86, 'Рисуем телефоны…');
    // прогрев первых картинок
    PD.eco.listings().filter(l => l.city === PD.S.city).slice(0, 24).forEach(l => PD.art.uri(l.modelId, l.colorIdx, 'back', l.cond));
    await frame(); prog(96, 'Почти готово…');
    const minShow = 1500, left = minShow - (performance.now() - t0); if (left > 0) await tick(left);
    prog(100, 'Готово!'); await tick(250);
    $('#app').hidden = false;
    ui.stack = [{ name: 'home', params: {} }]; ui.tab = 'home'; ui.render('fade');
    const sp = $('#splash'); sp.classList.add('out'); setTimeout(() => sp.remove(), 600);
    ui.startTicks(); ui.syncBadge();
    PD.eco.syncPromos();
    // системная кнопка «назад» Telegram
    try { if (tg && tg.BackButton) { const upd = () => { (ui.stack.length > 1 && !PD.os.session()) ? tg.BackButton.show() : tg.BackButton.hide(); }; tg.BackButton.onClick(() => { if (PD.os.session()) PD.os.close(); else ui.back(); }); setInterval(upd, 400); } } catch (e) { }
    // первый запуск
    if (!PD.S.onboarded) {
      PD.S.onboarded = true; PD.save();
      const d = ui.dialog(`<div class="ic ok">${PD.ic('gift')}</div><h3>Добро пожаловать в Phone Drop!</h3><p>Вам начислено <b>10 000 ₽</b>. Покупайте телефоны на Avito, торгуйтесь, перепродавайте, открывайте кейсы — и включайте каждый телефон.</p><button class="btn blk g" data-ok>Начать</button>`, { sticky: true });
      d.querySelector('[data-ok]').onclick = () => { PD.snd.play('ok'); ui.closeModal(d); };
    } else if (PD.migrated) ui.alert('Прогресс перенесён', 'Данные из прошлой версии Phone Drop сохранены.', 'ok');
    // сохранение при уходе
    G.addEventListener('error', e => console.error('Ошибка:', e.message));
  }
  document.addEventListener('DOMContentLoaded', boot);
  if (document.readyState !== 'loading') boot();
})(window);
