import os

def _load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(_file_)), '.env')
    if not os.path.exists(env_path):
        return
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            if key not in os.environ:
                os.environ[key] = value

_load_env()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'healthbridge-dev-secret-key')

    DB_HOST     = os.environ.get('DB_HOST',     'localhost')
    DB_PORT     = int(os.environ.get('DB_PORT', 3306))
    DB_USER     = os.environ.get('DB_USER',     'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_NAME     = os.environ.get('DB_NAME',     'healthbridge_db')

    
    SESSION_LIFETIME = int(os.environ.get('SESSION_LIFETIME', 3600)) # 1 hour default. After this, users must log in again. Reduces risk of stolen sessions.

    CACHE_TTL = int(os.environ.get('CACHE_TTL', 30))


def get_db_connection():
    # create and return a new DB connection.
    import mysql.connector
    conn = mysql.connector.connect(
        host        = Config.DB_HOST,
        port        = Config.DB_PORT,
        user        = Config.DB_USER,
        password    = Config.DB_PASSWORD,
        database    = Config.DB_NAME,
        connect_timeout = 10       # fail fast on bad network instead of hanging
    )
    return conn
