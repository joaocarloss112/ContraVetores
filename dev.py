import argparse
import hashlib
import os
import shutil
import signal
import subprocess
import sys
import time
import venv
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
VENV = RAIZ / 'venv'
FRONT = RAIZ / 'frontend'
WINDOWS = os.name == 'nt'


def etapa(texto):
  print(f'\n==> {texto}', flush=True)


def python_do_venv():
  if WINDOWS:
    return VENV / 'Scripts' / 'python.exe'
  return VENV / 'bin' / 'python'


def rodar(comando, pasta=RAIZ):
  resultado = subprocess.run([str(parte) for parte in comando], cwd=pasta)
  if resultado.returncode != 0:
    print(f'\nFalhou: {" ".join(str(parte) for parte in comando)}')
    sys.exit(resultado.returncode)


def hash_arquivo(caminho):
  return hashlib.sha256(caminho.read_bytes()).hexdigest()


def mudou_desde_a_ultima_vez(arquivo, marcador):
  atual = hash_arquivo(arquivo)
  if marcador.exists() and marcador.read_text() == atual:
    return False
  return True


def salvar_marcador(arquivo, marcador):
  marcador.write_text(hash_arquivo(arquivo))


def preparar_backend(python):
  if not python.exists():
    etapa('Criando o ambiente virtual (venv)')
    venv.create(VENV, with_pip=True)

  requisitos = RAIZ / 'requirements.txt'
  marcador = VENV / '.requirements.sha256'
  if mudou_desde_a_ultima_vez(requisitos, marcador):
    etapa('Instalando dependências do back-end')
    rodar([python, '-m', 'pip', 'install', '-q', '-r', requisitos])
    salvar_marcador(requisitos, marcador)
  else:
    etapa('Dependências do back-end já instaladas')

  etapa('Aplicando migrações no banco')
  rodar([python, 'manage.py', 'migrate', '--noinput'])


def existe_superusuario(python):
  codigo = (
      'import sys; from django.contrib.auth import get_user_model; '
      'sys.exit(int(not get_user_model().objects.filter(is_superuser=True).exists()))'
  )
  resultado = subprocess.run([str(python), 'manage.py', 'shell', '-v', '0', '-c', codigo], cwd=RAIZ)
  return resultado.returncode == 0


def garantir_superusuario(python):
  if existe_superusuario(python):
    return
  etapa('Nenhum usuário da gestão encontrado. Crie um para acessar o /admin')
  rodar([python, 'manage.py', 'createsuperuser'])


def preparar_frontend():
  npm = shutil.which('npm')
  if npm is None:
    print('\nnpm não encontrado. Instale o Node.js 20+ (https://nodejs.org) e rode de novo.')
    sys.exit(1)

  lock = FRONT / 'package-lock.json'
  marcador = FRONT / 'node_modules' / '.package-lock.sha256'
  if not (FRONT / 'node_modules').exists() or mudou_desde_a_ultima_vez(lock, marcador):
    etapa('Instalando dependências do front-end')
    rodar([npm, 'install', '--no-audit', '--no-fund'], pasta=FRONT)
    salvar_marcador(lock, marcador)
  else:
    etapa('Dependências do front-end já instaladas')
  return npm


def iniciar(comando, pasta):
  if WINDOWS:
    return subprocess.Popen([str(parte) for parte in comando], cwd=pasta)
  return subprocess.Popen([str(parte) for parte in comando], cwd=pasta, start_new_session=True)


def parar(processo):
  if processo.poll() is not None:
    return
  if WINDOWS:
    subprocess.run(['taskkill', '/T', '/F', '/PID', str(processo.pid)], capture_output=True)
  else:
    try:
      os.killpg(processo.pid, signal.SIGTERM)
    except ProcessLookupError:
      return
  try:
    processo.wait(timeout=10)
  except subprocess.TimeoutExpired:
    processo.kill()


def subir_servidores(python, npm, com_front):
  processos = []
  signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
  etapa('Subindo a API em http://127.0.0.1:8000 (admin em /admin/)')
  processos.append(iniciar([python, 'manage.py', 'runserver', '127.0.0.1:8000'], RAIZ))
  if com_front:
    etapa('Subindo o site em http://127.0.0.1:5173')
    vite = FRONT / 'node_modules' / 'vite' / 'bin' / 'vite.js'
    processos.append(iniciar([shutil.which('node'), vite, '--host', '127.0.0.1', '--port', '5173'], FRONT))
  print('\nTudo no ar. Ctrl+C para parar.\n', flush=True)

  try:
    while all(processo.poll() is None for processo in processos):
      time.sleep(1)
  except KeyboardInterrupt:
    pass
  finally:
    for processo in processos:
      parar(processo)
    print('\nServidores parados.')


def main():
  parser = argparse.ArgumentParser(description='Prepara e sobe o ContraVetores para desenvolvimento.')
  parser.add_argument('--seed', action='store_true', help='gera denúncias fictícias antes de subir')
  parser.add_argument('--so-api', action='store_true', help='sobe só o back-end')
  parser.add_argument('--so-preparar', action='store_true', help='instala e migra, sem subir servidores')
  args = parser.parse_args()

  if not (RAIZ / '.env').exists():
    print('Aviso: sem arquivo .env, usando SQLite local. Para o Supabase, copie .env.example para .env.')

  python = python_do_venv()
  preparar_backend(python)
  garantir_superusuario(python)

  if args.seed:
    etapa('Gerando denúncias fictícias')
    rodar([python, 'manage.py', 'seed_denuncias'])

  npm = None
  if not args.so_api:
    npm = preparar_frontend()

  if args.so_preparar:
    etapa('Pronto')
    return

  subir_servidores(python, npm, not args.so_api)


if __name__ == '__main__':
  main()
