# from flask import Blueprint, jsonify, request, url_for, send_file
# import time
# import threading
# from datetime import datetime
# from db import db
# import io
# import os

# test_bp = Blueprint('test', __name__)


# #Save Patient Info 
# @test_bp.route('/test/patient/save', methods=['POST'])
# def handle_save_patient():
#     return

from flask import Blueprint, jsonify

test_bp = Blueprint('test', __name__)

@test_bp.route('/test/hello', methods=['GET'])
def test_hello():
    return jsonify({'message': 'Test route working'}), 200