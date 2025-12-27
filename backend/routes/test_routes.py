from flask import Blueprint, jsonify

test_bp = Blueprint('test', __name__)

@test_bp.route('/test/hello', methods=['GET'])
def test_hello():
    return jsonify({'message': 'Test route working'}), 200