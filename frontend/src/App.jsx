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
          <div>
            <div className="marca">Olinda contra os Vetores</div>
            <div className="marca-sub">Central de denúncias • Olinda, PE</div>
          </div>
        </Link>
        <span className="pill">Saúde ambiental em foco</span>
      </header>
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/denunciar" element={<NovaDenuncia />} />
          <Route path="/orientacoes" element={<Orientacoes />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>
      <footer className="rodape">
        Central de Denúncias de Possíveis Focos de Vetores • Olinda, PE • MVP acadêmico, não é um canal oficial da Prefeitura
      </footer>
    </BrowserRouter>
  )
}
