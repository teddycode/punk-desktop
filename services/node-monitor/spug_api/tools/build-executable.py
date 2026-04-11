import os
import platform
import subprocess
import sys


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = 'spug-api-windows' if platform.system() == 'Windows' else 'spug-api-linux'
SEP = ';' if platform.system() == 'Windows' else ':'


def add_data(path, target):
    return f'{os.path.join(BASE_DIR, path)}{SEP}{target}'


def main():
    command = [
        sys.executable,
        '-m',
        'PyInstaller',
        '--noconfirm',
        '--clean',
        '--onefile',
        '--name',
        NAME,
        '--collect-submodules',
        'apps',
        '--collect-submodules',
        'consumer',
        '--collect-submodules',
        'libs',
        '--collect-submodules',
        'spug',
        '--collect-all',
        'uvicorn',
        '--collect-all',
        'websockets',
        '--collect-all',
        'channels',
        '--collect-all',
        'daphne',
        '--collect-all',
        'autobahn',
        '--collect-all',
        'django_redis',
        '--collect-all',
        'txaio',
        '--add-data',
        add_data('data', 'data'),
        os.path.join(BASE_DIR, 'server.py'),
    ]
    subprocess.check_call(command, cwd=BASE_DIR)


if __name__ == '__main__':
    main()
