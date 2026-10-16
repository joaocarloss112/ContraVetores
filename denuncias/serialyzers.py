from rest_framework import serializers
from .models import Denuncia


class DenunciaSerializer(serializers.ModelSerializer):

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
        'criado_em',
    ]
    read_only_fields = ['protocolo', 'criado_em']

  def validate_declaracao_boa_fe(self, value):
    if not value:
      raise serializers.ValidationError(
          'Você precisa confirmar que as informações são prestadas de boa-fé e verdadeiras'
      )
    return value