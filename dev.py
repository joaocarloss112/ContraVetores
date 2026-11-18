import argparse
import hashlib
import os
import shutil
import signal
import socket
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


def rodar(comando, pasta=RAIZ, dica=None):
  resultado = subprocess.run([str(parte) for parte in comando], cwd=pasta)
  if resultado.returncode != 0:
    print(f'\nFalhou: {" ".join(str(parte) for parte in comando)}')
    if dica:
      print(dica)
    sys.exit(resultado.returncode)


def checar_python():
  if sys.version_info < (3, 12):
    print(f'Python {sys.version.split()[0]} encontrado. O projeto precisa do Python 3.12 ou mais novo.')
    sys.exit(1)


def venv_funciona(python):
  if not python.exists():
    return False
  resultado = subprocess.run([str(python), '-m', 'pip', '--version'], capture_output=True)
  return resultado.returncode == 0


def criar_venv():
  etapa('Criando o ambiente virtual (venv)')
  try:
    venv.create(VENV, with_pip=True, clear=True)
  except Exception:
    shutil.rmtree(VENV, ignore_errors=True)
    print('\nNão foi possível criar o venv com pip.')
    print('No Ubuntu/Debian instale o pacote: sudo apt install python3-venv')
    sys.exit(1)


def porta_livre(porta):
  with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    try:
      s.bind(('127.0.0.1', porta))
    except OSError:
      return False
  return True


def checar_portas(com_front):
  portas = [8000]
  if com_front:
    portas.append(5173)
  ocupadas = [porta for porta in portas if not porta_livre(porta)]
  if ocupadas:
    print(f'\nPorta(s) {", ".join(str(p) for p in ocupadas)} já em uso. Feche o outro servidor e rode de novo.')
    sys.exit(1)


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
  if not venv_funciona(python):
    if VENV.exists():
      print('venv incompleto ou de outra versão do Python. Recriando.')
    criar_venv()

  requisitos = RAIZ / 'requirements.txt'
  marcador = VENV / '.requirements.sha256'
  if mudou_desde_a_ultima_vez(requisitos, marcador):
    etapa('Instalando dependências do back-end')
    rodar([python, '-m', 'pip', 'install', '-q', '-r', requisitos])
    salvar_marcador(requisitos, marcador)
  else:
    etapa('Dependências do back-end já instaladas')

  etapa('Aplicando migrações no banco')
  dica = None
  if os.environ.get('DATABASE_URL'):
    dica = (
        'Não deu para falar com o banco do DATABASE_URL. Confira:\n'
        '  1. O projeto no Supabase está ativo (no plano grátis ele pausa após 7 dias sem uso)\n'
        '  2. A URL é a do Session pooler (porta 5432, host *.pooler.supabase.com)\n'
        '  3. A senha não tem @ # / ? e não ficou o [YOUR-PASSWORD]'
    )
  rodar([python, 'manage.py', 'migrate', '--noinput'], dica=dica)


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
  if not sys.stdin.isatty():
    print('Terminal sem modo interativo (comum no Git Bash do Windows). Rode depois, no PowerShell ou terminal:')
    print(f'  {python.relative_to(RAIZ)} manage.py createsuperuser')
    return
  rodar([python, 'manage.py', 'createsuperuser'])


def preparar_frontend():
  npm = shutil.which('npm')
  node = shutil.which('node')
  if npm is None or node is None:
    print('\nNode.js não encontrado. Instale o Node.js 20+ (https://nodejs.org) e rode de novo.')
    sys.exit(1)
  versao = subprocess.run([node, '--version'], capture_output=True, text=True).stdout.strip()
  maior = int(versao.lstrip('v').split('.')[0])
  if maior < 20:
    print(f'\nNode.js {versao} encontrado. O front precisa do Node.js 20 ou mais novo.')
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
  checar_portas(com_front)
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


def carregar_env():
  arquivo = RAIZ / '.env'
  if not arquivo.exists():
    return
  for linha in arquivo.read_text(encoding='utf-8').splitlines():
    linha = linha.strip()
    if not linha or linha.startswith('#') or '=' not in linha:
      continue
    chave, valor = linha.split('=', 1)
    os.environ.setdefault(chave.strip(), valor.strip().strip('"').strip("'"))


def main():
  parser = argparse.ArgumentParser(description='Prepara e sobe o ContraVetores para desenvolvimento.')
  parser.add_argument('--seed', action='store_true', help='gera denúncias fictícias antes de subir')
  parser.add_argument('--so-api', action='store_true', help='sobe só o back-end')
  parser.add_argument('--so-preparar', action='store_true', help='instala e migra, sem subir servidores')
  args = parser.parse_args()

  checar_python()
  carregar_env()
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
