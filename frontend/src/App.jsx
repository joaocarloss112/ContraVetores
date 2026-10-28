import { useEffect, useState } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { getToken, setToken } from './api.js'
import NovaDenuncia from './pages/NovaDenuncia.jsx'
import Consulta from './pages/Consulta.jsx'
import Login from './pages/Login.jsx'
import Painel from './pages/Painel.jsx'
import DenunciaDetalhe from './pages/DenunciaDetalhe.jsx'

function Cabecalho() {
  const navigate = useNavigate()
  // Reavalia o token a cada navegação (login/logout mudam a rota).
  useLocation()
  const logado = Boolean(getToken())

  function sair() {
    setToken(null)
    navigate('/')
  }

  return (
    <header className="topo">
      <Link to="/" className="marca">ContraVetores</Link>
      <nav>
        <NavLink to="/">Denunciar</NavLink>
        <NavLink to="/consulta">Acompanhar</NavLink>
        {logado ? (
          <>
            <NavLink to="/painel">Painel</NavLink>
            <button className="linkbtn" onClick={sair}>Sair</button>
          </>
        ) : (
          <NavLink to="/gestao">Gestão</NavLink>
        )}
      </nav>
    </header>
  )
}

function RotaPrivada({ children }) {
  if (!getToken()) return <Navigate to="/gestao" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Cabecalho />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<NovaDenuncia />} />
          <Route path="/consulta" element={<Consulta />} />
          <Route path="/consulta/:protocolo" element={<Consulta />} />
          <Route path="/gestao" element={<Login />} />
          <Route path="/painel" element={<RotaPrivada><Painel /></RotaPrivada>} />
          <Route path="/painel/:protocolo" element={<RotaPrivada><DenunciaDetalhe /></RotaPrivada>} />
        </Routes>
      </main>
      <footer className="rodape">
        Projeto acadêmico UNICAP · MVP universitário · dados de demonstração não são reais
      </footer>
    </BrowserRouter>
  )
}
