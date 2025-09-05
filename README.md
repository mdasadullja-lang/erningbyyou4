# Earning Backend (Telegram WebApp)

## Quick start

```bash
cd earning-backend
cp .env.example .env
# edit .env (MongoDB, BOT_TOKEN, CORS_ORIGIN, ADMIN_USER_IDS)
npm install
npm run dev
```

The API will run on `http://localhost:4000` by default.

### Telegram verification
Send Telegram WebApp `initData` in the `x-telegram-init-data` header on every request.

### Key endpoints (user)
- `POST /api/auth/verify` { initData, start_param? }
- `GET /api/settings`
- `GET /api/me`
- `POST /api/me/profile` { name, email, phone, photoUrl }
- `POST /api/bonus/daily`
- `POST /api/ad/credit` { placement: 'rewardedPopup' | 'rewardedInterstitial' | 'appOpen' }
- `POST /api/withdraw` { method, account }
- `GET /api/withdraw`
- `GET /api/leaderboard`

### Admin (requires ADMIN_USER_IDS)
- `GET /api/admin/settings`
- `POST /api/admin/settings` (send full settings object)
- `GET /api/admin/withdraws?status=Pending`
- `PATCH /api/admin/withdraws/:id` { status }
- `POST /api/admin/user/:tgId/adjust` { amount }
- `POST /api/admin/user/:tgId/toggle-premium`
- `POST /api/admin/user/:tgId/toggle-ban`
