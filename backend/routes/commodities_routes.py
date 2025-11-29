from flask import Blueprint, jsonify
from db import get_db

commodities_bp = Blueprint("commodities", __name__)

@commodities_bp.route("/commodities", methods=["GET"])
def get_commodities():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT commodity_id, commodity_name FROM m_commodity")
    rows = cur.fetchall()
    return jsonify({"commodities": rows})


@commodities_bp.route("/commodities/<int:commodity_id>/varieties", methods=["GET"])
def get_varieties(commodity_id):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        """
        SELECT variety_id, variety_name 
        FROM m_commodity_variety 
        WHERE commodity_id = %s
        """,
        (commodity_id,)
    )
    rows = cur.fetchall()
    return jsonify({"varieties": rows})
