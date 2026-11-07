from rest_framework import serializers
from .models import Andamento, Denuncia

FOTO_TAMANHO_MAXIMO = 10 * 1024 * 1024


class AndamentoSerializer(serializers.ModelSerializer):
  autor = serializers.SerializerMethodField()

  class Meta:
    model = Andamento
    fields = ['status', 'observacao', 'criado_em', 'autor']
    read_only_fields = fields

  def get_autor(self, obj):
    if obj.autor is None:
      return None
    return obj.autor.get_full_name() or obj.autor.username


class DenunciaSerializer(serializers.ModelSerializer):
  andamentos = AndamentoSerializer(many=True, read_only=True)

  class Meta:
    model = Denuncia
    fields = [
        'protocolo',
        'titulo',
        'categoria',
        'descricao',
        'foto',
        'bairro',
        'endereco',
        'ponto_referencia',
        'declaracao_boa_fe',
        'status',
        'criado_em',
        'andamentos',
    ]
    read_only_fields = ['protocolo', 'status', 'criado_em', 'andamentos']
    extra_kwargs = {
        'endereco': {'required': True, 'allow_blank': False, 'allow_null': False},
    }

  def validate_foto(self, value):
    if value and value.size > FOTO_TAMANHO_MAXIMO:
      raise serializers.ValidationError('A foto deve ter até 10 MB.')
    return value

  def validate_declaracao_boa_fe(self, value):
    if not value:
      raise serializers.ValidationError(
          'Você precisa confirmar que as informações são prestadas de boa-fé e verdadeiras'
      )
    return value


class AndamentoCriarSerializer(serializers.Serializer):
  status = serializers.ChoiceField(choices=Denuncia.Status.choices)
  observacao = serializers.CharField(
      required=False, allow_blank=True, default=''
  )
