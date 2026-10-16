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
  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  protocolo = models.CharField(max_length=20, unique=True, blank=True)
  titulo = models.CharField(max_length=150)
  categoria = models.CharField(max_length=100)
  descricao = models.TextField()
  foto = models.ImageField(upload_to='denuncias/', blank=True, null=True)
  bairro = models.CharField(max_length=100, default='Olinda')
  endereco = models.CharField(max_length=255, blank=True, null=True)
  declaracao_boa_fe = models.BooleanField(default=False)
  criado_em = models.DateTimeField(auto_now_add=True)

  def save(self, *args, **kwargs):
    if not self.protocolo:
      self.protocolo = str(uuid.uuid4()).upper()[:8]
    super().save(*args, **kwargs)

  def __str__(self):
    return f'[{self.protocolo}] {self.titulo} - {self.bairro}'
