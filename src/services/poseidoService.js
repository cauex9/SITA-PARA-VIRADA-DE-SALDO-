/**
 * Serviço de Integração com o Servidor Backend Seguro.
 * 
 * Agora o Frontend não faz a simulação. Ele faz um fetch real
 * para o nosso Backend Local, que por sua vez se comunica (simuladamente por enquanto)
 * com a Poseido usando a Chave Privada segura.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const poseidoService = {
  /**
   * Consulta o saldo oficial na PoseidonPay
   * @returns {Promise<Object>} Resposta contendo available, pending, fundLock
   */
  getBalance: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/balance`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao buscar saldo');
      return data;
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
      const response = await fetch(`${BACKEND_URL}/api/exchange-rates?from=${from}&to=${to}&amount=${amount}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao buscar câmbio');
      return data;
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
      const response = await fetch(`${BACKEND_URL}/api/payment/credit-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro na transação');
      }
      
      return data;
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
      const response = await fetch(`${BACKEND_URL}/api/payment/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pixData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro na transação PIX');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Falha ao conectar com o servidor seguro.');
    }
  }
};
