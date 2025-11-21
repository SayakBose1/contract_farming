import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaTractor,
    FaPlus,
    FaEye,
    FaFileContract,
    FaClock,
    FaCheckCircle
} from 'react-icons/fa';
import { farmsAPI, contractsAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const FarmerDashboard = () => {
    const [stats, setStats] = useState({
        totalFarms: 0,
        totalContracts: 0,
        activeContracts: 0,
        openContracts: 0,
        totalEarnings: 0
    });
    const [recentContracts, setRecentContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch farms
            const farmsResponse = await farmsAPI.getFarms();
            const farms = farmsResponse.data.farms || [];

            // Fetch contracts
            let contracts = [];
            try {
                const contractsResponse = await contractsAPI.getContracts();
                contracts = contractsResponse.data.contracts || [];
            } catch (err) {
                console.log('Contracts API not available yet');
            }

            // Active contracts
            const activeContracts = contracts.filter(
                c => (c.contract_status || c.contractStatus) === 'active'
            ).length;

            // Open contracts
            const openContracts = contracts.filter(
                c => (c.contract_status || c.contractStatus) === 'open'
            ).length;

            // Total earnings
            const totalEarnings = contracts
                .filter(c => (c.contract_status || c.contractStatus) === 'completed')
                .reduce((sum, c) => sum + parseFloat(c.total_estimated_value || 0), 0);

            setStats({
                totalFarms: farms.length,
                totalContracts: contracts.length,
                activeContracts,
                openContracts,
                totalEarnings
            });

            // Recent 5
            setRecentContracts(contracts.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
                    <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
                    <p className="text-gray-600">Manage your farms and contracts</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaTractor className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalFarms}</p>
                                <p className="text-gray-600">Total Farms</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaFileContract className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
                                <p className="text-gray-600">Total Contracts</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaCheckCircle className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
                                <p className="text-gray-600">Active Contracts</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaClock className="h-8 w-8 text-yellow-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.openContracts}</p>
                                <p className="text-gray-600">Open Contracts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* No farms */}
                {stats.totalFarms === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center py-12">
                            <FaTractor className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Welcome to Contract Farming!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start by adding your first farm to create contracts and connect with buyers.
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
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    to="/farmer/farms"
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">Manage Farms</h3>
                                    <p className="text-sm text-gray-600">View and edit your farm details</p>
                                </Link>

                                <Link
                                    to="/farmer/farms/create"
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">Add New Farm</h3>
                                    <p className="text-sm text-gray-600">Register another farm</p>
                                </Link>

                                <Link
                                    to="/contracts/create"
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">Create Contract</h3>
                                    <p className="text-sm text-gray-600">Start a new farming contract</p>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Contracts */}
                        {recentContracts.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Recent Contracts
                                    </h2>

                                    <Link
                                        to="/contracts"
                                        className="text-green-600 hover:underline text-sm"
                                    >
                                        View All →
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {recentContracts.map((contract) => (
                                        <Link
                                            key={contract.id}
                                            to={`/contracts/${contract.id}`}
                                            className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {contract.contractId || contract.contract_id}
                                                    </p>

                                                    <p className="text-sm text-gray-600">
                                                        {contract.commodity?.commodity_name || 'N/A'} -{' '}
                                                        {contract.crop_quantity_amount ||
                                                            contract.cropDetails?.quantity?.amount}{' '}
                                                        {contract.crop_quantity_unit ||
                                                            contract.cropDetails?.quantity?.unit}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                                        (contract.contract_status ||
                                                            contract.contractStatus) === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : (contract.contract_status ||
                                                                  contract.contractStatus) === 'open'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {contract.contract_status || contract.contractStatus}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerDashboard;
