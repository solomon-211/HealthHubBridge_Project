from flask import Blueprint, request, jsonify, session
from config import get_db_connection, Config
import hashlib
import time

auth_bp = Blueprint('auth', __name__)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    username = data['username']
    password = hash_password(data['password'])

    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT user_id, username, role FROM users WHERE username = %s AND password = %s",
            (username, password)
        )
        user = cursor.fetchone()
        conn.close()
    except Exception as e:
        return jsonify({'error': 'Database unavailable. Please try again.', 'details': str(e)}), 503

    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401

    session['user_id']   = user['user_id']
    session['username']  = user['username']
    session['role']      = user['role']
    session['logged_in_at'] = time.time()

    return jsonify({
        'message':  'Login successful',
        'user':     {'username': user['username'], 'role': user['role']}
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200


def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Please log in to access this resource'}), 401

        elapsed = time.time() - session.get('logged_in_at', 0)
        if elapsed > Config.SESSION_LIFETIME:
            session.clear()
            return jsonify({'error': 'Session expired. Please log in again.'}), 401

        return f(*args, **kwargs)
    return decorated


def role_required(*allowed_roles):
    from functools import wraps
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Please log in'}), 401
            current_role = str(session.get('role') or '').strip().lower()
            normalized_allowed = {str(r).strip().lower() for r in allowed_roles}
            if current_role not in normalized_allowed:
                return jsonify({'error': 'You do not have permission to access this resource'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
