import React, { useState } from "react";
import "./enderecoModal.css";

export default function EnderecoModal({ open, onClose, onAddEndereco }) {
  const [input, setInput] = useState("");

  if (!open) return null;

  return (
    <div className="modal-bg">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>Cadastrar Endereço</h2>
        <input
          type="text"
          placeholder="Digite seu endereço"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid", marginBottom: "18px", backgroundColor: "#fff", color: "#000" }}
        />
        <button
          className="modal-btn"
          onClick={() => {
            if (input.trim()) {
              onAddEndereco(input.trim());
              setInput("");
              onClose();
            }
          }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}