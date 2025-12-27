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

/* =========================
   ROLE-BASED FILTERS
========================= */
const FARMER_FILTERS = [
  "all",
  "open",
  "negotiating",
  "accepted",
  "active",
  "completed",
];

const TRADER_FILTERS = ["open", "negotiating"];

const ContractList = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isFarmer = user?.user_type === "F" || user?.user_type === "FT";

  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState(isFarmer ? "all" : "open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    fetchContracts();
  }, [filter]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /* =========================
     API FETCH
  ========================= */
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

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

  /* =========================
     HELPERS
  ========================= */
  const safeDate = (value) => {
    if (!value) return "N/A";
    const dt = new Date(value.replace(" ", "T"));
    return isNaN(dt) ? "N/A" : dt.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <FaClock className="text-blue-600" />;
      case "negotiating":
        return <FaClock className="text-yellow-600" />;
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isFarmer ? "My Contracts" : "Available Contracts"}
            </h1>
            <p className="text-gray-600">
              {isFarmer
                ? "Manage your farming contracts"
                : "Browse and negotiate contracts from farmers"}
            </p>
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

        {/* SUCCESS / ERROR */}
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

        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(isFarmer ? FARMER_FILTERS : TRADER_FILTERS).map((status) => (
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

        {/* EMPTY STATE */}
        {contracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaFileContract className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Contracts Found
              </h3>

              <p className="text-gray-600 mb-6">
                {isFarmer
                  ? filter === "all"
                    ? "Create your first contract to start connecting with buyers."
                    : `No contracts with status "${filter}".`
                  : filter === "open"
                  ? "No open contracts available right now."
                  : "You are not negotiating any contracts yet."}
              </p>

              {isFarmer && (
                <Link
                  to="/contracts/create"
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Create Your First Contract
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* CONTRACT LIST */
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((contract) => (
              <Link
                key={contract.contractId}
                to={`/contracts/${contract.contractId}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
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
                          Created: {safeDate(contract.createdAt)}
                        </span>
                      </div>
                    </div>
                    <FaEye className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Commodity</p>
                      <p className="font-medium text-gray-900">
                        {contract.commodity?.commodity_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {contract.variety?.variety_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium text-gray-900">
                        {contract.cropDetails?.quantity?.amount}{" "}
                        {contract.cropDetails?.quantity?.unit}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {contract.cropDetails?.quality} grade
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Base Price</p>
                      <p className="font-medium text-gray-900">
                        ₹{contract.pricing?.basePrice}{" "}
                        <span className="text-sm text-gray-500">
                          {contract.pricing?.priceUnit}
                        </span>
                      </p>
                    </div>
                  </div>
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
