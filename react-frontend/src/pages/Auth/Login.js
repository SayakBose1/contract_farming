import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash, FaTractor, FaArrowRight } from "react-icons/fa";
import toast from "react-hot-toast";

const Login = () => {
  const { login, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    mobile_number: "",
    pass_key: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear field-specific error on typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ---------------------- VALIDATION ----------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.mobile_number)
      newErrors.mobile_number = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.mobile_number))
      newErrors.mobile_number = "Enter a valid 10-digit mobile number";

    if (!formData.pass_key)
      newErrors.pass_key = "Passkey is required";
    else if (!/^\d{4}$/.test(formData.pass_key))
      newErrors.pass_key = "Passkey must be 4 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------- SUBMIT LOGIN ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData.mobile_number, formData.pass_key);

    if (result.success) {
      toast.success("Login successful!");

      if (rememberMe) {
        localStorage.setItem("saved_mobile", formData.mobile_number);
      } else {
        localStorage.removeItem("saved_mobile");
      }

    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const isLoading = authLoading;

  // --------------------------------------------------------
  // UI COMPONENT
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl mb-4 transform hover:scale-110 transition">
            <FaTractor className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 bg-opacity-90 backdrop-blur-sm hover:scale-[1.02] transition transform duration-300">

          {/* Mobile Number */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
            <div className="relative">
              <input
                name="mobile_number"
                type="tel"
                maxLength={10}
                value={formData.mobile_number}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl
                  focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                  ${errors.mobile_number ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-green-300"}`}
                placeholder="Enter your 10-digit mobile number"
              />
            </div>
            {errors.mobile_number && (
              <p className="text-red-500 text-sm animate-shake">{errors.mobile_number}</p>
            )}
          </div>

          {/* Passkey */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700">Passkey</label>
            <div className="relative">
              <input
                name="pass_key"
                type={showPassword ? "text" : "password"}
                maxLength={4}
                value={formData.pass_key}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl pr-12
                  focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                  ${errors.pass_key ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-green-300"}`}
                placeholder="Enter your 4-digit passkey"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-400 hover:text-green-600" />
                ) : (
                  <FaEye className="text-gray-400 hover:text-green-600" />
                )}
              </button>
            </div>

            {errors.pass_key && (
              <p className="text-red-500 text-sm animate-shake">{errors.pass_key}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>

            <a href="/forgot-password" className="text-sm text-green-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl
              font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95
              transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>

          {/* Signup Link */}
          <p className="text-center text-gray-600 mt-6">
            Don’t have an account?
            <a href="/signup" className="text-green-600 ml-1 hover:underline">Create one</a>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Secure login powered by end-to-end encryption
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;
