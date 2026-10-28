from rest_framework import serializers
from .models import Andamento, Denuncia


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
        'declaracao_boa_fe',
        'status',
        'criado_em',
        'andamentos',
    ]
    read_only_fields = ['protocolo', 'status', 'criado_em', 'andamentos']

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
