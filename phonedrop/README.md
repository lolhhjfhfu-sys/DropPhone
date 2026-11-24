# PHONE DROP 2.0.0 — Telegram Mini App

Симулятор покупки/продажи/коллекционирования смартфонов. Фронтенд — чистый JS/CSS, сервер — Node 22 + SQLite (`node:sqlite`).

## Запуск
    node server.js                       # http://localhost:3000 (dev-режим)
    PORT=8080 DATA_DIR=./data BOT_TOKEN=123:ABC node server.js

- `BOT_TOKEN` — токен бота: включает проверку подписи Telegram initData. Без него сервер доверяет id из клиента (только для разработки!).
- `DATA_DIR` — каталог базы SQLite (прогресс игроков, бэкапы, использованные промокоды). Сохраняйте его при обновлениях — прогресс не удаляется.
- Telegram Mini App требует HTTPS: поставьте за nginx/Caddy/Cloudflare Tunnel и укажите URL в @BotFather (/newapp или кнопка меню).

## Промокоды (проверяются на сервере, одноразовые на игрока)
WELCOME2026, OBNOVA, PHONEDROP, RELEASE200, TYNTYTY, FLAGSHIP, BLACKFRIDAY, AVITO2026

## Хранение
IndexedDB + зеркало в localStorage + синхронизация с сервером (ревизии, до 25 бэкапов, восстановление в Профиль → Настройки).
