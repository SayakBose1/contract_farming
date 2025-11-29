import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFileContract,
  FaPlus,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaBan,
} from "react-icons/fa";

import { contractsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const ContractList = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  const [filter, setFilter] = useState("all");

  const isFarmer = user?.user_type === "F" || user?.user_type === "FT";

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      const params = filter !== "all" ? { status: filter } : {};

      const response = isFarmer
        ? await contractsAPI.getContracts(params)
        : await contractsAPI.getAvailableContracts(params);

      setContracts(response.data.contracts || []);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <FaClock className="text-blue-600" />;
      case "accepted":
      case "active":
        return <FaCheckCircle className="text-green-600" />;
      case "completed":
        return <FaCheckCircle className="text-green-800" />;
      case "cancelled":
        return <FaBan className="text-gray-600" />;
      case "disputed":
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "negotiating":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-green-200 text-green-900";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-gray-200 text-gray-600";
      case "disputed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const safeDate = (d) => {
    const value = d || "";
    const dt = new Date(value.replace(" ", "T"));
    return isNaN(dt) ? "N/A" : dt.toLocaleDateString();
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Contracts</h1>
            <p className="text-gray-600">Manage your farming contracts</p>
          </div>

          {isFarmer && (
            <Link
              to="/contracts/create"
              className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md shadow-sm transition"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Create New Contract
            </Link>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "open",
              "negotiating",
              "accepted",
              "active",
              "completed",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === status
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Contract List */}
        {contracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaFileContract className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Contracts Found
              </h3>

              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? isFarmer
                    ? "Create your first contract to start connecting with buyers."
                    : "No contracts found."
                  : `No contracts with status "${filter}".`}
              </p>

              {isFarmer && (
                <Link
                  to="/contracts/create"
                  className="btn-primary inline-flex items-center"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Create Your First Contract
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((contract) => (
              <Link
                key={contract.contractId || contract.contract_id || contract.id}
                to={`/contracts/${
                  contract.contractId || contract.contract_id || contract.id
                }`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {contract.contractId}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            contract.contractStatus
                          )}`}
                        >
                          {contract.contractStatus}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm">
                        {getStatusIcon(contract.contractStatus)}
                        <span className="ml-2">
                          Created:{" "}
                          {safeDate(contract.createdAt || contract.created_at)}
                        </span>
                      </div>
                    </div>

                    <FaEye className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Contract Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Commodity */}
                    <div>
                      <p className="text-sm text-gray-600">Commodity</p>
                      <p className="font-medium text-gray-900">
                        {contract.commodity?.commodity_name || "N/A"}
                      </p>

                      {contract.variety?.variety_name && (
                        <p className="text-sm text-gray-500">
                          {contract.variety.variety_name}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium text-gray-900">
                        {contract.cropDetails?.quantity?.amount ||
                          contract.crop_quantity_amount}{" "}
                        {contract.cropDetails?.quantity?.unit ||
                          contract.crop_quantity_unit}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {contract.cropDetails?.quality ||
                          contract.commodity_quality}{" "}
                        grade
                      </p>
                    </div>

                    {/* Price */}
                    <div>
                      <p className="text-sm text-gray-600">Base Price</p>
                      <p className="font-medium text-gray-900">
                        ₹{contract.pricing?.basePrice || contract.base_price}{" "}
                        <span className="text-sm text-gray-500">
                          {contract.pricing?.priceUnit || contract.price_unit}
                        </span>
                      </p>

                      {(contract.pricing?.totalEstimatedValue ||
                        contract.total_estimated_value) && (
                        <p className="text-sm text-gray-500">
                          Total: ₹
                          {contract.pricing?.totalEstimatedValue ||
                            contract.total_estimated_value}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  {(contract.farmingDetails?.plantingDate ||
                    contract.planting_date) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-600">Planting: </span>
                          <span className="font-medium text-gray-900">
                            {new Date(
                              contract.farmingDetails?.plantingDate ||
                                contract.planting_date
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-600">Harvest: </span>
                          <span className="font-medium text-gray-900">
                            {new Date(
                              contract.farmingDetails?.harvestingDate ||
                                contract.harvesting_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-green-600 font-medium">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractList;
