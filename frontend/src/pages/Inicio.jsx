import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const PASSOS = [
  { titulo: 'O que você viu', texto: 'Dê um título, escolha o tipo de foco e descreva a situação. Se tiver uma foto, pode anexar.' },
  { titulo: 'Onde fica', texto: 'Escolha o bairro e informe o endereço ou um ponto de referência, como uma praça ou escola.' },
  { titulo: 'Revise e envie', texto: 'Confira o resumo, confirme que as informações são verdadeiras e envie.' },
]

const FOCOS = [
  'Água parada em recipientes, calhas, lonas ou caixas d’água abertas',
  'Pneus, entulho e lixo acumulado',
  'Terrenos e imóveis abandonados',
  'Obras paradas que acumulam água',
  'Piscinas sem manutenção',
  'Esgoto a céu aberto ou água contaminada',
]

export default function Inicio() {
  const botaoTopo = useRef(null)
  const [mostrarBarra, setMostrarBarra] = useState(false)

  useEffect(() => {
    const alvo = botaoTopo.current
    if (!alvo || !('IntersectionObserver' in window)) {
      return undefined
    }
    const observador = new IntersectionObserver(([entrada]) => {
      setMostrarBarra(!entrada.isIntersecting)
    })
    observador.observe(alvo)
    return () => observador.disconnect()
  }, [])

  let classeBarra = 'barra-fixa'
  let tabBarra = -1
  if (mostrarBarra) {
    classeBarra = 'barra-fixa visivel'
    tabBarra = 0
  }

  return (
    <>
      <section className="abertura">
        <div className="abertura-conteudo">
          <h1>Viu um possível foco de mosquito? Avise a vigilância em saúde de Olinda.</h1>
          <p className="abertura-apoio">
            Água parada, lixo acumulado e terrenos abandonados favorecem a dengue, a zika e a
            chikungunya. Sua denúncia ajuda as equipes a chegar mais rápido.
          </p>
          <Link ref={botaoTopo} className="botao-grande" to="/denunciar">Registrar denúncia</Link>
          <ul className="garantias">
            <li>Leva cerca de 2 minutos</li>
            <li>Sem cadastro e sem login</li>
            <li>Foto opcional</li>
          </ul>
        </div>
      </section>

      <div className="pagina">
        <section className="bloco">
          <h2>Como funciona</h2>
          <ol className="linha-do-tempo">
            {PASSOS.map((passo) => (
              <li key={passo.titulo}>
                <h3>{passo.titulo}</h3>
                <p>{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bloco">
          <h2>O que dá para denunciar</h2>
          <ul className="lista-focos">
            {FOCOS.map((foco) => <li key={foco}>{foco}</li>)}
          </ul>
        </section>

        <section className="bloco">
          <h2>Antes de começar</h2>
          <div className="colunas">
            <div>
              <h3>Tenha em mãos</h3>
              <ul className="lista-simples">
                <li>O endereço ou um ponto de referência perto do local</li>
                <li>Uma foto, se der para tirar sem se arriscar</li>
              </ul>
            </div>
            <div>
              <h3>Cuide da sua segurança</h3>
              <ul className="lista-simples">
                <li>Não entre em terrenos nem toque em resíduos</li>
                <li>Evite rostos e placas de veículos na foto</li>
                <li>Informe só o que viu ou suspeita, de boa-fé</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bloco depois">
          <h2>O que acontece depois</h2>
          <p>
            A denúncia fica registrada para a equipe de vigilância em saúde. Este canal é de mão única:
            não há protocolo, consulta de andamento nem resposta ao cidadão. Este MVP acadêmico ainda
            não é integrado à Prefeitura.
          </p>
        </section>

        <section className="bloco prevencao">
          <h2>Também vale olhar a sua casa</h2>
          <p>Vasos de planta, calhas e caixas d’água destampadas também viram criadouros.</p>
          <Link to="/orientacoes">Ver orientações de prevenção</Link>
        </section>
      </div>

      <div className={classeBarra} aria-hidden={!mostrarBarra}>
        <Link className="botao-grande" to="/denunciar" tabIndex={tabBarra}>Registrar denúncia</Link>
      </div>
    </>
  )
}
