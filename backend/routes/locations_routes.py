from flask import Blueprint, jsonify, current_app
import os
import pymysql

locations_bp = Blueprint('locations', __name__, url_prefix='/locations')

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

@locations_bp.route('/divisions', methods=['GET'])
def get_divisions():
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT division_id, division_name FROM m_division ORDER BY division_name")
            rows = cur.fetchall()
        conn.close()
        return jsonify({'divisions': rows}), 200
    except Exception as e:
        current_app.logger.exception("Failed to fetch divisions")
        return jsonify({'message': str(e)}), 500

@locations_bp.route('/divisions/<int:division_id>/districts', methods=['GET'])
def get_districts(division_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT district_id, district_name 
                FROM m_district 
                WHERE division_id=%s
                ORDER BY district_name
            """, (division_id,))
            rows = cur.fetchall()
        conn.close()
        return jsonify({'districts': rows}), 200
    except Exception as e:
        current_app.logger.exception("Failed to fetch districts")
        return jsonify({'message': str(e)}), 500

@locations_bp.route('/districts/<int:district_id>/tehsils', methods=['GET'])
def get_tehsils(district_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT tehsil_id, tehsil_name 
                FROM m_tehsil 
                WHERE district_id=%s
                ORDER BY tehsil_name
            """, (district_id,))
            rows = cur.fetchall()
        conn.close()
        return jsonify({'tehsils': rows}), 200
    except Exception as e:
        current_app.logger.exception("Failed to fetch tehsils")
        return jsonify({'message': str(e)}), 500

@locations_bp.route('/districts/<int:district_id>/blocks', methods=['GET'])
def get_blocks(district_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT block_id, block_name 
                FROM m_block 
                WHERE district_id=%s
                ORDER BY block_name
            """, (district_id,))
            rows = cur.fetchall()
        conn.close()
        return jsonify({'blocks': rows}), 200
    except Exception as e:
        current_app.logger.exception("Failed to fetch blocks")
        return jsonify({'message': str(e)}), 500
