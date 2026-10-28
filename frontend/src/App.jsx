import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Inicio from './pages/Inicio.jsx'
import NovaDenuncia from './pages/NovaDenuncia.jsx'
import Orientacoes from './pages/Orientacoes.jsx'

function VoltarAoTopo() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <VoltarAoTopo />
      <header className="topo">
        <Link to="/" className="marca-bloco">
          <span className="logo" aria-hidden="true">✳</span>
          <span>
            <span className="marca">Olinda contra os Vetores</span>
            <span className="marca-sub">Central de denúncias de Olinda, PE</span>
          </span>
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/denunciar" element={<NovaDenuncia />} />
          <Route path="/orientacoes" element={<Orientacoes />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>
      <footer className="rodape">
        <p>Central de Denúncias de Possíveis Focos de Vetores de Olinda, PE.</p>
        <p>MVP acadêmico da UNICAP. Não é um canal oficial da Prefeitura.</p>
      </footer>
    </BrowserRouter>
  )
}
