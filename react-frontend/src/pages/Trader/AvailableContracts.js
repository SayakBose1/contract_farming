import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFileContract,
  FaFilter,
  FaMapMarkerAlt,
  FaSeedling,
  FaRupeeSign,
  FaCalendar,
  FaHandshake,
} from "react-icons/fa";
import { contractsAPI, locationsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const AvailableContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [filters, setFilters] = useState({
    division: "",
    district: "",
    tehsil: "",
    block: "",
    status: "open",
  });

  useEffect(() => {
    fetchDivisions();
    fetchContracts();
  }, []);

  useEffect(() => {
    if (filters.division) fetchDistricts(filters.division);
  }, [filters.division]);

  useEffect(() => {
    if (filters.district) {
      fetchTehsils(filters.district);
      fetchBlocks(filters.district);
    }
  }, [filters.district]);

  const fetchDivisions = async () => {
    try {
      const res = await locationsAPI.getDivisions();
      setDivisions(res.data.divisions || []);
    } catch (err) {
      console.error("Error fetching divisions:", err);
    }
  };

  const fetchDistricts = async (divisionId) => {
    try {
      const res = await locationsAPI.getDistricts(divisionId);
      setDistricts(res.data.districts || []);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  const fetchTehsils = async (districtId) => {
    try {
      const res = await locationsAPI.getTehsils(districtId);
      setTehsils(res.data.tehsils || []);
    } catch (err) {
      console.error("Error fetching tehsils:", err);
    }
  };

  const fetchBlocks = async (districtId) => {
    try {
      const res = await locationsAPI.getBlocks(districtId);
      setBlocks(res.data.blocks || []);
    } catch (err) {
      console.error("Error fetching blocks:", err);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.division) params.division = filters.division;
      if (filters.district) params.district = filters.district;
      if (filters.tehsil) params.tehsil = filters.tehsil;
      if (filters.block) params.block = filters.block;
      if (filters.status) params.status = filters.status;

      const res = await contractsAPI.getAvailableContracts(params);
      setContracts(res.data.contracts || []);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError("Failed to load available contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "division") {
        updated.district = "";
        updated.tehsil = "";
        updated.block = "";
      } else if (field === "district") {
        updated.tehsil = "";
        updated.block = "";
      }

      return updated;
    });
  };

  const applyFilters = () => {
    fetchContracts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      division: "",
      district: "",
      tehsil: "",
      block: "",
      status: "open",
    });
    setDistricts([]);
    setTehsils([]);
    setBlocks([]);
  };

  const handleShowInterest = async (contractId) => {
    try {
      await contractsAPI.showInterest(contractId);
      alert("Interest shown successfully! The farmer will be notified.");
      fetchContracts();
    } catch (err) {
      console.error("Error showing interest:", err);
      alert(err.response?.data?.message || "Failed to show interest");
    }
  };

  const hasShownInterest = (contract) => {
    const negotiations = contract.negotiations || [];
    return negotiations.some(
      (n) => n.type === "interest" && n.trader_id === user.id
    );
  };

  if (loading && contracts.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">
              Available Contracts
            </h1>
            <p className="text-gray-600">
              Browse and show interest in farming contracts
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary inline-flex items-center"
          >
            <FaFilter className="mr-2 h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Filter Contracts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Division */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Division
                </label>
                <select
                  value={filters.division}
                  onChange={(e) =>
                    handleFilterChange("division", e.target.value)
                  }
                  className="input-field"
                >
                  <option value="">All Divisions</option>
                  {divisions.map((div) => (
                    <option key={div.division_id} value={div.division_id}>
                      {div.division_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <select
                  value={filters.district}
                  onChange={(e) =>
                    handleFilterChange("district", e.target.value)
                  }
                  className="input-field"
                  disabled={!filters.division}
                >
                  <option value="">All Districts</option>
                  {districts.map((dist) => (
                    <option key={dist.district_id} value={dist.district_id}>
                      {dist.district_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tehsil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tehsil
                </label>
                <select
                  value={filters.tehsil}
                  onChange={(e) => handleFilterChange("tehsil", e.target.value)}
                  className="input-field"
                  disabled={!filters.district}
                >
                  <option value="">All Tehsils</option>
                  {tehsils.map((teh) => (
                    <option key={teh.tehsil_id} value={teh.tehsil_id}>
                      {teh.tehsil_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block
                </label>
                <select
                  value={filters.block}
                  onChange={(e) => handleFilterChange("block", e.target.value)}
                  className="input-field"
                  disabled={!filters.district}
                >
                  <option value="">All Blocks</option>
                  {blocks.map((blk) => (
                    <option key={blk.block_id} value={blk.block_id}>
                      {blk.block_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button onClick={applyFilters} className="btn-primary">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Contracts List */}
        {contracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaFileContract className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Contracts Available
              </h3>
              <p className="text-gray-600 mb-6">
                There are no open contracts matching your filters at the moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((contract) => (
              <div
                key={contract.contract_id || contract.contractId}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {contract.contractId || contract.contract_id}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                          {contract.contractStatus || contract.contract_status}
                        </span>
                      </div>

                      {/* Location */}
                      {contract.farm && (
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <FaMapMarkerAlt className="mr-2" />
                          <span>
                            {contract.farm.division?.division_name},
                            {contract.farm.district?.district_name}
                            {contract.farm.tehsil &&
                              `, ${contract.farm.tehsil.tehsil_name}`}
                            {contract.farm.block &&
                              `, ${contract.farm.block.block_name}`}
                          </span>
                        </div>
                      )}

                      {/* Farmer Info */}
                      {contract.user && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <span className="font-medium">Farmer:</span>
                          <span className="ml-2">
                            {contract.user.full_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Commodity */}
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaSeedling className="mr-2" />
                        Commodity
                      </p>
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
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaRupeeSign className="mr-2" />
                        Base Price
                      </p>
                      <p className="font-medium text-gray-900">
                        ₹{contract.pricing?.basePrice || contract.base_price}
                      </p>
                      <p className="text-sm text-gray-500">
                        {contract.pricing?.priceUnit || contract.price_unit}
                      </p>
                    </div>

                    {/* Harvest Date */}
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaCalendar className="mr-2" />
                        Harvest Date
                      </p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          contract.farmingDetails?.harvestingDate ||
                            contract.harvesting_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                    <Link
                      to={`/trader/contracts/${
                        contract.contract_id || contract.contractId
                      }`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View Details →
                    </Link>

                    {hasShownInterest(contract) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed inline-flex items-center"
                      >
                        <FaHandshake className="mr-2" />
                        Interest Shown
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleShowInterest(
                            contract.contract_id || contract.contractId
                          );
                        }}
                        className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md shadow-sm transition"
                      >
                        <FaHandshake className="mr-2" />
                        Show Interest
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableContracts;
