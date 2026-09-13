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
- Variavel: `VITE_SUPABASE_URL=https://ttmqtvkevlfxyqbtyrxx.supabase.co`
- Variavel: `VITE_SUPABASE_ANON_KEY` com a chave publica/anon do projeto Supabase

O arquivo `netlify.toml` ja configura o build, o fallback para o React Router e a URL publica do Supabase. Configure `VITE_SUPABASE_ANON_KEY` nas variaveis de ambiente do site Netlify antes de publicar. Essa e a chave publica/anon, nunca uma `service_role`.

Nunca configure segredos da PoseidonPay na Netlify; eles devem ficar somente no Render.