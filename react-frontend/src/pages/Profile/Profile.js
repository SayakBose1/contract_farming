import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
    const { user, setUser } = useAuth();

    // Local form state
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        email_id: user?.email_id || "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            await axios.put(
                "http://localhost:5005/auth/profile",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Profile updated successfully!");

            // Update frontend user (address removed)
            setUser({
                ...user,
                full_name: formData.full_name,
                email_id: formData.email_id,
            });

        } catch (err) {
            alert("Update failed: " + err.response?.data?.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600">Manage your account information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Profile Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center">

                            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl font-bold">
                                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                                </span>
                            </div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                {user?.full_name || "User"}
                            </h2>

                            <p className="text-gray-600 break-words text-sm">
                                {user?.email_id}
                            </p>

                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2 capitalize">
                                {user?.user_type === "F" || user?.user_type === "FT"
                                    ? "Farmer"
                                    : user?.user_type === "T"
                                    ? "Trader"
                                    : user?.user_type === "A"
                                    ? "Admin"
                                    : "User"}
                            </span>

                        </div>
                    </div>

                    {/* Profile Details + Edit */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">

                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            Personal Information
                        </h3>

                        <form className="space-y-4" onSubmit={handleSubmit}>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    className="mt-1 block w-full border rounded-md px-3 py-2"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email_id"
                                    className="mt-1 block w-full border rounded-md px-3 py-2"
                                    value={formData.email_id}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="mt-1 block w-full border bg-gray-100 rounded-md px-3 py-2"
                                    value={user?.mobile_number}
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
                            >
                                Save Changes
                            </button>
                        </form>

                        {/* ACTIONS */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">
                                Account Actions
                            </h4>

                            <div className="space-y-2">
                                <button className="btn-secondary w-full">
                                    Change Password
                                </button>
                                <button className="btn-secondary w-full">
                                    Upload Digital Signature
                                </button>

                                {(user?.user_type === "F" || user?.user_type === "FT") && (
                                    <button className="btn-secondary w-full">
                                        Update Farming Details
                                    </button>
                                )}

                                {user?.user_type === "T" && (
                                    <button className="btn-secondary w-full">
                                        Update Business Details
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
