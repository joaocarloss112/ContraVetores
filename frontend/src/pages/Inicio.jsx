import { Link } from 'react-router-dom'

const ITENS = [
  'Água parada em recipientes ou áreas abertas',
  'Pneus, entulho e lixo acumulado',
  'Terrenos abandonados e piscinas sem manutenção',
  'Esgoto, água contaminada ou outros possíveis focos',
]

export default function Inicio() {
  return (
    <>
      <section className="hero">
        <div className="hero-texto">
          <p className="eyebrow">Olinda • Pernambuco</p>
          <h1>Ajude a identificar possíveis focos de vetores na cidade.</h1>
          <p className="apoio">
            Comunique locais com água parada, lixo acumulado ou outras situações que possam
            favorecer a proliferação de mosquitos e outros vetores.
          </p>
          <Link className="btn-principal" to="/denunciar">+ Registrar uma denúncia</Link>
          <p className="aviso-escopo">
            Via de mão única: o cidadão envia a denúncia. Esta plataforma não oferece
            acompanhamento nem resposta.
          </p>
        </div>
        <aside className="card-vidro">
          <div className="icone-card" aria-hidden="true">🦟</div>
          <h2>O que pode ser denunciado?</h2>
          <ul>
            {ITENS.map((item) => <li key={item}><span aria-hidden="true">✓</span> {item}</li>)}
          </ul>
        </aside>
      </section>

      <section className="etapas">
        <Etapa numero="01" titulo="Descreva a situação" texto="Explique o que observou e escolha a categoria que melhor representa o possível foco." />
        <Etapa numero="02" titulo="Informe o local" texto="Indique o bairro e o endereço ou ponto de referência para ajudar a localizar o local." />
        <Etapa numero="03" titulo="Envie a denúncia" texto="Você pode anexar uma foto, mas ela é opcional. Revise as informações antes de enviar." />
      </section>

      <section className="cartao">
        <h2 className="sem-margem">Antes de registrar</h2>
        <ul className="lista-cuidados">
          <li>Informe situações observadas ou suspeitas de boa-fé.</li>
          <li>Não entre em terrenos nem se aproxime de áreas perigosas para fotografar.</li>
          <li>Evite incluir rostos, placas ou outros dados pessoais na foto.</li>
        </ul>
      </section>

      <section className="aviso">
        <h2>Importante sobre o funcionamento</h2>
        <p>
          Não há consulta de protocolo, atualização de status, retorno ao cidadão ou mapa público de
          denúncias. As denúncias ficam registradas no ContraVetores, mas este MVP acadêmico ainda não
          é integrado à Prefeitura.
        </p>
      </section>

      <Link className="link-orientacoes" to="/orientacoes">Ver orientações de prevenção</Link>
    </>
  )
}

function Etapa({ numero, titulo, texto }) {
  return (
    <article className="etapa">
      <span className="etapa-num">{numero} / ETAPA</span>
      <h3>{titulo}</h3>
      <p>{texto}</p>
    </article>
  )
}
