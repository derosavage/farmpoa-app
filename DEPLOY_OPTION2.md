# FarmPOA Hosting (Option 2)

This setup deploys:
- Backend -> Render
- Frontend -> Vercel

## 1) Deploy backend to Render

1. Push this project to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select your repo (Render will detect `render.yaml`).
4. Create the service.
5. In Render service settings, fill these required env vars:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (min 32 chars)
   - `INTERNAL_API_KEY`
   - `AT_API_KEY` (if using Africa's Talking)
   - `AT_USERNAME` (if using Africa's Talking)
6. After first deploy, copy backend URL, for example:
   - `https://farmpoa-backend.onrender.com`

## 2) Deploy frontend to Vercel

1. In Vercel, click **Add New...** -> **Project**.
2. Select the same repo.
3. Set **Root Directory** to `farmpoa-ui-kit`.
4. Build settings:
   - Framework Preset: **Other**
   - Build Command: leave empty
   - Output Directory: leave empty
5. Deploy.

`vercel.json` already routes `/` to `farmpoa-web-dashboard.html`.

## 3) Allow frontend origin in backend CORS

1. Copy your Vercel site URL, for example:
   - `https://farmpoa-ui-kit.vercel.app`
2. In Render backend env vars, set:
   - `CORS_ORIGINS=https://farmpoa-ui-kit.vercel.app`
3. Redeploy backend.

If you use multiple domains, comma-separate them:
- `CORS_ORIGINS=https://farmpoa-ui-kit.vercel.app,https://your-custom-domain.com`

## 4) Verify production

- Backend docs: `https://<your-backend-domain>/docs`
- Frontend home: `https://<your-frontend-domain>/`
- API prefix in backend is `/api/v1`

## Notes

- Keep real secrets only in Render env vars, not in repo files.
- Render free tier can sleep when idle.
