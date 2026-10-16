from django.contrib import admin
from .models import Denuncia, Usuario

@admin.register(Denuncia)
class DenunciaAdmin(admin.ModelAdmin):
  list_display = [
      'protocolo',
      'titulo',
      'categoria',
      'bairro',
      'endereco',
      'declaracao_boa_fe',
      'criado_em',
  ]
  search_fields = ['protocolo', 'titulo', 'endereco','bairro']
  list_filter = ['categoria', 'bairro', 'declaracao_boa_fe']
