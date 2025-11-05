import React from "react";

export default function ResumoPedido({ itens = [], valorTotal = 0, taxaEntrega = 0, tipoEntrega = "entrega" }) {
  const subtotal = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
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
          itens.map((item, index) => (
            <div key={index} className="resumo-item">
              <div className="item-info">
                <span className="item-nome">{item.nome || item.name}</span>
                <span className="item-quantidade">x{item.quantidade || item.quantity}</span>
              </div>
              <span className="item-preco">
                {formatCurrency((item.preco || item.price) * (item.quantidade || item.quantity))}
              </span>
            </div>
          ))
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