/* PHONE DROP 2.0.0 — каталог моделей (58 устройств) */
(function (G) {
  'use strict';
  // P(id, бренд, название, год, цена б/у «отличное» ₽, чип, [cpu,gpu,mem] тыс.баллов, ОЗУ, [память], экран, АКБ мАч, камеры, [мм ш,в], оболочка, цвета)
  // Цвет: "Название:основной:второй:рамка"
  const MODELS = [];
  function P(id, br, n, yr, price, chip, sc, ram, st, scr, bat, cam, dim, shell, cols, o) {
    const colors = cols.split('|').map(s => { const a = s.split(':'); return { name: a[0], c1: a[1], c2: a[2], fr: a[3] }; });
    const m = Object.assign({
      id, br, n, yr, price, chip, cpu: sc[0], gpu: sc[1], mem: sc[2], ram, st, scr, bat, cam,
      w: dim[0], h: dim[1], shell, colors
    }, o || {});
    m.ux = Math.round((m.cpu + m.gpu) * 0.17);
    m.total = m.cpu + m.gpu + m.mem + m.ux;
    m.tier = price >= 90000 ? 5 : price >= 60000 ? 4 : price >= 35000 ? 3 : price >= 18000 ? 2 : 1;
    MODELS.push(m);
  }

  /* ---------- Apple ---------- */
  P('ip11', 'Apple', 'iPhone 11', 2019, 13500, 'Apple A13 Bionic', [200, 230, 70], 4, [64, 128, 256], '6.1" Liquid Retina LCD 60 Гц', 3110, '12 Мп + 12 Мп (сверхширокая)', [75.7, 150.9], 'ios',
    'Чёрный:#2b2c2e:#1a1a1c:#2a2a2c|Белый:#f1f1ee:#d9d9d6:#cfcfcb|Зелёный:#aee1cd:#8fcfb6:#9ed4be|Жёлтый:#f7e07a:#f0d05a:#e8cf6c|Фиолетовый:#d1cdda:#b9b3c8:#c0bccd|Красный:#ba0c2f:#8f0922:#a30a29', { notch: 'wide', frame: 'round', rad: 0.115, bezel: 0.052 });
  P('ip12', 'Apple', 'iPhone 12', 2020, 19500, 'Apple A14 Bionic', [230, 310, 75], 4, [64, 128, 256], '6.1" Super Retina XDR OLED 60 Гц', 2815, '12 Мп + 12 Мп (сверхширокая)', [71.5, 146.7], 'ios',
    'Чёрный:#2e2f33:#1c1d20:#34353a|Белый:#f4f4f2:#dcdcd9:#e4e4e1|Синий:#2f5f8f:#244a73:#38668f|Зелёный:#b9dcc8:#9ac7ae:#aed1bd|Красный:#c00f2d:#930a22:#c8283f|Фиолетовый:#cbc3e0:#b0a6cd:#bdb4d6', { notch: 'wide', frame: 'flat', rad: 0.13, bezel: 0.045 });
  P('ip13', 'Apple', 'iPhone 13', 2021, 27000, 'Apple A15 Bionic', [270, 400, 80], 4, [128, 256, 512], '6.1" Super Retina XDR OLED 60 Гц', 3240, '12 Мп + 12 Мп (диагональ)', [71.5, 146.7], 'ios',
    'Полночь:#26292f:#17191d:#2c3036|Сияющая звезда:#f3eee6:#e0d9cc:#e8e2d6|Синий:#3e5d78:#2c465d:#486782|Розовый:#f4cfd0:#e8b2b6:#efc3c5|Красный:#bf1230:#92091f:#c52f45|Зелёный:#394e3f:#2a3b30:#43594a', { notch: 'small', frame: 'flat', rad: 0.13, bezel: 0.042 });
  P('ip13p', 'Apple', 'iPhone 13 Pro', 2021, 37000, 'Apple A15 Bionic (5 ядер GPU)', [275, 440, 85], 6, [128, 256, 512, 1024], '6.1" Super Retina XDR OLED 120 Гц', 3095, '12 Мп + 12 Мп + 12 Мп (тел.)', [71.5, 146.7], 'ios',
    'Графитовый:#4a4a4f:#35353a:#56565b|Золотой:#f4e3c4:#e3cf9f:#e8d2a0|Серебристый:#eceef0:#d4d7da:#d5d6d8|Небесно-голубой:#a9c4dd:#8aabc8:#98b4cf|Альпийский зелёный:#586f5c:#445a49:#65806a', { notch: 'small', frame: 'steel', rad: 0.13, bezel: 0.04 });
  P('ip14', 'Apple', 'iPhone 14', 2022, 33500, 'Apple A15 Bionic (5 ядер GPU)', [275, 420, 85], 6, [128, 256, 512], '6.1" Super Retina XDR OLED 60 Гц', 3279, '12 Мп + 12 Мп (диагональ)', [71.5, 146.7], 'ios',
    'Полночь:#272a30:#181a1e:#2d3037|Сияющая звезда:#f2ede4:#ded7c9:#e6e0d3|Фиолетовый:#d6cfe6:#bdb3d4:#c9c1dc|Синий:#a9c5e0:#8bacc9:#9ab7d2|Красный:#c5112f:#97091f:#cc2f46|Жёлтый:#f7e98f:#ecd868:#f1e07a', { notch: 'small', frame: 'flat', rad: 0.13, bezel: 0.04 });
  P('ip14p', 'Apple', 'iPhone 14 Pro', 2022, 47000, 'Apple A16 Bionic', [330, 560, 95], 6, [128, 256, 512, 1024], '6.1" Super Retina XDR OLED 120 Гц', 3200, '48 Мп + 12 Мп + 12 Мп (тел.)', [71.5, 147.5], 'ios',
    'Чёрный космос:#2d2d30:#1b1b1e:#3a3a3d|Серебристый:#eeeeef:#d6d6d8:#d7d7d9|Золотой:#f1e1c3:#dfc99d:#e5d0a0|Тёмно-фиолетовый:#59506a:#443b54:#625974', { notch: 'island', frame: 'steel', rad: 0.13, bezel: 0.038 });
  P('ip15', 'Apple', 'iPhone 15', 2023, 47000, 'Apple A16 Bionic', [335, 540, 95], 6, [128, 256, 512], '6.1" Super Retina XDR OLED 60 Гц', 3349, '48 Мп + 12 Мп (диагональ)', [71.6, 147.6], 'ios',
    'Чёрный:#3b3d42:#2b2d31:#44464b|Синий:#cfdbe6:#b6c8d8:#c2d1de|Зелёный:#d3dfce:#bccdb5:#c6d5c0|Жёлтый:#f1e8b6:#e3d68e:#ebdfa2|Розовый:#f1dcdc:#e4c3c3:#ead0d0', { notch: 'island', frame: 'flat', rad: 0.13, bezel: 0.036, matteGlass: true });
  P('ip15p', 'Apple', 'iPhone 15 Pro', 2023, 62000, 'Apple A17 Pro', [400, 820, 110], 8, [128, 256, 512, 1024], '6.1" Super Retina XDR OLED 120 Гц', 3274, '48 Мп + 12 Мп + 12 Мп (тел. 3×)', [70.6, 146.6], 'ios',
    'Чёрный титан:#3a3b3d:#2a2b2d:#47484a|Белый титан:#e9e8e3:#d3d1ca:#d4d2cb|Синий титан:#3f4a5a:#2f3846:#4a5668|Натуральный титан:#b9b0a4:#9f968a:#a99f92', { notch: 'island', frame: 'titan', rad: 0.125, bezel: 0.03, matteGlass: true });
  P('ip16', 'Apple', 'iPhone 16', 2024, 63000, 'Apple A18', [420, 820, 115], 8, [128, 256, 512], '6.1" Super Retina XDR OLED 60 Гц', 3561, '48 Мп + 12 Мп (вертикаль)', [71.6, 147.6], 'ios',
    'Чёрный:#34363b:#25272b:#3d4046|Белый:#f1f1ef:#dcdcd8:#e2e2df|Розовый:#f4c9d8:#e8aec3:#eebccb|Бирюзовый:#a8d2d3:#86bbbd:#98c6c8|Ультрамарин:#8fa2f3:#7287e0:#8397ec', { notch: 'island', frame: 'flat', rad: 0.13, bezel: 0.033, matteGlass: true });
  P('ip16p', 'Apple', 'iPhone 16 Pro', 2024, 83000, 'Apple A18 Pro', [450, 980, 120], 8, [128, 256, 512, 1024], '6.3" Super Retina XDR OLED 120 Гц', 3582, '48 Мп + 48 Мп + 12 Мп (тел. 5×)', [71.5, 149.6], 'ios',
    'Чёрный титан:#3c3c3e:#2b2b2d:#48484a|Белый титан:#e8e7e2:#d2d0c9:#d3d1ca|Натуральный титан:#b8aea2:#9d9488:#a79d90|Пустынный титан:#c3a58f:#a98b75:#b09580', { notch: 'island', frame: 'titan', rad: 0.125, bezel: 0.027, matteGlass: true });
  P('ip17', 'Apple', 'iPhone 17', 2025, 88000, 'Apple A19', [480, 1000, 125], 8, [256, 512], '6.3" Super Retina XDR OLED 120 Гц', 3692, '48 Мп + 48 Мп (вертикаль)', [71.5, 149.6], 'ios',
    'Чёрный:#2f3136:#202226:#3a3d43|Белый:#f2f2f0:#ddddd9:#e3e3e0|Туманно-синий:#b5c8e0:#98b0cf:#a8bdd6|Шалфей:#b9c9ad:#9fb391:#adbf9f|Лавандовый:#cfc3e6:#b6a6d6:#c2b5dc', { notch: 'island', frame: 'flat', rad: 0.125, bezel: 0.026, matteGlass: true });
  P('ip17pm', 'Apple', 'iPhone 17 Pro Max', 2025, 142000, 'Apple A19 Pro', [540, 1300, 135], 12, [256, 512, 1024, 2048], '6.9" Super Retina XDR OLED 120 Гц', 5088, '48 Мп + 48 Мп + 48 Мп (тел. 4×/8×)', [78.0, 163.4], 'ios',
    'Серебристый:#dfe0e3:#c8cace:#c9cbcf|Космический оранжевый:#e0762e:#c45b1a:#cf6a27|Глубокий синий:#2e3b5a:#202b45:#3a4766', { notch: 'island', frame: 'alu', rad: 0.12, bezel: 0.024, matteGlass: true });

  /* ---------- Samsung ---------- */
  P('s21', 'Samsung', 'Galaxy S21', 2021, 14500, 'Exynos 2100', [260, 250, 85], 8, [128, 256], '6.2" Dynamic AMOLED 2X 120 Гц', 4000, '12 Мп + 64 Мп + 12 Мп', [71.2, 151.7], 'oneui',
    'Фантомный серый:#5b5c63:#42434a:#4b4c52|Фантомный белый:#eeeeee:#d6d6d9:#dedee0|Фантомный фиолетовый:#a79bd1:#8a7cb9:#9a8ec6|Фантомный розовый:#e8b8c2:#d79aa8:#dfa9b4', { notch: 'punch', frame: 'round', rad: 0.12, bezel: 0.036, punch: 'c' });
  P('s22', 'Samsung', 'Galaxy S22', 2022, 19000, 'Exynos 2200', [300, 350, 90], 8, [128, 256], '6.1" Dynamic AMOLED 2X 120 Гц', 3700, '50 Мп + 12 Мп + 10 Мп (тел.)', [70.6, 146.0], 'oneui',
    'Фантомный чёрный:#25262b:#17181b:#2e2f34|Фантомный белый:#f1f1f1:#dadadd:#e3e3e5|Зелёный:#6e8a74:#566f5c:#62806a|Бордовый:#7a2437:#5c1727:#6c2032', { notch: 'punch', frame: 'flat', rad: 0.12, bezel: 0.036, punch: 'c' });
  P('s23', 'Samsung', 'Galaxy S23', 2023, 30000, 'Snapdragon 8 Gen 2', [380, 700, 100], 8, [128, 256, 512], '6.1" Dynamic AMOLED 2X 120 Гц', 3900, '50 Мп + 12 Мп + 10 Мп (тел. 3×)', [70.9, 146.3], 'oneui',
    'Фантомный чёрный:#27282c:#18191c:#303136|Кремовый:#eee3cf:#d9cbb0:#e2d6bf|Зелёный:#7c9382:#617868:#6d8573|Лавандовый:#cfc7e3:#b5aad0:#c3b9d9', { notch: 'punch', frame: 'flat', rad: 0.12, bezel: 0.034, punch: 'c' });
  P('s23u', 'Samsung', 'Galaxy S23 Ultra', 2023, 52000, 'Snapdragon 8 Gen 2', [385, 720, 105], 12, [256, 512, 1024], '6.8" Dynamic AMOLED 2X 120 Гц, S Pen', 5000, '200 Мп + 12 Мп + 10 Мп + 10 Мп', [78.1, 163.4], 'oneui',
    'Фантомный чёрный:#242529:#141517:#2e2f33|Кремовый:#ece1cc:#d6c8ac:#e0d4bb|Зелёный:#56705e:#41594a:#4d6654|Лавандовый:#cbc3e0:#b0a5cd:#bfb5d6', { notch: 'punch', frame: 'flat', rad: 0.075, bezel: 0.03, punch: 'c' });
  P('s24', 'Samsung', 'Galaxy S24', 2024, 40000, 'Exynos 2400', [400, 780, 100], 8, [128, 256, 512], '6.2" Dynamic AMOLED 2X 120 Гц', 4000, '50 Мп + 12 Мп + 10 Мп (тел. 3×)', [70.6, 147.0], 'oneui',
    'Оникс чёрный:#2a2b2f:#1b1c1f:#3a3b3f|Мраморный серый:#bfbfc2:#a6a6aa:#aaaaae|Кобальтовый фиолетовый:#b8a6dc:#9d89c8:#a794cf|Янтарный жёлтый:#f0d77a:#e0c25c:#e5ca66', { notch: 'punch', frame: 'alu', rad: 0.105, bezel: 0.03, punch: 'c' });
  P('s24u', 'Samsung', 'Galaxy S24 Ultra', 2024, 72000, 'Snapdragon 8 Gen 3 for Galaxy', [470, 950, 120], 12, [256, 512, 1024], '6.8" Dynamic AMOLED 2X 120 Гц, S Pen', 5000, '200 Мп + 50 Мп (5×) + 12 Мп + 10 Мп', [79.0, 162.3], 'oneui',
    'Титановый чёрный:#303135:#202124:#3a3b3f|Титановый серый:#8b8b8d:#707072:#7a7a7c|Титановый фиолетовый:#9f94b6:#847999:#8e83a3|Титановый жёлтый:#d9cf9b:#c4b97e:#cbc189', { notch: 'punch', frame: 'titan', rad: 0.06, bezel: 0.026, punch: 'c', flatScreen: true });
  P('s25', 'Samsung', 'Galaxy S25', 2025, 56000, 'Snapdragon 8 Elite for Galaxy', [560, 1150, 135], 12, [128, 256, 512], '6.2" Dynamic AMOLED 2X 120 Гц', 4000, '50 Мп + 12 Мп + 10 Мп (тел. 3×)', [70.5, 146.9], 'oneui',
    'Тёмно-синий:#273247:#192233:#303c52|Ледяной голубой:#bcd3e6:#9fbbd2:#adc6da|Мятный:#bfe3d3:#9fcdb9:#add7c6|Серебристая тень:#d6d8dd:#bcbfc6:#c4c7cd', { notch: 'punch', frame: 'alu', rad: 0.105, bezel: 0.028, punch: 'c' });
  P('s25u', 'Samsung', 'Galaxy S25 Ultra', 2025, 95000, 'Snapdragon 8 Elite for Galaxy', [570, 1200, 140], 12, [256, 512, 1024], '6.9" Dynamic AMOLED 2X 120 Гц, S Pen', 5000, '200 Мп + 50 Мп (5×) + 50 Мп + 10 Мп', [77.6, 162.8], 'oneui',
    'Титановый серо-синий:#8d9aa6:#727f8b:#7b8894|Титановый чёрный:#2e2f33:#1d1e21:#3b3c40|Титановый серый:#9b9a96:#82817d:#8c8b87|Титановый бело-серебристый:#dcdcdc:#c3c3c4:#cacacb', { notch: 'punch', frame: 'titan', rad: 0.055, bezel: 0.022, punch: 'c', flatScreen: true });

  /* ---------- Xiaomi / Redmi / POCO ---------- */
  P('x13', 'Xiaomi', 'Xiaomi 13', 2023, 31000, 'Snapdragon 8 Gen 2', [380, 690, 100], 8, [128, 256], '6.36" AMOLED 120 Гц', 4500, '50 Мп + 10 Мп (3.2×) + 12 Мп', [71.5, 152.8], 'hyperos',
    'Чёрный:#2a2b2e:#1a1b1d:#4a4b4e|Белый:#f1f0ec:#dddbd5:#c9c8c2|Цветочный зелёный:#b8d4bd:#98bba0:#a9c6af|Синий:#6c9fd0:#5584b6:#6f8fb4', { notch: 'punch', frame: 'alu', rad: 0.12, bezel: 0.028, punch: 'c' });
  P('x14', 'Xiaomi', 'Xiaomi 14', 2024, 42000, 'Snapdragon 8 Gen 3', [460, 930, 115], 12, [256, 512], '6.36" LTPO AMOLED 120 Гц', 4610, '50 Мп + 50 Мп (3.2×) + 50 Мп', [71.5, 152.8], 'hyperos',
    'Чёрный:#2b2c2f:#1b1c1e:#4b4c4f|Белый:#f3f2ee:#dfddd7:#cac9c3|Нефритовый зелёный:#9db8a3:#7f9d87:#8aa890|Розовый:#efc8cf:#dfabb6:#e5b9c1', { notch: 'punch', frame: 'alu', rad: 0.12, bezel: 0.026, punch: 'c' });
  P('x14u', 'Xiaomi', 'Xiaomi 14 Ultra', 2024, 68000, 'Snapdragon 8 Gen 3', [465, 950, 125], 16, [256, 512, 1024], '6.73" LTPO AMOLED 120 Гц', 5000, '50 Мп + 50 Мп (3.2×) + 50 Мп (5×) + 50 Мп', [75.3, 161.4], 'hyperos',
    'Чёрный:#1f2023:#111214:#2a2b2e|Белый:#e9e9e6:#d3d3cf:#c8c8c4|Титановый серый:#7e8186:#656870:#7b7e84', { notch: 'punch', frame: 'steel', rad: 0.095, bezel: 0.024, punch: 'c' });
  P('x15', 'Xiaomi', 'Xiaomi 15', 2025, 55000, 'Snapdragon 8 Elite', [555, 1140, 135], 12, [256, 512, 1024], '6.36" LTPO AMOLED 120 Гц', 5240, '50 Мп + 50 Мп (3×) + 50 Мп', [71.2, 152.3], 'hyperos',
    'Чёрный:#26272a:#17181a:#47484b|Белый:#f1f1ee:#dcdcd7:#c7c7c3|Зелёный:#a4b9a8:#879f8c:#93a898|Жидкое серебро:#d3d5d8:#b8bbc0:#c1c4c8', { notch: 'punch', frame: 'alu', rad: 0.115, bezel: 0.022, punch: 'c' });
  P('rn12', 'Redmi', 'Redmi Note 12', 2023, 9500, 'Snapdragon 4 Gen 1', [150, 90, 50], 6, [64, 128], '6.67" AMOLED 120 Гц', 5000, '48 Мп + 8 Мп + 2 Мп', [76.0, 165.9], 'hyperos',
    'Оникс серый:#4b4d52:#33353a:#3d3f44|Мятный зелёный:#b6d9c6:#98c3ab:#a6ceb8|Ледяной голубой:#a8c7e6:#8bafd2:#9abbdb|Рассветное золото:#e7c88a:#d3ae68:#dcb978', { notch: 'punch', frame: 'plastic', rad: 0.115, bezel: 0.034, punch: 'c' });
  P('rn13p', 'Redmi', 'Redmi Note 13 Pro', 2024, 15500, 'Helio G99-Ultra', [200, 130, 60], 8, [128, 256, 512], '6.67" AMOLED 120 Гц', 5100, '200 Мп + 8 Мп + 2 Мп', [74.2, 161.2], 'hyperos',
    'Полночный чёрный:#2d2f34:#1c1e22:#3a3c41|Аврора фиолетовый:#a090d6:#8272c0:#9084c9|Океанский бирюзовый:#6cc5c0:#4fa8a4:#5db4b0|Коралловый фиолетовый:#d8a3d2:#c385bd:#cc93c6', { notch: 'punch', frame: 'plastic', rad: 0.11, bezel: 0.03, punch: 'c' });
  P('rn14p', 'Redmi', 'Redmi Note 14 Pro', 2025, 21000, 'Dimensity 7300-Ultra', [230, 160, 70], 8, [128, 256, 512], '6.67" AMOLED 120 Гц', 5500, '200 Мп + 8 Мп + 2 Мп', [74.7, 162.5], 'hyperos',
    'Полночный чёрный:#2b2d32:#1b1d21:#383a3f|Коралловый фиолетовый:#c6a4d8:#ad85c3:#b994cd|Лавандовый:#cdbfec:#b3a2dc:#c0b0e4|Океанский синий:#4a6fc7:#3957a5:#4565b5', { notch: 'punch', frame: 'plastic', rad: 0.115, bezel: 0.03, punch: 'c' });
  P('px6p', 'POCO', 'POCO X6 Pro', 2024, 20000, 'Dimensity 8300-Ultra', [410, 480, 95], 8, [256, 512], '6.67" AMOLED 120 Гц', 5000, '64 Мп + 8 Мп + 2 Мп', [74.3, 160.5], 'hyperos',
    'Жёлтый:#f4d321:#2b2b2d:#303033|Чёрный:#2b2c30:#1b1c1f:#38393d|Серый:#8d9096:#73767c:#7b7e84', { notch: 'punch', frame: 'plastic', rad: 0.11, bezel: 0.03, punch: 'c', pocoSplit: true });
  P('px7p', 'POCO', 'POCO X7 Pro', 2025, 24500, 'Dimensity 8400-Ultra', [470, 700, 105], 8, [256, 512], '6.67" AMOLED 120 Гц', 6000, '50 Мп + 8 Мп', [74.4, 160.5], 'hyperos',
    'Жёлтый:#f6d62a:#2c2c2e:#303033|Чёрный:#2b2c30:#1c1d20:#38393d|Зелёный:#6f9a8d:#547f72:#5d8a7d', { notch: 'punch', frame: 'plastic', rad: 0.11, bezel: 0.03, punch: 'c', pocoSplit: true });
  P('pf6', 'POCO', 'POCO F6', 2024, 30000, 'Snapdragon 8s Gen 3', [450, 780, 105], 12, [256, 512], '6.67" AMOLED 120 Гц', 5000, '50 Мп + 8 Мп', [74.7, 160.5], 'hyperos',
    'Титановый:#b9bcc2:#9fa2a9:#a9acb2|Зелёный:#6d8d78:#53735e:#5f806a|Чёрный:#2b2c30:#1b1c1f:#38393d', { notch: 'punch', frame: 'plastic', rad: 0.11, bezel: 0.028, punch: 'c' });

  /* ---------- Google Pixel ---------- */
  P('pix7', 'Google', 'Pixel 7', 2022, 17000, 'Google Tensor G2', [260, 250, 75], 8, [128, 256], '6.3" OLED 90 Гц', 4355, '50 Мп + 12 Мп (сверхширокая)', [73.2, 155.6], 'pixel',
    'Обсидиан:#2f3033:#1d1e20:#c8c9cc|Снежный:#eceeed:#d4d6d5:#c9cbca|Лемонграсс:#e9ecb3:#d3d78f:#cdd1a0', { notch: 'punch', frame: 'alu', rad: 0.115, bezel: 0.034, punch: 'c' });
  P('pix8', 'Google', 'Pixel 8', 2023, 27000, 'Google Tensor G3', [330, 420, 90], 8, [128, 256], '6.2" Actua OLED 120 Гц', 4575, '50 Мп + 12 Мп (сверхширокая)', [70.8, 150.5], 'pixel',
    'Обсидиан:#2e2f32:#1c1d1f:#bfc0c3|Лещина:#a6b4a8:#8b9b8d:#8f9e91|Роза:#f2c9c3:#e2aea7:#e3b6b0', { notch: 'punch', frame: 'alu', rad: 0.115, bezel: 0.03, punch: 'c' });
  P('pix9', 'Google', 'Pixel 9', 2024, 41000, 'Google Tensor G4', [360, 500, 100], 12, [128, 256], '6.3" Actua OLED 120 Гц', 4700, '50 Мп + 48 Мп (сверхширокая)', [72.0, 152.8], 'pixel',
    'Обсидиан:#303134:#1e1f21:#34353a|Фарфор:#e8e6e1:#d2d0ca:#dad8d2|Зимний зелёный:#bfd3c2:#a2bba6:#b0c8b4|Пион:#f3c2c8:#e4a5ad:#ebb3b9', { notch: 'punch', frame: 'alu', rad: 0.11, bezel: 0.028, punch: 'c' });

  /* ---------- OnePlus / Nothing / OPPO / Realme / Infinix ---------- */
  P('op12', 'OnePlus', 'OnePlus 12', 2024, 43000, 'Snapdragon 8 Gen 3', [475, 960, 125], 12, [256, 512], '6.82" LTPO AMOLED 120 Гц', 5400, '50 Мп + 48 Мп + 64 Мп (3×)', [75.8, 164.3], 'oxygen',
    'Изумрудный:#2e5846:#1f3f31:#8a8d8c|Шёлковый чёрный:#26272a:#161719:#7c7d80|Ледниковый белый:#eef0f1:#d6dadc:#b8bcbe', { notch: 'punch', frame: 'steel', rad: 0.1, bezel: 0.026, punch: 'c' });
  P('op13', 'OnePlus', 'OnePlus 13', 2025, 62000, 'Snapdragon 8 Elite', [570, 1180, 140], 12, [256, 512, 1024], '6.82" LTPO AMOLED 120 Гц', 6000, '50 Мп + 50 Мп (3×) + 50 Мп', [76.5, 162.9], 'oxygen',
    'Полночный океан:#1f3340:#13222d:#8a8d90|Арктический рассвет:#e8eaf3:#cfd3e4:#b9bdcb|Чёрное затмение:#212224:#121314:#6e7073', { notch: 'punch', frame: 'steel', rad: 0.11, bezel: 0.022, punch: 'c' });
  P('nt2', 'Nothing', 'Nothing Phone (2)', 2023, 25000, 'Snapdragon 8+ Gen 1', [330, 520, 90], 12, [128, 256, 512], '6.7" LTPO OLED 120 Гц', 4700, '50 Мп + 50 Мп', [75.2, 162.1], 'nothing',
    'Белый:#e9e9e6:#cfcfcb:#c8c8c4|Тёмно-серый:#4a4c50:#34363a:#3e4044', { notch: 'punch', frame: 'alu', rad: 0.1, bezel: 0.028, punch: 'c', transparent: true });
  P('nt3', 'Nothing', 'Nothing Phone (3)', 2025, 48000, 'Snapdragon 8s Gen 4', [430, 800, 105], 12, [256, 512], '6.67" Flexible AMOLED 120 Гц', 5150, '50 Мп + 50 Мп (3×) + 50 Мп', [75.6, 160.6], 'nothing',
    'Белый:#ecece9:#d3d3cf:#cfcfcb|Чёрный:#2a2b2e:#1a1b1d:#3a3b3e', { notch: 'punch', frame: 'alu', rad: 0.105, bezel: 0.026, punch: 'c', transparent: true });
  P('rno12', 'OPPO', 'OPPO Reno 12', 2024, 22000, 'Dimensity 7300-Energy', [220, 150, 70], 12, [256, 512], '6.7" AMOLED 120 Гц', 5000, '50 Мп + 8 Мп + 2 Мп', [75.1, 162.0], 'coloros',
    'Закатный персик:#f0b99c:#e19a78:#d9a283|Астро серебристый:#dfe1e6:#c3c7cf:#c6c9d0|Матовый коричневый:#7d5a47:#614332:#6b4c3b', { notch: 'punch', frame: 'plastic', rad: 0.12, bezel: 0.03, punch: 'c' });
  P('rgt6', 'Realme', 'Realme GT 6', 2024, 30000, 'Snapdragon 8s Gen 3', [450, 790, 105], 12, [256, 512], '6.78" LTPO AMOLED 120 Гц', 5500, '50 Мп + 50 Мп (перископ) + 8 Мп', [75.1, 162.1], 'realme',
    'Зелёный Razor:#b9e04c:#9cc231:#a7ca3e|Жидкое серебро:#d3d6dc:#b5b9c2:#bec1c8', { notch: 'punch', frame: 'plastic', rad: 0.115, bezel: 0.028, punch: 'c' });
  P('igt20', 'Infinix', 'Infinix GT 20 Pro', 2024, 14500, 'Dimensity 8200 Ultimate', [340, 560, 90], 12, [256, 512], '6.78" AMOLED 144 Гц', 5000, '108 Мп + 2 Мп + 2 Мп', [75.5, 164.4], 'xos',
    'Механический серебристый:#aeb2b8:#8e929a:#9a9ea5|Киберсиний:#2c4fb0:#1c3585:#26429a|Механический оранжевый:#e9833a:#cc6420:#d6722c', { notch: 'punch', frame: 'plastic', rad: 0.11, bezel: 0.03, punch: 'c', rgbLight: true });

  /* ---------- Дополнительно до 45 моделей ---------- */
  P('ipse3', 'Apple', 'iPhone SE (3-го поколения)', 2022, 15500, 'Apple A15 Bionic (4 ядра GPU)', [265, 340, 65], 4, [64, 128, 256], '4.7" Retina IPS LCD 60 Гц', 2018, '12 Мп', [67.3, 138.4], 'ios',
    'Тёмная ночь:#2b2c2f:#1a1b1d:#2d2e31|Сияющая звезда:#f2ede4:#ddd6c9:#e5dfd3|Красный:#bf1230:#92091f:#c52f45', { notch: 'homebtn', frame: 'alu', rad: 0.1, bezel: 0.1 });
  P('a55', 'Samsung', 'Galaxy A55', 2024, 17500, 'Exynos 1480', [210, 250, 70], 8, [128, 256], '6.6" Super AMOLED 120 Гц', 5000, '50 Мп + 12 Мп + 5 Мп', [77.4, 161.1], 'oneui',
    'Ледяной голубой:#a9c2dc:#8aa7c6:#9bb5cf|Тёмно-синий:#2b3550:#1c2438:#3a4560|Лиловый:#cbbfe3:#b2a3d0:#bfb1da|Лимонный:#e9e69b:#d3d078:#dbd886', { notch: 'punch', frame: 'alu', rad: 0.11, bezel: 0.04, punch: 'c' });
  P('pix9p', 'Google', 'Pixel 9 Pro', 2024, 55000, 'Google Tensor G4', [365, 510, 105], 16, [128, 256, 512], '6.3" LTPO OLED 120 Гц', 4700, '50 Мп + 48 Мп + 48 Мп (5×)', [72.0, 152.8], 'pixel',
    'Обсидиан:#2c2d30:#1a1b1d:#4a4b4f|Фарфор:#e9e7e2:#d3d1cb:#d9d7d1|Лещина:#a8b5a9:#8c9b8d:#97a498|Розовый кварц:#eec9c7:#dfaead:#e5bab9', { notch: 'punch', frame: 'alu', rad: 0.11, bezel: 0.026, punch: 'c' });
  P('hm6p', 'Honor', 'Honor Magic6 Pro', 2024, 49000, 'Snapdragon 8 Gen 3', [470, 950, 125], 12, [256, 512, 1024], '6.8" LTPO OLED 120 Гц', 5600, '50 Мп + 180 Мп (перископ) + 50 Мп', [77.1, 162.5], 'magicos',
    'Эпи зелёный:#3f5a4a:#2b4034:#7a8a7f|Чёрный:#27282b:#17181a:#4b4c4f|Серый:#7e8186:#656870:#6f7277', { notch: 'pill', frame: 'alu', rad: 0.1, bezel: 0.026 });
  P('moe50', 'Motorola', 'Motorola Edge 50 Pro', 2024, 20000, 'Snapdragon 7 Gen 3', [250, 280, 80], 12, [256, 512], '6.7" pOLED 144 Гц', 4500, '50 Мп + 13 Мп + 10 Мп (3×)', [72.4, 161.2], 'moto',
    'Чёрная красавица:#26272a:#171819:#3b3c40|Лунная жемчужина:#e6e4e8:#cfccd5:#d3d1d8|Люкс лавандовый:#c4b6e0:#a998cc:#b6a8d6', { notch: 'punch', frame: 'plastic', rad: 0.12, bezel: 0.026, punch: 'c', vegan: true });

  /* ---------- Обновление: новые модели ---------- */
  P('ip15pm', 'Apple', 'iPhone 15 Pro Max', 2023, 78000, 'Apple A17 Pro', [405, 830, 115], 8, [256, 512, 1024], '6.7" Super Retina XDR OLED 120 Гц', 4441, '48 Мп + 12 Мп + 12 Мп (тел. 5×)', [76.7, 159.9], 'ios',
    'Чёрный титан:#3a3b3d:#2a2b2d:#47484a|Белый титан:#e9e8e3:#d3d1ca:#d4d2cb|Синий титан:#3f4a5a:#2f3846:#4a5668|Натуральный титан:#b9b0a4:#9f968a:#a99f92', { notch: 'island', frame: 'titan', rad: 0.12, bezel: 0.03, matteGlass: true });
  P('ip16pm', 'Apple', 'iPhone 16 Pro Max', 2024, 102000, 'Apple A18 Pro', [455, 990, 122], 8, [256, 512, 1024], '6.9" Super Retina XDR OLED 120 Гц', 4685, '48 Мп + 48 Мп + 12 Мп (тел. 5×)', [77.6, 163.0], 'ios',
    'Чёрный титан:#3c3c3e:#2b2b2d:#48484a|Белый титан:#e8e7e2:#d2d0c9:#d3d1ca|Натуральный титан:#b8aea2:#9d9488:#a79d90|Пустынный титан:#c3a58f:#a98b75:#b09580', { notch: 'island', frame: 'titan', rad: 0.115, bezel: 0.024, matteGlass: true });
  P('s24fe', 'Samsung', 'Galaxy S24 FE', 2024, 31000, 'Exynos 2400e', [370, 700, 95], 8, [128, 256, 512], '6.7" Dynamic AMOLED 2X 120 Гц', 4700, '50 Мп + 12 Мп + 8 Мп (тел. 3×)', [77.3, 162.0], 'oneui',
    'Графитовый:#3a3d42:#2a2c30:#33363b|Голубой:#a9c6e0:#8cb0cf:#9bb9d3|Мятный:#b4dcc9:#95c7ae:#a4d0bb|Жёлтый:#efe08f:#ddcb68:#e5d479', { notch: 'punch', frame: 'alu', rad: 0.105, bezel: 0.032, punch: 'c' });
  P('x14t', 'Xiaomi', 'Xiaomi 14T Pro', 2024, 40000, 'Dimensity 9300+', [455, 900, 120], 12, [256, 512, 1024], '6.67" AMOLED 144 Гц', 5000, '50 Мп + 50 Мп (2.6×) + 12 Мп', [75.1, 160.5], 'hyperos',
    'Титановый серый:#6e7176:#555860:#62656b|Титановый чёрный:#26272a:#17181a:#3d3e42|Титановый синий:#4f6b93:#3b5273:#475f84', { notch: 'punch', frame: 'alu', rad: 0.11, bezel: 0.026, punch: 'c' });
  P('pix8p', 'Google', 'Pixel 8 Pro', 2023, 38000, 'Google Tensor G3', [335, 430, 95], 12, [128, 256, 512, 1024], '6.7" LTPO OLED 120 Гц', 5050, '50 Мп + 48 Мп + 48 Мп (5×)', [76.5, 162.6], 'pixel',
    'Обсидиан:#2d2e31:#1b1c1e:#bdbec1|Фарфор:#ebe9e4:#d4d2cc:#c9c8c4|Залив:#a8c3d6:#8aa8bd:#9bb4c6', { notch: 'punch', frame: 'alu', rad: 0.1, bezel: 0.026, punch: 'c' });
  P('pf7p', 'POCO', 'POCO F7 Pro', 2025, 34000, 'Snapdragon 8 Gen 3', [465, 940, 120], 12, [256, 512], '6.67" AMOLED 120 Гц', 6000, '50 Мп + 8 Мп', [75.0, 160.3], 'hyperos',
    'Серебристый:#d1d3d8:#b5b8bf:#bfc2c8|Синий:#3a58b4:#2b438d:#3a4f9a|Чёрный:#2a2b2f:#1a1b1e:#37383c', { notch: 'punch', frame: 'alu', rad: 0.11, bezel: 0.026, punch: 'c', pocoSplit: true });
  P('nt2a', 'Nothing', 'Nothing Phone (2a)', 2024, 17500, 'Dimensity 7200 Pro', [235, 190, 70], 8, [128, 256], '6.7" Flexible AMOLED 120 Гц', 5000, '50 Мп + 50 Мп', [76.3, 161.7], 'nothing',
    'Белый:#eaeae7:#d0d0cc:#cacac6|Чёрный:#2a2b2e:#1a1b1d:#3a3b3e|Голубой:#9fc2e0:#7ea8cb:#8fb5d4', { notch: 'punch', frame: 'plastic', rad: 0.105, bezel: 0.03, punch: 'c', transparent: true });
  P('op13r', 'OnePlus', 'OnePlus 13R', 2025, 40000, 'Snapdragon 8 Gen 3', [470, 950, 122], 12, [256, 512], '6.78" LTPO AMOLED 120 Гц', 6000, '50 Мп + 50 Мп (2×) + 8 Мп', [75.8, 161.7], 'oxygen',
    'Небула нуар:#1f2a3a:#141c28:#7e8386|Небесная нить:#dbe6ee:#c1d0dc:#aab6bf', { notch: 'punch', frame: 'alu', rad: 0.105, bezel: 0.026, punch: 'c' });

  const BY_ID = {};
  MODELS.forEach(m => BY_ID[m.id] = m);
  G.MODELS = MODELS;
  G.MODEL_BY_ID = BY_ID;
  G.BRANDS = [...new Set(MODELS.map(m => m.br))];
})(typeof window !== 'undefined' ? window : globalThis);
