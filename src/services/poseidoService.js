/**
 * Serviço de Integração com o Servidor Backend Seguro.
 * 
 * Agora o Frontend não faz a simulação. Ele faz um fetch real
 * para o nosso Backend Local, que por sua vez se comunica (simuladamente por enquanto)
 * com a Poseido usando a Chave Privada segura.
 */

const DEFAULT_BACKEND_URL = 'https://sita-para-virada-de-saldo-1.onrender.com';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL
  || (import.meta.env.DEV ? 'http://localhost:3000' : DEFAULT_BACKEND_URL)).replace(/\/$/, '');

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `Servidor respondeu com HTTP ${response.status}.`);
  }

  return data;
}

export const poseidoService = {
  /**
   * Consulta o saldo oficial na PoseidonPay
   * @returns {Promise<Object>} Resposta contendo available, pending, fundLock
   */
  getBalance: async () => {
    try {
      return await requestJson(`${BACKEND_URL}/api/balance`);
    } catch (error) {
      throw new Error(error.message || 'Falha ao conectar com o servidor seguro.');
    }
  },

  /**
   * Consulta a taxa de câmbio na PoseidonPay
   * @param {string} from - Moeda de origem
   * @param {string} to - Moeda de destino
   * @param {number} amount - Valor a converter
   * @returns {Promise<Object>} Resposta contendo convertedAmount e exchangeRate
   */
  getExchangeRate: async (from, to, amount) => {
    try {
      return await requestJson(`${BACKEND_URL}/api/exchange-rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`);
    } catch (error) {
      throw new Error(error.message || 'Falha ao conectar com o servidor seguro.');
    }
  },

  /**
   * Processa um pagamento via Cartão de Crédito
   * @param {Object} paymentData - amount e dados do cartão (número, dono, validade, cvv)
   * @returns {Promise<Object>} Resposta da transação
   */
  processCreditCard: async (paymentData) => {
    try {
      return await requestJson(`${BACKEND_URL}/api/payment/credit-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
    } catch (error) {
      throw new Error(error.message || 'Falha ao conectar com o servidor seguro.');
    }
  },

  /**
   * Processa uma transferência de saída via PIX (API Oficial de Transfersências)
   * @param {Object} pixData - Chave PIX, tipo, valor, nome e documento do recebedor
   * @returns {Promise<Object>} Resposta da transação
   */
  processPixWithdrawal: async (pixData) => {
    try {
      return await requestJson(`${BACKEND_URL}/api/payment/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pixData)
      });
    } catch (error) {
      throw new Error(error.message || 'Falha ao conectar com o servidor seguro.');
    }
  }
};
