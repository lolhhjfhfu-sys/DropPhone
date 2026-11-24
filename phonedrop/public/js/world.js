/* PHONE DROP 2.0.0 — мир игры: состояния, города, транспорт, кейсы, промокоды */
(function (G) {
  'use strict';
  const APP_VERSION = '2.1.0';
  const START_MONEY = 10000;

  const CONDITIONS = {
    new:       { id: 'new',       name: 'Новое',       mul: 1.18, color: '#00b856', desc: 'В плёнке, полный комплект, гарантия',   bat: [100, 100] },
    excellent: { id: 'excellent', name: 'Отличное',    mul: 1.00, color: '#0af',    desc: 'Без следов использования',              bat: [90, 97] },
    good:      { id: 'good',      name: 'Хорошее',     mul: 0.82, color: '#f5a000', desc: 'Мелкие царапины и потёртости',          bat: [80, 89] },
    damaged:   { id: 'damaged',   name: 'Повреждённое',mul: 0.52, color: '#ff4053', desc: 'Трещины, сколы, следы падений',          bat: [62, 80] }
  };
  const COND_ORDER = ['new', 'excellent', 'good', 'damaged'];
  const STORAGE_MUL = [1, 1.08, 1.2, 1.38, 1.62];

  const RARITY = {
    common:    { id: 'common',    name: 'Обычный',      color: '#8b93a1', glow: '#aab2c0' },
    rare:      { id: 'rare',      name: 'Редкий',       color: '#2b9cff', glow: '#6cbcff' },
    epic:      { id: 'epic',      name: 'Эпический',    color: '#a45cff', glow: '#c394ff' },
    legendary: { id: 'legendary', name: 'Легендарный',  color: '#ffb020', glow: '#ffd070' },
    mythic:    { id: 'mythic',    name: 'Мифический',   color: '#ff3d5a', glow: '#ff8da0' }
  };
  const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];

  /* ---------- Города ---------- */
  const CITIES = [
    { id: 'msk', name: 'Москва',           lat: 55.75, lon: 37.62,  pm: 1.05, pop: 13 },
    { id: 'spb', name: 'Санкт-Петербург',  lat: 59.93, lon: 30.34,  pm: 1.03, pop: 5.6 },
    { id: 'kzn', name: 'Казань',           lat: 55.79, lon: 49.12,  pm: 0.99, pop: 1.3 },
    { id: 'ekb', name: 'Екатеринбург',     lat: 56.84, lon: 60.6,   pm: 0.98, pop: 1.5 },
    { id: 'nsk', name: 'Новосибирск',      lat: 55.03, lon: 82.92,  pm: 0.96, pop: 1.6 },
    { id: 'krd', name: 'Краснодар',        lat: 45.04, lon: 38.98,  pm: 0.99, pop: 1.1 },
    { id: 'nnv', name: 'Нижний Новгород',  lat: 56.33, lon: 44.0,   pm: 0.97, pop: 1.2 },
    { id: 'sam', name: 'Самара',           lat: 53.2,  lon: 50.15,  pm: 0.96, pop: 1.1 },
    { id: 'vvo', name: 'Владивосток',      lat: 43.12, lon: 131.89, pm: 0.91, pop: 0.6 },
    { id: 'kgd', name: 'Калининград',      lat: 54.71, lon: 20.51,  pm: 1.0,  pop: 0.5 }
  ];
  const CITY_BY_ID = {};
  CITIES.forEach(c => CITY_BY_ID[c.id] = c);

  function distKm(a, b) {
    const R = 6371, rad = x => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(s)));
  }
  // Варианты транспорта между городами
  function routes(fromId, toId) {
    if (fromId === toId) return [];
    const d = distKm(CITY_BY_ID[fromId], CITY_BY_ID[toId]);
    const out = [];
    const road = d * 1.18;
    if (d <= 2000) out.push({ type: 'bus', name: 'Автобус', km: Math.round(road), hours: +(road / 58 + 0.5).toFixed(1), price: Math.round((450 + road * 1.35) / 10) * 10 });
    if (d <= 6500) out.push({ type: 'train', name: 'Поезд', km: Math.round(road), hours: +(road / 85 + 0.8).toFixed(1), price: Math.round((700 + road * 2.1) / 10) * 10 });
    out.push({ type: 'plane', name: 'Самолёт', km: d, hours: +(d / 760 + 3.2).toFixed(1), price: Math.round((3200 + d * 3.4) / 10) * 10 });
    return out;
  }

  /* ---------- Кейсы ---------- */
  // w — вес (на 100 000): сумма по кейсу = 100 000, шансы показываются игроку и используются в розыгрыше
  const CASES = [
    {
      id: 'budget', name: 'Бюджетный кейс', price: 9900, accent: '#2fb457', accent2: '#8fe0a2',
      desc: 'Недорогие смартфоны. Шанс найти что-то громкое — небольшой, но есть.',
      cond: { new: 4, excellent: 14, good: 34, damaged: 48 },
      drops: [
        { r: 'common',    w: 68000, m: ['rn12', 'ip11', 's21', 'igt20', 'ipse3', 'pix7', 'nt2a'] },
        { r: 'rare',      w: 23000, m: ['rn13p', 'a55', 'ip12', 's22', 'rn14p', 'moe50', 's24fe'] },
        { r: 'epic',      w: 7500,  m: ['ip13', 'x13', 'px6p', 'rno12', 'px7p', 'nt2', 'pix8p'] },
        { r: 'legendary', w: 1300,  m: ['ip14', 's23', 'pf6', 'rgt6'] },
        { r: 'mythic',    w: 200,   m: ['ip13p', 's24'] }
      ]
    },
    {
      id: 'advanced', name: 'Продвинутый кейс', price: 29900, accent: '#2b7bff', accent2: '#8fb6ff',
      desc: 'Средний и верхний сегмент. Хорошие шансы на актуальные модели.',
      cond: { new: 12, excellent: 30, good: 36, damaged: 22 },
      drops: [
        { r: 'common',    w: 56000, m: ['ip13', 's23', 'x13', 'px7p', 'pf6', 'nt2', 'pix8', 'rgt6', 'ip14'] },
        { r: 'rare',      w: 29500, m: ['ip13p', 'ip14p', 's24', 'pix9', 'ip15', 'nt3', 'x14', 'x14t', 'op13r'] },
        { r: 'epic',      w: 11000, m: ['s23u', 's25', 'x15', 'op12', 'pix9p', 'hm6p', 'pf7p'] },
        { r: 'legendary', w: 3000,  m: ['ip15p', 'ip16', 's24u', 'x14u', 'op13', 'ip15pm'] },
        { r: 'mythic',    w: 500,   m: ['ip16p', 'ip17', 's25u', 'ip16pm'] }
      ]
    },
    {
      id: 'flagship', name: 'Флагманский кейс', price: 64900, accent: '#ff3d5a', accent2: '#ffb0bd',
      desc: 'Только топовые устройства. Почти всегда — новые или в отличном состоянии.',
      cond: { new: 32, excellent: 40, good: 23, damaged: 5 },
      drops: [
        { r: 'common',    w: 50000, m: ['ip15', 's24', 'x14', 'pix9', 's23u', 'op12', 'hm6p', 'pix9p', 's25', 'x15', 'nt3', 'ip14p'] },
        { r: 'rare',      w: 30000, m: ['ip15p', 'ip16', 's24u', 'op13', 'x14u', 'ip15pm'] },
        { r: 'epic',      w: 14000, m: ['ip16p', 's25u', 'ip16pm'] },
        { r: 'legendary', w: 5000,  m: ['ip17'] },
        { r: 'mythic',    w: 1000,  m: ['ip17pm'] }
      ]
    }
  ];
  const CASE_BY_ID = {};
  CASES.forEach(c => CASE_BY_ID[c.id] = c);

  /* ---------- Промокоды ---------- */
  // Награды: money / phone / case. Проверка кода выполняется на сервере (источник истины); этот список — запасной офлайн-режим.
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

  const NAMES_M = ['Алексей', 'Дмитрий', 'Сергей', 'Иван', 'Андрей', 'Максим', 'Артём', 'Никита', 'Роман', 'Михаил', 'Кирилл', 'Егор', 'Тимур', 'Павел'];
  const NAMES_F = ['Анна', 'Мария', 'Екатерина', 'Ольга', 'Наталья', 'Юлия', 'Алина', 'Дарья', 'София', 'Виктория', 'Ксения', 'Полина'];
  const SELLER_NOTES = [
    'Пользовался аккуратно, всегда в чехле и со стеклом.',
    'Продаю, потому что перехожу на другую модель.',
    'Состояние соответствует описанию, всё работает.',
    'Торг уместен, но без фанатизма. Звоните и пишите.',
    'Был подарком, использовал мало. Коробка и зарядка есть.',
    'Срочно, уезжаю. Отдам за адекватную цену.',
    'Покупал в официальном магазине, чек сохранился.',
    'Работает без нареканий, Face ID/отпечаток исправен.',
    'Менялся экран/аккумулятор — всё прозрачно, расскажу.',
    'Забирайте сегодня, завтра уже не будет.'
  ];

  G.PD = G.PD || {};
  Object.assign(G.PD, {
    APP_VERSION, START_MONEY, CONDITIONS, COND_ORDER, STORAGE_MUL, RARITY, RARITY_ORDER,
    CITIES, CITY_BY_ID, distKm, routes, CASES, CASE_BY_ID, PROMOS, NAMES_M, NAMES_F, SELLER_NOTES
  });
})(typeof window !== 'undefined' ? window : globalThis);
