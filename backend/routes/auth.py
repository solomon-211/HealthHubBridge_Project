from flask import Blueprint, request, jsonify, session
from config import get_db_connection, Config
import hashlib


# initializes the Flask Blueprint for the authentication route.
auth_bp = Blueprint('auth', __name__)

# to encode passwords from plain text to a SHA-256 hash.
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# handles POST requests to the /api/auth/login endpoint, allowing users to log in by providing their username and password. It checks the credentials against the database and, if valid, stores user information in the session.
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
        # If the DB is unreachable, returns this message 
        return jsonify({'error': 'Database unavailable. Please try again.', 'details': str(e)}), 503

    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401

    # Store user info in the server-side session
    session['user_id']   = user['user_id']
    session['username']  = user['username']
    session['role']      = user['role']
    session['logged_in_at'] = time.time()

    return jsonify({
        'message':  'Login successful',
        'user':     {'username': user['username'], 'role': user['role']}
    }), 200
