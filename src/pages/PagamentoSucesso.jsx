import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PagamentoSucesso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const collection_id = searchParams.get('collection_id');
  const collection_status = searchParams.get('collection_status');
  const payment_id = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const external_reference = searchParams.get('external_reference');
  const preference_id = searchParams.get('preference_id');

  useEffect(() => {
    console.log('✅ Pagamento aprovado!', {
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      preference_id
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
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
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ color: '#4CAF50', marginBottom: '20px' }}>Pagamento Aprovado!</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
          Seu pagamento foi processado com sucesso.
        </p>
        
        {payment_id && (
          <div style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>
              ID do Pagamento:
            </p>
            <p style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#4CAF50',
              fontFamily: 'monospace'
            }}>
              {payment_id}
            </p>
          </div>
        )}

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

        <p style={{ fontSize: '16px', marginBottom: '30px', color: '#666' }}>
          🎉 Obrigado por comprar conosco!
        </p>

        <button
          onClick={() => navigate('/pedidos')}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '10px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#45a049'}
          onMouseOut={(e) => e.target.style.background = '#4CAF50'}
        >
          Ver Meus Pedidos
        </button>

        <button
          onClick={() => navigate('/cliente')}
          style={{
            background: '#fff',
            color: '#4CAF50',
            border: '2px solid #4CAF50',
            padding: '15px 40px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#4CAF50';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#fff';
            e.target.style.color = '#4CAF50';
          }}
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
