
from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import os
import jwt
import datetime
import pymysql
import bcrypt

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')


# ------------------------------
# DATABASE CONNECTION
# ------------------------------
def get_db_connection():
    return pymysql.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        db=os.environ.get('DB_NAME', 'sisjk'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        charset='utf8mb4'
    )


# ------------------------------
# TOKEN CHECK DECORATOR
# ------------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            if token.startswith("Bearer "):
                token = token[7:]

            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            mobile = payload.get("mobile_number")

            if not mobile:
                return jsonify({'message': 'Invalid token payload'}), 401

            conn = get_db_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT user_id, mobile_number, full_name, user_type 
                    FROM m_user_login WHERE mobile_number=%s LIMIT 1
                """, (mobile,))
                user = cur.fetchone()
            conn.close()

            if not user:
                return jsonify({'message': 'Invalid token user'}), 401

            return f(user, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except Exception as e:
            return jsonify({'message': f'Token error: {str(e)}'}), 401

    return decorated


# ------------------------------
# LOGIN
# ------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    mobile_number = data.get('mobile_number')
    pass_key = data.get('pass_key')

    if not mobile_number or not pass_key:
        return jsonify({'message': 'Mobile number and passkey required'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cur:

            # m_user_login does NOT contain email_id
            cur.execute("""
                SELECT user_id, mobile_number, pass_key, full_name, user_type
                FROM m_user_login 
                WHERE mobile_number=%s LIMIT 1
            """, (mobile_number,))
            user = cur.fetchone()

            if not user:
                conn.close()
                return jsonify({'message': 'Invalid credentials'}), 401

            stored_hash = user['pass_key'].encode('utf-8')

            if not bcrypt.checkpw(pass_key.encode('utf-8'), stored_hash):
                conn.close()
                return jsonify({'message': 'Invalid credentials'}), 401

            # get email from m_user
            cur.execute("""
                SELECT email_id FROM m_user WHERE user_id=%s LIMIT 1
            """, (user["user_id"],))
            extra = cur.fetchone()
            email = extra["email_id"] if extra else None

        conn.close()

        token = jwt.encode({
            'mobile_number': mobile_number,
            'user_type': user['user_type'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')

        user_data = {
            'id': user['user_id'],
            'mobile_number': user['mobile_number'],
            'name': user['full_name'],
            'user_type': user['user_type'],
            'email': email
        }

        return jsonify({'message': 'Login successful', 'token': token, 'user': user_data}), 200

    except Exception as e:
        current_app.logger.exception("Login error")
        return jsonify({'message': f'Login failed: {str(e)}'}), 500


# ------------------------------
# SIGNUP STEP 1
# ------------------------------
@auth_bp.route('/signup', methods=['POST'])
def signup_step1():
    data = request.get_json() or {}

    full_name = data.get('full_name')
    mobile_number = data.get('mobile_number')
    pass_key = data.get('pass_key')
    user_type = data.get('user_type')

    if not (full_name and mobile_number and pass_key and user_type):
        return jsonify({'message': 'All fields are required'}), 400

    hashed = bcrypt.hashpw(pass_key.encode('utf-8'), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        with conn.cursor() as cur:

            cur.execute("SELECT user_id FROM m_user_login WHERE mobile_number=%s LIMIT 1", (mobile_number,))
            if cur.fetchone():
                return jsonify({'message': 'Mobile number already registered'}), 409

            cur.execute("""
                INSERT INTO m_user_login
                (full_name, mobile_number, pass_key, user_type, last_login, updated_time)
                VALUES (%s, %s, %s, %s, NULL, NOW())
            """, (full_name, mobile_number, hashed.decode('utf-8'), user_type))

            user_id = cur.lastrowid

        conn.commit()
        conn.close()
        return jsonify({'message': 'Signup step1 created', 'user_id': user_id}), 201

    except Exception as e:
        current_app.logger.exception("Signup step1 error")
        return jsonify({'message': f'Signup step1 failed: {str(e)}'}), 500


# ------------------------------
# SIGNUP STEP 2
# ------------------------------
@auth_bp.route('/signup/details/<int:user_id>', methods=['POST'])
def signup_step2(user_id):
    data = request.get_json() or {}

    try:
        conn = get_db_connection()
        with conn.cursor() as cur:

            cur.execute("SELECT * FROM m_user_login WHERE user_id=%s LIMIT 1", (user_id,))
            login_user = cur.fetchone()

            if not login_user:
                return jsonify({'message': 'Step1 not completed'}), 404

            # Prepare fields
            reg_id = data.get("reg_id", f"{login_user['user_type']}{user_id:05d}")

            cur.execute("""
                INSERT INTO m_user (
                    user_id, user_type, reg_id, age, full_name, gender, voter_id,
                    mobile_number, email_id, address, division_id, district_id,
                    tehsil_id, block_id, education_level_id, experience_years,
                    image_path, voter_path, source, status, updated_date, sequence
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s)
            """, (
                user_id,
                login_user["user_type"],
                reg_id,
                data.get("age", 0),
                login_user["full_name"],
                data.get("gender", "M"),
                data.get("voter_id", ""),
                login_user["mobile_number"],
                data.get("email_id"),
                data.get("address", ""),
                data.get("division_id", 1),
                data.get("district_id", 1),
                data.get("tehsil_id", 1),
                data.get("block_id", 1),
                data.get("education_level_id", 1),
                data.get("experience_years", 0),
                data.get("image_path"),
                data.get("voter_path"),
                "Web",
                "Pending",
                1
            ))

        conn.commit()
        conn.close()
        return jsonify({'message': 'Profile created'}), 201

    except Exception as e:
        current_app.logger.exception("Signup step2 error")
        return jsonify({'message': f'Signup step2 failed: {str(e)}'}), 500


# ------------------------------
# PROFILE & PASSWORD
# ------------------------------
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Return FULL user profile by joining m_user_login + m_user
    """
    try:
        user_id = current_user["user_id"]
        conn = get_db_connection()
        with conn.cursor() as cur:

            # Get basic login data
            cur.execute("""
                SELECT user_id, full_name, mobile_number, user_type
                FROM m_user_login WHERE user_id=%s
            """, (user_id,))
            login = cur.fetchone()

            # Get additional profile data
            cur.execute("""
                SELECT email_id, address, status as is_active
                FROM m_user WHERE user_id=%s LIMIT 1
            """, (user_id,))
            profile = cur.fetchone()

        conn.close()

        full_user = {
            "id": login["user_id"],
            "full_name": login["full_name"],
            "mobile_number": login["mobile_number"],
            "user_type": login["user_type"],
            "email_id": profile["email_id"] if profile else None,
            "address": profile["address"] if profile else "",
            "is_active": True if profile and profile["is_active"] == "Active" else False
        }

        return jsonify({"user": full_user}), 200

    except Exception as e:
        current_app.logger.exception("Fetch user error")
        return jsonify({"message": f"Fetch user failed: {str(e)}"}), 500



@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    Update editable fields in m_user
    Allowed fields: full_name, email_id, address
    """
    try:
        data = request.get_json() or {}
        user_id = current_user["user_id"]

        full_name = data.get("full_name")
        email_id = data.get("email_id")
        address = data.get("address")

        if not (full_name and email_id):
            return jsonify({"message": "full_name and email_id are required"}), 400

        conn = get_db_connection()
        with conn.cursor() as cur:

            # Update m_user_login full_name
            cur.execute("""
                UPDATE m_user_login SET full_name=%s, updated_time=NOW()
                WHERE user_id=%s
            """, (full_name, user_id))

            # Update m_user table (email + address)
            cur.execute("""
                UPDATE m_user 
                SET email_id=%s, address=%s, updated_date=NOW()
                WHERE user_id=%s
            """, (email_id, address, user_id))

        conn.commit()
        conn.close()

        # Return updated user
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user_id,
                "full_name": full_name,
                "email_id": email_id,
                "address": address,
                "mobile_number": current_user["mobile_number"],
                "user_type": current_user["user_type"],
                "is_active": True
            }
        }), 200

    except Exception as e:
        current_app.logger.exception("Profile update error")
        return jsonify({"message": f"Profile update failed: {str(e)}"}), 500
