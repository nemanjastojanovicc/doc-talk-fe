# DocTalk

## ▶️ Pokretanje iz terminala

Iz root foldera projekta (`doc-talk-fe`):

1. Instalacija dependencies:

```
yarn add
```

2. Pokreni frontend + backend zajedno:

```
yarn start
```

Alternativno, odvojeno:

```
yarn start-fe
yarn start-be
```

Frontend: `http://localhost:3000`  
Backend (Swagger): `http://localhost:8000/docs`

---

## 🔑 Test kredencijali

### Doktor (user role)

- Email: `jelena.auth@example.com`
- Password: `sigurna123`

### Pacijent (patient role)

- Email: `patient1@gmail.com`
- Password: `pacijent1234`

---

## ✅ Skorašnje izmene

- Dodate auth rute na backendu: `signup`, `login`, `refresh-token`, `logout`, `user`.
- Dodate migracije (`backend/migrations.py`) i automatsko izvršavanje pri startup-u.
- Dodata rola `user` i rola `patient`.
- Doktor može da kreira pacijenta sa email + lozinkom (pacijent se kasnije loguje tim podacima).
- Dodata patient-only ruta `GET /patients/me`.
- Dodata posebna stranica za pacijenta (`/my-health`) sa samo njegovim podacima.
- Login redirect sada ide po ulozi:
  - `patient` ➜ `/my-health`
  - ostali user-i ➜ `/home`
- Iz konsultacije se automatski dopunjavaju `diagnosesHistory` i `medications` u kartonu pacijenta.
