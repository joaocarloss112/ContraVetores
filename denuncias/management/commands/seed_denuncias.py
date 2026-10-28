import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from denuncias.models import BAIRROS, Andamento, Denuncia

TITULOS = {
    'Água parada': ['Caixa d\'água destampada', 'Poça após chuva', 'Calha entupida com água'],
    'Lixo e entulho': ['Entulho em terreno', 'Sacos de lixo na calçada', 'Lixo próximo a canal'],
    'Terreno abandonado': ['Mato alto e água empoçada', 'Lote abandonado com lixo', 'Terreno sem muro'],
    'Pneus e recipientes acumulando água': ['Pneus com água acumulada', 'Garrafas e baldes no quintal'],
    'Esgoto ou água contaminada': ['Esgoto a céu aberto', 'Canal com água parada'],
    'Animais ou pragas associados a possíveis focos': ['Ratos perto de lixo acumulado', 'Escorpiões em muro'],
    'Piscinas sem manutenção': ['Piscina abandonada com água verde', 'Piscina de casa fechada'],
    'Outro possível foco de vetores': ['Vaso de planta com água', 'Lona acumulando água'],
}

DESCRICOES = [
    'Foco identificado durante a caminhada da manhã. Precisa de vistoria.',
    'Situação recorrente há algumas semanas, perto de residências.',
    'Moradores relatam aumento de mosquitos na região.',
    'Local de difícil acesso, mas o risco é visível da rua.',
]

FLUXO = [
    ['RECEBIDA'],
    ['RECEBIDA', 'VALIDADA'],
    ['RECEBIDA', 'VALIDADA', 'RESOLVIDA'],
    ['RECEBIDA', 'REJEITADA'],
]

OBSERVACOES = {
    'RECEBIDA': 'Denúncia recebida pela central.',
    'VALIDADA': 'Foco confirmado em vistoria.',
    'REJEITADA': 'Não foi possível confirmar o foco no local.',
    'RESOLVIDA': 'Foco eliminado e área acompanhada.',
}


class Command(BaseCommand):
  help = 'Gera denúncias sintéticas para demonstração e testes (dados fictícios).'

  def add_arguments(self, parser):
    parser.add_argument('--quantidade', type=int, default=20)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument(
        '--limpar', action='store_true',
        help='Remove todas as denúncias antes de gerar.',
    )

  def handle(self, *args, **options):
    if options['limpar']:
      Denuncia.objects.all().delete()
      self.stdout.write('Denúncias anteriores removidas.')

    rnd = random.Random(options['seed'])
    agora = timezone.now()
    categorias = list(TITULOS)

    for _ in range(options['quantidade']):
      categoria = rnd.choice(categorias)
      titulo = rnd.choice(TITULOS[categoria])
      denuncia = Denuncia.objects.create(
          titulo=titulo,
          categoria=categoria,
          descricao=rnd.choice(DESCRICOES),
          bairro=rnd.choice(BAIRROS[:-1]),
          endereco=f'Rua {rnd.randint(1, 60)}, nº {rnd.randint(1, 900)}',
          declaracao_boa_fe=True,
      )
      fluxo = rnd.choice(FLUXO)
      for i, status in enumerate(fluxo):
        andamento = Andamento.objects.create(
            denuncia=denuncia,
            status=status,
            observacao=OBSERVACOES[status],
        )
        Andamento.objects.filter(pk=andamento.pk).update(
            criado_em=agora - timedelta(days=len(fluxo) - i, hours=rnd.randint(0, 5))
        )
      denuncia.status = fluxo[-1]
      denuncia.save(update_fields=['status'])
      Denuncia.objects.filter(pk=denuncia.pk).update(
          criado_em=agora - timedelta(days=rnd.randint(1, 30))
      )

    self.stdout.write(self.style.SUCCESS(
        f'{options["quantidade"]} denúncias sintéticas geradas. Total: {Denuncia.objects.count()}.'
    ))
