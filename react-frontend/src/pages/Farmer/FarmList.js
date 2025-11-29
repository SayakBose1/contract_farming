import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTractor, FaPlus, FaMapMarkerAlt, FaLeaf } from "react-icons/fa";
import { farmsAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const FarmList = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await farmsAPI.getFarms();
      setFarms(response.data.farms || []);
    } catch (err) {
      console.error("Error fetching farms:", err);
      setError("Failed to load farms");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
            <p className="text-gray-600">
              Manage your farms and create contracts
            </p>
          </div>

          <Link
            to="/farmer/farms/create"
            className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md shadow-sm transition"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add New Farm
          </Link>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {farms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaTractor className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Farms Added Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first farm to start creating contracts and connecting
                with buyers.
              </p>

              <Link
                to="/farmer/farms/create"
                className="btn-primary inline-flex items-center"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Add Your First Farm
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => {
              const districtName = farm.district?.district_name || "N/A";
              const divisionName = farm.division?.division_name || "N/A";
              const soil = farm.soil_type || "N/A";
              const size = farm.farm_size_area
                ? `${farm.farm_size_area} ${farm.farm_size_unit || ""}`
                : "N/A";

              return (
                <Link
                  key={farm.farm_id}
                  to={`/farmer/farms/${farm.farm_id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {farm.farm_name}
                      </h3>
                      <FaTractor className="h-6 w-6 text-green-600" />
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      {/* Location */}
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {districtName}, {divisionName}
                        </span>
                      </div>

                      {/* Farm Size */}
                      <div className="flex items-center">
                        <FaLeaf className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{size}</span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Soil: {soil}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <span className="text-sm text-green-600 font-medium">
                      View Details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmList;
