import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaSeedling,
  FaCalendar,
  FaRupeeSign,
  FaTruck,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaHandshake,
  FaPhone,
} from "react-icons/fa";
import { contractsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [acceptingTrader, setAcceptingTrader] = useState(null);
  const [images, setImages] = useState([]);
  const [imageRequest, setImageRequest] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestBox, setShowRequestBox] = useState(false);
  const [negotiationImages, setNegotiationImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const isFarmer = user?.user_type === "F" || user?.user_type === "FT";
  const isTrader = !isFarmer;
  const isNegotiating =
    (contract?.contract_status || contract?.contractStatus) === "negotiating";

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);

      const [contractRes, imagesRes, requestRes] = await Promise.all([
        contractsAPI.getContract(id),
        contractsAPI.getContractImages(id),
        contractsAPI.getImageRequest(id),
      ]);

      setContract(contractRes.data.contract);
      setImages(imagesRes.data.images || []);
      setImageRequest(requestRes.data.request);

      setContract(contractRes.data.contract);
      setImages(imagesRes.data.images || []);
    } catch (err) {
      setError("Failed to load contract details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await contractsAPI.cancelContract(id);
      navigate("/contracts", {
        state: { message: "Contract cancelled successfully" },
      });
    } catch (err) {
      console.error("Error cancelling contract:", err);
      setError("Failed to cancel contract");
    }
  };

  const handleAcceptTrader = async (traderId) => {
    try {
      setAcceptingTrader(traderId);
      await contractsAPI.acceptTrader(id, traderId);
      alert("Trader accepted successfully! Contract moved to negotiating.");
      fetchContractDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept trader");
    } finally {
      setAcceptingTrader(null);
    }
  };

  const getInterestedTraders = () => {
    const negotiations = contract?.negotiations || [];

    return negotiations
      .filter((n) => n.type === "interest" && n.status === "pending")
      .map((n) => ({
        userId: n.trader_id,
        userName: n.trader_name || "Trader",
        userMobile: n.trader_mobile || "N/A",
        timestamp: n.timestamp,
      }));
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <FaClock className="text-blue-600" />;
      case "accepted":
      case "active":
        return <FaCheckCircle className="text-green-600" />;
      case "disputed":
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const canEdit = () =>
    contract &&
    ["draft", "open"].includes(
      contract.contract_status || contract.contractStatus
    );

  const canCancel = () =>
    contract &&
    !["active", "completed", "cancelled"].includes(
      contract.contract_status || contract.contractStatus
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">{error || "Contract not found"}</p>
            <Link
              to="/contracts"
              className="text-green-600 hover:underline mt-4 inline-block"
            >
              ← Back to Contracts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const contractData = contract.cropDetails
    ? contract
    : {
        contractId: contract.contract_id || contract.contractId,
        contractStatus: contract.contract_status || contract.contractStatus,
        cropDetails: {
          commodityId: contract.commodity_id,
          varietyId: contract.variety_id,
          quality: contract.commodity_quality,
          quantity: {
            amount: contract.crop_quantity_amount,
            unit: contract.crop_quantity_unit,
          },
          expectedYield: contract.expected_yield,
        },
        farmingDetails: {
          plantingDate: contract.planting_date,
          harvestingDate: contract.harvesting_date,
          season: contract.season,
          farmingTechniques: contract.farming_techniques || [],
          fertilizersUsed: contract.fertilizers_used || [],
          pesticidesUsed: contract.pesticides_used || [],
          irrigationSchedule: contract.irrigation_schedule,
        },
        pricing: {
          basePrice: contract.base_price,
          priceUnit: contract.price_unit,
          totalEstimatedValue: contract.total_estimated_value,
          advancePayment: {
            amount: contract.advance_payment_amount,
            percentage: contract.advance_payment_percentage,
            dueDate: contract.advance_payment_due_date,
            status: contract.advance_payment_status,
          },
          finalPayment: {
            amount: contract.final_payment_amount,
            dueDate: contract.final_payment_due_date,
            status: contract.final_payment_status,
          },
        },
        logistics: {
          responsibility: contract.logistics_responsibility,
          pickupLocation: contract.pickup_location,
          deliveryLocation: contract.delivery_location,
          transportationCost: contract.transportation_cost,
          packagingRequirements: contract.packaging_requirements,
          deliverySchedule: contract.delivery_schedule,
        },
        laborAndSupport: {
          laborResponsibility: contract.labor_responsibility,
        },
        commodity: contract.commodity,
        variety: contract.variety,
        farm: contract.farm,
        createdAt: contract.created_at || contract.createdAt,
        updatedAt: contract.updated_at || contract.updatedAt,
      };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/contracts"
            className="text-green-600 hover:text-green-700 inline-flex items-center mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Contracts
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {contractData.contractId}
                </h1>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize flex items-center gap-2 ${getStatusColor(
                    contractData.contractStatus
                  )}`}
                >
                  {getStatusIcon(contractData.contractStatus)}
                  {contractData.contractStatus}
                </span>
              </div>

              <p className="text-gray-600">
                Created: {new Date(contractData.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex space-x-3">
              {canEdit() && (
                <Link
                  to={`/contracts/${id}/edit`}
                  className="btn-secondary inline-flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit
                </Link>
              )}

              {canCancel() && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4">Confirm Cancellation</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this contract? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Keep Contract
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Contract
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* CROP DETAILS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaSeedling className="mr-2 text-green-600" />
                Crop Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Commodity</p>
                  <p className="text-lg font-medium text-gray-900">
                    {contractData.commodity?.commodity_name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Variety</p>
                  <p className="text-lg font-medium text-gray-900">
                    {contractData.variety?.variety_name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Quality Grade</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {contractData.cropDetails.quality}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="text-lg font-medium text-gray-900">
                    {contractData.cropDetails.quantity.amount}
                    {contractData.cropDetails.quantity.unit}
                  </p>
                </div>

                {contractData.cropDetails.expectedYield && (
                  <div>
                    <p className="text-sm text-gray-600">Expected Yield</p>
                    <p className="text-lg font-medium text-gray-900">
                      {contractData.cropDetails.expectedYield}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CROP IMAGES */}
            {images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Crop Images
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.image_id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <img
                        src={img.image_url}
                        alt="Contract"
                        onClick={() => setSelectedImage(img.image_url)}
                        className="w-full h-32 object-cover
             transition-transform duration-300 ease-in-out
             hover:scale-110 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FARMER – IMAGE REQUEST RECEIVED */}
            {isFarmer &&
              isNegotiating &&
              imageRequest?.status === "pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                  <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                    Trader Requested More Images
                  </h2>

                  <p className="text-sm text-yellow-700 mb-4">
                    {imageRequest.message}
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setNegotiationImages(Array.from(e.target.files))
                    }
                    className="block w-full text-sm mb-3"
                  />

                  <button
                    onClick={async () => {
                      if (negotiationImages.length === 0) return;

                      try {
                        setUploadingImages(true);

                        const fd = new FormData();
                        negotiationImages.forEach((img) =>
                          fd.append("images", img)
                        );
                        fd.append("upload_stage", "negotiation");

                        await contractsAPI.uploadContractImages(id, fd);
                        await contractsAPI.fulfillImageRequest(id);
                        fetchContractDetails();
                      } catch (err) {
                        alert("Failed to upload images");
                      } finally {
                        setUploadingImages(false);
                      }
                    }}
                    disabled={uploadingImages}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    {uploadingImages ? "Uploading..." : "Upload Images"}
                  </button>
                </div>
              )}

            {/* FARMING DETAILS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaCalendar className="mr-2 text-green-600" />
                Farming Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Planting Date</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(
                      contractData.farmingDetails.plantingDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Harvesting Date</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(
                      contractData.farmingDetails.harvestingDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Season</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {contractData.farmingDetails.season}
                  </p>
                </div>
              </div>

              {contractData.farmingDetails.farmingTechniques?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Farming Techniques
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {contractData.farmingDetails.farmingTechniques.map(
                      (technique, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize"
                        >
                          {technique}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {contractData.farmingDetails.fertilizersUsed?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Fertilizers Used</p>
                  <p className="text-sm text-gray-900">
                    {contractData.farmingDetails.fertilizersUsed.join(", ")}
                  </p>
                </div>
              )}

              {contractData.farmingDetails.irrigationSchedule && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Irrigation Schedule
                  </p>
                  <p className="text-sm text-gray-900">
                    {contractData.farmingDetails.irrigationSchedule}
                  </p>
                </div>
              )}
            </div>

            {/* PRICING DETAILS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaRupeeSign className="mr-2 text-green-600" />
                Pricing Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Base Price</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{contractData.pricing.basePrice}{" "}
                    {contractData.pricing.priceUnit}
                  </p>
                </div>

                {contractData.pricing.totalEstimatedValue && (
                  <div>
                    <p className="text-sm text-gray-600">
                      Total Estimated Value
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      ₹{contractData.pricing.totalEstimatedValue}
                    </p>
                  </div>
                )}
              </div>

              {contractData.pricing.advancePayment?.amount && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Advance Payment
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">
                        ₹{contractData.pricing.advancePayment.amount}
                      </p>
                    </div>

                    {contractData.pricing.advancePayment.percentage && (
                      <div>
                        <p className="text-sm text-gray-600">Percentage</p>
                        <p className="font-medium text-gray-900">
                          {contractData.pricing.advancePayment.percentage}%
                        </p>
                      </div>
                    )}

                    {contractData.pricing.advancePayment.dueDate && (
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            contractData.pricing.advancePayment.dueDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {contractData.pricing.advancePayment.status && (
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {contractData.pricing.advancePayment.status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {contractData.pricing.finalPayment?.amount && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Final Payment
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">
                        ₹{contractData.pricing.finalPayment.amount}
                      </p>
                    </div>

                    {contractData.pricing.finalPayment.dueDate && (
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            contractData.pricing.finalPayment.dueDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* LOGISTICS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaTruck className="mr-2 text-green-600" />
                Logistics
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Responsibility</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {contractData.logistics.responsibility}
                  </p>
                </div>

                {contractData.logistics.pickupLocation && (
                  <div>
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-medium text-gray-900">
                      {contractData.logistics.pickupLocation}
                    </p>
                  </div>
                )}

                {contractData.logistics.deliveryLocation && (
                  <div>
                    <p className="text-sm text-gray-600">Delivery Location</p>
                    <p className="font-medium text-gray-900">
                      {contractData.logistics.deliveryLocation}
                    </p>
                  </div>
                )}

                {contractData.logistics.transportationCost && (
                  <div>
                    <p className="text-sm text-gray-600">Transportation Cost</p>
                    <p className="font-medium text-gray-900">
                      ₹{contractData.logistics.transportationCost}
                    </p>
                  </div>
                )}

                {contractData.logistics.packagingRequirements && (
                  <div>
                    <p className="text-sm text-gray-600">
                      Packaging Requirements
                    </p>
                    <p className="font-medium text-gray-900">
                      {contractData.logistics.packagingRequirements}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* FARM INFO */}
            {contractData.farm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Farm Information
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {contractData.farm.farm_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {contractData.farm.farm_size_area}
                    {contractData.farm.farm_size_unit}
                  </p>

                  <Link
                    to={`/farmer/farms/${contractData.farm.farm_id}`}
                    className="text-sm text-green-600 hover:underline inline-block mt-2"
                  >
                    View Farm Details →
                  </Link>
                </div>
              </div>
            )}

            {/* INTERESTED TRADERS */}
            {isFarmer &&
              contractData.contractStatus === "open" &&
              getInterestedTraders().length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FaHandshake className="mr-2 text-blue-600" />
                    Interested Traders ({getInterestedTraders().length})
                  </h2>

                  <div className="space-y-4">
                    {getInterestedTraders().map((trader) => (
                      <div
                        key={trader.userId || Math.random()}
                        className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {trader.userName}
                            </p>

                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <FaPhone className="mr-1 h-3 w-3" />
                              {trader.userMobile}
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              Shown interest on{" "}
                              {new Date(trader.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAcceptTrader(trader.userId)}
                          disabled={acceptingTrader === trader.userId}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {acceptingTrader === trader.userId ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 mr-2"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 
0 0 5.373 0 12h4zm2 5.291A7.962 
7.962 0 014 12H0c0 3.042 1.135 
5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Accepting...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="mr-2" />
                              Accept Trader
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Accepting a trader will move the contract to negotiating
                    phase
                  </p>
                </div>
              )}

            {/* LABOR & SUPPORT */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUsers className="mr-2 text-green-600" />
                Labor & Support
              </h2>

              <div>
                <p className="text-sm text-gray-600">Labor Responsibility</p>
                <p className="font-medium text-gray-900 capitalize">
                  {contractData.laborAndSupport.laborResponsibility}
                </p>
              </div>
            </div>

            {/* TRADER – REQUEST MORE IMAGES */}
            {isTrader &&
              isNegotiating &&
              (!imageRequest || imageRequest.status === "fulfilled") && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Negotiation Action
                  </h2>

                  {!showRequestBox ? (
                    <button
                      onClick={() => setShowRequestBox(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Request More Images
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Message to farmer (optional)"
                        className="w-full border rounded-lg p-2 text-sm"
                        rows={3}
                      />

                      <button
                        onClick={async () => {
                          try {
                            await contractsAPI.requestMoreImages(id, {
                              message: requestMessage,
                            });

                            setShowRequestBox(false);
                            setRequestMessage("");
                            fetchContractDetails();
                          } catch (err) {
                            alert(
                              err.response?.data?.message ||
                                "Failed to send request"
                            );
                          }
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Send Request
                      </button>
                    </div>
                  )}
                </div>
              )}

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {canEdit() && (
                  <Link
                    to={`/contracts/${id}/edit`}
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Edit Contract
                  </Link>
                )}

                <Link
                  to="/contracts"
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Contracts
                </Link>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Timeline
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contractData.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contractData.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80
               flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full View"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ContractDetails;
