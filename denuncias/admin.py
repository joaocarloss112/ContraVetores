from django.contrib import admin
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
      'status',
      'declaracao_boa_fe',
      'criado_em',
  ]
  search_fields = ['protocolo', 'titulo', 'endereco','bairro']
  list_filter = ['status', 'categoria', 'bairro', 'declaracao_boa_fe']
  inlines = [AndamentoInline]

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
