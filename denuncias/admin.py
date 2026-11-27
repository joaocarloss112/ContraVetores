from django.contrib import admin
from django.utils.html import format_html
from .models import Andamento, Denuncia, Usuario


class AndamentoInline(admin.TabularInline):
  model = Andamento
  extra = 0
  readonly_fields = ['autor', 'criado_em']
  fields = ['status', 'observacao', 'autor', 'criado_em']


@admin.register(Denuncia)
class DenunciaAdmin(admin.ModelAdmin):
  list_display = [
      'protocolo',
      'titulo',
      'categoria',
      'bairro',
      'endereco',
      'mapa',
      'status',
      'declaracao_boa_fe',
      'criado_em',
  ]
  search_fields = ['protocolo', 'titulo', 'endereco','bairro']
  list_filter = ['status', 'categoria', 'bairro', 'declaracao_boa_fe']
  readonly_fields = ['protocolo', 'status', 'criado_em', 'mapa']
  inlines = [AndamentoInline]

  @admin.display(description='Mapa')
  def mapa(self, obj):
    if obj.latitude is None or obj.longitude is None:
      return '-'
    url = (
        'https://www.openstreetmap.org/'
        f'?mlat={obj.latitude}&mlon={obj.longitude}#map=18/{obj.latitude}/{obj.longitude}'
    )
    return format_html('<a href="{}" target="_blank" rel="noopener">Ver no mapa</a>', url)

  def save_formset(self, request, form, formset, change):
    instances = formset.save(commit=False)
    for instance in instances:
      if isinstance(instance, Andamento) and instance.autor_id is None:
        instance.autor = request.user
      instance.save()
    formset.save_m2m()
    for obj in formset.deleted_objects:
      obj.delete()
    ultimo = form.instance.andamentos.order_by('-criado_em').first()
    if ultimo and form.instance.status != ultimo.status:
      form.instance.status = ultimo.status
      form.instance.save(update_fields=['status'])
