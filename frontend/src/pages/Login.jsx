import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../api.js'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const dados = await api.login(username, password)
      setToken(dados.access)
      navigate('/painel')
    } catch {
      setErro('Usuário ou senha inválidos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="cartao estreito">
      <h1>Acesso da gestão</h1>
      <p className="ajuda">Área restrita à vigilância em saúde e aos agentes de Olinda.</p>
      <form onSubmit={entrar}>
        <label>
          Usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </section>
  )
}
