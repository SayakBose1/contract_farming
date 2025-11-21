import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUpload,
  FaPlus,
  FaTrash,
  FaCheck,
  FaInfoCircle,
  FaSeedling,
  FaLeaf,
  FaHistory,
  FaWarehouse,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { farmsAPI, uploadAPI } from "../../services/api";
import axios from "axios";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5005";

const CreateFarm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Location dropdown data
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    farmName: "",
    farmDivision: "",
    farmDistrict: "",
    farmTehsil: "",
    farmBlock: "",
    location: {
      coordinates: {
        latitude: "",
        longitude: "",
      },
    },
    farmSize: {
      area: "",
      unit: "acres",
    },
    soilInformation: {
      soilType: "",
      phLevel: "",
      organicMatter: "",
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      soilTestDate: "",
      soilTestReport: null,
    },
    irrigationSystem: "",
    waterSource: "",
    farmingTechniques: [],
    certifications: [],
    currentCrops: [],
    farmHistory: [],
    facilities: {
      storageCapacity: "",
      storageType: "",
      processingFacility: false,
      coldStorage: false,
      packingFacility: false,
      qualityTestingLab: false,
    },
  });

  const [mediaFiles, setMediaFiles] = useState({
    images: [],
    videos: [],
  });

  const [mediaDescriptions, setMediaDescriptions] = useState({
    images: [],
    videos: [],
  });

  const steps = [
    {
      id: 1,
      title: "Basic Information",
      description: "Farm name and location details",
      icon: FaInfoCircle,
    },
    {
      id: 2,
      title: "Farm Specifications",
      description: "Size, soil, and irrigation details",
      icon: FaSeedling,
    },
    {
      id: 3,
      title: "Farming Practices",
      description: "Techniques and certifications",
      icon: FaLeaf,
    },
    {
      id: 4,
      title: "Crops & History",
      description: "Current crops and farming history",
      icon: FaHistory,
    },
    {
      id: 5,
      title: "Facilities & Media",
      description: "Farm facilities and media uploads",
      icon: FaWarehouse,
    },
  ];

  const soilTypes = ["clay", "sandy", "loamy", "silt", "peaty", "chalky"];
  const irrigationSystems = ["drip", "sprinkler", "flood", "furrow", "none"];
  const waterSources = ["borewell", "canal", "river", "rainwater", "pond"];
  const farmingTechniqueOptions = [
    "organic",
    "conventional",
    "integrated",
    "precision",
    "sustainable",
  ];
  const certificationTypes = ["organic", "fair-trade", "global-gap", "iso"];
  const seasons = ["kharif", "rabi", "zaid"];
  const cropStatuses = ["planted", "growing", "ready", "harvested"];

  // Fetch divisions on component mount
  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      setLoadingLocations(true);
      const response = await axios.get(`${API_BASE}/locations/divisions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setDivisions(response.data.divisions || []);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      setErrors((prev) => ({ ...prev, locations: "Failed to load divisions" }));
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchDistricts = async (divisionId) => {
    try {
      setLoadingLocations(true);
      const response = await axios.get(
        `${API_BASE}/locations/divisions/${divisionId}/districts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDistricts(response.data.districts || []);
      setTehsils([]);
      setBlocks([]);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setErrors((prev) => ({ ...prev, locations: "Failed to load districts" }));
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchTehsils = async (districtId) => {
    try {
      setLoadingLocations(true);
      const response = await axios.get(
        `${API_BASE}/locations/districts/${districtId}/tehsils`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTehsils(response.data.tehsils || []);
    } catch (error) {
      console.error("Error fetching tehsils:", error);
      setErrors((prev) => ({ ...prev, locations: "Failed to load tehsils" }));
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchBlocks = async (districtId) => {
    try {
      setLoadingLocations(true);
      const response = await axios.get(
        `${API_BASE}/locations/districts/${districtId}/blocks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBlocks(response.data.blocks || []);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      setErrors((prev) => ({ ...prev, locations: "Failed to load blocks" }));
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleDivisionChange = (divisionId) => {
    setFormData((prev) => ({
      ...prev,
      farmDivision: divisionId,
      farmDistrict: "",
      farmTehsil: "",
      farmBlock: "",
    }));
    setDistricts([]);
    setTehsils([]);
    setBlocks([]);
    if (divisionId) {
      fetchDistricts(divisionId);
    }
  };

  const handleDistrictChange = (districtId) => {
    setFormData((prev) => ({
      ...prev,
      farmDistrict: districtId,
      farmTehsil: "",
      farmBlock: "",
    }));
    setTehsils([]);
    setBlocks([]);
    if (districtId) {
      fetchTehsils(districtId);
      fetchBlocks(districtId);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error when user starts typing
    if (errors[`${section}.${field}`] || errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}`]: "",
        [field]: "",
      }));
    }
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleArrayInputChange = (field, index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addArrayItem = (field, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultItem],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleTechniqueToggle = (technique) => {
    setFormData((prev) => ({
      ...prev,
      farmingTechniques: prev.farmingTechniques.includes(technique)
        ? prev.farmingTechniques.filter((t) => t !== technique)
        : [...prev.farmingTechniques, technique],
    }));
  };

  const handleFileUpload = (type, files) => {
    try {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      setMediaFiles((prev) => ({
        ...prev,
        [type]: [...prev[type], ...fileArray],
      }));

      // Initialize descriptions for new files
      const newDescriptions = fileArray.map(() => "");
      setMediaDescriptions((prev) => ({
        ...prev,
        [type]: [...prev[type], ...newDescriptions],
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrors((prev) => ({
        ...prev,
        fileUpload: "Failed to upload file. Please try again.",
      }));
    }
  };

  const removeMediaFile = (type, index) => {
    setMediaFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
    setMediaDescriptions((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateMediaDescription = (type, index, description) => {
    setMediaDescriptions((prev) => ({
      ...prev,
      [type]: prev[type].map((desc, i) => (i === index ? description : desc)),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.farmName.trim())
          newErrors.farmName = "Farm name is required";
        if (!formData.farmDivision)
          newErrors.farmDivision = "Division is required";
        if (!formData.farmDistrict)
          newErrors.farmDistrict = "District is required";
        if (!formData.farmTehsil) newErrors.farmTehsil = "Tehsil is required";
        if (!formData.farmBlock) newErrors.farmBlock = "Block is required";
        break;
      case 2:
        if (!formData.farmSize.area || formData.farmSize.area <= 0)
          newErrors["farmSize.area"] = "Farm area is required";
        if (!formData.soilInformation.soilType)
          newErrors["soilInformation.soilType"] = "Soil type is required";
        if (!formData.irrigationSystem)
          newErrors.irrigationSystem = "Irrigation system is required";
        if (!formData.waterSource)
          newErrors.waterSource = "Water source is required";
        break;
      case 3:
        if (formData.farmingTechniques.length === 0)
          newErrors.farmingTechniques =
            "At least one farming technique is required";
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      if (validateStep(currentStep)) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only allow submission when on the final step
    if (currentStep !== steps.length) {
      console.log("Form submission blocked - not on final step");
      return;
    }

    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Create farm first
      const farmResponse = await farmsAPI.createFarm(formData);
      const farmId = farmResponse.data.farm_id;

      // Upload media files if any
      if (mediaFiles.images.length > 0 || mediaFiles.videos.length > 0) {
        const allFiles = [...mediaFiles.images, ...mediaFiles.videos];
        const allDescriptions = [
          ...mediaDescriptions.images,
          ...mediaDescriptions.videos,
        ];

        try {
          await uploadAPI.uploadFarmMedia(farmId, allFiles, allDescriptions);
        } catch (uploadError) {
          console.warn(
            "Media upload failed, but farm was created:",
            uploadError
          );
          // Continue even if media upload fails
        }
      }

      navigate("/farmer/farms", {
        state: {
          message: "Farm created successfully!",
        },
      });
    } catch (error) {
      console.error("Error creating farm:", error);
      console.error("Error response:", error.response?.data);

      // Get detailed error message
      let errorMessage = "Failed to create farm";
      if (error.response?.data?.errors) {
        // Validation errors array
        errorMessage = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setErrors({
        submit: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>

            {/* Farm Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Name *
              </label>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) =>
                  handleInputChange(null, "farmName", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.farmName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter farm name"
              />
              {errors.farmName && (
                <p className="text-red-500 text-sm mt-1">{errors.farmName}</p>
              )}
            </div>

            {/* Location Errors */}
            {errors.locations && (
              <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {errors.locations}
              </div>
            )}

            {/* Division & District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Division */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Division *
                </label>
                <select
                  value={formData.farmDivision}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  disabled={loadingLocations}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.farmDivision ? "border-red-500" : "border-gray-300"
                  } ${loadingLocations ? "bg-gray-100" : ""}`}
                >
                  <option value="">Select Division</option>
                  {divisions.map((division) => (
                    <option
                      key={division.division_id}
                      value={division.division_id}
                    >
                      {division.division_name}
                    </option>
                  ))}
                </select>

                {errors.farmDivision && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.farmDivision}
                  </p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <select
                  value={formData.farmDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!formData.farmDivision || loadingLocations}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.farmDistrict ? "border-red-500" : "border-gray-300"
                  } ${
                    !formData.farmDivision || loadingLocations
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option
                      key={district.district_id}
                      value={district.district_id}
                    >
                      {district.district_name}
                    </option>
                  ))}
                </select>

                {errors.farmDistrict && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.farmDistrict}
                  </p>
                )}

                {!formData.farmDivision && (
                  <p className="text-gray-500 text-xs mt-1">
                    Please select division first
                  </p>
                )}
              </div>
            </div>

            {/* Tehsil & Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tehsil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tehsil *
                </label>
                <select
                  value={formData.farmTehsil}
                  onChange={(e) =>
                    handleInputChange(null, "farmTehsil", e.target.value)
                  }
                  disabled={!formData.farmDistrict || loadingLocations}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.farmTehsil ? "border-red-500" : "border-gray-300"
                  } ${
                    !formData.farmDistrict || loadingLocations
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <option value="">Select Tehsil</option>
                  {tehsils.map((tehsil) => (
                    <option key={tehsil.tehsil_id} value={tehsil.tehsil_id}>
                      {tehsil.tehsil_name}
                    </option>
                  ))}
                </select>

                {errors.farmTehsil && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.farmTehsil}
                  </p>
                )}

                {!formData.farmDistrict && (
                  <p className="text-gray-500 text-xs mt-1">
                    Please select district first
                  </p>
                )}
              </div>

              {/* Block */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block *
                </label>
                <select
                  value={formData.farmBlock}
                  onChange={(e) =>
                    handleInputChange(null, "farmBlock", e.target.value)
                  }
                  disabled={!formData.farmDistrict || loadingLocations}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.farmBlock ? "border-red-500" : "border-gray-300"
                  } ${
                    !formData.farmDistrict || loadingLocations
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <option value="">Select Block</option>
                  {blocks.map((block) => (
                    <option key={block.block_id} value={block.block_id}>
                      {block.block_name}
                    </option>
                  ))}
                </select>

                {errors.farmBlock && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.farmBlock}
                  </p>
                )}

                {!formData.farmDistrict && (
                  <p className="text-gray-500 text-xs mt-1">
                    Please select district first
                  </p>
                )}
              </div>
            </div>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.coordinates.latitude}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "location",
                      "coordinates",
                      "latitude",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter latitude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.coordinates.longitude}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "location",
                      "coordinates",
                      "longitude",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Farm Specifications
            </h3>

            {/* Farm Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Area *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.farmSize.area}
                  onChange={(e) =>
                    handleInputChange("farmSize", "area", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors["farmSize.area"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter area"
                />
                {errors["farmSize.area"] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors["farmSize.area"]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.farmSize.unit}
                  onChange={(e) =>
                    handleInputChange("farmSize", "unit", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="bigha">Bigha</option>
                  <option value="kanal">Kanal</option>
                </select>
              </div>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Type *
              </label>
              <select
                value={formData.soilInformation.soilType}
                onChange={(e) =>
                  handleInputChange(
                    "soilInformation",
                    "soilType",
                    e.target.value
                  )
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors["soilInformation.soilType"]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Soil Type</option>
                {soilTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              {errors["soilInformation.soilType"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["soilInformation.soilType"]}
                </p>
              )}
            </div>

            {/* Soil Nutrient Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  pH Level
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={formData.soilInformation.phLevel}
                  onChange={(e) =>
                    handleInputChange(
                      "soilInformation",
                      "phLevel",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="pH"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organic Matter (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.soilInformation.organicMatter}
                  onChange={(e) =>
                    handleInputChange(
                      "soilInformation",
                      "organicMatter",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="OM %"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nitrogen (kg/ha)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.soilInformation.nitrogen}
                  onChange={(e) =>
                    handleInputChange(
                      "soilInformation",
                      "nitrogen",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="N"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phosphorus (kg/ha)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.soilInformation.phosphorus}
                  onChange={(e) =>
                    handleInputChange(
                      "soilInformation",
                      "phosphorus",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="P"
                />
              </div>
            </div>

            {/* Irrigation & Water Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Irrigation System *
                </label>
                <select
                  value={formData.irrigationSystem}
                  onChange={(e) =>
                    handleInputChange(null, "irrigationSystem", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.irrigationSystem
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Irrigation System</option>
                  {irrigationSystems.map((system) => (
                    <option key={system} value={system}>
                      {system.charAt(0).toUpperCase() + system.slice(1)}
                    </option>
                  ))}
                </select>

                {errors.irrigationSystem && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.irrigationSystem}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Source *
                </label>
                <select
                  value={formData.waterSource}
                  onChange={(e) =>
                    handleInputChange(null, "waterSource", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.waterSource ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Water Source</option>
                  {waterSources.map((source) => (
                    <option key={source} value={source}>
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </option>
                  ))}
                </select>

                {errors.waterSource && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.waterSource}
                  </p>
                )}
              </div>
            </div>

            {/* Soil Test Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Test Date
              </label>
              <input
                type="date"
                value={formData.soilInformation.soilTestDate}
                onChange={(e) =>
                  handleInputChange(
                    "soilInformation",
                    "soilTestDate",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Farming Practices
            </h3>

            {/* Farming Techniques */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Farming Techniques * (Select all that apply)
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {farmingTechniqueOptions.map((technique) => (
                  <label
                    key={technique}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.farmingTechniques.includes(technique)}
                      onChange={() => handleTechniqueToggle(technique)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      {technique.charAt(0).toUpperCase() + technique.slice(1)}
                    </span>
                  </label>
                ))}
              </div>

              {errors.farmingTechniques && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.farmingTechniques}
                </p>
              )}
            </div>

            {/* Certifications Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Certifications
                </label>

                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("certifications", {
                      type: "",
                      certificateNumber: "",
                      issuedBy: "",
                      validUntil: "",
                      certificateUrl: "",
                    })
                  }
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  <FaPlus className="mr-1 h-3 w-3" />
                  Add Certification
                </button>
              </div>

              {formData.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Certification {index + 1}
                    </h4>

                    <button
                      type="button"
                      onClick={() => removeArrayItem("certifications", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Type
                      </label>
                      <select
                        value={cert.type}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "certifications",
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Type</option>
                        {certificationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Certificate Number */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Certificate Number
                      </label>
                      <input
                        type="text"
                        value={cert.certificateNumber}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "certifications",
                            index,
                            "certificateNumber",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Certificate number"
                      />
                    </div>

                    {/* Issued By */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Issued By
                      </label>
                      <input
                        type="text"
                        value={cert.issuedBy}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "certifications",
                            index,
                            "issuedBy",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Issuing authority"
                      />
                    </div>

                    {/* Valid Until */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        value={cert.validUntil}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "certifications",
                            index,
                            "validUntil",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Crops & History
            </h3>

            {/* ---------------------- Current Crops Section ---------------------- */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Current Crops
                </label>

                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("currentCrops", {
                      cropName: "",
                      variety: "",
                      plantedArea: "",
                      plantingDate: "",
                      expectedHarvestDate: "",
                      status: "planted",
                    })
                  }
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  <FaPlus className="mr-1 h-3 w-3" />
                  Add Crop
                </button>
              </div>

              {formData.currentCrops.map((crop, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Crop {index + 1}
                    </h4>

                    <button
                      type="button"
                      onClick={() => removeArrayItem("currentCrops", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Crop Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Crop Name
                      </label>
                      <input
                        type="text"
                        value={crop.cropName}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "currentCrops",
                            index,
                            "cropName",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Crop name"
                      />
                    </div>

                    {/* Variety */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Variety
                      </label>
                      <input
                        type="text"
                        value={crop.variety}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "currentCrops",
                            index,
                            "variety",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Variety"
                      />
                    </div>

                    {/* Planted Area */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Planted Area
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={crop.plantedArea}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "currentCrops",
                            index,
                            "plantedArea",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Area in acres"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Status
                      </label>
                      <select
                        value={crop.status}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "currentCrops",
                            index,
                            "status",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      >
                        {cropStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Planting Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Planting Date
                      </label>
                      <input
                        type="date"
                        value={crop.plantingDate}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "currentCrops",
                            index,
                            "plantingDate",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Expected Harvest Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Expected Harvest Date
                      </label>
                      <input
                        type="date"
                        value={crop.expectedHarvestDate}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "currentCrops",
                            index,
                            "expectedHarvestDate",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------------------- Farm History Section ---------------------- */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Farm History
                </label>

                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("farmHistory", {
                      year: new Date().getFullYear(),
                      season: "",
                      cropName: "",
                      variety: "",
                      yield: "",
                      yieldUnit: "tons",
                      qualityGrade: "",
                      marketPrice: "",
                      totalIncome: "",
                    })
                  }
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  <FaPlus className="mr-1 h-3 w-3" />
                  Add History Record
                </button>
              </div>

              {formData.farmHistory.map((history, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      History Record {index + 1}
                    </h4>

                    <button
                      type="button"
                      onClick={() => removeArrayItem("farmHistory", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>

                  {/* History Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Year */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        value={history.year}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "year",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Year"
                      />
                    </div>

                    {/* Season */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Season
                      </label>
                      <select
                        value={history.season}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "season",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Season</option>
                        {seasons.map((season) => (
                          <option key={season} value={season}>
                            {season.charAt(0).toUpperCase() + season.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Crop Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Crop Name
                      </label>
                      <input
                        type="text"
                        value={history.cropName}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "cropName",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Crop name"
                      />
                    </div>

                    {/* Variety */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Variety
                      </label>
                      <input
                        type="text"
                        value={history.variety}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "variety",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Variety"
                      />
                    </div>

                    {/* Yield */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Yield
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={history.yield}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "yield",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Yield"
                      />
                    </div>

                    {/* Quality Grade */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quality Grade
                      </label>
                      <input
                        type="text"
                        value={history.qualityGrade}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "qualityGrade",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Quality grade"
                      />
                    </div>

                    {/* Market Price */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Market Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={history.marketPrice}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "marketPrice",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Price per unit"
                      />
                    </div>

                    {/* Total Income */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Total Income (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={history.totalIncome}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "farmHistory",
                            index,
                            "totalIncome",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Total income"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Facilities & Media
            </h3>

            {/* ===================== Facilities Section ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ---------- Farm Facilities ---------- */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Farm Facilities
                </h4>

                <div className="space-y-4">
                  {/* Storage Capacity & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Storage Capacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Capacity (tons)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.facilities.storageCapacity}
                        onChange={(e) =>
                          handleInputChange(
                            "facilities",
                            "storageCapacity",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Storage capacity"
                      />
                    </div>

                    {/* Storage Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Type
                      </label>
                      <input
                        type="text"
                        value={formData.facilities.storageType}
                        onChange={(e) =>
                          handleInputChange(
                            "facilities",
                            "storageType",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Warehouse, Silo"
                      />
                    </div>
                  </div>

                  {/* Available Facilities */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Available Facilities
                    </label>

                    <div className="space-y-2">
                      {/* Processing Facility */}
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.facilities.processingFacility}
                          onChange={(e) =>
                            handleInputChange(
                              "facilities",
                              "processingFacility",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          Processing Facility
                        </span>
                      </label>

                      {/* Cold Storage */}
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.facilities.coldStorage}
                          onChange={(e) =>
                            handleInputChange(
                              "facilities",
                              "coldStorage",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          Cold Storage
                        </span>
                      </label>

                      {/* Packing Facility */}
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.facilities.packingFacility}
                          onChange={(e) =>
                            handleInputChange(
                              "facilities",
                              "packingFacility",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          Packing Facility
                        </span>
                      </label>

                      {/* Quality Testing Lab */}
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.facilities.qualityTestingLab}
                          onChange={(e) =>
                            handleInputChange(
                              "facilities",
                              "qualityTestingLab",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          Quality Testing Lab
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================== Media Section ===================== */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Farm Media
                </h4>

                <div className="space-y-4">
                  {/* ---------------- Farm Images ---------------- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Images
                    </label>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload("images", e.target.files)
                        }
                        className="hidden"
                        id="farm-images"
                      />

                      <label
                        htmlFor="farm-images"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <FaUpload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload farm images
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG up to 10 MB each
                        </span>
                      </label>
                    </div>

                    {mediaFiles.images.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {mediaFiles.images.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">
                                {file.name}
                              </p>

                              <input
                                type="text"
                                placeholder="Add description..."
                                value={mediaDescriptions.images[index] || ""}
                                onChange={(e) =>
                                  updateMediaDescription(
                                    "images",
                                    index,
                                    e.target.value
                                  )
                                }
                                className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeMediaFile("images", index)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ---------------- Farm Videos ---------------- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Videos
                    </label>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={(e) =>
                          handleFileUpload("videos", e.target.files)
                        }
                        className="hidden"
                        id="farm-videos"
                      />

                      <label
                        htmlFor="farm-videos"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <FaUpload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload farm videos
                        </span>
                        <span className="text-xs text-gray-500">
                          MP4, MOV up to 50 MB each
                        </span>
                      </label>
                    </div>

                    {mediaFiles.videos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {mediaFiles.videos.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">
                                {file.name}
                              </p>

                              <input
                                type="text"
                                placeholder="Add description..."
                                value={mediaDescriptions.videos[index] || ""}
                                onChange={(e) =>
                                  updateMediaDescription(
                                    "videos",
                                    index,
                                    e.target.value
                                  )
                                }
                                className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeMediaFile("videos", index)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/farmer/farms"
            className="inline-flex items-center text-green-600 hover:text-green-700"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Farms
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep >= step.id
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-300 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <FaCheck className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {renderStepContent()}

            {/* Error Display */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.submit}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                  currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating Farm...
                      </>
                    ) : (
                      "Create Farm"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFarm;
