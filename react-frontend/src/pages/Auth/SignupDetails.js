import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import axios from "axios";

import {
  FaTractor,
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaMale,
  FaFemale,
  FaUserAlt,
  FaIdCard,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
} from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5005";

const SignupDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // -------------------------------------------------------
  // FORM STATE
  // -------------------------------------------------------
  const [form, setForm] = useState({
    email_id: "",
    age: "",
    gender: "M",
    voter_id: "",
    division_id: "",
    district_id: "",
    tehsil_id: "",
    block_id: "",
    education_level_id: "",
    experience_years: "",
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // -------------------------------------------------------
  // MASTER DATA STATE
  // -------------------------------------------------------
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);

  // -------------------------------------------------------
  // LOAD MASTER DATA
  // -------------------------------------------------------
  useEffect(() => {
    loadDivisions();
    loadEducation();
  }, []);

  // -------------------------------------------------------
  // LOAD DIVISIONS   (Correct route: /locations/divisions)
  // -------------------------------------------------------
  const loadDivisions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/locations/divisions`);
      setDivisions(res.data.divisions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load divisions");
    }
  };

  // When division changes → load districts
  useEffect(() => {
    if (form.division_id) loadDistricts(form.division_id);
  }, [form.division_id]);

  const loadDistricts = async (divisionId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/locations/divisions/${divisionId}/districts`
      );
      setDistricts(res.data.districts || []);
      setTehsils([]);
      setBlocks([]);

      setForm((p) => ({
        ...p,
        district_id: "",
        tehsil_id: "",
        block_id: "",
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load districts");
    }
  };

  // When district changes → load tehsils
  useEffect(() => {
    if (form.district_id) loadTehsils(form.district_id);
    if (form.district_id) loadBlocks(form.district_id);
  }, [form.district_id]);

  const loadTehsils = async (districtId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/locations/districts/${districtId}/tehsils`
      );
      setTehsils(res.data.tehsils || []);
      setForm((p) => ({ ...p, tehsil_id: "" }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tehsils");
    }
  };

  const loadBlocks = async (districtId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/locations/districts/${districtId}/blocks`
      );
      setBlocks(res.data.blocks || []);
      setForm((p) => ({ ...p, block_id: "" }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blocks");
    }
  };

  // -------------------------------------------------------
  // LOAD EDUCATION (Only master route)
  // -------------------------------------------------------
  const loadEducation = async () => {
    try {
      const res = await axios.get(`${API_BASE}/master/education`);
      setEducationLevels(res.data.education_levels || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load education levels");
    }
  };

  // -------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // -------------------------------------------------------
  // SUBMIT
  // -------------------------------------------------------
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
        division_id: Number(form.division_id),
        district_id: Number(form.district_id),
        tehsil_id: Number(form.tehsil_id),
        block_id: Number(form.block_id),
        education_level_id: Number(form.education_level_id),
        experience_years: form.experience_years
          ? Number(form.experience_years)
          : null,
      };

      await authAPI.signupStep2(userId, payload);

      toast.success("Signup completed! Please login.");
      localStorage.removeItem("signup_mobile");
      localStorage.removeItem("signup_pass");

      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // STEP TITLES
  // -------------------------------------------------------
  const steps = [
    { id: 1, title: "Personal Info", icon: FaUser },
    { id: 2, title: "Location", icon: FaMapMarkerAlt },
    { id: 3, title: "Professional", icon: FaBriefcase },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl mb-4">
            <FaTractor className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Complete Profile</h1>
          <p className="text-gray-600">Few more details required</p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg scale-110"
                        : "bg-gray-200"
                    }`}
                  >
                    <step.icon
                      className={`text-xl ${
                        currentStep >= step.id ? "text-white" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-2 text-sm font-semibold ${
                      currentStep >= step.id
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 mb-6">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentStep > step.id
                          ? "bg-gradient-to-r from-green-500 to-emerald-600"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CARD CONTAINER */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 bg-opacity-90 backdrop-blur-sm">
          {/* ------------------------------- */}
          {/* STEP 1: PERSONAL INFO */}
          {/* ------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-slide-in">
              {/* Email & Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
                    <input
                      name="email_id"
                      type="email"
                      value={form.email_id}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 rounded-xl hover:border-green-300"
                      placeholder="you@email..."
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">Age</label>
                  <input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl hover:border-green-300"
                    placeholder="Age"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Gender
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "M",
                      label: "Male",
                      icon: <FaMale className="text-green-600 text-2xl" />,
                    },
                    {
                      value: "F",
                      label: "Female",
                      icon: <FaFemale className="text-pink-500 text-2xl" />,
                    },
                    {
                      value: "O",
                      label: "Other",
                      icon: <FaUserAlt className="text-indigo-500 text-2xl" />,
                    },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, gender: g.value }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        form.gender === g.value
                          ? "border-green-500 bg-green-50 shadow-lg scale-105"
                          : "border-gray-200 bg-white hover:border-green-300"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        {g.icon}
                        <span className="mt-1 text-sm font-semibold">
                          {g.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voter ID */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Voter ID</label>
                <div className="relative">
                  <FaIdCard className="absolute left-4 top-4 text-gray-400" />
                  <input
                    name="voter_id"
                    value={form.voter_id}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 rounded-xl hover:border-green-300"
                    placeholder="Enter voter ID"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------- */}
          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-slide-in">
              {/* Address field added */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl hover:border-green-300"
                  placeholder="Full address"
                />
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border-2 border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                {/* Division */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    Division
                  </label>
                  <select
                    name="division_id"
                    value={form.division_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 rounded-xl hover:border-green-300"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((d) => (
                      <option key={d.division_id} value={d.division_id}>
                        {d.division_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    District
                  </label>
                  <select
                    name="district_id"
                    value={form.district_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 rounded-xl hover:border-green-300"
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.district_id} value={d.district_id}>
                        {d.district_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tehsil */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">Tehsil</label>
                  <select
                    name="tehsil_id"
                    value={form.tehsil_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 rounded-xl hover:border-green-300"
                  >
                    <option value="">Select Tehsil</option>
                    {tehsils.map((t) => (
                      <option key={t.tehsil_id} value={t.tehsil_id}>
                        {t.tehsil_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Block */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">Block</label>
                  <select
                    name="block_id"
                    value={form.block_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 rounded-xl hover:border-green-300"
                  >
                    <option value="">Select Block</option>
                    {blocks.map((b) => (
                      <option key={b.block_id} value={b.block_id}>
                        {b.block_id}
                        {" - "}
                        {b.block_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------- */}
          {/* STEP 3: PROFESSIONAL */}
          {/* ------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    Education
                  </label>
                  <div className="relative">
                    <FaGraduationCap className="absolute left-4 top-4 text-gray-400" />
                    <select
                      name="education_level_id"
                      value={form.education_level_id}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 rounded-xl hover:border-green-300"
                    >
                      <option value="">Select Education Level</option>
                      {educationLevels.map((e) => (
                        <option
                          key={e.education_level_id}
                          value={e.education_level_id}
                        >
                          {e.education_level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    Farming Experience (Years)
                  </label>
                  <div className="relative">
                    <FaBriefcase className="absolute left-4 top-4 text-gray-400" />
                    <input
                      name="experience_years"
                      type="number"
                      value={form.experience_years}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 rounded-xl hover:border-green-300"
                      placeholder="Years of experience"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                <h3 className="font-semibold text-green-700">
                  Review Before Submit
                </h3>
                <p className="text-sm text-green-600">
                  You can go back anytime and update information before final
                  submission.
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------- */}
          {/* BUTTONS */}
          {/* ------------------------------- */}
          <div className="flex items-center justify-between mt-10 border-t pt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>Next</span>
                <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Submitting..." : "Complete Profile"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SignupDetails;
