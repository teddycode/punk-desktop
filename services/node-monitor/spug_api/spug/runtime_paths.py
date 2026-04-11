import os
import shutil
import sys


SOURCE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE_DIR = getattr(sys, '_MEIPASS', SOURCE_DIR) if getattr(sys, 'frozen', False) else SOURCE_DIR
RUNTIME_DIR = os.path.dirname(os.path.abspath(sys.executable)) if getattr(sys, 'frozen', False) else SOURCE_DIR

DATA_DIR = os.path.join(RUNTIME_DIR, 'data')
DATABASE_PATH = os.path.join(DATA_DIR, 'db.sqlite3')
LOG_DIR = os.path.join(RUNTIME_DIR, 'logs')
REPOS_DIR = os.path.join(RUNTIME_DIR, 'repos')
BUILD_DIR = os.path.join(REPOS_DIR, 'build')
STORAGE_DIR = os.path.join(RUNTIME_DIR, 'storage')
TRANSFER_DIR = os.path.join(STORAGE_DIR, 'transfer')


def ensure_runtime_layout():
    for path in (DATA_DIR, LOG_DIR, REPOS_DIR, BUILD_DIR, TRANSFER_DIR):
        os.makedirs(path, exist_ok=True)

    if getattr(sys, 'frozen', False) and not os.path.exists(DATABASE_PATH):
        seed_db = os.path.join(BUNDLE_DIR, 'data', 'db.sqlite3')
        if os.path.exists(seed_db):
            shutil.copy2(seed_db, DATABASE_PATH)
