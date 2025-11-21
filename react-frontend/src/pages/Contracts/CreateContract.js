import React, {
    useState,
    useEffect
} from 'react';
import {
    useNavigate,
    useParams,
    Link
} from 'react-router-dom';
import {
    FaArrowLeft,
    FaSeedling,
    FaCalendar,
    FaRupeeSign,
    FaTruck,
    FaUsers,
    FaImages,
    FaCheckCircle
} from 'react-icons/fa';
import {
    contractsAPI,
    farmsAPI,
    commoditiesAPI
} from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const CreateContract = () => {
    const navigate = useNavigate();
    const {
        farmId
    } = useParams();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [farms, setFarms] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [varieties, setVarieties] = useState([]);

    const [formData, setFormData] = useState({
        farm: farmId || '',

        // Crop Details
        cropDetails: {
            commodityId: '',
            varietyId: '',
            quality: 'standard',
            quantity: {
                amount: '',
                unit: 'quintal'
            },
            expectedYield: '',
            qualityParameters: {}
        },

        // Farming Details
        farmingDetails: {
            plantingDate: '',
            harvestingDate: '',
            season: 'kharif',
            farmingTechniques: [],
            fertilizersUsed: [],
            pesticidesUsed: [],
            irrigationSchedule: ''
        },

        // Pricing
        pricing: {
            basePrice: '',
            priceUnit: 'per-quintal',
            advancePayment: {
                amount: '',
                percentage: '',
                dueDate: ''
            },
            finalPayment: {
                amount: '',
                dueDate: ''
            },
            bonusIncentives: [],
            penaltyClause: []
        },

        // Logistics
        logistics: {
            responsibility: 'farmer',
            pickupLocation: '',
            deliveryLocation: '',
            transportationCost: '',
            packagingRequirements: '',
            deliverySchedule: ''
        },

        // Labor and Support
        laborAndSupport: {
            laborResponsibility: 'farmer',
            technicalSupport: {},
            expertVisits: {}
        },

        // Media Files
        mediaFiles: {
            farmImages: [],
            farmVideos: [],
            documents: []
        }
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
                commoditiesAPI.getCommodities()
            ]);

            setFarms(farmsRes.data.farms || []);
            setCommodities(commoditiesRes.data.commodities || []);
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    const fetchVarieties = async (commodityId) => {
        try {
            const response = await commoditiesAPI.getVarieties(commodityId);
            setVarieties(response.data.varieties || []);
        } catch (err) {
            console.error('Error fetching varieties:', err);
        }
    };

    const handleInputChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleNestedInputChange = (section, nestedSection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [nestedSection]: {
                    ...prev[section][nestedSection],
                    [field]: value
                }
            }
        }));
    };

    const handleArrayInput = (section, field, value) => {
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: array
            }
        }));
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 7));
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const response = await contractsAPI.createContract(formData);

            navigate('/contracts', {
                state: {
                    message: 'Contract created successfully!'
                }
            });
        } catch (err) {
            console.error('Error creating contract:', err);
            setError(err.response ?.data ?.message || 'Failed to create contract');
        } finally {
            setLoading(false);
        }
    };

    const steps = [{
            number: 1,
            title: 'Farm Selection',
            icon: FaSeedling
        },
        {
            number: 2,
            title: 'Crop Details',
            icon: FaSeedling
        },
        {
            number: 3,
            title: 'Farming Details',
            icon: FaCalendar
        },
        {
            number: 4,
            title: 'Pricing',
            icon: FaRupeeSign
        },
        {
            number: 5,
            title: 'Logistics',
            icon: FaTruck
        },
        {
            number: 6,
            title: 'Labor & Support',
            icon: FaUsers
        },
        {
            number: 7,
            title: 'Review',
            icon: FaCheckCircle
        }
    ];

    if (loading && farms.length === 0) {
        return ( 
            <div className = "min-h-screen bg-gray-50 flex items-center justify-center" >
            <LoadingSpinner / >
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

                  <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
                  <p className="text-gray-600">
                      Fill in the details to create a farming contract
                  </p>
              </div>

              {/* Progress Steps */}
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

                                <span className="text-xs mt-2 text-center hidden sm:block">
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

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                  {/* Packaging Requirements */}
                  <textarea
                    value={formData.logistics.packagingRequirements}
                    onChange={(e) =>
                      handleInputChange(
                        "logistics",
                        "packagingRequirements",
                        e.target.value
                      )
                    }
                    className="input-field"
                    rows="3"
                    placeholder="Describe packaging requirements"
                  />

                  {/* STEP 6 - LABOR & SUPPORT */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Labor & Support
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Labor Responsibility */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                  required
                                  className="input-field"
                                >
                                    <option value="farmer">Farmer</option>
                                    <option value="trader">Trader</option>
                                    <option value="shared">Shared</option>
                                </select>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm text-blue-800">
                                    Technical support and expert visit details can be added after
                                    contract creation through the contract management interface.
                                </p>
                            </div>
                        </div>
                    </div>
                  )}

                  {/* STEP 7 - Review */}
                  {currentStep === 7 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Review Contract
                        </h2>

                        <div className="space-y-4">
                            {/* Selected Farm */}
                            <div className="p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Selected Farm
                                </h3>
                                <p className="text-gray-700">
                                    {farms.find((f) => f.farm_id == formData.farm)?.farm_name ||
                                      "N/A"}
                                </p>
                            </div>

                            {/* Crop Details */}
                            <div className="p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Crop Details
                                </h3>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Commodity:</span>
                                        <span className="ml-2 font-medium">
                    {
                      commodities.find(
                        (c) =>
                          c.commodity_id ==
                          formData.cropDetails.commodityId
                      )?.commodity_name || "N/A"
                    }
                  </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Variety:</span>
                                        <span className="ml-2 font-medium">
                    {
                      varieties.find(
                        (v) =>
                          v.variety_id ==
                          formData.cropDetails.varietyId
                      )?.variety_name || "N/A"
                    }
                  </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Quality:</span>
                                        <span className="ml-2 font-medium capitalize">
                    {formData.cropDetails.quality}
                  </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="ml-2 font-medium">
                    {formData.cropDetails.quantity.amount}{" "}
                                            {formData.cropDetails.quantity.unit}
                  </span>
                                    </div>
                                </div>
                            </div>

                            {/* Farming Details */}
                            <div className="p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Farming Details
                                </h3>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Planting Date:</span>
                                        <span className="ml-2 font-medium">
                    {formData.farmingDetails.plantingDate}
                  </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Harvesting Date:</span>
                                        <span className="ml-2 font-medium">
                    {formData.farmingDetails.harvestingDate}
                  </span>
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Season:</span>
                                        <span className="ml-2 font-medium capitalize">
                    {formData.farmingDetails.season}
                  </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Base Price:</span>
                                        <span className="ml-2 font-medium">
                    ₹{formData.pricing.basePrice}{" "}
                                            {formData.pricing.priceUnit}
                  </span>
                                    </div>

                                    {formData.pricing.advancePayment?.amount && (
                                      <div>
                                          <span className="text-gray-600">Advance:</span>
                                          <span className="ml-2 font-medium">
                      ₹{formData.pricing.advancePayment.amount}
                    </span>
                                      </div>
                                    )}
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Logistics
                                </h3>

                                <div className="text-sm">
                                    <span className="text-gray-600">Responsibility:</span>
                                    <span className="ml-2 font-medium capitalize">
                  {formData.logistics.responsibility}
                </span>
                                </div>
                            </div>

                            {/* Labor & Support */}
                            <div className="p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Labor & Support
                                </h3>

                                <div className="text-sm">
                                    <span className="text-gray-600">Labor Responsibility:</span>
                                    <span className="ml-2 font-medium capitalize">
                  {formData.laborAndSupport.laborResponsibility}
                </span>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-6">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                      )}

                      {currentStep < 7 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Next
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Contract"}
                        </button>
                      )}
                  </div>
              </form>
          </div>
      </div>
    );
};

export default CreateContract;