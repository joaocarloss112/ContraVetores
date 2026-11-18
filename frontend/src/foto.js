const LADO_MAXIMO = 1600
const QUALIDADE = 0.8

function gerarBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', QUALIDADE)
  })
}

export async function comprimirFoto(arquivo) {
  if (!arquivo.type.startsWith('image/') || arquivo.type === 'image/gif') {
    return arquivo
  }

  let imagem
  try {
    imagem = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
  } catch {
    return arquivo
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(imagem.width * escala)
  canvas.height = Math.round(imagem.height * escala)
  canvas.getContext('2d').drawImage(imagem, 0, 0, canvas.width, canvas.height)
  imagem.close()

  const blob = await gerarBlob(canvas)
  if (!blob || blob.size >= arquivo.size) {
    return arquivo
  }
  const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], nome, { type: 'image/jpeg', lastModified: Date.now() })
}

export function formatarTamanho(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
