import { BAIRROS } from './api.js'

const MENSAGENS_DE_ERRO = {
  1: 'Você não permitiu o acesso à localização. Informe o endereço abaixo.',
  2: 'Não foi possível descobrir sua localização agora. Informe o endereço abaixo.',
  3: 'A localização demorou demais. Tente de novo ou informe o endereço abaixo.',
}

export function localizacaoDisponivel() {
  return 'geolocation' in navigator && window.isSecureContext
}

export function obterPosicao() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        resolve({
          latitude: posicao.coords.latitude.toFixed(6),
          longitude: posicao.coords.longitude.toFixed(6),
          precisao: Math.round(posicao.coords.accuracy),
        })
      },
      (erro) => {
        let mensagem = MENSAGENS_DE_ERRO[erro.code]
        if (!mensagem) {
          mensagem = MENSAGENS_DE_ERRO[2]
        }
        reject(new Error(mensagem))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  })
}

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function encontrarBairro(endereco) {
  const candidatos = [endereco.suburb, endereco.neighbourhood, endereco.city_district, endereco.quarter]
  for (const candidato of candidatos) {
    if (!candidato) {
      continue
    }
    const achado = BAIRROS.find((bairro) => normalizar(bairro) === normalizar(candidato))
    if (achado) {
      return achado
    }
  }
  return null
}

export async function buscarEndereco(latitude, longitude) {
  const parametros = new URLSearchParams({
    format: 'jsonv2',
    lat: latitude,
    lon: longitude,
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'pt-BR',
  })
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?${parametros}`)
    if (!resp.ok) {
      return null
    }
    const dados = await resp.json()
    const endereco = dados.address || {}
    const partes = [endereco.road, endereco.house_number].filter(Boolean)
    return {
      endereco: partes.join(', '),
      bairro: encontrarBairro(endereco),
    }
  } catch {
    return null
  }
}
