from flask import Blueprint, jsonify, current_app
import pymysql, os

master_bp = Blueprint('master', __name__, url_prefix='/master')

def get_db_connection():
    return pymysql.connect(
        host=os.environ.get('DB_HOST','localhost'),
        user=os.environ.get('DB_USER','root'),
        password=os.environ.get('DB_PASSWORD',''),
        db=os.environ.get('DB_NAME','sisjk'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

@master_bp.route('/education', methods=['GET'])
def get_education():
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT education_level_id, education_level FROM m_education_level")
            rows = cur.fetchall()
        conn.close()
        return jsonify({'education_levels': rows}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
