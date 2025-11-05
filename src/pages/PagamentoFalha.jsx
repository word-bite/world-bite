import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PagamentoFalha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const payment_id = searchParams.get('payment_id');
  const external_reference = searchParams.get('external_reference');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #EF5350, #E53935)',
      color: 'white',
      padding: '40px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        color: '#333'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>❌</div>
        <h1 style={{ color: '#EF5350', marginBottom: '20px' }}>Pagamento Não Aprovado</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
          Infelizmente seu pagamento não foi processado.
        </p>
        
        <div style={{
          background: '#ffebee',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '1px solid #ffcdd2'
        }}>
          <p style={{ fontSize: '16px', color: '#c62828', marginBottom: '10px' }}>
            <strong>Possíveis motivos:</strong>
          </p>
          <ul style={{ 
            textAlign: 'left', 
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <li>Saldo insuficiente</li>
            <li>Dados do cartão incorretos</li>
            <li>Cartão bloqueado</li>
            <li>Limite de crédito excedido</li>
          </ul>
        </div>

        {external_reference && (
          <div style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>
              Referência:
            </p>
            <p style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#333',
              fontFamily: 'monospace'
            }}>
              {external_reference}
            </p>
          </div>
        )}

        <p style={{ fontSize: '16px', marginBottom: '30px', color: '#666' }}>
          💡 Tente novamente com outro método de pagamento ou verifique seus dados.
        </p>

        <button
          onClick={() => navigate('/finalizar-pedido')}
          style={{
            background: '#EF5350',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Tentar Novamente
        </button>

        <button
          onClick={() => navigate('/cliente')}
          style={{
            background: '#fff',
            color: '#EF5350',
            border: '2px solid #EF5350',
            padding: '15px 40px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
