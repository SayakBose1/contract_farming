import React, { useState } from 'react';
import { FaTractor, FaUser, FaPhone, FaLock, FaUserTie, FaArrowRight, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    mobile_number: '',
    pass_key: '',
    confirm_pass_key: '',
    user_type: 'F'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const userTypes = [
    { value: 'F', label: 'Farmer', icon: '🌾', desc: 'Grow and sell produce' },
    { value: 'T', label: 'Trader', icon: '🤝', desc: 'Buy and trade goods' },
    { value: 'FT', label: 'Both', icon: '⚡', desc: 'Farmer & Trader' }
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.mobile_number))
      e.mobile_number = 'Enter a valid 10-digit mobile number';
    if (!/^\d{4}$/.test(form.pass_key))
      e.pass_key = 'Passkey must be 4 digits';
    if (form.pass_key !== form.confirm_pass_key)
      e.confirm_pass_key = 'Passkeys do not match';
    if (!['F', 'T', 'FT'].includes(form.user_type))
      e.user_type = 'Select a valid user type';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        mobile_number: form.mobile_number.trim(),
        pass_key: form.pass_key.trim(),
        user_type: form.user_type
      };

      const res = await authAPI.signupStep1(payload);
      const userId = res.data.user_id;

      localStorage.setItem('signup_mobile', payload.mobile_number);
      localStorage.setItem('signup_pass', payload.pass_key);

      toast.success('Account created — continue to complete profile!');
      navigate(`/signup/details/${userId}`);

    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated BG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="w-full max-w-lg relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Join Us Today</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-90">

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <FaUser className="text-gray-400" />
                </span>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl ${
                    errors.full_name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  placeholder="Your full name"
                />
              </div>
              {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <FaPhone className="text-gray-400" />
                </span>
                <input
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl ${
                    errors.mobile_number ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  placeholder="Enter mobile number"
                />
              </div>
              {errors.mobile_number && <p className="text-red-500 text-sm">{errors.mobile_number}</p>}
            </div>

            {/* Passkey */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Passkey (4 digits)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <FaLock className="text-gray-400" />
                </span>

                <input
                  name="pass_key"
                  type={showPass ? "text" : "password"}
                  value={form.pass_key}
                  onChange={handleChange}
                  maxLength={4}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl ${
                    errors.pass_key ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  placeholder="4-digit passkey"
                />

                <span
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.pass_key && <p className="text-red-500 text-sm">{errors.pass_key}</p>}
            </div>

            {/* Confirm Passkey */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Confirm Passkey</label>
              <div className="relative">

                <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <FaLock className="text-gray-400" />
                </span>

                <input
                  name="confirm_pass_key"
                  type={showConfirmPass ? "text" : "password"}
                  value={form.confirm_pass_key}
                  onChange={handleChange}
                  maxLength={4}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl ${
                    errors.confirm_pass_key ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  placeholder="Re-enter passkey"
                />

                <span
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.confirm_pass_key && (
                <p className="text-red-500 text-sm">{errors.confirm_pass_key}</p>
              )}
            </div>

            {/* User Type Boxes */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                I am a
              </label>
              <div className="grid grid-cols-3 gap-3">
                {userTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, user_type: type.value }))}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 
                      ${form.user_type === type.value
                        ? 'border-green-500 bg-green-50 shadow'
                        : 'border-gray-200 bg-white hover:border-green-300'}
                    `}
                  >
                    {form.user_type === type.value && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </span>
                    )}

                    <div className="text-3xl mb-1">{type.icon}</div>
                    <p className="text-sm font-semibold">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold shadow-lg"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-green-600 font-semibold">Sign In</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
