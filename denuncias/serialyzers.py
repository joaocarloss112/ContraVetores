from decimal import ROUND_HALF_UP, Decimal

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


class CoordenadaField(serializers.DecimalField):
  def to_representation(self, valor):
    return str(valor)


def campo_coordenada(limite):
  return CoordenadaField(
      max_digits=20, decimal_places=15, required=False, allow_null=True,
      min_value=-limite, max_value=limite,
  )


class DenunciaSerializer(serializers.ModelSerializer):
  andamentos = AndamentoSerializer(many=True, read_only=True)
  latitude = campo_coordenada(90)
  longitude = campo_coordenada(180)

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
        'latitude',
        'longitude',
        'declaracao_boa_fe',
        'status',
        'criado_em',
        'andamentos',
    ]
    read_only_fields = ['protocolo', 'status', 'criado_em', 'andamentos']
    extra_kwargs = {
        'endereco': {'required': True, 'allow_blank': False, 'allow_null': False},
    }

  def validate(self, dados):
    tem_latitude = dados.get('latitude') is not None
    tem_longitude = dados.get('longitude') is not None
    if tem_latitude != tem_longitude:
      raise serializers.ValidationError(
          {'geral': ['Envie latitude e longitude juntas.']}
      )
    seis_casas = Decimal('0.000001')
    for campo in ['latitude', 'longitude']:
      if dados.get(campo) is not None:
        dados[campo] = dados[campo].quantize(seis_casas, rounding=ROUND_HALF_UP)
    return dados

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


class AndamentoPublicoSerializer(serializers.ModelSerializer):
  class Meta:
    model = Andamento
    fields = ['status', 'observacao', 'criado_em']
    read_only_fields = fields


class DenunciaPublicaSerializer(DenunciaSerializer):
  andamentos = AndamentoPublicoSerializer(many=True, read_only=True)


class AndamentoCriarSerializer(serializers.Serializer):
  status = serializers.ChoiceField(choices=Denuncia.Status.choices)
  observacao = serializers.CharField(
      required=False, allow_blank=True, default=''
  )
