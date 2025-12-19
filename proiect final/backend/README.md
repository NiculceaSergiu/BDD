# Platforma de Management Evenimente & Participanți

Backend Node.js cu arhitectură tip controller → service → repository, baze de date MySQL separate pentru autentificare și evenimente, JWT cu refresh tokens și rate limiting pe login.

## Setup rapid
1. Copiază `.env.example` în `.env` și ajustează valorile.
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Creează manual două baze de date MySQL (auth_db, events_db) și importă schemele:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS auth_db DEFAULT CHARACTER SET utf8mb4;"
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS events_db DEFAULT CHARACTER SET utf8mb4;"
   mysql -u root -p auth_db < db/auth_schema.sql
   mysql -u root -p events_db < db/events_schema.sql
   ```
3. Rulează serverul:
   ```bash
   npm install
   npm run dev
   ```
   API-ul rulează pe `http://localhost:3000`. Documentația Swagger: `http://localhost:3000/api/docs`.

## Scripturi
- `npm run dev` – pornește serverul cu nodemon
- `npm start` – pornește serverul cu node

## Endpoints principale
- `POST /api/auth/register` – creare cont (bcrypt)
- `POST /api/auth/login` – login cu rate limiting și emitere access/refresh tokens
- `POST /api/auth/refresh` – reemitere access token
- `POST /api/auth/logout` – șterge refresh token-ul
- `GET /api/events` / `GET /api/events/:id` – listare și detalii evenimente
- `POST /api/events` – creare eveniment + bilet (rol: organizer/admin, tranzacție)
- `POST /api/registrations` – înscriere la eveniment (rollback dacă nu mai sunt locuri)

## Structură
- `src/config` – config runtime (.env, swagger)
- `src/db` – pool-uri MySQL (auth_db, events_db)
- `src/repositories` – acces la date (users, refresh tokens, events, tickets, registrations)
- `src/services` – logică de business (autentificare, evenimente, înscrieri)
- `src/controllers` – layer HTTP
- `src/routes` – rute Express + validări Joi/Zod (Joi)
- `src/middleware` – auth JWT, roluri, rate limiting, validare request, error handler
- `src/utils` – JWT helpers, parole, date

## Note
- Access token: implicit 15 minute (`JWT_ACCESS_TTL`), refresh token salvat în DB (`refresh_tokens`) pentru revocare.
- Conexiuni MySQL cu `mysql2/promise` și pooling separat pentru fiecare bază de date.
- Pentru organizatori/admini, setarea rolului se face la înregistrare (`role` în payload). Ajustează manual în DB dacă vrei să promovezi un cont existent.
