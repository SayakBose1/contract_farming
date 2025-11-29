from flask import Blueprint, request, jsonify
import pymysql
import os
import json
import jwt
from datetime import datetime

farms_bp = Blueprint("farms", __name__, url_prefix="/farms")

# Use the same secret as auth_routes.py
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')


def get_db():
    return pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        db=os.environ.get("DB_NAME", "sisjk"),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )


# --------------------------
# REAL CURRENT USER (from JWT)
# --------------------------
def get_current_user_id():
    """
    Extract user_id from JWT token (same logic as auth.token_required)
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header:
        # No token sent
        return None

    token = auth_header
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        mobile = payload.get("mobile_number")
        if not mobile:
            return None

        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT user_id 
                FROM m_user_login 
                WHERE mobile_number=%s 
                LIMIT 1
            """, (mobile,))
            user = cur.fetchone()
        conn.close()

        if not user:
            return None

        return user["user_id"]

    except Exception:
        return None


# --------------------------
# SAFE HELPERS
# --------------------------
def to_float(value):
    if value in ("", None):
        return None
    try:
        return float(value)
    except:
        return None


def safe_json(value):
    """Convert DB JSON string → python list"""
    try:
        if value in (None, "", "null"):
            return []
        return json.loads(value)
    except:
        return []


# -------------------------------------------------------------
# GET /farms → List of farms
# -------------------------------------------------------------
@farms_bp.route("", methods=["GET"])
def list_farms():
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"message": "Unauthorized"}), 401

        conn = get_db()
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    f.farm_id,
                    f.farm_name,
                    f.farm_size_area,
                    f.farm_size_unit,
                    f.soil_type,

                    d.district_id,
                    d.district_name,

                    v.division_id,
                    v.division_name
                FROM m_farm f
                LEFT JOIN m_district d ON d.district_id = f.farm_district
                LEFT JOIN m_division v ON v.division_id = f.farm_division
                WHERE f.user_id = %s
                ORDER BY f.farm_id DESC
            """
            cur.execute(sql, (user_id,))
            rows = cur.fetchall()

        conn.close()

        farms = []
        for r in rows:
            farms.append({
                "farm_id": r["farm_id"],
                "farm_name": r["farm_name"],
                "farm_size_area": r["farm_size_area"],
                "farm_size_unit": r["farm_size_unit"],
                "soil_type": r["soil_type"],

                "district": {
                    "district_id": r["district_id"],
                    "district_name": r["district_name"]
                } if r["district_id"] else None,

                "division": {
                    "division_id": r["division_id"],
                    "division_name": r["division_name"]
                } if r["division_id"] else None
            })

        return jsonify({"farms": farms}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# -------------------------------------------------------------
# GET /farms/<id> → Full farm details
# -------------------------------------------------------------
@farms_bp.route("/<int:farm_id>", methods=["GET"])
def get_farm(farm_id):
    try:
        # (Optional) you could also check owner via get_current_user_id() here
        conn = get_db()
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    f.*,
                    d.district_id, d.district_name,
                    v.division_id, v.division_name,
                    t.tehsil_id, t.tehsil_name,
                    b.block_id, b.block_name
                FROM m_farm f
                LEFT JOIN m_district d ON d.district_id = f.farm_district
                LEFT JOIN m_division v ON v.division_id = f.farm_division
                LEFT JOIN m_tehsil t ON t.tehsil_id = f.farm_tehsil
                LEFT JOIN m_block b ON b.block_id = f.farm_block
                WHERE f.farm_id = %s
            """
            cur.execute(sql, (farm_id,))
            row = cur.fetchone()

        conn.close()

        if not row:
            return jsonify({"message": "Farm not found"}), 404

        # PARSE JSON fields
        for field in [
            "farming_techniques",
            "certifications",
            "current_crops",
            "farm_history",
            "farm_images",
            "farm_videos"
        ]:
            if row.get(field):
                row[field] = json.loads(row[field])
            else:
                row[field] = []

        # Convert booleans
        boolean_fields = [
            "facilities_processing_facility",
            "facilities_cold_storage",
            "facilities_packing_facility",
            "facilities_quality_testing_lab"
        ]
        for field in boolean_fields:
            row[field] = bool(row[field])

        # Attach related objects
        row["district"] = {
            "district_id": row["district_id"],
            "district_name": row["district_name"]
        } if row["district_id"] else None

        row["division"] = {
            "division_id": row["division_id"],
            "division_name": row["division_name"]
        } if row["division_id"] else None

        row["tehsil"] = {
            "tehsil_id": row["tehsil_id"],
            "tehsil_name": row["tehsil_name"]
        } if row["tehsil_id"] else None

        row["block"] = {
            "block_id": row["block_id"],
            "block_name": row["block_name"]
        } if row["block_id"] else None

        return jsonify({"farm": row}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# -------------------------------------------------------------
# POST /farms → Create a new farm
# -------------------------------------------------------------
@farms_bp.route("", methods=["POST"])
def create_farm():
    data = request.get_json()

    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"message": "Unauthorized"}), 401

        now = datetime.now()

        # Extract sub-groups
        soil = data.get("soilInformation", {})
        farm_size = data.get("farmSize", {})
        coords = (data.get("location") or {}).get("coordinates") or {}
        facilities = data.get("facilities") or {}

        # Floats
        lat = to_float(coords.get("latitude"))
        lon = to_float(coords.get("longitude"))
        soil_ph = to_float(soil.get("phLevel"))
        soil_om = to_float(soil.get("organicMatter"))
        soil_n = to_float(soil.get("nitrogen"))
        soil_p = to_float(soil.get("phosphorus"))
        soil_k = to_float(soil.get("potassium"))
        size_area = to_float(farm_size.get("area"))

        # Strings
        size_unit = farm_size.get("unit") or None
        facilities_capacity = to_float(facilities.get("storageCapacity"))
        facilities_type = facilities.get("storageType") or None

        # Booleans → int
        proc_fac = 1 if facilities.get("processingFacility") else 0
        cold_store = 1 if facilities.get("coldStorage") else 0
        pack_fac = 1 if facilities.get("packingFacility") else 0
        quality_lab = 1 if facilities.get("qualityTestingLab") else 0

        soil_test_date = soil.get("soilTestDate") or None

        # JSON fields
        farming_techniques = json.dumps(data.get("farmingTechniques") or [])
        certifications = json.dumps(data.get("certifications") or [])
        current_crops = json.dumps(data.get("currentCrops") or [])
        farm_history = json.dumps(data.get("farmHistory") or [])
        media_images = json.dumps(data.get("farmImages") or [])
        media_videos = json.dumps(data.get("farmVideos") or [])

        # Insert
        sql = """
            INSERT INTO m_farm (
                user_id, farm_name, farm_division, farm_district, farm_tehsil, farm_block,
                location_latitude, location_longitude,
                farm_size_area, farm_size_unit,
                soil_type, soil_ph_level, soil_organic_matter, soil_nitrogen,
                soil_phosphorus, soil_potassium, soil_test_date, soil_test_report,
                irrigation_system, water_source,
                farming_techniques, certifications, current_crops, farm_history,
                facilities_storage_capacity, facilities_storage_type,
                facilities_processing_facility, facilities_cold_storage,
                facilities_packing_facility, facilities_quality_testing_lab,
                farm_images, farm_videos,
                created_at, updated_at
            ) VALUES (
                %s,%s,%s,%s,%s,%s,
                %s,%s,
                %s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,
                %s,%s,%s,%s,
                %s,%s,
                %s,%s,
                %s,%s,
                %s,%s,
                %s,%s
            )
        """

        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(sql, (
                user_id,
                data.get("farmName"),
                data.get("farmDivision"),
                data.get("farmDistrict"),
                data.get("farmTehsil"),
                data.get("farmBlock"),

                lat, lon,
                size_area, size_unit,

                soil.get("soilType"), soil_ph, soil_om, soil_n,
                soil_p, soil_k, soil_test_date, soil.get("soilTestReport"),

                data.get("irrigationSystem"),
                data.get("waterSource"),

                farming_techniques,
                certifications,
                current_crops,
                farm_history,

                facilities_capacity,
                facilities_type,
                proc_fac,
                cold_store,
                pack_fac,
                quality_lab,

                media_images,
                media_videos,

                now, now
            ))

            farm_id = cur.lastrowid

        conn.close()
        return jsonify({"farmId": farm_id, "message": "Farm created successfully"}), 201

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# -------------------------------------------------------------
# DELETE /farms/<id>
# -------------------------------------------------------------
@farms_bp.route("/<int:farm_id>", methods=["DELETE"])
def delete_farm(farm_id):
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"message": "Unauthorized"}), 401

        conn = get_db()
        with conn.cursor() as cur:
            # Optional: ensure the farm belongs to current user
            cur.execute(
                "DELETE FROM m_farm WHERE farm_id = %s AND user_id = %s",
                (farm_id, user_id)
            )
        conn.close()
        return jsonify({"message": "Farm deleted successfully"}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500
