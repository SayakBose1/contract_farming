import os
import json
import jwt
import datetime
import hashlib
from PIL import Image
from io import BytesIO
from flask import Blueprint, request, jsonify
from db import get_db
from flask import send_from_directory
from werkzeug.utils import secure_filename
import uuid

contracts_bp = Blueprint("contracts", __name__)
SECRET_KEY = os.environ.get('SECRET_KEY')


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


@contracts_bp.route("/contracts", methods=["POST"])
def create_contract():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    data = request.json

    try:
        cursor = db.cursor()

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
        return jsonify({
    "message": "Contract created successfully!",
    "contract_id": contract_uid
}), 201


    except Exception as e:
        print("CREATE CONTRACT ERROR:", e)
        return jsonify({"message": "Failed to create contract"}), 500



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



# @contracts_bp.route("/contracts/<string:contract_id>", methods=["GET"])
# def get_contract(contract_id):
#     db = get_db()
#     cursor = db.cursor()

#     cursor.execute(
#         """
#         SELECT c.*, 
#                f.farm_name, f.farm_size_area, f.farm_size_unit,
#                com.commodity_name,
#                v.variety_name
#         FROM contracts c
#         JOIN m_farm f ON f.farm_id = c.farm_id
#         JOIN m_commodity com ON com.commodity_id = c.commodity_id
#         JOIN m_commodity_variety v ON v.variety_id = c.variety_id
#         WHERE c.contract_id = %s
#     """,
#         (contract_id,),
#     )

#     row = cursor.fetchone()

#     if not row:
#         return jsonify({"message": "Contract not found"}), 404

#     return jsonify({"contract": format_contract(row)})
@contracts_bp.route("/contracts/<string:contract_id>", methods=["GET"])
def get_contract(contract_id):
    db = get_db()
    cursor = db.cursor()

    # 1. Fetch contract
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
        (contract_id,)
    )

    row = cursor.fetchone()

    if not row:
        return jsonify({"message": "Contract not found"}), 404

    # 2. Parse negotiations
    negotiations = json.loads(row["negotiations"] or "[]")

    # 3. Collect trader IDs who showed interest
    trader_ids = [
        n["trader_id"]
        for n in negotiations
        if n.get("type") == "interest"
    ]

    trader_map = {}

    # 4. Fetch trader name & phone
    if trader_ids:
        cursor.execute(
            """
            SELECT user_id, full_name, mobile_number
            FROM m_user_login
            WHERE user_id IN %s
            """,
            (tuple(trader_ids),)
        )

        for t in cursor.fetchall():
            trader_map[t["user_id"]] = {
                "trader_name": t["full_name"],
                "trader_mobile": t["mobile_number"]
            }

    # 5. Enrich negotiations with trader info
    for n in negotiations:
        tid = n.get("trader_id")
        if tid in trader_map:
            n.update(trader_map[tid])

    # 6. Send enriched contract
    contract_data = format_contract(row)
    contract_data["negotiations"] = negotiations

    return jsonify({"contract": contract_data})



@contracts_bp.route("/contracts/<string:contract_id>/cancel", methods=["POST"])
def cancel_contract(contract_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

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



@contracts_bp.route("/contracts/form-data", methods=["GET"])
def get_form_data():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

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



@contracts_bp.route("/contracts/<string:contract_id>/images", methods=["POST"])
def upload_contract_images(contract_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    files = request.files.getlist("images")
    upload_stage = request.form.get("upload_stage", "creation")

    if not files:
        return jsonify({"message": "No images provided"}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT contract_status FROM contracts WHERE contract_id=%s",
        (contract_id,)
    )
    if not cursor.fetchone():
        return jsonify({"message": "Contract not found"}), 404

    cursor.execute(
        "SELECT user_type FROM m_user_login WHERE user_id=%s",
        (user_id,)
    )
    row = cursor.fetchone()
    uploader_role = "trader" if row and row["user_type"].lower().startswith("t") else "farmer"

    UPLOAD_DIR = os.getenv("CONTRACT_IMAGE_PATH", "uploads/contracts")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    inserted = 0

    for file in files:
        content = file.read()

        if len(content) > 5 * 1024 * 1024:
            continue

        try:
            img = Image.open(BytesIO(content))
            img.verify()
            img = Image.open(BytesIO(content))
            width, height = img.size
        except Exception:
            continue

        filename = secure_filename(file.filename)
        unique_name = f"{contract_id}_{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as f:
            f.write(content)

        file_size_kb = len(content) // 1024
        checksum = hashlib.sha256(content).hexdigest()

        cursor.execute(
            """
            INSERT INTO contract_images (
                contract_id,
                uploaded_by,
                uploader_role,
                upload_stage,
                original_filename,
                file_type,
                file_size_kb,
                image_width,
                image_height,
                checksum_sha256,
                is_verified
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1)
            """,
            (
                contract_id,
                user_id,
                uploader_role,
                upload_stage,
                unique_name,
                file.content_type,
                file_size_kb,
                width,
                height,
                checksum
            )
        )

        inserted += 1

    db.commit()

    return jsonify({
        "message": "Images uploaded successfully",
        "count": inserted
    })



@contracts_bp.route("/contracts/images/<path:filename>")
def serve_contract_image(filename):
    image_dir = os.getenv("CONTRACT_IMAGE_PATH", "uploads/contracts")
    return send_from_directory(image_dir, filename)



@contracts_bp.route("/contracts/<string:contract_id>/images", methods=["GET"])
def get_contract_images(contract_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT image_id,
               original_filename,
               uploader_role,
               upload_stage,
               created_at
        FROM contract_images
        WHERE contract_id=%s
        ORDER BY created_at DESC
        """,
        (contract_id,)
    )

    images = cursor.fetchall()
    base_url = os.getenv("BASE_URL", "http://localhost:5005")

    for img in images:
        img["image_url"] = f"{base_url}/contracts/images/{img['original_filename']}"

    return jsonify({"images": images})



@contracts_bp.route("/contracts/<string:contract_id>/image-request", methods=["POST"])
def create_image_request(contract_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()
    data = request.json or {}

    cursor.execute(
        "SELECT contract_status, trader_user_id FROM contracts WHERE contract_id=%s",
        (contract_id,)
    )
    contract = cursor.fetchone()

    if not contract:
        return jsonify({"message": "Contract not found"}), 404

    if contract["contract_status"] != "negotiating":
        return jsonify({"message": "Contract not in negotiation"}), 400

    if contract["trader_user_id"] != user_id:
        return jsonify({"message": "Only accepted trader can request images"}), 403

    cursor.execute(
        """
        SELECT request_id FROM contract_image_requests
        WHERE contract_id=%s AND status='pending'
        """,
        (contract_id,)
    )
    if cursor.fetchone():
        return jsonify({"message": "Request already pending"}), 400

    cursor.execute(
        """
        INSERT INTO contract_image_requests (contract_id, requested_by, message)
        VALUES (%s, %s, %s)
        """,
        (contract_id, user_id, data.get("message"))
    )

    db.commit()
    return jsonify({"message": "Image request sent"}), 201



@contracts_bp.route("/contracts/<string:contract_id>/image-request", methods=["GET"])
def get_image_request(contract_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT request_id, message, status, created_at
        FROM contract_image_requests
        WHERE contract_id=%s
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (contract_id,)
    )

    req = cursor.fetchone()

    if not req:
        return jsonify({"request": None})

    return jsonify({
        "request": {
            "request_id": req["request_id"],
            "message": req["message"],
            "status": req["status"],
            "created_at": req["created_at"]
        }
    })



@contracts_bp.route(
    "/contracts/<string:contract_id>/image-request/fulfill",
    methods=["POST"]
)
def fulfill_image_request(contract_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT user_id FROM contracts WHERE contract_id=%s",
        (contract_id,)
    )
    contract = cursor.fetchone()

    if not contract or contract["user_id"] != user_id:
        return jsonify({"message": "Not allowed"}), 403

    cursor.execute(
        """
        UPDATE contract_image_requests
        SET status='fulfilled', fulfilled_at=NOW()
        WHERE contract_id=%s AND status='pending'
        """,
        (contract_id,)
    )

    db.commit()
    return jsonify({"message": "Image request fulfilled"})
