import { useState, useEffect } from 'react';
import {
  Wallet, Plus, ArrowUpRight, ArrowLeft, CreditCard,
  CheckCircle2, History, User, LogOut, Home, Lock, Mail,
  Loader2, RefreshCw, UserPlus, AlertCircle
} from 'lucide-react';
import { poseidoService } from './services/poseidoService';
import { supabase } from './lib/supabase';

// ─────────────────────────────────────────────────────────
// Componentes fora do App() para evitar bug de re-mount
// ─────────────────────────────────────────────────────────

function LoginScreen({ onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    setIsLoading(false);
  };

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: '#eef2ff', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
          <Wallet size={48} color="var(--primary)" />
        </div>
        <h1>Digital Wallet</h1>
        <p>Acesse sua conta para continuar</p>
      </div>

      <div className="card">
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: 'var(--danger)', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input id="login-email" type="email" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input id="login-password" type="password" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
          </div>
          <button id="btn-entrar" type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Ainda não tem uma conta?</p>
          <button id="btn-criar-conta" type="button" className="btn btn-secondary" onClick={onGoRegister}>
            <UserPlus size={18} /> Criar Conta Grátis
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function RegisterScreen({ onGoLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }

    setIsLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>Conta criada!</h2>
        <p style={{ margin: '1rem 0 2rem' }}>Verifique seu e-mail para confirmar o cadastro e depois faça login.</p>
        <button className="btn btn-primary" onClick={onGoLogin}>Ir para o Login</button>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: '#eef2ff', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
          <UserPlus size={40} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '1.5rem' }}>Criar Conta</h1>
        <p>Preencha os dados para se cadastrar</p>
      </div>

      <div className="card">
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: 'var(--danger)', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Nome Completo</label>
            <input id="register-name" type="text" className="input-field" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">E-mail</label>
            <input id="register-email" type="email" className="input-field" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="input-group">
            <label className="input-label">Senha</label>
            <input id="register-password" type="password" className="input-field" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className="input-group">
            <label className="input-label">Confirmar Senha</label>
            <input id="register-confirm" type="password" className="input-field" placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <button id="btn-cadastrar" type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={isLoading}>
            {isLoading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Criando conta...</> : 'Cadastrar'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Já tem uma conta?</p>
          <button id="btn-voltar-login" type="button" className="btn btn-secondary" onClick={onGoLogin}>Fazer Login</button>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function HomeTab({ balance, formatCurrency, setSubView, setCurrentTab }) {
  return (
    <div className="animate-fade-in">
      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: 'white' }}>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Saldo Atual</p>
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '1.5rem' }}>{formatCurrency(balance)}</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" style={{ background: 'white', color: 'var(--primary)', flex: 1, padding: '0.5rem' }} onClick={() => setSubView('addFunds')}>
            <Plus size={18} /> Adicionar
          </button>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', flex: 1, padding: '0.5rem' }} onClick={() => setSubView('withdrawPix')}>
            <ArrowUpRight size={18} /> Sacar
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: '1rem', marginBottom: '1rem', marginTop: '2rem' }}>Acesso Rápido</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 0 30%', textAlign: 'center', cursor: 'pointer', padding: '1rem' }} onClick={() => setSubView('exchange')}>
          <RefreshCw size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>Câmbio</p>
        </div>
        <div className="card" style={{ flex: '1 0 30%', textAlign: 'center', cursor: 'pointer', padding: '1rem' }} onClick={() => setCurrentTab('history')}>
          <History size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>Histórico</p>
        </div>
        <div className="card" style={{ flex: '1 0 30%', textAlign: 'center', cursor: 'pointer', padding: '1rem' }} onClick={() => setCurrentTab('profile')}>
          <User size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>Perfil</p>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ transactions, isLoadingHistory, formatCurrency, formatDate }) {
  if (isLoadingHistory) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p>Carregando histórico...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem' }}>Histórico de Transações</h2>
      {transactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
          <History size={32} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>Nenhuma transação registrada ainda.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0.5rem' }}>
          {transactions.map((tx, index) => (
            <div key={tx.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem',
              borderBottom: index !== transactions.length - 1 ? '1px solid var(--border-color)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: tx.type === 'in' ? '#d1fae5' : '#fee2e2', padding: '0.5rem', borderRadius: '8px' }}>
                  {tx.type === 'in' ? <Plus size={16} color="var(--success)" /> : <ArrowUpRight size={16} color="var(--danger)" />}
                </div>
                <div>
                  <p className="font-bold" style={{ fontSize: '0.875rem' }}>{tx.description}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(tx.created_at)}</p>
                </div>
              </div>
              <div className={`font-bold ${tx.type === 'in' ? 'text-success' : ''}`} style={{ color: tx.type === 'in' ? 'var(--success)' : 'var(--text-main)' }}>
                {tx.type === 'in' ? '+' : '-'} {formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ session, onLogout }) {
  const email = session?.user?.email || '';
  const name = session?.user?.user_metadata?.full_name || 'Usuário';
  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem' }}>Meu Perfil</h2>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{
          background: 'var(--primary)', color: 'white', width: '64px', height: '64px', borderRadius: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1rem'
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ marginBottom: '0.25rem' }}>{name}</h3>
        <p style={{ color: 'var(--text-muted)' }}>{email}</p>
      </div>
      <div className="card" style={{ padding: '0.5rem' }}>
        <button className="btn" style={{ background: 'transparent', color: 'var(--danger)', justifyContent: 'flex-start' }} onClick={onLogout}>
          <LogOut size={20} /> Sair da conta
        </button>
      </div>
    </div>
  );
}

function AddFundsSubView({ isLoading, apiError, onSubmit, state, handlers }) {
  const { cardOwner, cardNumber, cardExpiry, cardCvv, addAmount } = state;
  const { setCardOwner, setCardNumber, setCardExpiry, setCardCvv, setAddAmount, setSubView } = handlers;
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn" style={{ padding: '0.5rem', width: 'auto', background: 'white' }} onClick={() => setSubView('')} disabled={isLoading}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0 }}>Adicionar Saldo</h2>
      </div>
      {apiError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {apiError}
        </div>
      )}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          <CreditCard size={20} /> <span style={{ fontSize: '0.875rem' }}>Cartão de Crédito</span>
        </div>
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label className="input-label">Nome do Titular</label>
            <input type="text" className="input-field" placeholder="NOME IMPRESSO NO CARTÃO" value={cardOwner} onChange={(e) => setCardOwner(e.target.value.toUpperCase())} required disabled={isLoading} />
          </div>
          <div className="input-group">
            <label className="input-label">Número do Cartão</label>
            <input type="text" className="input-field" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength="19" required disabled={isLoading} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Validade</label>
              <input type="text" className="input-field" placeholder="MM/AA" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} maxLength="5" required disabled={isLoading} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">CVV</label>
              <input type="text" className="input-field" placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} maxLength="4" required disabled={isLoading} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Valor (R$)</label>
            <input type="number" className="input-field" placeholder="0,00" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} step="0.01" min="1" required disabled={isLoading} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processando...</> : 'Confirmar Pagamento'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function WithdrawPixSubView({ isLoading, apiError, balance, formatCurrency, pixKey, setPixKey, pixKeyType, setPixKeyType, ownerName, setOwnerName, ownerDocType, setOwnerDocType, ownerDocNumber, setOwnerDocNumber, withdrawAmount, setWithdrawAmount, onSubmit, setSubView }) {
  const withdrawValue = parseFloat(withdrawAmount || 0);
  const feeValue = Number.isFinite(withdrawValue) ? withdrawValue * 0.08 : 0;
  const liquidValue = Number.isFinite(withdrawValue) ? withdrawValue - feeValue : 0;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn" style={{ padding: '0.5rem', width: 'auto', background: 'white' }} onClick={() => setSubView('')} disabled={isLoading}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0 }}>Saque PIX</h2>
      </div>
      {apiError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {apiError}
        </div>
      )}
      <div className="card" style={{ background: '#f8fafc' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Disponível para saque</p>
        <h2 style={{ color: 'var(--text-main)', marginTop: '0.25rem' }}>{formatCurrency(balance)}</h2>
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxa Poseidon (8%)</span>
            <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(feeValue)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Valor líquido</span>
            <strong style={{ color: 'var(--primary)' }}>{formatCurrency(liquidValue)}</strong>
          </div>
        </div>
      </div>
      <div className="card">
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: '0 0 140px' }}>
              <label className="input-label">Tipo da Chave</label>
              <select className="input-field" value={pixKeyType} onChange={(e) => setPixKeyType(e.target.value)} disabled={isLoading}>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="phone">Celular</option>
                <option value="email">E-mail</option>
                <option value="random">Aleatória</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Chave PIX</label>
              <input type="text" className="input-field"
                placeholder={pixKeyType === 'email' ? 'nome@email.com' : pixKeyType === 'phone' ? '(11) 99999-9999' : 'Digite a chave'}
                value={pixKey} onChange={(e) => setPixKey(e.target.value)} required disabled={isLoading} />
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', margin: '0.5rem 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados do Recebedor</p>

          <div className="input-group">
            <label className="input-label">Nome Completo</label>
            <input type="text" className="input-field" placeholder="Nome sem acentos" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required disabled={isLoading} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: '0 0 110px' }}>
              <label className="input-label">Documento</label>
              <select className="input-field" value={ownerDocType} onChange={(e) => setOwnerDocType(e.target.value)} disabled={isLoading}>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Número</label>
              <input type="text" className="input-field"
                placeholder={ownerDocType === 'cpf' ? '000.000.000-00' : '00.000.000/0001-00'}
                value={ownerDocNumber} onChange={(e) => setOwnerDocNumber(e.target.value)} required disabled={isLoading} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Valor do Saque (R$)</label>
            <input type="number" className="input-field" placeholder="0,00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} step="0.01" max={balance} min="1" required disabled={isLoading} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={isLoading || balance <= 0}>
            {isLoading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processando...</> : 'Transferir via PIX'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ExchangeSubView({ isLoading, apiError, exchangeFrom, setExchangeFrom, exchangeTo, setExchangeTo, exchangeAmount, setExchangeAmount, exchangeResult, onSubmit, setSubView, setExchangeResult }) {
  const fmtEx = (v, c) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: c }).format(v);
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn" style={{ padding: '0.5rem', width: 'auto', background: 'white' }} onClick={() => { setSubView(''); setExchangeResult(null); }} disabled={isLoading}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0 }}>Câmbio e Taxas</h2>
      </div>
      {apiError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {apiError}
        </div>
      )}
      <div className="card">
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">De</label>
              <select className="input-field" value={exchangeFrom} onChange={e => setExchangeFrom(e.target.value)} disabled={isLoading}>
                <option value="BRL">BRL (Real)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Para</label>
              <select className="input-field" value={exchangeTo} onChange={e => setExchangeTo(e.target.value)} disabled={isLoading}>
                <option value="USD">USD (Dólar)</option>
                <option value="BRL">BRL (Real)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Valor a converter</label>
            <input type="number" className="input-field" placeholder="0,00" value={exchangeAmount} onChange={(e) => setExchangeAmount(e.target.value)} step="0.01" min="1" required disabled={isLoading} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Consultando...</> : 'Simular Câmbio'}
          </button>
        </form>
      </div>
      {exchangeResult && (
        <div className="card animate-fade-in" style={{ background: '#f8fafc', border: '1px solid var(--primary)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Valor Convertido</p>
          <h2 style={{ color: 'var(--primary)', margin: '0.5rem 0' }}>{fmtEx(exchangeResult.amount, exchangeTo)}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Taxa atual: 1 {exchangeFrom} = {exchangeResult.rate} {exchangeTo}</p>
        </div>
      )}
    </div>
  );
}

function SuccessSubView({ successMessage, setSubView }) {
  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
      <h2 style={{ marginBottom: '1rem' }}>Tudo certo!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>{successMessage}</p>
      <button className="btn btn-primary" onClick={() => setSubView('')}>Voltar ao Início</button>
    </div>
  );
}

function BottomNav({ currentTab, setCurrentTab, setSubView }) {
  return (
    <nav className="bottom-nav">
      <button className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => { setCurrentTab('home'); setSubView(''); }}>
        <Home size={24} /><span>Início</span>
      </button>
      <button className={`nav-item ${currentTab === 'history' ? 'active' : ''}`} onClick={() => { setCurrentTab('history'); setSubView(''); }}>
        <History size={24} /><span>Histórico</span>
      </button>
      <button className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => { setCurrentTab('profile'); setSubView(''); }}>
        <User size={24} /><span>Perfil</span>
      </button>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────
// App principal — gerencia sessão e estado global
// ─────────────────────────────────────────────────────────

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState('login');

  const [balance, setBalance] = useState(0.00);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [currentTab, setCurrentTab] = useState('home');
  const [subView, setSubView] = useState('');

  const [addAmount, setAddAmount] = useState('');
  const [cardOwner, setCardOwner] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [ownerName, setOwnerName] = useState('');
  const [ownerDocType, setOwnerDocType] = useState('cpf');
  const [ownerDocNumber, setOwnerDocNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [exchangeFrom, setExchangeFrom] = useState('BRL');
  const [exchangeTo, setExchangeTo] = useState('USD');
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangeResult, setExchangeResult] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Escuta mudanças de sessão do Supabase ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Carrega saldo e histórico quando loga ──
  useEffect(() => {
    if (session) {
      fetchBalance();
      fetchTransactions();
    }
  }, [session]);

  const fetchBalance = async () => {
    try {
      const data = await poseidoService.getBalance();
      if (data?.available !== undefined) setBalance(data.available);
    } catch (err) {
      console.error('Não foi possível atualizar o saldo:', err);
    }
  };

  const fetchTransactions = async () => {
    if (!session) return;
    setIsLoadingHistory(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error) setTransactions(data || []);
    setIsLoadingHistory(false);
  };

  const saveTransaction = async (txData) => {
    if (!session) return;
    await supabase.from('transactions').insert({
      user_id: session.user.id,
      type: txData.type,
      amount: txData.amount,
      description: txData.desc,
      gateway_id: txData.transactionId || null,
    });
    await fetchTransactions(); // recarrega do banco
  };

  const formatCurrency = (value, currency = 'BRL') =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentTab('home');
    setSubView('');
    setTransactions([]);
    setBalance(0);
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setApiError('');
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsLoading(true);
    try {
      let formattedExpiry = '2026-09';
      if (cardExpiry.includes('/')) {
        const [month, year] = cardExpiry.split('/');
        formattedExpiry = `20${year}-${month.padStart(2, '0')}`;
      }

      const response = await poseidoService.processCreditCard({
        amount,
        card: { number: cardNumber.replace(/\s+/g, ''), owner: cardOwner, expiresAt: formattedExpiry, cvv: cardCvv }
      });

      await saveTransaction({ type: 'in', amount, desc: 'Depósito via Cartão', transactionId: response.transactionId });
      await fetchBalance();

      setSuccessMessage(`Saldo de ${formatCurrency(amount)} adicionado com sucesso!`);
      setSubView('success');
      setAddAmount(''); setCardNumber(''); setCardOwner(''); setCardExpiry(''); setCardCvv('');
    } catch (error) {
      setApiError(error.message || 'Erro ao processar pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setApiError('');
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    const fee = amount * 0.08;
    const liquidAmount = amount - fee;

    if (amount > balance) { setApiError('Saldo insuficiente para este saque.'); return; }

    setIsLoading(true);
    try {
      const response = await poseidoService.processPixWithdrawal({
        pixKey,
        pixKeyType,
        amount: liquidAmount,
        fee,
        ownerName,
        ownerDocType,
        ownerDocNumber
      });

      await saveTransaction({ type: 'out', amount: amount, desc: `Saque PIX para ${pixKey} (taxa 8%)`, transactionId: response.transactionId });
      await fetchBalance();

      setSuccessMessage(`Saque de ${formatCurrency(amount)} realizado. Taxa de ${formatCurrency(fee)} aplicada.`);
      setSubView('success');
      setWithdrawAmount(''); setPixKey(''); setOwnerName(''); setOwnerDocNumber('');
    } catch (error) {
      setApiError(error.message || 'Falha na transferência PIX.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExchange = async (e) => {
    e.preventDefault();
    setApiError('');
    setExchangeResult(null);
    const amount = parseFloat(exchangeAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsLoading(true);
    try {
      const data = await poseidoService.getExchangeRate(exchangeFrom, exchangeTo, amount);
      setExchangeResult({ amount: data.convertedAmount, rate: data.exchangeRate });
    } catch (error) {
      setApiError(error.message || 'Falha ao consultar câmbio.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Tela de carregamento enquanto verifica sessão ──
  if (authLoading) {
    return (
      <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Telas de autenticação ──
  if (!session) {
    if (authScreen === 'register') return <RegisterScreen onGoLogin={() => setAuthScreen('login')} />;
    return <LoginScreen onGoRegister={() => setAuthScreen('register')} />;
  }

  // ── App autenticado ──
  return (
    <>
      <div className="content-area">
        {subView === '' ? (
          <>
            {currentTab === 'home' && <HomeTab balance={balance} formatCurrency={formatCurrency} setSubView={setSubView} setCurrentTab={setCurrentTab} />}
            {currentTab === 'history' && <HistoryTab transactions={transactions} isLoadingHistory={isLoadingHistory} formatCurrency={formatCurrency} formatDate={formatDate} />}
            {currentTab === 'profile' && <ProfileTab session={session} onLogout={handleLogout} />}
          </>
        ) : (
          <>
            {subView === 'addFunds' && (
              <AddFundsSubView
                isLoading={isLoading} apiError={apiError} onSubmit={handleAddFunds}
                state={{ cardOwner, cardNumber, cardExpiry, cardCvv, addAmount }}
                handlers={{ setCardOwner, setCardNumber, setCardExpiry, setCardCvv, setAddAmount, setSubView }}
              />
            )}
            {subView === 'withdrawPix' && (
              <WithdrawPixSubView
                isLoading={isLoading} apiError={apiError} balance={balance} formatCurrency={formatCurrency}
                pixKey={pixKey} setPixKey={setPixKey} pixKeyType={pixKeyType} setPixKeyType={setPixKeyType}
                ownerName={ownerName} setOwnerName={setOwnerName}
                ownerDocType={ownerDocType} setOwnerDocType={setOwnerDocType}
                ownerDocNumber={ownerDocNumber} setOwnerDocNumber={setOwnerDocNumber}
                withdrawAmount={withdrawAmount} setWithdrawAmount={setWithdrawAmount}
                onSubmit={handleWithdraw} setSubView={setSubView}
              />
            )}
            {subView === 'exchange' && (
              <ExchangeSubView
                isLoading={isLoading} apiError={apiError}
                exchangeFrom={exchangeFrom} setExchangeFrom={setExchangeFrom}
                exchangeTo={exchangeTo} setExchangeTo={setExchangeTo}
                exchangeAmount={exchangeAmount} setExchangeAmount={setExchangeAmount}
                exchangeResult={exchangeResult} setExchangeResult={setExchangeResult}
                onSubmit={handleExchange} setSubView={setSubView}
              />
            )}
            {subView === 'success' && <SuccessSubView successMessage={successMessage} setSubView={setSubView} />}
          </>
        )}
      </div>
      {subView === '' && <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} setSubView={setSubView} />}
    </>
  );
}

export default App;
