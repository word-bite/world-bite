import React from "react";

export default function ResumoPedido({ itens = [], valorTotal = 0, taxaEntrega = 0, tipoEntrega = "entrega" }) {
  // Calcular subtotal com suporte para ambas estruturas de dados
  const subtotal = itens.reduce((acc, item) => {
    const preco = item.price || item.preco || 0;
    const quantidade = item.quantity || item.quantidade || 1;
    return acc + (preco * quantidade);
  }, 0);
  
  const total = tipoEntrega === "entrega" ? subtotal + taxaEntrega : subtotal;

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="resumo-pedido-box">
      <h2>Resumo do Pedido</h2>
      
      <div className="resumo-itens">
        {itens.length === 0 ? (
          <p className="resumo-vazio">Nenhum item no carrinho</p>
        ) : (
          itens.map((item, index) => {
            const nome = item.name || item.nome || 'Item sem nome';
            const preco = item.price || item.preco || 0;
            const quantidade = item.quantity || item.quantidade || 1;
            
            return (
              <div key={index} className="resumo-item">
                <div className="item-info">
                  <span className="item-nome">{nome}</span>
                  <span className="item-quantidade">x{quantidade}</span>
                </div>
                <span className="item-preco">
                  {formatCurrency(preco * quantidade)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="resumo-valores">
        <div className="linha-valor">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {tipoEntrega === "entrega" && (
          <div className="linha-valor">
            <span>Taxa de entrega</span>
            <span>{taxaEntrega === 0 ? 'Calculando...' : formatCurrency(taxaEntrega)}</span>
          </div>
        )}
        {tipoEntrega === "retirada" && (
          <div className="linha-valor retirada-info">
            <span>🏃 Retirada no local</span>
            <span className="gratis">Grátis</span>
          </div>
        )}
        <div className="linha-valor total">
          <strong>Total</strong>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>
    </div>
  );
}