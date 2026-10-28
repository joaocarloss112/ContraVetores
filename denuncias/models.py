from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class Usuario(AbstractUser):
  class TipoUsuario(models.TextChoices):
    GESTAO = 'GESTAO', 'Gestão Municipal'

  tipo = models.CharField(
      max_length=20, choices=TipoUsuario.choices, default=TipoUsuario.GESTAO
  )
  telefone = models.CharField(max_length=15, blank=True, null=True)


class Denuncia(models.Model):
  class Status(models.TextChoices):
    RECEBIDA = 'RECEBIDA', 'Recebida'
    VALIDADA = 'VALIDADA', 'Validada'
    REJEITADA = 'REJEITADA', 'Rejeitada'
    RESOLVIDA = 'RESOLVIDA', 'Resolvida'

  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  protocolo = models.CharField(max_length=20, unique=True, blank=True)
  titulo = models.CharField(max_length=150)
  categoria = models.CharField(max_length=100)
  descricao = models.TextField()
  foto = models.ImageField(upload_to='denuncias/', blank=True, null=True)
  bairro = models.CharField(max_length=100, default='Olinda')
  endereco = models.CharField(max_length=255, blank=True, null=True)
  declaracao_boa_fe = models.BooleanField(default=False)
  status = models.CharField(
      max_length=20, choices=Status.choices, default=Status.RECEBIDA
  )
  criado_em = models.DateTimeField(auto_now_add=True)

  def save(self, *args, **kwargs):
    if not self.protocolo:
      self.protocolo = str(uuid.uuid4()).upper()[:8]
    super().save(*args, **kwargs)

  def __str__(self):
    return f'[{self.protocolo}] {self.titulo} - {self.bairro}'


class Andamento(models.Model):
  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  denuncia = models.ForeignKey(
      Denuncia, on_delete=models.CASCADE, related_name='andamentos'
  )
  autor = models.ForeignKey(
      Usuario, on_delete=models.SET_NULL, null=True, blank=True,
      related_name='andamentos',
  )
  status = models.CharField(max_length=20, choices=Denuncia.Status.choices)
  observacao = models.TextField(blank=True, default='')
  criado_em = models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering = ['criado_em']

  def __str__(self):
    return f'[{self.denuncia.protocolo}] {self.status}'

