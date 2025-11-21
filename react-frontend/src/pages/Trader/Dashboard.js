import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHandshake, FaEye, FaShoppingCart } from "react-icons/fa";
import { contractsAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const TraderDashboard = () => {
  const [stats, setStats] = useState({
    availableContracts: 0,
    activeContracts: 0,
    totalInvestment: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch available contracts
      const availableResponse = await contractsAPI.getAvailableContracts();
      const available = availableResponse.data.contracts || [];

      setStats({
        availableContracts: available.length,
        activeContracts: 0, // Can be calculated from trader's accepted contracts
        totalInvestment: 0, // Can be calculated from active contracts
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {" "}
            Trader Dashboard{" "}
          </h1>{" "}
          <p className="text-gray-600"> Browse and manage contracts </p>{" "}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {" "}
          {/* Available Contracts - Blue Theme */}{" "}
          <Link to="/trader/contracts/available" className="block">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                    <FaEye className="h-8 w-8 text-white" />
                  </div>{" "}
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-white">
                      {" "}
                      {stats.availableContracts}{" "}
                    </p>{" "}
                    <p className="text-blue-50"> Available Contracts </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="text-white opacity-75">
                  <span className="text-sm"> → </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </Link>
          {/* Active Contracts - Green Theme */}{" "}
          <div className="bg-gradient-to-br from-green-400 to-green-500 p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                <FaHandshake className="h-8 w-8 text-white" />
              </div>{" "}
              <div className="ml-4">
                <p className="text-3xl font-bold text-white">
                  {" "}
                  {stats.activeContracts}{" "}
                </p>{" "}
                <p className="text-green-50"> Active Contracts </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>
          {/* Total Investment - Purple Theme */}{" "}
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-30 p-3 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl"> ₹ </span>{" "}
              </div>{" "}
              <div className="ml-4">
                <p className="text-3xl font-bold text-white">
                  {" "}
                  ₹{stats.totalInvestment}{" "}
                </p>{" "}
                <p className="text-purple-50"> Total Investment </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <FaShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Contract Trading!
            </h3>{" "}
            <p className="text-gray-600 mb-6">
              Browse available contracts from farmers and secure your supply
              chain.{" "}
            </p>{" "}
            <a
              href="/trader/contracts/available"
              className="btn-primary inline-block"
            >
              Browse Contracts{" "}
            </a>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default TraderDashboard;
