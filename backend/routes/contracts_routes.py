import os
import json
import jwt
import datetime
from flask import Blueprint, request, jsonify
from db import get_db

contracts_bp = Blueprint("contracts", __name__)

# Same secret as in auth_routes.py
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')


# ----------------------------------------------------------
# Helper: Get current user_id from JWT token
# ----------------------------------------------------------
def get_current_user_id():
    """
    Reads Authorization: Bearer <token>, decodes JWT, finds user_id from m_user_login.
    Returns user_id (int) or None if invalid/missing.
    """
    token = request.headers.get("Authorization")

    if not token:
        print("AUTH: Missing Authorization header")
        return None

    try:
        if token.startswith("Bearer "):
            token = token[7:]

        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        mobile = payload.get("mobile_number")

        if not mobile:
            print("AUTH: No mobile_number in token payload")
            return None

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT user_id 
            FROM m_user_login 
            WHERE mobile_number=%s 
            LIMIT 1
            """,
            (mobile,)
        )
        row = cursor.fetchone()

        if not row:
            print("AUTH: No user found for mobile:", mobile)
            return None

        return row["user_id"]

    except jwt.ExpiredSignatureError:
        print("AUTH: Token expired")
        return None
    except Exception as e:
        print("AUTH: Error decoding token:", e)
        return None


def to_iso(dt):
    try:
        if isinstance(dt, datetime.datetime):
            return dt.isoformat()
        return dt
    except:
        return None


# ----------------------------------------------------------
# Helper: Format contract to frontend
# ----------------------------------------------------------
def format_contract(row):
    return {
        "id": row["id"],
        "contractId": row["contract_id"],  
        "contract_id": row["contract_id"],
        "contractStatus": row["contract_status"], 
        "contract_status": row["contract_status"],
        "createdAt": to_iso(row["created_at"]),  
        "created_at": to_iso(row["created_at"]),
        "updatedAt": to_iso(row["updated_at"]), 
        "updated_at": to_iso(row["updated_at"]),
        "cropDetails": {
            "commodityId": row["commodity_id"],
            "varietyId": row["variety_id"],
            "quality": row["commodity_quality"],
            "expectedYield": row["expected_yield"],
            "quantity": {
                "amount": row["crop_quantity_amount"],
                "unit": row["crop_quantity_unit"]
            }
        },

        "farmingDetails": {
            "plantingDate": row["planting_date"],
            "harvestingDate": row["harvesting_date"],
            "season": row["season"],
            "farmingTechniques": json.loads(row["farming_techniques"] or "[]"),
            "fertilizersUsed": json.loads(row["fertilizers_used"] or "[]"),
            "pesticidesUsed": json.loads(row["pesticides_used"] or "[]"),
            "irrigationSchedule": row["irrigation_schedule"]
        },

        "pricing": {
            "basePrice": row["base_price"],
            "priceUnit": row["price_unit"],
            "totalEstimatedValue": row["total_estimated_value"],
            "advancePayment": {
                "amount": row["advance_payment_amount"],
                "percentage": row["advance_payment_percentage"],
                "dueDate": row["advance_payment_due_date"],
                "status": row["advance_payment_status"]
            },
            "finalPayment": {
                "amount": row["final_payment_amount"],
                "dueDate": row["final_payment_due_date"],
                "status": row["final_payment_status"]
            }
        },

        "logistics": {
            "responsibility": row["logistics_responsibility"],
            "pickupLocation": row["pickup_location"],
            "deliveryLocation": row["delivery_location"],
            "transportationCost": row["transportation_cost"],
            "packagingRequirements": row["packaging_requirements"],
            "deliverySchedule": row["delivery_schedule"]
        },

        "laborAndSupport": {
            "laborResponsibility": row["labor_responsibility"]
        },

        "commodity": {"commodity_name": row["commodity_name"]},
        "variety": {"variety_name": row["variety_name"]},

        "farm": {
            "farm_id": row["farm_id"],
            "farm_name": row["farm_name"],
            "farm_size_area": row["farm_size_area"],
            "farm_size_unit": row["farm_size_unit"]
        },

        "negotiations": json.loads(row["negotiations"] or "[]")
    }


# ----------------------------------------------------------
# Create Contract
# ----------------------------------------------------------
@contracts_bp.route("/contracts", methods=["POST"])
def create_contract():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    data = request.json

    try:
        cursor = db.cursor()

        # Default quality if missing
        quality = data["cropDetails"].get("quality") or "standard"

        contract_uid = f"C{int(datetime.datetime.now().timestamp())}{user_id}"

        cursor.execute(
            """
            INSERT INTO contracts (
                contract_id, user_id, farm_id,
                commodity_id, variety_id, commodity_quality,
                crop_quantity_amount, crop_quantity_unit,
                expected_yield, quality_parameters,
                planting_date, harvesting_date, season,
                farming_techniques, fertilizers_used, pesticides_used, irrigation_schedule,
                base_price, price_unit, total_estimated_value,
                advance_payment_amount, advance_payment_percentage, advance_payment_due_date,
                logistics_responsibility, pickup_location, delivery_location,
                transportation_cost, packaging_requirements, delivery_schedule,
                labor_responsibility, technical_support, expert_visits,
                farm_images, farm_videos, documents,
                contract_status, created_at, updated_at
            )
            VALUES (
                %(contract_id)s, %(user_id)s, %(farm_id)s,
                %(commodity_id)s, %(variety_id)s, %(commodity_quality)s,
                %(crop_quantity_amount)s, %(crop_quantity_unit)s,
                %(expected_yield)s, %(quality_parameters)s,
                %(planting_date)s, %(harvesting_date)s, %(season)s,
                %(farming_techniques)s, %(fertilizers_used)s, %(pesticides_used)s, %(irrigation_schedule)s,
                %(base_price)s, %(price_unit)s, %(total_estimated_value)s,
                %(advance_payment_amount)s, %(advance_payment_percentage)s, %(advance_payment_due_date)s,
                %(logistics_responsibility)s, %(pickup_location)s, %(delivery_location)s,
                %(transportation_cost)s, %(packaging_requirements)s, %(delivery_schedule)s,
                %(labor_responsibility)s, %(technical_support)s, %(expert_visits)s,
                %(farm_images)s, %(farm_videos)s, %(documents)s,
                'open', NOW(), NOW()
            )
        """,
            {
                "contract_id": contract_uid,
                "user_id": user_id,
                "farm_id": data["farm"],
                "commodity_id": data["cropDetails"]["commodityId"],
                "variety_id": data["cropDetails"]["varietyId"],
                "commodity_quality": quality,
                "crop_quantity_amount": data["cropDetails"]["quantity"]["amount"],
                "crop_quantity_unit": data["cropDetails"]["quantity"]["unit"],
                "expected_yield": data["cropDetails"]["expectedYield"],
                "quality_parameters": json.dumps(
                    data["cropDetails"].get("qualityParameters", {})
                ),
                "planting_date": data["farmingDetails"]["plantingDate"],
                "harvesting_date": data["farmingDetails"]["harvestingDate"],
                "season": data["farmingDetails"]["season"],
                "farming_techniques": json.dumps(
                    data["farmingDetails"]["farmingTechniques"]
                ),
                "fertilizers_used": json.dumps(
                    data["farmingDetails"]["fertilizersUsed"]
                ),
                "pesticides_used": json.dumps(
                    data["farmingDetails"]["pesticidesUsed"]
                ),
                "irrigation_schedule": data["farmingDetails"]["irrigationSchedule"],
                "base_price": data["pricing"]["basePrice"],
                "price_unit": data["pricing"]["priceUnit"],
                "total_estimated_value": None,
                "advance_payment_amount": data["pricing"]["advancePayment"].get(
                    "amount"
                ),
                "advance_payment_percentage": data["pricing"]["advancePayment"].get(
                    "percentage"
                ),
                "advance_payment_due_date": data["pricing"]["advancePayment"].get(
                    "dueDate"
                ),
                "logistics_responsibility": data["logistics"]["responsibility"],
                "pickup_location": data["logistics"]["pickupLocation"],
                "delivery_location": data["logistics"]["deliveryLocation"],
                "transportation_cost": data["logistics"].get("transportationCost"),
                "packaging_requirements": data["logistics"][
                    "packagingRequirements"
                ],
                "delivery_schedule": data["logistics"].get("deliverySchedule"),
                "labor_responsibility": data["laborAndSupport"][
                    "laborResponsibility"
                ],
                "technical_support": json.dumps(
                    data["laborAndSupport"].get("technicalSupport", {})
                ),
                "expert_visits": json.dumps(
                    data["laborAndSupport"].get("expertVisits", {})
                ),
                "farm_images": json.dumps(
                    data["mediaFiles"].get("farmImages", [])
                ),
                "farm_videos": json.dumps(
                    data["mediaFiles"].get("farmVideos", [])
                ),
                "documents": json.dumps(
                    data["mediaFiles"].get("documents", [])
                ),
            },
        )

        db.commit()
        return jsonify({"message": "Contract created successfully!"}), 201

    except Exception as e:
        print("CREATE CONTRACT ERROR:", e)
        return jsonify({"message": "Failed to create contract"}), 500


# ----------------------------------------------------------
# Get All Contracts (for logged-in farmer)
# ----------------------------------------------------------
@contracts_bp.route("/contracts", methods=["GET"])
def get_contracts():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    status_filter = request.args.get("status")

    db = get_db()
    cursor = db.cursor()

    query = """
        SELECT c.*,
               f.farm_name, f.farm_size_area, f.farm_size_unit,
               com.commodity_name,
               v.variety_name
        FROM contracts c
        JOIN m_farm f ON f.farm_id = c.farm_id
        JOIN m_commodity com ON com.commodity_id = c.commodity_id
        JOIN m_commodity_variety v ON v.variety_id = c.variety_id
        WHERE c.user_id = %s
    """

    params = [user_id]

    if status_filter:
        query += " AND c.contract_status = %s"
        params.append(status_filter)

    cursor.execute(query, params)
    rows = cursor.fetchall()

    return jsonify({"contracts": [format_contract(r) for r in rows]})


# ----------------------------------------------------------
# Get Single Contract
# ----------------------------------------------------------
@contracts_bp.route("/contracts/<string:contract_id>", methods=["GET"])
def get_contract(contract_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT c.*, 
               f.farm_name, f.farm_size_area, f.farm_size_unit,
               com.commodity_name,
               v.variety_name
        FROM contracts c
        JOIN m_farm f ON f.farm_id = c.farm_id
        JOIN m_commodity com ON com.commodity_id = c.commodity_id
        JOIN m_commodity_variety v ON v.variety_id = c.variety_id
        WHERE c.contract_id = %s
    """,
        (contract_id,),
    )

    row = cursor.fetchone()

    if not row:
        return jsonify({"message": "Contract not found"}), 404

    return jsonify({"contract": format_contract(row)})


# ----------------------------------------------------------
# Cancel Contract
# ----------------------------------------------------------
@contracts_bp.route("/contracts/<string:contract_id>/cancel", methods=["POST"])
def cancel_contract(contract_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

    # Optional: ensure only owner can cancel
    cursor.execute(
        """
        UPDATE contracts 
        SET contract_status='cancelled'
        WHERE contract_id=%s AND user_id=%s
    """,
        (contract_id, user_id),
    )

    db.commit()
    return jsonify({"message": "Contract cancelled"})


# ----------------------------------------------------------
# Trader Interest (this is legacy, you mainly use trader_routes now)
# ----------------------------------------------------------
@contracts_bp.route("/contracts/<string:contract_id>/interest", methods=["POST"])
def show_interest(contract_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT negotiations FROM contracts WHERE contract_id=%s",
        (contract_id,),
    )
    row = cursor.fetchone()

    if not row:
        return jsonify({"message": "Contract not found"}), 404

    negotiations = json.loads(row["negotiations"] or "[]")
    negotiations.append(
        {
            "trader_id": user_id,
            "type": "interest",
            "status": "pending",
            "timestamp": datetime.datetime.now().isoformat(),
        }
    )

    cursor.execute(
        """
        UPDATE contracts
        SET negotiations=%s
        WHERE contract_id=%s
    """,
        (json.dumps(negotiations), contract_id),
    )

    db.commit()
    return jsonify({"message": "Interest recorded"})


# ----------------------------------------------------------
# Farmer Accepts Trader
# ----------------------------------------------------------
@contracts_bp.route(
    "/contracts/<string:contract_id>/accept/<int:trader_id>", methods=["POST"]
)
def accept_trader(contract_id, trader_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT negotiations, user_id 
        FROM contracts 
        WHERE contract_id=%s
    """,
        (contract_id,),
    )
    row = cursor.fetchone()

    if not row:
        return jsonify({"message": "Contract not found"}), 404

    # Optional: ensure only owner farmer can accept
    if row["user_id"] != user_id:
        return jsonify({"message": "Not allowed"}), 403

    negotiations = json.loads(row["negotiations"] or "[]")

    for n in negotiations:
        if n.get("trader_id") == trader_id:
            n["status"] = "accepted"

    cursor.execute(
        """
        UPDATE contracts
        SET contract_status='negotiating',
            negotiations=%s,
            trader_user_id=%s
        WHERE contract_id=%s
    """,
        (json.dumps(negotiations), trader_id, contract_id),
    )

    db.commit()
    return jsonify({"message": "Trader accepted"})


# ----------------------------------------------------------
# Contract Form Data
# ----------------------------------------------------------
@contracts_bp.route("/contracts/form-data", methods=["GET"])
def get_form_data():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

    # Farms of this logged-in farmer
    cursor.execute(
        """
        SELECT farm_id, farm_name 
        FROM m_farm 
        WHERE user_id = %s
    """,
        (user_id,),
    )
    farms = cursor.fetchall()

    cursor.execute("SELECT commodity_id, commodity_name FROM m_commodity")
    commodities = cursor.fetchall()

    cursor.execute(
        """
        SELECT variety_id, commodity_id, variety_name 
        FROM m_commodity_variety
    """
    )
    varieties = cursor.fetchall()

    cursor.execute(
        """
        SELECT unit_id, unit_name 
        FROM m_produce_unit
    """
    )
    units = cursor.fetchall()

    return jsonify(
        {
            "farms": farms,
            "commodities": commodities,
            "varieties": varieties,
            "units": units,
        }
    )
