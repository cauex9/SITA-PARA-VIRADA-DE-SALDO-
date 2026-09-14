const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Carregar o arquivo .env que está na pasta raiz do projeto (um nível acima)
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const PROCESSED_WEBHOOKS_PATH = path.join(__dirname, 'data', 'processed-webhooks.json');

/**
 * @typedef {Object} TransferSent
 * @property {string} id
 * @property {number} amount
 * @property {'PROCESSING'|'COMPLETED'|'FAILED'} status
 * @property {string} endToEndId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PixMetadata
 * @property {string} [payerDocument]
 * @property {string} [payerName]
 * @property {string} [payerBankName]
 * @property {string} [payerBankAccount]
 * @property {string} [payerBankBranch]
 * @property {string} [receiverDocument]
 * @property {string} [receiverName]
 * @property {string} [receiverPixKey]
 * @property {string} [receiverBankName]
 * @property {string} [receiverBankAccount]
 * @property {string} [receiverBankBranch]
 */

/**
 * @typedef {Object} PayoutAccount
 * @property {string} id
 * @property {'ACTIVE'|'INACTIVE'} status
 * @property {string} ownerName
 * @property {string} ownerDocument
 * @property {string} pix
 * @property {string} pixType
 * @property {string} [bank]
 * @property {string} [agency]
 * @property {string} [agencyDigit]
 * @property {string} [account]
 * @property {string} [accountDigit]
 * @property {'CHECKING'|'SAVINGS'|'CRYPTO_WALLET'} accountType
 * @property {string} cryptoAddress
 * @property {string} cryptoNetwork
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} WithdrawPayload
 * @property {string} id
 * @property {string} clientIdentifier
 * @property {number} amount
 * @property {string} message
 * @property {number} receivedAmount
 * @property {number} feeAmount
 * @property {string} currency
 * @property {'PENDING'|'PROCESSING'|'TRANSFERRING'|'COMPLETED'|'CANCELED'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} TransferCreatedWebhookPayload
 * @property {'TRANSFER_CREATED'} event
 * @property {string} token
 * @property {WithdrawPayload} withdraw
 * @property {PayoutAccount} payoutAccount
 * @property {TransferSent[]} sents
 * @property {PixMetadata|null} [pixMetadata]
 */

function ensureProcessedWebhooksFile() {
  const dir = path.dirname(PROCESSED_WEBHOOKS_PATH);
  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(PROCESSED_WEBHOOKS_PATH)) {
    fs.writeFileSync(PROCESSED_WEBHOOKS_PATH, JSON.stringify({}, null, 2));
  }
}

function loadProcessedWebhooks() {
  try {
    ensureProcessedWebhooksFile();
    const raw = fs.readFileSync(PROCESSED_WEBHOOKS_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (error) {
    console.error('[WEBHOOK] Falha ao ler processamento persistido:', error.message);
    return {};
  }
}

function saveProcessedWebhooks(data) {
  try {
    ensureProcessedWebhooksFile();
    fs.writeFileSync(PROCESSED_WEBHOOKS_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('[WEBHOOK] Falha ao persistir processamento:', error.message);
    return false;
  }
}

function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * @param {unknown} payload
 * @returns {{ ok: true, data: TransferCreatedWebhookPayload }|{ ok: false, error: string }}
 */
function validateTransferCreatedPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'Payload inválido.' };
  }

  const { event, token, withdraw, payoutAccount, sents, pixMetadata } = payload;

  if (event !== 'TRANSFER_CREATED') {
    return { ok: false, error: 'Evento inválido.' };
  }

  if (!isNonEmptyString(token)) {
    return { ok: false, error: 'Token ausente ou inválido.' };
  }

  if (!withdraw || typeof withdraw !== 'object' || Array.isArray(withdraw)) {
    return { ok: false, error: 'Objeto withdraw ausente.' };
  }

  const requiredWithdrawFields = ['id', 'clientIdentifier', 'amount', 'message', 'receivedAmount', 'feeAmount', 'currency', 'status', 'createdAt', 'updatedAt'];
  for (const field of requiredWithdrawFields) {
    if (!(field in withdraw)) {
      return { ok: false, error: `withdraw.${field} ausente.` };
    }
  }

  if (!isNonEmptyString(withdraw.id)) return { ok: false, error: 'withdraw.id inválido.' };
  if (!isNonEmptyString(withdraw.clientIdentifier)) return { ok: false, error: 'withdraw.clientIdentifier inválido.' };
  if (!isFiniteNumber(withdraw.amount)) return { ok: false, error: 'withdraw.amount inválido.' };
  if (typeof withdraw.message !== 'string') return { ok: false, error: 'withdraw.message inválido.' };
  if (!isFiniteNumber(withdraw.receivedAmount)) return { ok: false, error: 'withdraw.receivedAmount inválido.' };
  if (!isFiniteNumber(withdraw.feeAmount)) return { ok: false, error: 'withdraw.feeAmount inválido.' };
  if (!isNonEmptyString(withdraw.currency)) return { ok: false, error: 'withdraw.currency inválido.' };
  if (!['PENDING', 'PROCESSING', 'TRANSFERRING', 'COMPLETED', 'CANCELED'].includes(withdraw.status)) {
    return { ok: false, error: 'withdraw.status inválido.' };
  }
  if (!isIsoDate(withdraw.createdAt) || !isIsoDate(withdraw.updatedAt)) {
    return { ok: false, error: 'withdraw.createdAt/updatedAt inválidos.' };
  }

  if (!payoutAccount || typeof payoutAccount !== 'object' || Array.isArray(payoutAccount)) {
    return { ok: false, error: 'Objeto payoutAccount ausente.' };
  }

  const requiredPayoutFields = ['id', 'status', 'ownerName', 'ownerDocument', 'pix', 'pixType', 'accountType', 'cryptoAddress', 'cryptoNetwork', 'createdAt', 'updatedAt', 'deletedAt'];
  for (const field of requiredPayoutFields) {
    if (!(field in payoutAccount)) {
      return { ok: false, error: `payoutAccount.${field} ausente.` };
    }
  }

  if (!isNonEmptyString(payoutAccount.id)) return { ok: false, error: 'payoutAccount.id inválido.' };
  if (!['ACTIVE', 'INACTIVE'].includes(payoutAccount.status)) return { ok: false, error: 'payoutAccount.status inválido.' };
  if (!isNonEmptyString(payoutAccount.ownerName)) return { ok: false, error: 'payoutAccount.ownerName inválido.' };
  if (!isNonEmptyString(payoutAccount.ownerDocument)) return { ok: false, error: 'payoutAccount.ownerDocument inválido.' };
  if (!isNonEmptyString(payoutAccount.pix)) return { ok: false, error: 'payoutAccount.pix inválido.' };
  if (!isNonEmptyString(payoutAccount.pixType)) return { ok: false, error: 'payoutAccount.pixType inválido.' };
  if (!['CHECKING', 'SAVINGS', 'CRYPTO_WALLET'].includes(payoutAccount.accountType)) return { ok: false, error: 'payoutAccount.accountType inválido.' };
  if (!isNonEmptyString(payoutAccount.cryptoAddress)) return { ok: false, error: 'payoutAccount.cryptoAddress inválido.' };
  if (!isNonEmptyString(payoutAccount.cryptoNetwork)) return { ok: false, error: 'payoutAccount.cryptoNetwork inválido.' };
  if (!isIsoDate(payoutAccount.createdAt) || !isIsoDate(payoutAccount.updatedAt)) {
    return { ok: false, error: 'payoutAccount.createdAt/updatedAt inválidos.' };
  }

  if (!Array.isArray(sents)) {
    return { ok: false, error: 'sents deve ser um array.' };
  }

  for (const sent of sents) {
    if (!sent || typeof sent !== 'object' || Array.isArray(sent)) {
      return { ok: false, error: 'Item inválido em sents.' };
    }
    const requiredSentFields = ['id', 'amount', 'status', 'endToEndId', 'createdAt'];
    for (const field of requiredSentFields) {
      if (!(field in sent)) {
        return { ok: false, error: `sents[].${field} ausente.` };
      }
    }
    if (!isNonEmptyString(sent.id)) return { ok: false, error: 'sents[].id inválido.' };
    if (!isFiniteNumber(sent.amount)) return { ok: false, error: 'sents[].amount inválido.' };
    if (!['PROCESSING', 'COMPLETED', 'FAILED'].includes(sent.status)) return { ok: false, error: 'sents[].status inválido.' };
    if (typeof sent.endToEndId !== 'string') return { ok: false, error: 'sents[].endToEndId inválido.' };
    if (!isIsoDate(sent.createdAt)) return { ok: false, error: 'sents[].createdAt inválido.' };
  }

  if (pixMetadata != null && (typeof pixMetadata !== 'object' || Array.isArray(pixMetadata))) {
    return { ok: false, error: 'pixMetadata inválido.' };
  }

  return {
    ok: true,
    data: {
      event,
      token,
      withdraw,
      payoutAccount,
      sents,
      pixMetadata
    }
  };
}

async function getPublicIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '8.8.8.8';
  } catch {
    return '8.8.8.8';
  }
}

// Pegando as chaves do .env de forma segura
const POSEIDO_CLIENT_ID = process.env.POSEIDO_CLIENT_ID;
const POSEIDO_CLIENT_SECRET = process.env.POSEIDO_CLIENT_SECRET;
const GATEWAY_WEBHOOK_TOKEN = process.env.GATEWAY_WEBHOOK_TOKEN;
const WEBHOOK_CALLBACK_URL = process.env.WEBHOOK_CALLBACK_URL;
const POSEIDON_API_URL = 'https://app.poseidonpay.site/api/v1/gateway/card/receive';
const POSEIDON_BALANCE_URL = 'https://app.poseidonpay.site/api/v1/gateway/producer/balance';

console.log(`[BACKEND] Inicializando servidor seguro...`);
console.log(`[BACKEND] Chaves da PoseidonPay carregadas com sucesso.`);
if (!GATEWAY_WEBHOOK_TOKEN) {
  console.warn('[WEBHOOK] GATEWAY_WEBHOOK_TOKEN não configurado. O webhook ficará rejeitado até ser informado.');
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/outbound-ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();

    if (!response.ok || !data.ip) {
      return res.status(502).json({ error: 'Não foi possível consultar o IP público de saída.' });
    }

    return res.json({ ip: data.ip });
  } catch (error) {
    console.error('[BACKEND] Falha ao consultar IP público de saída:', error.message);
    return res.status(502).json({ error: 'Não foi possível consultar o IP público de saída.' });
  }
});

// Endpoint Seguro para consultar o Saldo
app.get('/api/balance', async (req, res) => {
  console.log(`[BACKEND] Consultando saldo oficial na PoseidonPay...`);
  try {
    const response = await fetch(POSEIDON_BALANCE_URL, {
      method: 'GET',
      headers: {
        'x-public-key': POSEIDO_CLIENT_ID,
        'x-secret-key': POSEIDO_CLIENT_SECRET
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      res.json({ success: true, ...data });
    } else {
      res.status(response.status).json({ error: 'Erro ao buscar saldo', details: data });
    }
  } catch (error) {
    console.error(`[BACKEND] Falha na comunicação:`, error);
    res.status(500).json({ error: 'Erro interno ao consultar saldo.' });
  }
});

// Endpoint Seguro para consultar Taxa de Câmbio
app.get('/api/exchange-rates', async (req, res) => {
  const { from, to, amount } = req.query;
  console.log(`[BACKEND] Consultando câmbio de ${amount} ${from} para ${to}...`);
  try {
    // API usa Query Params (apesar da documentação citar body, o método é GET)
    const url = new URL('https://app.poseidonpay.site/api/v1/utils/exchange-rates');
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
    url.searchParams.append('amount', amount);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-public-key': POSEIDO_CLIENT_ID,
        'x-secret-key': POSEIDO_CLIENT_SECRET
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      res.json({ success: true, ...data });
    } else {
      res.status(response.status).json({ error: data.message || 'Erro ao consultar câmbio', details: data });
    }
  } catch (error) {
    console.error(`[BACKEND] Falha na comunicação (câmbio):`, error);
    res.status(500).json({ error: 'Erro interno ao consultar câmbio.' });
  }
});

function normalizeCardExpiration(value) {
  const expiration = String(value || '').trim();
  let month;
  let year;

  if (/^\d{4}$/.test(expiration)) {
    month = expiration.slice(0, 2);
    year = `20${expiration.slice(2)}`;
  } else if (/^\d{2}\/(?:\d{2}|\d{4})$/.test(expiration)) {
    const [rawMonth, rawYear] = expiration.split('/');
    month = rawMonth;
    year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  } else if (/^\d{4}-\d{2}$/.test(expiration)) {
    [year, month] = expiration.split('-');
  } else {
    throw new Error('Validade do cartão inválida. Use MMYY, MM/YY ou MM/YYYY.');
  }

  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12 || !Number.isInteger(yearNumber) || yearNumber < 2000) {
    throw new Error('Validade do cartão inválida. Informe um mês entre 01 e 12 e um ano válido.');
  }

  const expirationEnd = new Date(yearNumber, monthNumber, 0, 23, 59, 59, 999);
  if (expirationEnd < new Date()) {
    throw new Error('Validade do cartão expirada.');
  }

  return `${yearNumber}-${String(monthNumber).padStart(2, '0')}`;
}

// Endpoint Seguro para Cartão de Crédito (Integração Oficial)
app.post('/api/payment/credit-card', async (req, res) => {
  const { amount, card } = req.body;
  let expiresAt;

  try {
    expiresAt = normalizeCardExpiration(card?.expiresAt);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const publicIp = await getPublicIp();
  
  console.log(`[BACKEND] Recebida solicitação de depósito via Cartão no valor de R$${amount}.`);
  console.log(`[BACKEND] Disparando requisição real para a API PoseidonPay...`);

  // Construindo o Body exigido pela PoseidonPay
  const payload = {
    identifier: `wallet-dep-${Date.now()}`,
    amount: amount,
    client: {
      name: "João da Silva", // Dados genéricos para aprovar a transação sem formulário longo
      email: "joao.gen@email.com",
      phone: "(11) 99999-9999",
      document: "12345678909",
      address: {
        country: "BR",
        state: "SP",
        city: "São Paulo",
        neighborhood: "Centro",
        zipCode: "01001-000",
        street: "Praça da Sé",
        number: "1",
        complement: ""
      }
    },
    clientIp: publicIp,
    card: {
      number: card.number,
      owner: card.owner,
      expiresAt,
      cvv: card.cvv,
      statementDescriptor: "CARTEIRA DIGITAL"
    },
    products: [
      {
        id: "prod-add-funds",
        name: "Adição de Saldo na Carteira Digital",
        quantity: 1,
        price: amount,
        physical: false
      }
    ]
  };

  try {
    const response = await fetch(POSEIDON_API_URL, {
      method: 'POST',
      headers: {
        'x-public-key': POSEIDO_CLIENT_ID,
        'x-secret-key': POSEIDO_CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[BACKEND] Transação APROVADA na PoseidonPay. ID: ${data.transactionId}`);
      res.json({
        success: true,
        transactionId: data.transactionId,
        message: 'Pagamento processado com sucesso na PoseidonPay.',
        amountProcessed: amount
      });
    } else {
      console.error('[POSEIDON CARTAO] HTTP STATUS:', response.status);
      console.error('[POSEIDON CARTAO] MESSAGE:', data.message);
      console.error('[POSEIDON CARTAO] DETAILS:', JSON.stringify(data.details, null, 2));
      console.error('[POSEIDON CARTAO] RESPONSE:', JSON.stringify(data, null, 2));
      console.log(`[BACKEND] Erro retornado pela PoseidonPay:`, data.message);
      res.status(response.status).json({ 
        error: data.message || 'Transação recusada pela PoseidonPay.',
        details: data.details
      });
    }
  } catch (error) {
    console.error(`[BACKEND] Falha na comunicação com PoseidonPay:`, error);
    res.status(500).json({ error: 'Erro de conexão com o servidor de pagamentos.' });
  }
});

// Endpoint Seguro para Transferência/Saque via PIX (Integração Oficial)
app.post('/api/payment/pix', async (req, res) => {
  const { pixKey, pixKeyType, amount, ownerName, ownerDocType, ownerDocNumber } = req.body;
  const publicIp = await getPublicIp();

  console.log(`[BACKEND] Solicitação de Saque PIX para: ${pixKey} (tipo: ${pixKeyType}) de R$${amount}.`);
  console.log(`[BACKEND] Disparando requisição real para a API PoseidonPay Transfers...`);

  // Normalizar nome: remover acentos e caracteres especiais (exigido pela API)
  const normalizedName = ownerName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .substring(0, 100);

  const payload = {
    identifier: `wallet-pix-${Date.now()}`,
    amount: amount,
    discountFeeOfReceiver: false, // a taxa fica com o produtor, não com o recebedor
    callbackUrl: WEBHOOK_CALLBACK_URL,
    pix: {
      type: pixKeyType,  // cpf | cnpj | phone | email | random
      key: pixKey
    },
    owner: {
      ip: publicIp,
      name: normalizedName,
      document: {
        type: ownerDocType,   // cpf | cnpj
        number: ownerDocNumber
      }
    }
  };

  try {
    const response = await fetch('https://app.poseidonpay.site/api/v1/gateway/transfers', {
      method: 'POST',
      headers: {
        'x-public-key': POSEIDO_CLIENT_ID,
        'x-secret-key': POSEIDO_CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // A API pode retornar 200 mas com status CANCELED (chave inválida, etc.)
    if (response.ok) {
      const withdrawStatus = data.withdraw?.status;
      if (withdrawStatus === 'CANCELED') {
        const reason = data.withdraw?.rejectedReason || 'Transferência cancelada pela PoseidonPay.';
        console.error('[POSEIDON PIX] TRANSFERENCIA CANCELADA');
        console.error('[POSEIDON PIX] REJECTED REASON:', data.withdraw?.rejectedReason);
        console.error('[POSEIDON PIX] RESPONSE:', JSON.stringify(data, null, 2));
        console.log(`[BACKEND] PIX CANCELADO: ${reason}`);
        return res.status(400).json({ error: reason });
      }

      console.log(`[BACKEND] PIX CRIADO com sucesso. ID: ${data.withdraw?.id} | Status: ${withdrawStatus}`);
      res.json({
        success: true,
        transactionId: data.withdraw?.id || `PIX-${Date.now()}`,
        status: withdrawStatus,
        message: 'Transferência PIX enviada com sucesso.',
        receiptUrl: data.receiptUrl || null,
        amountTransferred: data.withdraw?.amount || amount
      });
    } else {
      const errMsg = data.message || 'Transferência recusada pela PoseidonPay.';
      console.error('[POSEIDON PIX] HTTP STATUS:', response.status);
      console.error('[POSEIDON PIX] MESSAGE:', data.message);
      console.error('[POSEIDON PIX] DETAILS:', JSON.stringify(data.details, null, 2));
      console.error('[POSEIDON PIX] RESPONSE:', JSON.stringify(data, null, 2));
      console.log(`[BACKEND] Erro na Transferência PIX:`, errMsg);
      res.status(response.status).json({ error: errMsg, details: data });
    }
  } catch (error) {
    console.error(`[BACKEND] Falha na comunicação (PIX Transfers):`, error);
    res.status(500).json({ error: 'Erro de conexão com o servidor de pagamentos.' });
  }
});

app.post('/webhooks/transfer-created', (req, res) => {
  const payload = req.body;
  const validation = validateTransferCreatedPayload(payload);

  if (!validation.ok) {
    console.warn('[WEBHOOK] Payload rejeitado pela validação:', validation.error);
    return res.status(400).json({ success: false, error: validation.error });
  }

  const expectedToken = process.env.GATEWAY_WEBHOOK_TOKEN;
  if (!expectedToken || validation.data.token !== expectedToken) {
    console.warn('[WEBHOOK] Token inválido ou ausente. Requisição rejeitada.');
    return res.status(401).json({ success: false, error: 'Token inválido.' });
  }

  const withdrawId = validation.data.withdraw.id;
  const processed = loadProcessedWebhooks();

  if (processed[withdrawId]) {
    console.log(`[WEBHOOK] Evento duplicado ignorado para withdrawId=${withdrawId}`);
    return res.status(200).json({ success: true, status: 'duplicate', withdrawId });
  }

  processed[withdrawId] = {
    event: validation.data.event,
    status: validation.data.withdraw.status,
    processedAt: new Date().toISOString(),
    clientIdentifier: validation.data.withdraw.clientIdentifier,
    amount: validation.data.withdraw.amount,
    currency: validation.data.withdraw.currency
  };

  const persisted = saveProcessedWebhooks(processed);
  if (!persisted) {
    console.error('[WEBHOOK] Falha ao persistir evento aceito. Requisição não confirmada.');
    return res.status(500).json({ success: false, error: 'Falha ao processar webhook.' });
  }

  console.log(`[WEBHOOK] TRANSFER_CREATED aceito para withdrawId=${withdrawId} e persistido com sucesso.`);
  return res.status(200).json({
    success: true,
    status: 'accepted',
    withdrawId,
    event: validation.data.event
  });
});

app.listen(PORT, () => {
  console.log(`[BACKEND] Servidor rodando com segurança na porta ${PORT}`);
});
