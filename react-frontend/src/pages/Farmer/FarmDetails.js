import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaTractor,
  FaMapMarkerAlt,
  FaLeaf,
  FaWater,
  FaSeedling,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { farmsAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const FarmDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchFarmDetails();
  }, [id]);

  const safeParse = (value) => {
    try {
      if (!value) return [];
      if (typeof value === "object") return value;
      return JSON.parse(value);
    } catch (e) {
      return [];
    }
  };

  const fetchFarmDetails = async () => {
    try {
      setLoading(true);
      const response = await farmsAPI.getFarm(id);
      const farmData = response.data.farm;

      farmData.current_crops = safeParse(farmData.current_crops);
      farmData.farming_techniques = safeParse(farmData.farming_techniques);
      farmData.certifications = safeParse(farmData.certifications);

      farmData.divisionId =
        farmData.division?.division_id || farmData.farm_division;
      farmData.districtId =
        farmData.district?.district_id || farmData.farm_district;
      farmData.tehsilId = farmData.tehsil?.tehsil_id || farmData.farm_tehsil;
      farmData.blockId = farmData.block?.block_id || farmData.farm_block;

      setFarm(farmData);
    } catch (err) {
      console.error("Error fetching farm details:", err);
      setError("Failed to load farm details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await farmsAPI.deleteFarm(id);
      navigate("/farmer/farms", {
        state: { message: "Farm deleted successfully" },
      });
    } catch (err) {
      console.error("Error deleting farm:", err);
      setError("Failed to delete farm");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">{error || "Farm not found"}</p>
            <Link
              to="/farmer/farms"
              className="text-green-600 hover:underline mt-4 inline-block"
            >
              ← Back to Farms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/farmer/farms"
            className="text-green-600 hover:text-green-700 inline-flex items-center mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Farms
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {farm.farm_name}
              </h1>

              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <span>
                  {farm.district?.district_name}, {farm.division?.division_name}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Link
                to={`/farmer/farms/${id}/edit`}
                className="btn-secondary inline-flex items-center"
              >
                <FaEdit className="mr-2" />
                Edit
              </Link>

              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this farm? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT MAIN SECTION */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Farm Size</p>
                  <p className="text-lg font-medium text-gray-900">
                    {farm.farm_size_area} {farm.farm_size_unit}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Soil Type</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {farm.soil_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Irrigation System</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {farm.irrigation_system}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Water Source</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {farm.water_source}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Location Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Division</p>
                    <p className="font-medium text-gray-900">
                      {farm.division?.division_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-medium text-gray-900">
                      {farm.district?.district_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Tehsil</p>
                    <p className="font-medium text-gray-900">
                      {farm.tehsil?.tehsil_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Block</p>
                    <p className="font-medium text-gray-900">
                      {farm.block?.block_name}
                    </p>
                  </div>
                </div>

                {farm.location_latitude && farm.location_longitude && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">GPS Coordinates</p>
                    <p className="font-medium text-gray-900">
                      {farm.location_latitude}, {farm.location_longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Soil Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaLeaf className="mr-2 text-green-600" />
                Soil Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {farm.soil_ph_level && (
                  <div>
                    <p className="text-sm text-gray-600">pH Level</p>
                    <p className="text-lg font-medium text-gray-900">
                      {farm.soil_ph_level}
                    </p>
                  </div>
                )}

                {farm.soil_organic_matter && (
                  <div>
                    <p className="text-sm text-gray-600">Organic Matter</p>
                    <p className="text-lg font-medium text-gray-900">
                      {farm.soil_organic_matter}%
                    </p>
                  </div>
                )}

                {farm.soil_nitrogen && (
                  <div>
                    <p className="text-sm text-gray-600">Nitrogen (N)</p>
                    <p className="text-lg font-medium text-gray-900">
                      {farm.soil_nitrogen}
                    </p>
                  </div>
                )}

                {farm.soil_phosphorus && (
                  <div>
                    <p className="text-sm text-gray-600">Phosphorus (P)</p>
                    <p className="text-lg font-medium text-gray-900">
                      {farm.soil_phosphorus}
                    </p>
                  </div>
                )}

                {farm.soil_potassium && (
                  <div>
                    <p className="text-sm text-gray-600">Potassium (K)</p>
                    <p className="text-lg font-medium text-gray-900">
                      {farm.soil_potassium}
                    </p>
                  </div>
                )}

                {farm.soil_test_date && (
                  <div>
                    <p className="text-sm text-gray-600">Last Test Date</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(farm.soil_test_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Crops */}
            {farm.current_crops.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaSeedling className="mr-2 text-green-600" />
                  Current Crops
                </h2>

                <div className="space-y-3">
                  {farm.current_crops.map((crop, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-4 py-2"
                    >
                      <p className="font-medium text-gray-900">
                        {crop.cropName || crop.commodityName || "Crop"}
                      </p>

                      <div className="text-sm text-gray-600 mt-1">
                        <span>
                          Area: {crop.plantedArea} {farm.farm_size_unit}
                        </span>

                        {crop.plantingDate && (
                          <span className="ml-4">
                            Planted:{" "}
                            {new Date(crop.plantingDate).toLocaleDateString()}
                          </span>
                        )}

                        {crop.expectedHarvestDate && (
                          <span className="ml-4">
                            Harvest:{" "}
                            {new Date(
                              crop.expectedHarvestDate
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Facilities */}
            {(farm.facilities_storage_capacity ||
              farm.facilities_processing_facility ||
              farm.facilities_cold_storage ||
              farm.facilities_packing_facility ||
              farm.facilities_quality_testing_lab) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Facilities
                </h2>

                <div className="space-y-3">
                  {farm.facilities_storage_capacity && (
                    <div>
                      <p className="text-sm text-gray-600">Storage Capacity</p>
                      <p className="font-medium text-gray-900">
                        {farm.facilities_storage_capacity} tonnes
                      </p>

                      {farm.facilities_storage_type && (
                        <p className="text-sm text-gray-500 capitalize">
                          {farm.facilities_storage_type}
                        </p>
                      )}
                    </div>
                  )}

                  {farm.facilities_processing_facility && (
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-2" />
                      <span>Processing Facility</span>
                    </div>
                  )}

                  {farm.facilities_cold_storage && (
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-2" />
                      <span>Cold Storage</span>
                    </div>
                  )}

                  {farm.facilities_packing_facility && (
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-2" />
                      <span>Packing Facility</span>
                    </div>
                  )}

                  {farm.facilities_quality_testing_lab && (
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-2" />
                      <span>Quality Testing Lab</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Farming Techniques */}
            {farm.farming_techniques.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Farming Techniques
                </h2>

                <div className="flex flex-wrap gap-2">
                  {farm.farming_techniques.map((technique, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize"
                    >
                      {technique}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {farm.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Certifications
                </h2>

                <div className="space-y-2">
                  {farm.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center">
                      <FaCheckCircle className="text-green-600 mr-2" />
                      <span className="text-gray-900 capitalize">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Link
                  to="/contracts/create"
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Contract
                </Link>

                <Link
                  to={`/farmer/farms/${id}/edit`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Edit Farm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetails;
