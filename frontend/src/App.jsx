import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio.jsx'
import NovaDenuncia from './pages/NovaDenuncia.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <header className="topo">
        <div className="marca-bloco">
          <span className="logo" aria-hidden="true">✳</span>
          <div>
            <div className="marca">Olinda contra os Vetores</div>
            <div className="marca-sub">Central de denúncias • Olinda, PE</div>
          </div>
        </div>
        <span className="pill">Saúde ambiental em foco</span>
      </header>
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/denunciar" element={<NovaDenuncia />} />
        </Routes>
      </main>
      <footer className="rodape">
        Central de Denúncias de Possíveis Focos de Vetores • Olinda, PE • Protótipo demonstrativo não oficial
      </footer>
    </BrowserRouter>
  )
}
