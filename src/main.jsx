import { Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro inesperado na interface:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" role="alert" style={{ textAlign: 'center' }}>
            <h1>Não foi possível carregar a página</h1>
            <p style={{ margin: '1rem 0 1.5rem' }}>
              Ocorreu um erro inesperado. Recarregue a página para tentar novamente.
            </p>
            <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
