import React, { useState } from 'react';
import './empresas.css';

export default function RetiradaModal({ isOpen, onClose, onConfirm }) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      alert('Digite o código de retirada');
      return;
    }

    if (codigo.length !== 4) {
      alert('O código deve ter 4 dígitos');
      return;
    }

    setLoading(true);
    
    try {
      await onConfirm(codigo.trim());
      setCodigo('');
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar retirada:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCodigo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content retirada-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔍 Confirmar Retirada</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <p>Digite o código fornecido pelo cliente:</p>
          
          <div className="codigo-input-group">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              className="codigo-input"
              maxLength="4"
              autoFocus
              disabled={loading}
            />
          </div>
          
          <div className="modal-actions">
            <button 
              type="submit"
              className="btn-confirmar"
              disabled={loading || codigo.length !== 4}
            >
              {loading ? '⏳ Confirmando...' : '✅ Confirmar Retirada'}
            </button>
            <button 
              type="button"
              onClick={handleClose}
              className="btn-cancelar"
              disabled={loading}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
        
        <div className="modal-footer">
          <small>💡 Dica: O código tem 4 dígitos (ex: 6363)</small>
        </div>
      </div>
    </div>
  );
}
