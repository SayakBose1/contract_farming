import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaSeedling,
  FaCalendar,
  FaRupeeSign,
  FaTruck,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import { contractsAPI, farmsAPI, commoditiesAPI } from "../../services/api";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const QUANTITY_UNITS = ["quintal", "kg", "tonne"];

const CreateContract = () => {
  const navigate = useNavigate();
  const { farmId } = useParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [farms, setFarms] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [varieties, setVarieties] = useState([]);

  const [formData, setFormData] = useState({
    farm: farmId || "",

    cropDetails: {
      commodityId: "",
      varietyId: "",
      quality: "standard",
      quantity: { amount: "", unit: "quintal" },
      expectedYield: "",
      qualityParameters: {},
    },

    farmingDetails: {
      plantingDate: "",
      harvestingDate: "",
      season: "kharif",
      farmingTechniques: [],
      fertilizersUsed: [],
      pesticidesUsed: [],
      irrigationSchedule: "",
    },

    pricing: {
      basePrice: "",
      priceUnit: "per-quintal",
      advancePayment: { amount: "", percentage: "", dueDate: "" },
      finalPayment: { amount: "", dueDate: "" },
      bonusIncentives: [],
      penaltyClause: [],
    },

    logistics: {
      responsibility: "farmer",
      pickupLocation: "",
      deliveryLocation: "",
      transportationCost: "",
      packagingRequirements: "",
      deliverySchedule: "",
    },

    laborAndSupport: {
      laborResponsibility: "farmer",
      technicalSupport: {},
      expertVisits: {},
    },

    mediaFiles: {
      farmImages: [],
      farmVideos: [],
      documents: [],
    },
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.cropDetails.commodityId) {
      fetchVarieties(formData.cropDetails.commodityId);
    }
  }, [formData.cropDetails.commodityId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [farmsRes, commoditiesRes] = await Promise.all([
        farmsAPI.getFarms(),
        commoditiesAPI.getCommodities(),
      ]);

      setFarms(farmsRes.data.farms || []);
      setCommodities(commoditiesRes.data.commodities || []);
    } catch (err) {
      setError("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const fetchVarieties = async (commodityId) => {
    try {
      const response = await commoditiesAPI.getVarieties(commodityId);
      setVarieties(response.data.varieties || []);
    } catch (err) {}
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayInput = (section, field, value) => {
    const array = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: array,
      },
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 7));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleNestedInputChange = (section, nestedSection, field, value) => {
    setFormData((prev) => {
      if (!nestedSection) {
        // flat update inside cropDetails, farmingDetails, etc.
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
      }

      // nested update
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [nestedSection]: {
            ...prev[section][nestedSection],
            [field]: value,
          },
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await contractsAPI.createContract(formData);

      navigate("/contracts", {
        state: { message: "Contract created successfully!" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create contract");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Farm Selection", icon: FaSeedling },
    { number: 2, title: "Crop Details", icon: FaSeedling },
    { number: 3, title: "Farming Details", icon: FaCalendar },
    { number: 4, title: "Pricing", icon: FaRupeeSign },
    { number: 5, title: "Logistics", icon: FaTruck },
    { number: 6, title: "Labor & Support", icon: FaUsers },
    { number: 7, title: "Review", icon: FaCheckCircle },
  ];

  if (loading && farms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/contracts"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Create New Contract
          </h1>
          <p className="text-gray-600">
            Fill in the details to create a farming contract
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <FaCheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>

                  <span className="text-xs mt-2 hidden sm:block">
                    {step.title}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* STEP 1 - FARM SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Select Farm
              </h2>

              <div className="bg-white p-6 rounded-lg shadow space-y-4">
                {/* Label */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Farm <span className="text-red-500">*</span>
                </label>

                {/* Dropdown */}
                <select
                  value={formData.farm}
                  onChange={(e) =>
                    handleInputChange(null, "farm", e.target.value)
                  }
                  required
                  className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 
          ${
            formData.farm
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }
          focus:ring-2 focus:ring-blue-400 focus:border-blue-500
        `}
                >
                  <option value="">Choose a farm</option>
                  {farms.map((farm) => (
                    <option key={farm.farm_id} value={farm.farm_id}>
                      {farm.farm_name} — {farm.farm_size_area}{" "}
                      {farm.farm_size_unit}
                    </option>
                  ))}
                </select>

                {/* Success Message */}
                {formData.farm && (
                  <div className="p-3 mt-2 rounded border border-green-300 bg-green-50 text-green-700 text-sm">
                    Farm selected! Continue to add crop details.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 - CROP DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Crop Details
              </h2>

              <div className="bg-white p-6 rounded-lg shadow space-y-6">
                {/* Grid Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Commodity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commodity <span className="text-red-500">*</span>
                    </label>

                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.cropDetails.commodityId}
                      onChange={(e) =>
                        handleInputChange(
                          "cropDetails",
                          "commodityId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select commodity</option>
                      {commodities.map((c) => (
                        <option key={c.commodity_id} value={c.commodity_id}>
                          {c.commodity_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variety */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety <span className="text-red-500">*</span>
                    </label>

                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.cropDetails.varietyId}
                      onChange={(e) =>
                        handleInputChange(
                          "cropDetails",
                          "varietyId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select variety</option>
                      {varieties.map((v) => (
                        <option key={v.variety_id} value={v.variety_id}>
                          {v.variety_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quality Grade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality Grade <span className="text-red-500">*</span>
                    </label>

                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.cropDetails.quality}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "cropDetails",
                          null,
                          "quality",
                          e.target.value
                        )
                      }
                    >
                      <option value="premium">Premium</option>
                      <option value="grade-a">Grade A</option>
                      <option value="grade-b">Grade B</option>
                      <option value="standard">Standard</option>
                    </select>
                  </div>

                  {/* Expected Yield */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Yield <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      placeholder="Enter expected yield"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
               focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.cropDetails.expectedYield}
                      onChange={(e) =>
                        handleInputChange(
                          "cropDetails",
                          "expectedYield",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* Grid Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Amount <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      placeholder="Enter quantity"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.cropDetails.quantity.amount}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "cropDetails",
                          "quantity",
                          "amount",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Quantity Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Unit <span className="text-red-500">*</span>
                    </label>

                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.cropDetails.quantity.unit}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "cropDetails",
                          "quantity",
                          "unit",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Unit</option>
                      <option value="quintal">Quintal</option>
                      <option value="kg">Kilograms</option>
                      <option value="grams">Grams</option>
                      <option value="ton">Ton</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 – FARMING DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Farming Details
              </h2>

              <div className="bg-white p-6 rounded-lg shadow space-y-6">
                {/* Row 1 – Planting / Harvesting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Planting Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planting Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.farmingDetails.plantingDate}
                      onChange={(e) =>
                        handleInputChange(
                          "farmingDetails",
                          "plantingDate",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
                       focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Harvesting Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harvesting Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.farmingDetails.harvestingDate}
                      onChange={(e) =>
                        handleInputChange(
                          "farmingDetails",
                          "harvestingDate",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
                       focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Row 2 – Season / Irrigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Season */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={formData.farmingDetails.season}
                      onChange={(e) =>
                        handleInputChange(
                          "farmingDetails",
                          "season",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
                       focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select season</option>
                      <option value="kharif">Kharif (Monsoon)</option>
                      <option value="rabi">Rabi (Winter)</option>
                      <option value="zaid">Zaid (Summer)</option>
                    </select>
                  </div>

                  {/* Irrigation Schedule */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Irrigation Schedule
                    </label>
                    <textarea
                      placeholder="Describe irrigation schedule"
                      rows="1"
                      value={formData.farmingDetails.irrigationSchedule}
                      onChange={(e) =>
                        handleInputChange(
                          "farmingDetails",
                          "irrigationSchedule",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
                       focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    ></textarea>
                  </div>
                </div>

                {/* Row 3 – Farming Techniques */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farming Techniques (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., organic, drip irrigation, mulching"
                    value={formData.farmingDetails.farmingTechniques.join(", ")}
                    onChange={(e) =>
                      handleArrayInput(
                        "farmingDetails",
                        "farmingTechniques",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Row 4 – Fertilizers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fertilizers Used (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., NPK, organic compost, vermicompost"
                    value={formData.farmingDetails.fertilizersUsed.join(", ")}
                    onChange={(e) =>
                      handleArrayInput(
                        "farmingDetails",
                        "fertilizersUsed",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Row 5 – Pesticides */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pesticides Used (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., neem oil, biological pesticides"
                    value={formData.farmingDetails.pesticidesUsed.join(", ")}
                    onChange={(e) =>
                      handleArrayInput(
                        "farmingDetails",
                        "pesticidesUsed",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2
                     focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 – PRICING DETAILS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Pricing Details
              </h2>

              <div className="bg-white p-6 rounded-lg shadow space-y-8">
                {/* Row 1 – Base Price & Price Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter base price"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
            focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.pricing.basePrice}
                      onChange={(e) =>
                        handleInputChange(
                          "pricing",
                          "basePrice",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Price Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
            focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.pricing.priceUnit}
                      onChange={(e) =>
                        handleInputChange(
                          "pricing",
                          "priceUnit",
                          e.target.value
                        )
                      }
                    >
                      <option value="per-quintal">Per Quintal</option>
                      <option value="per-kg">Per Kg</option>
                      <option value="per-ton">Per Ton</option>
                    </select>
                  </div>
                </div>

                {/* Advance Payment Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Advance Payment
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Advance Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advance Amount
                      </label>
                      <input
                        type="number"
                        placeholder="Enter advance amount"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 
              focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.pricing.advancePayment.amount}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "pricing",
                            "advancePayment",
                            "amount",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Advance Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advance Percentage (%)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter percentage"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 
              focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.pricing.advancePayment.percentage}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "pricing",
                            "advancePayment",
                            "percentage",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Advance Payment Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Advance Payment Due Date
                    </label>
                    <input
                      type="date"
                      className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 
            focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.pricing.advancePayment.dueDate}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "pricing",
                          "advancePayment",
                          "dueDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* Final Payment Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Final Payment
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Final Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Final Amount
                      </label>
                      <input
                        type="number"
                        placeholder="Enter final amount"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 
              focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.pricing.finalPayment.amount}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "pricing",
                            "finalPayment",
                            "amount",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Final Payment Due Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Final Payment Due Date
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 
              focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.pricing.finalPayment.dueDate}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "pricing",
                            "finalPayment",
                            "dueDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 – LOGISTICS DETAILS */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Logistics Details
              </h2>

              <div className="bg-white p-6 rounded-lg shadow space-y-6">
                {/* Row 1 – Logistics Responsibility & Transportation Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logistics Responsibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logistics Responsibility{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={formData.logistics.responsibility}
                      onChange={(e) =>
                        handleInputChange(
                          "logistics",
                          "responsibility",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2
            focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="trader">Trader</option>
                      <option value="shared">Shared</option>
                    </select>
                  </div>

                  {/* Transportation Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportation Cost
                    </label>

                    <input
                      type="number"
                      placeholder="Enter cost"
                      value={formData.logistics.transportationCost}
                      onChange={(e) =>
                        handleInputChange(
                          "logistics",
                          "transportationCost",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
            focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Row 2 – Pickup Location & Delivery Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location
                    </label>

                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      value={formData.logistics.pickupLocation}
                      onChange={(e) =>
                        handleInputChange(
                          "logistics",
                          "pickupLocation",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
            focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Delivery Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Location
                    </label>

                    <input
                      type="text"
                      placeholder="Enter delivery location"
                      value={formData.logistics.deliveryLocation}
                      onChange={(e) =>
                        handleInputChange(
                          "logistics",
                          "deliveryLocation",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 
            focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Row 3 – Delivery Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Schedule
                  </label>

                  <input
                    type="date"
                    value={formData.logistics.deliverySchedule}
                    onChange={(e) =>
                      handleInputChange(
                        "logistics",
                        "deliverySchedule",
                        e.target.value
                      )
                    }
                    className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 
          focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Row 4 – Packaging Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Packaging Requirements
                  </label>

                  <textarea
                    placeholder="Describe packaging requirements"
                    rows="2"
                    value={formData.logistics.packagingRequirements}
                    onChange={(e) =>
                      handleInputChange(
                        "logistics",
                        "packagingRequirements",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 
          focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 – LABOR & SUPPORT */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Labor & Support
              </h2>

              <div className="bg-white p-6 rounded-lg shadow space-y-6">
                {/* Labor Responsibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labor Responsibility <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={formData.laborAndSupport.laborResponsibility}
                    onChange={(e) =>
                      handleInputChange(
                        "laborAndSupport",
                        "laborResponsibility",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2
          focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="farmer">Farmer</option>
                    <option value="trader">Trader</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    Technical support and expert visit details can be added
                    after contract creation through the contract management
                    interface.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7 – REVIEW */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Review Contract
              </h2>

              {/* Review Card */}
              <div className="bg-white p-6 rounded-lg shadow space-y-8">
                {/* --- FARM DETAILS --- */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Farm Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Farm Name</p>
                      <p className="font-medium">
                        {farms.find((f) => f.farm_id == formData.farm)
                          ?.farm_name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- CROP DETAILS --- */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Crop Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Commodity</p>
                      <p className="font-medium">
                        {commodities.find(
                          (c) =>
                            c.commodity_id == formData.cropDetails.commodityId
                        )?.commodity_name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Variety</p>
                      <p className="font-medium">
                        {varieties.find(
                          (v) => v.variety_id == formData.cropDetails.varietyId
                        )?.variety_name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Quality Grade</p>
                      <p className="font-medium capitalize">
                        {formData.cropDetails.quality}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-medium">
                        {formData.cropDetails.quantity.amount}{" "}
                        {formData.cropDetails.quantity.unit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- FARMING DETAILS --- */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Farming Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Planting Date</p>
                      <p className="font-medium">
                        {formData.farmingDetails.plantingDate || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Harvesting Date</p>
                      <p className="font-medium">
                        {formData.farmingDetails.harvestingDate || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Season</p>
                      <p className="font-medium capitalize">
                        {formData.farmingDetails.season || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Irrigation Schedule</p>
                      <p className="font-medium">
                        {formData.farmingDetails.irrigationSchedule || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- PRICING DETAILS --- */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Pricing
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Base Price</p>
                      <p className="font-medium">
                        ₹{formData.pricing.basePrice}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Price Unit</p>
                      <p className="font-medium">
                        {formData.pricing.priceUnit}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Advance Amount</p>
                      <p className="font-medium">
                        {formData.pricing.advancePayment.amount || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Advance %</p>
                      <p className="font-medium">
                        {formData.pricing.advancePayment.percentage || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Final Payment Amount</p>
                      <p className="font-medium">
                        {formData.pricing.finalPayment.amount || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- LOGISTICS --- */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Logistics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Responsibility</p>
                      <p className="font-medium capitalize">
                        {formData.logistics.responsibility || "N/A"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-gray-600">Packaging Requirements</p>
                      <p className="font-medium">
                        {formData.logistics.packagingRequirements || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- LABOR --- */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Labor & Support
                  </h3>

                  <p className="font-medium capitalize text-sm">
                    Labor Responsibility:{" "}
                    {formData.laborAndSupport.laborResponsibility}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border rounded-lg text-gray-700"
              >
                Previous
              </button>
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg"
              >
                Create Contract
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContract;
