import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from flask import Blueprint, request, jsonify
from config import get_db_connection
from cache import cache_get, cache_set, cache_invalidate
from routes.auth import login_required
from mysql.connector import IntegrityError

patients_bp = Blueprint('patients', __name__)

def serialize(row):
    if row is None:
        return None
    return {k: (v.isoformat() if hasattr(v, 'isoformat') else v) for k, v in row.items()}


@patients_bp.route('/patients', methods=['GET'])
@login_required
def get_patients():
    search = request.args.get('search', '').strip()

    cache_key = f'patients:{search}'
    cached = cache_get(cache_key)
    if cached:
        return jsonify({'patients': cached, 'source': 'cache'}), 200

    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if search:
            like = f'%{search}%'
            cursor.execute("""
                SELECT patient_id, first_name, last_name, date_of_birth,
                       gender, phone, email, blood_type, clinic_number,
                       insurance_provider, registered_at
                FROM patients
                WHERE first_name LIKE %s
                   OR last_name  LIKE %s
                   OR clinic_number LIKE %s
                ORDER BY last_name
            """, (like, like, like))
        else:
            cursor.execute("""
                SELECT patient_id, first_name, last_name, date_of_birth,
                       gender, phone, email, blood_type, clinic_number,
                       insurance_provider, registered_at
                FROM patients
                ORDER BY last_name
            """)

        patients = [serialize(row) for row in cursor.fetchall()]
        conn.close()
    except Exception as e:
        return jsonify({'error': 'Could not retrieve patients. Check connection.', 'details': str(e)}), 503

    cache_set(cache_key, patients)
    return jsonify({'patients': patients, 'source': 'db'}), 200


@patients_bp.route('/patients', methods=['POST'])
@login_required
def register_patient():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['first_name', 'last_name', 'date_of_birth', 'gender', 'clinic_number']
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO patients (
                first_name, last_name, date_of_birth, gender,
                phone, email, address, blood_type,
                emergency_contact, insurance_provider,
                national_id, clinic_number
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data['first_name'],            data['last_name'],
            data['date_of_birth'],         data['gender'],
            data.get('phone'),             data.get('email'),
            data.get('address'),           data.get('blood_type'),
            data.get('emergency_contact'), data.get('insurance_provider'),
            data.get('national_id'),       data['clinic_number']
        ))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

    except IntegrityError as e:
        if e.errno == 1062:
            return jsonify({'error': f"Clinic number '{data['clinic_number']}' is already registered"}), 409
        raise
    except Exception as e:
        return jsonify({'error': 'Registration failed.', 'details': str(e)}), 503

    cache_invalidate('patients')

    return jsonify({'id': new_id, 'clinic_number': data['clinic_number']}), 201


@patients_bp.route('/patients/<int:patient_id>', methods=['GET'])
@login_required
def get_patient(patient_id):
    cache_key = f'patients:id:{patient_id}'
    cached = cache_get(cache_key)
    if cached:
        return jsonify({'patient': cached, 'source': 'cache'}), 200

    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM patients WHERE patient_id = %s", (patient_id,))
        patient = serialize(cursor.fetchone())
        conn.close()
    except Exception as e:
        return jsonify({'error': 'Could not retrieve patient.', 'details': str(e)}), 503

    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    cache_set(cache_key, patient)
    return jsonify({'patient': patient, 'source': 'db'}), 200


@patients_bp.route('/patients/<int:patient_id>', methods=['PATCH'])
@login_required
def update_patient(patient_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    allowed_fields = ['phone', 'email', 'address', 'emergency_contact',
                      'insurance_provider', 'blood_type']
    updates = {k: v for k, v in data.items() if k in allowed_fields}

    if not updates:
        return jsonify({'error': 'No valid fields provided to update'}), 400

    set_clause = ', '.join(f"{col} = %s" for col in updates)
    values     = list(updates.values()) + [patient_id]

    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"UPDATE patients SET {set_clause} WHERE patient_id = %s",
            values
        )
        conn.commit()
        affected = cursor.rowcount
        conn.close()
    except Exception as e:
        return jsonify({'error': 'Update failed.', 'details': str(e)}), 503

    if affected == 0:
        return jsonify({'error': 'Patient not found'}), 404

    cache_invalidate(f'patients:id:{patient_id}')
    cache_invalidate('patients:')

    return jsonify({'message': 'Patient updated successfully'}), 200
