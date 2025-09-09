import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./loginPage/login";
import CadastroRestaurante from "./CadastroRestaurante/CadastroRestaurante";
import Home from "./Home/Home";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home como página inicial */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro-restaurante" element={<CadastroRestaurante />} />
      </Routes>
    </Router>
  );
}