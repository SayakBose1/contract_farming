import json
import datetime
import jwt
from flask import Blueprint, request, jsonify
from db import get_db
import os

trader_bp = Blueprint("trader", __name__, url_prefix="/trader")

SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-this")



def get_current_user_id():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header:
        return None

    token = auth_header
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        mobile = payload.get("mobile_number")
        if not mobile:
            return None

        db = get_db()
        with db.cursor() as cur:
            cur.execute("""
                SELECT user_id 
                FROM m_user_login 
                WHERE mobile_number=%s LIMIT 1
            """, (mobile,))
            user = cur.fetchone()

        if not user:
            return None

        return user["user_id"]

    except Exception:
        return None



def format_available_contract(row):
    def to_iso(dt):
        if not dt:
            return None
        if hasattr(dt, "isoformat"):
            return dt.isoformat()
        try:
            return datetime.datetime.strptime(dt, "%Y-%m-%d %H:%M:%S").isoformat()
        except:
            return None

    return {
        "id": row["id"],
        "contractId": row["contract_id"],
        "contractStatus": row["contract_status"],


        "createdAt": to_iso(row["created_at"]),

        "commodity": {
            "commodity_name": row["commodity_name"],
        },
        "variety": {
            "variety_name": row["variety_name"],
        },

        "cropDetails": {
            "quantity": {
                "amount": row["crop_quantity_amount"],
                "unit": row["crop_quantity_unit"]
            },
            "quality": row["commodity_quality"],
        },

        "pricing": {
            "basePrice": row["base_price"],
            "priceUnit": row["price_unit"],
        },

        "farmingDetails": {
            "harvestingDate": to_iso(row["harvesting_date"]),
        },

        "farm": {
            "farm_id": row["farm_id"],
            "farm_name": row["farm_name"],

            "division": {
                "division_id": row["farm_division"],
                "division_name": row["division_name"],
            } if row["farm_division"] else None,

            "district": {
                "district_id": row["farm_district"],
                "district_name": row["district_name"],
            } if row["farm_district"] else None,

            "tehsil": {
                "tehsil_id": row["farm_tehsil"],
                "tehsil_name": row["tehsil_name"],
            } if row["farm_tehsil"] else None,

            "block": {
                "block_id": row["farm_block"],
                "block_name": row["block_name"],
            } if row["farm_block"] else None,
        },

        "user": {
            "user_id": row["user_id"],
            "full_name": row["farmer_name"],
        },

        "negotiations": json.loads(row["negotiations"] or "[]")
    }



@trader_bp.route("/contracts/available", methods=["GET"])
def get_available_contracts():
    trader_id = get_current_user_id()
    if not trader_id:
        return jsonify({"message": "Unauthorized"}), 401

    status = request.args.get("status", "open").lower()

    db = get_db()
    cur = db.cursor()

    base_query = """
        SELECT 
            c.*,
            f.farm_name, f.farm_id,
            f.farm_division, f.farm_district, f.farm_tehsil, f.farm_block,
            d.division_name,
            dist.district_name,
            t.tehsil_name,
            b.block_name,
            com.commodity_name,
            v.variety_name,
            u.full_name AS farmer_name
        FROM contracts c
        JOIN m_farm f ON f.farm_id = c.farm_id
        JOIN m_commodity com ON com.commodity_id = c.commodity_id
        JOIN m_commodity_variety v ON v.variety_id = c.variety_id
        JOIN m_user_login u ON u.user_id = c.user_id
        LEFT JOIN m_division d ON d.division_id = f.farm_division
        LEFT JOIN m_district dist ON dist.district_id = f.farm_district
        LEFT JOIN m_tehsil t ON t.tehsil_id = f.farm_tehsil
        LEFT JOIN m_block b ON b.block_id = f.farm_block
        WHERE c.user_id != %s
    """

    params = [trader_id]

    # ✅ OPEN TAB → ONLY OPEN CONTRACTS
    if status == "open":
        base_query += " AND LOWER(c.contract_status) = 'open'"

    # ✅ NEGOTIATING TAB → ONLY SELECTED TRADER
    elif status == "negotiating":
        base_query += """
            AND LOWER(c.contract_status) = 'negotiating'
            AND c.trader_user_id = %s
        """
        params.append(trader_id)

    # ❌ TRADERS MUST NOT SEE THESE STATES
    else:
        return jsonify({"contracts": []}), 200

    base_query += " ORDER BY c.created_at DESC"

    cur.execute(base_query, params)
    rows = cur.fetchall()

    return jsonify({
        "contracts": [format_available_contract(r) for r in rows]
    }), 200



@trader_bp.route("/contracts/<string:contract_id>/interest", methods=["POST"])
def show_interest(contract_id):
    trader_id = get_current_user_id()

    if not trader_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT negotiations FROM contracts WHERE contract_id=%s", (contract_id,))
    row = cur.fetchone()

    if not row:
        return jsonify({"message": "Contract not found"}), 404

    negotiations = json.loads(row["negotiations"] or "[]")

    negotiations.append({
        "trader_id": trader_id,
        "type": "interest",
        "status": "pending",
        "timestamp": datetime.datetime.now().isoformat()
    })

    cur.execute("""
        UPDATE contracts 
        SET negotiations=%s
        WHERE contract_id=%s
    """, (json.dumps(negotiations), contract_id))

    db.commit()

    return jsonify({"message": "Interest added successfully"}), 200



@trader_bp.route("/contracts/<string:contract_id>/accept-trader/<int:trader_id>", methods=["POST"])
def accept_trader(contract_id, trader_id):
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT negotiations FROM contracts WHERE contract_id=%s", (contract_id,))
    row = cur.fetchone()

    if not row:
        return jsonify({"message": "Contract not found"}), 404

    negotiations = json.loads(row["negotiations"] or "[]")

    for n in negotiations:
        if n.get("trader_id") == trader_id:
            n["status"] = "accepted"

    cur.execute("""
        UPDATE contracts
        SET contract_status='Negotiating',
            negotiations=%s,
            trader_user_id=%s
        WHERE contract_id=%s
    """, (json.dumps(negotiations), trader_id, contract_id))

    db.commit()

    return jsonify({"message": "Trader accepted"}), 200



@trader_bp.route("/contracts/<string:contract_id>", methods=["GET"])
def get_single_contract(contract_id):
    trader_id = get_current_user_id()
    if not trader_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        SELECT 
            c.*,
            f.farm_name, f.farm_id,
            f.farm_division, f.farm_district, f.farm_tehsil, f.farm_block,
            d.division_name,
            dist.district_name,
            t.tehsil_name,
            b.block_name,
            com.commodity_name,
            v.variety_name,
            u.full_name AS farmer_name
        FROM contracts c
        JOIN m_farm f ON f.farm_id = c.farm_id
        JOIN m_commodity com ON com.commodity_id = c.commodity_id
        JOIN m_commodity_variety v ON v.variety_id = c.variety_id
        JOIN m_user_login u ON u.user_id = c.user_id
        LEFT JOIN m_division d ON d.division_id = f.farm_division
        LEFT JOIN m_district dist ON dist.district_id = f.farm_district
        LEFT JOIN m_tehsil t ON t.tehsil_id = f.farm_tehsil
        LEFT JOIN m_block b ON b.block_id = f.farm_block
        WHERE c.contract_id = %s
        LIMIT 1
    """, (contract_id,))

    row = cur.fetchone()
    if not row:
        return jsonify({"message": "Contract not found"}), 404

    # 🔐 SECURITY CHECK
    if row["contract_status"].lower() == "negotiating":
        if row["trader_user_id"] != trader_id:
            return jsonify({"message": "Forbidden"}), 403

    return jsonify({
        "contract": format_available_contract(row)
    }), 200
