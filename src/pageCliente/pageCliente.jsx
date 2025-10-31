import React from "react";
import { useNavigate } from "react-router-dom";

export default function PageCliente() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 10000
      }}>
        ✅ PÁGINA DO CLIENTE FUNCIONANDO - {window.location.href}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '50px',
        borderRadius: '15px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '20px',
        marginTop: '50px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍽️</div>
        <h1 style={{ color: '#333', marginBottom: '20px', fontSize: '28px' }}>
          World Bite - Página do Cliente
        </h1>
        <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          Parabéns! A página do cliente está funcionando perfeitamente. 
          Agora você pode implementar as funcionalidades do sistema de delivery.
        </p>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745', marginBottom: '15px' }}>
            ✅ Status da Aplicação
          </div>
          <div style={{ textAlign: 'left', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div>✅ React funcionando</div>
            <div>✅ Roteamento funcionando</div>
            <div>✅ CSS carregado</div>
            <div>✅ JavaScript executando</div>
            <div>✅ Navegação funcionando</div>
            <div>✅ Componente renderizando</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '15px 25px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🏠 Ir para Home
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            style={{
              padding: '15px 25px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🔐 Ir para Login
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 25px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🔄 Recarregar
          </button>
        </div>

        <div style={{
          fontSize: '12px',
          color: '#666',
          backgroundColor: '#e9ecef',
          padding: '15px',
          borderRadius: '5px',
          textAlign: 'left'
        }}>
          <strong>🔍 Informações de Debug:</strong><br/>
          <strong>URL:</strong> {window.location.href}<br/>
          <strong>Porta:</strong> {window.location.port}<br/>
          <strong>Componente:</strong> PageCliente.jsx<br/>
          <strong>Timestamp:</strong> {new Date().toLocaleString()}<br/>
          <strong>Status:</strong> Funcionando ✅
        </div>
      </div>
    </div>
  );
}