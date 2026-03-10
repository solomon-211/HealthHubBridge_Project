from flask import Blueprint, request, jsonify, session
from config import get_db_connection, Config
import hashlib


# initializes the Flask Blueprint for the authentication route.
auth_bp = Blueprint('auth', __name__)

# to encode passwords from plain text to a SHA-256 hash.
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


