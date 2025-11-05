import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PagamentoPendente() {
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
      background: 'linear-gradient(135deg, #FFA726, #FB8C00)',
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
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>⏳</div>
        <h1 style={{ color: '#FFA726', marginBottom: '20px' }}>Pagamento Pendente</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
          Seu pagamento está sendo processado.
        </p>
        
        <p style={{ fontSize: '16px', marginBottom: '30px', color: '#666' }}>
          📧 Você receberá uma notificação assim que o pagamento for confirmado.
        </p>

        {external_reference && (
          <div style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>
              Número do Pedido:
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

        <button
          onClick={() => navigate('/pedidos')}
          style={{
            background: '#FFA726',
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
          Acompanhar Pedidos
        </button>

        <button
          onClick={() => navigate('/cliente')}
          style={{
            background: '#fff',
            color: '#FFA726',
            border: '2px solid #FFA726',
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
