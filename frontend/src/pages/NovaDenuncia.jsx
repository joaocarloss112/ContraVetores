import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, BAIRROS, CATEGORIAS, FOTO_TAMANHO_MAXIMO } from '../api.js'

const ETAPAS = ['O que você viu', 'Onde fica', 'Revisar e enviar']

const CAMPOS_POR_ETAPA = {
  1: ['titulo', 'categoria', 'descricao', 'foto'],
  2: ['bairro', 'endereco', 'ponto_referencia'],
  3: ['declaracao_boa_fe'],
}

const vazio = {
  titulo: '',
  categoria: CATEGORIAS[0],
  descricao: '',
  bairro: BAIRROS[0],
  endereco: '',
  ponto_referencia: '',
  declaracao_boa_fe: false,
}

function validarEtapa(etapa, campos, foto) {
  const erros = {}
  if (etapa === 1) {
    if (!campos.titulo.trim()) {
      erros.titulo = ['Informe um título para a denúncia.']
    }
    if (!campos.descricao.trim()) {
      erros.descricao = ['Descreva o que você observou.']
    }
    if (foto && foto.size > FOTO_TAMANHO_MAXIMO) {
      erros.foto = ['A foto deve ter até 10 MB.']
    }
  }
  if (etapa === 2) {
    if (!campos.endereco.trim()) {
      erros.endereco = ['Informe o endereço ou a localização aproximada.']
    }
  }
  if (etapa === 3) {
    if (!campos.declaracao_boa_fe) {
      erros.declaracao_boa_fe = ['Confirme a declaração de boa-fé para enviar.']
    }
  }
  return erros
}

function primeiraEtapaComErro(erros) {
  for (const etapa of [1, 2, 3]) {
    if (CAMPOS_POR_ETAPA[etapa].some((campo) => erros[campo])) {
      return etapa
    }
  }
  return 3
}

export default function NovaDenuncia() {
  const [etapa, setEtapa] = useState(1)
  const [campos, setCampos] = useState(vazio)
  const [foto, setFoto] = useState(null)
  const [previa, setPrevia] = useState(null)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [etapa, enviada])

  useEffect(() => {
    if (!foto) {
      setPrevia(null)
      return undefined
    }
    const url = URL.createObjectURL(foto)
    setPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [foto])

  function alterar(e) {
    const { name, value, type, checked } = e.target
    let valor = value
    if (type === 'checkbox') {
      valor = checked
    }
    setCampos((atual) => ({ ...atual, [name]: valor }))
    setErros((atual) => ({ ...atual, [name]: undefined }))
  }

  function escolherFoto(e) {
    const arquivo = e.target.files[0] || null
    setFoto(arquivo)
    if (arquivo && arquivo.size > FOTO_TAMANHO_MAXIMO) {
      setErros((atual) => ({ ...atual, foto: ['A foto deve ter até 10 MB.'] }))
    } else {
      setErros((atual) => ({ ...atual, foto: undefined }))
    }
  }

  function removerFoto() {
    setFoto(null)
    setErros((atual) => ({ ...atual, foto: undefined }))
  }

  function avancar() {
    const novos = validarEtapa(etapa, campos, foto)
    setErros(novos)
    if (Object.keys(novos).length === 0) {
      setEtapa((n) => n + 1)
    }
  }

  function voltar() {
    setErros({})
    setEtapa((n) => n - 1)
  }

  async function enviar(e) {
    e.preventDefault()
    const novos = validarEtapa(3, campos, foto)
    setErros(novos)
    if (Object.keys(novos).length > 0) {
      return
    }
    setEnviando(true)
    const form = new FormData()
    Object.entries(campos).forEach(([chave, valor]) => form.append(chave, valor))
    if (foto) {
      form.append('foto', foto)
    }
    try {
      await api.criarDenuncia(form)
      setEnviada(true)
    } catch (err) {
      let recebidos = err.dados
      const conhecidos = Object.values(CAMPOS_POR_ETAPA).flat().concat('geral')
      const temCampoConhecido = recebidos && typeof recebidos === 'object'
        && Object.keys(recebidos).some((campo) => conhecidos.includes(campo))
      if (!temCampoConhecido) {
        recebidos = { geral: ['Não foi possível enviar agora. Tente novamente em instantes.'] }
      }
      setErros(recebidos)
      setEtapa(primeiraEtapaComErro(recebidos))
    } finally {
      setEnviando(false)
    }
  }

  if (enviada) {
    return (
      <section className="cartao centralizado">
        <div className="selo-sucesso" aria-hidden="true">✓</div>
        <p className="eyebrow escuro">Denúncia enviada</p>
        <h1>Obrigado por ajudar Olinda</h1>
        <p className="ajuda">
          Sua denúncia foi registrada no ContraVetores e vai apoiar o trabalho da vigilância em saúde.
        </p>
        <div className="aviso aviso-compacto">
          <strong>Sobre o retorno</strong>
          <p>
            A plataforma é uma via de mão única. Não há protocolo para acompanhamento, consulta de
            status ou resposta ao cidadão.
          </p>
        </div>
        <Link className="btn-principal escuro" to="/">Voltar ao início</Link>
      </section>
    )
  }

  return (
    <>
      <Link className="link-voltar" to="/">← Voltar ao início</Link>
      <h1 className="titulo-pagina">Registrar possível foco de vetores</h1>
      <p className="subtitulo-pagina">Preencha os dados abaixo. A foto é opcional.</p>

      <ol className="passos" aria-label="Etapas do formulário">
        {ETAPAS.map((nome, i) => {
          let classe = 'passo'
          if (i + 1 === etapa) {
            classe = 'passo ativo'
          } else if (i + 1 < etapa) {
            classe = 'passo feito'
          }
          let atual
          if (i + 1 === etapa) {
            atual = 'step'
          }
          return (
            <li key={nome} className={classe} aria-current={atual}>
              {i + 1}. {nome}
            </li>
          )
        })}
      </ol>

      <section className="cartao">
        <form onSubmit={enviar} noValidate>
          {etapa === 1 && (
            <>
              <h2 className="titulo-etapa">Conte o que encontrou</h2>
              <Campo
                rotulo="Título da denúncia *"
                nome="titulo"
                valor={campos.titulo}
                onChange={alterar}
                erros={erros}
                maxLength={150}
                placeholder="Ex.: Pneus acumulando água em terreno"
              />
              <label>
                Categoria do possível foco *
                <select name="categoria" value={campos.categoria} onChange={alterar}>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
                <Erro erros={erros} nome="categoria" />
              </label>
              <label>
                Descrição do que observou *
                <textarea
                  name="descricao"
                  rows={4}
                  value={campos.descricao}
                  onChange={alterar}
                  placeholder="Descreva o local e a situação observada..."
                  aria-invalid={Boolean(erros.descricao)}
                />
                <Erro erros={erros} nome="descricao" />
              </label>
              <div className="campo-foto">
                <span className="rotulo">Foto do local (opcional)</span>
                <span className="dica">Imagem de até 10 MB.</span>
                <label className="area-upload">
                  <input type="file" accept="image/*" onChange={escolherFoto} />
                </label>
                {previa && (
                  <div className="previa">
                    <img src={previa} alt="Prévia da foto escolhida" />
                    <button type="button" className="secundario pequeno" onClick={removerFoto}>Remover foto</button>
                  </div>
                )}
                <Erro erros={erros} nome="foto" />
                <span className="dica">A foto é enviada junto com a denúncia. Evite rostos e placas de veículos.</span>
              </div>
              <p className="aviso aviso-linha">Não toque em resíduos nem entre em terrenos para verificar possíveis focos.</p>
            </>
          )}

          {etapa === 2 && (
            <>
              <h2 className="titulo-etapa">Onde fica o possível foco?</h2>
              <label>
                Bairro de Olinda *
                <select name="bairro" value={campos.bairro} onChange={alterar}>
                  {BAIRROS.map((b) => <option key={b}>{b}</option>)}
                </select>
                <Erro erros={erros} nome="bairro" />
              </label>
              <Campo
                rotulo="Endereço ou localização aproximada *"
                nome="endereco"
                valor={campos.endereco}
                onChange={alterar}
                erros={erros}
                maxLength={255}
                placeholder="Rua, número próximo ou cruzamento"
              />
              <Campo
                rotulo="Ponto de referência (opcional)"
                nome="ponto_referencia"
                valor={campos.ponto_referencia}
                onChange={alterar}
                erros={erros}
                maxLength={255}
                placeholder="Praça, comércio ou escola próxima"
              />
              <div className="caixa-local">
                <span aria-hidden="true">⌖</span>
                <strong>Localização por endereço</strong>
                <span>Por enquanto a localização é informada só pelo endereço, sem GPS nem mapa.</span>
              </div>
            </>
          )}

          {etapa === 3 && (
            <>
              <h2 className="titulo-etapa">Revise antes de enviar</h2>
              <div className="resumo">
                <span className="resumo-rotulo">Descrição</span>
                <strong>{campos.titulo}</strong>
                <span>{campos.categoria}</span>
                <p>{campos.descricao}</p>
                {previa && <img className="resumo-foto" src={previa} alt="Foto anexada" />}
              </div>
              <div className="resumo">
                <span className="resumo-rotulo">Local</span>
                <strong>{campos.bairro}</strong>
                <span>{campos.endereco}</span>
                {campos.ponto_referencia && <span>Referência: {campos.ponto_referencia}</span>}
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="declaracao_boa_fe"
                  checked={campos.declaracao_boa_fe}
                  onChange={alterar}
                />
                Confirmo que as informações foram preenchidas de boa-fé e correspondem ao que observei. *
              </label>
              <Erro erros={erros} nome="declaracao_boa_fe" />
              <p className="aviso aviso-linha">
                <strong>Sem acompanhamento:</strong> não haverá protocolo para consulta, atualização de
                status ou resposta por esta plataforma.
              </p>
              <Erro erros={erros} nome="geral" />
            </>
          )}

          <div className="acoes">
            {etapa === 1 && (
              <button type="button" className="secundario" onClick={() => navigate('/')}>Cancelar</button>
            )}
            {etapa > 1 && (
              <button type="button" className="secundario" onClick={voltar}>Voltar</button>
            )}
            {etapa < 3 && <button type="button" onClick={avancar}>Continuar →</button>}
            {etapa === 3 && <BotaoEnviar enviando={enviando} />}
          </div>
        </form>
      </section>
    </>
  )
}

function BotaoEnviar({ enviando }) {
  if (enviando) {
    return <button type="submit" disabled>Enviando…</button>
  }
  return <button type="submit">Enviar denúncia</button>
}

function Campo({ rotulo, nome, valor, onChange, erros, maxLength, placeholder }) {
  return (
    <label>
      {rotulo}
      <input
        name={nome}
        value={valor}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(erros[nome])}
      />
      <Erro erros={erros} nome={nome} />
    </label>
  )
}

function Erro({ erros, nome }) {
  if (!erros[nome]) {
    return null
  }
  let mensagens = erros[nome]
  if (!Array.isArray(mensagens)) {
    mensagens = [String(mensagens)]
  }
  return <span className="erro" role="alert">{mensagens.join(' ')}</span>
}
