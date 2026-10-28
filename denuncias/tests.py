import shutil
import tempfile
from io import BytesIO

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient

from .models import Andamento, Denuncia


def imagem_de_teste():
  buffer = BytesIO()
  Image.new('RGB', (4, 4), color=(0, 128, 0)).save(buffer, format='PNG')
  return SimpleUploadedFile('foco.png', buffer.getvalue(), content_type='image/png')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp(prefix='contravetores-test-media-'))
class DenunciaApiTests(TestCase):

  @classmethod
  def tearDownClass(cls):
    shutil.rmtree(settings.MEDIA_ROOT, ignore_errors=True)
    super().tearDownClass()

  def setUp(self):
    self.client = APIClient()
    self.payload = {
        'titulo': 'Caixa d\'água destampada',
        'categoria': 'Água parada',
        'descricao': 'Caixa aberta no quintal.',
        'bairro': 'Carmo',
        'endereco': 'Rua do Sol, 10',
        'declaracao_boa_fe': True,
    }
    self.gestor = get_user_model().objects.create_user(
        username='gestor', password='senha-de-teste-123'
    )

  def test_criar_denuncia_com_foto_retorna_protocolo_e_status_recebida(self):
    foto = imagem_de_teste()
    resp = self.client.post(
        reverse('criar-denuncia'), {**self.payload, 'foto': foto}, format='multipart'
    )
    self.assertEqual(resp.status_code, 201, resp.data)
    self.assertEqual(resp.data['status'], Denuncia.Status.RECEBIDA)
    self.assertEqual(len(resp.data['protocolo']), 8)
    self.assertTrue(resp.data['foto'])

  def test_criar_denuncia_sem_boa_fe_e_recusada(self):
    resp = self.client.post(
        reverse('criar-denuncia'), {**self.payload, 'declaracao_boa_fe': False},
        format='json',
    )
    self.assertEqual(resp.status_code, 400)
    self.assertIn('declaracao_boa_fe', resp.data)

  def test_consulta_publica_por_protocolo_mostra_status_e_historico(self):
    denuncia = Denuncia.objects.create(**self.payload)
    Andamento.objects.create(
        denuncia=denuncia, status=Denuncia.Status.RECEBIDA, observacao='Recebida.'
    )
    resp = self.client.get(reverse('consultar-protocolo', args=[denuncia.protocolo]))
    self.assertEqual(resp.status_code, 200)
    self.assertEqual(resp.data['status'], Denuncia.Status.RECEBIDA)
    self.assertEqual(resp.data['andamentos'][0]['observacao'], 'Recebida.')
    self.assertIsNone(resp.data['andamentos'][0]['autor'])

  def test_lista_admin_exige_autenticacao(self):
    resp = self.client.get(reverse('admin-listar-denuncias'))
    self.assertIn(resp.status_code, (401, 403))

  def test_gestao_registra_andamento_e_atualiza_status(self):
    denuncia = Denuncia.objects.create(**self.payload)
    self.client.force_authenticate(self.gestor)
    url = reverse('admin-criar-andamento', args=[denuncia.protocolo])

    resp = self.client.post(
        url, {'status': 'VALIDADA', 'observacao': 'Foco confirmado.'}, format='json'
    )

    self.assertEqual(resp.status_code, 201, resp.data)
    self.assertEqual(resp.data['status'], 'VALIDADA')
    denuncia.refresh_from_db()
    self.assertEqual(denuncia.status, 'VALIDADA')
    andamento = denuncia.andamentos.get()
    self.assertEqual(andamento.autor, self.gestor)
    self.assertEqual(resp.data['andamentos'][0]['autor'], 'gestor')

  def test_andamento_com_status_invalido_e_recusado(self):
    denuncia = Denuncia.objects.create(**self.payload)
    self.client.force_authenticate(self.gestor)
    resp = self.client.post(
        reverse('admin-criar-andamento', args=[denuncia.protocolo]),
        {'status': 'INVENTADO'}, format='json',
    )
    self.assertEqual(resp.status_code, 400)
    self.assertFalse(denuncia.andamentos.exists())

  def test_andamento_exige_autenticacao(self):
    denuncia = Denuncia.objects.create(**self.payload)
    resp = self.client.post(
        reverse('admin-criar-andamento', args=[denuncia.protocolo]),
        {'status': 'VALIDADA'}, format='json',
    )
    self.assertIn(resp.status_code, (401, 403))
    denuncia.refresh_from_db()
    self.assertEqual(denuncia.status, Denuncia.Status.RECEBIDA)

  def test_login_jwt_entrega_token_para_painel(self):
    resp = self.client.post(
        '/auth/login', {'username': 'gestor', 'password': 'senha-de-teste-123'},
        format='json',
    )
    self.assertEqual(resp.status_code, 200)
    self.assertIn('access', resp.data)
