# Deploy

## Render (API)

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Configure no Render:

- `POSEIDO_CLIENT_ID`
- `POSEIDO_CLIENT_SECRET`
- `GATEWAY_WEBHOOK_TOKEN`
- `WEBHOOK_CALLBACK_URL=https://SEU-SERVICO.onrender.com/webhooks/transfer-created`

## Netlify (frontend)

- Build Command: `npm run build`
- Publish Directory: `dist`
- Variavel: `VITE_BACKEND_URL=https://SEU-SERVICO.onrender.com`

O arquivo `netlify.toml` ja configura o build e o fallback para o React Router. Nunca configure segredos da PoseidonPay na Netlify; eles devem ficar somente no Render.