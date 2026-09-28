# PadosiPro – Register → OTP → Login → Basic Details → Task Selection

- `backend/` – Node.js + Express + SQLite (bcrypt password hashing, JWT, email OTP)
- `app/` – React Native (Expo). Fully native components, no WebView. Runs on Android and iOS.

## 1. Backend
```bash
cd backend
cp .env.example .env      # set JWT_SECRET; add SMTP_* to send real emails
npm install
npm start                 # http://localhost:4000
```
Without `SMTP_HOST`, the OTP is printed in the server console (development mode).
The SQLite file `padosipro.db` and the seeded tasks are created on first run.

## 2. App
```bash
cd app
npm install
npx expo install --fix    # aligns dependency versions with your Expo SDK
npm start                 # press "a" (Android emulator) / "i" (iOS simulator), or scan the QR in Expo Go
```
API URL: Android emulator uses `http://10.0.2.2:4000`, iOS simulator `http://localhost:4000`.
On a physical phone: `EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:4000 npm start`.

## API
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | – | email, password, confirmPassword |
| POST | `/api/auth/verify-otp` | – | email, otp |
| POST | `/api/auth/login` | – | email, password (verified users only) |
| PUT | `/api/user/basic-details` | Bearer | name, mobile, address, businessName |
| GET | `/api/tasks` | Bearer | – |
| POST | `/api/tasks/select` | Bearer | taskId |

Tables: `users` (credentials, `email_verified`, basic details, `selected_task_id`), `email_otps` (hashed code, expiry, attempts), `tasks`.

OTP expires in 10 minutes and locks after 5 wrong attempts. If a code expires, registering again with the same unverified email issues a fresh one, so no extra endpoints were needed.
# PadosiPro_Assignment
