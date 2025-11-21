import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaTractor,
  FaHandshake,
  FaShieldAlt,
  FaChartLine,
  FaUsers,
  FaLeaf,
} from "react-icons/fa";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FaHandshake,
      title: "Secure Contracts",
      description:
        "Digital contracts with legal validity and transparent terms for both farmers and buyers.",
    },
    {
      icon: FaShieldAlt,
      title: "Trust & Security",
      description:
        "Built-in verification system and secure payment processing for peace of mind.",
    },
    {
      icon: FaChartLine,
      title: "Market Insights",
      description:
        "Real-time market data and pricing information to make informed decisions.",
    },
    {
      icon: FaUsers,
      title: "Community Support",
      description:
        "Connect with a network of farmers, buyers, and agricultural experts.",
    },
    {
      icon: FaLeaf,
      title: "Sustainable Farming",
      description:
        "Promote sustainable agricultural practices and organic farming methods.",
    },
    {
      icon: FaTractor,
      title: "Modern Agriculture",
      description:
        "Leverage technology to modernize farming practices and increase productivity.",
    },
  ];

  return (
    <div className="min-h-screen">
      {" "}
      {/* Hero Section */}{" "}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contract Farming for{" "}
              <span className="block text-green-200"> Jammu & Kashmir </span>{" "}
            </h1>{" "}
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Connecting farmers and buyers through transparent, secure, and
              profitable contract farming agreements.Build sustainable
              partnerships for better agriculture.{" "}
            </p>
            {!user ? (
              <div className="flex justify-center">
                <Link
                  to="/login"
                  className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started{" "}
                </Link>{" "}
              </div>
            ) : (
              <div className="flex justify-center">
                <Link
                  to={`/${user.role}/dashboard`}
                  className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard{" "}
                </Link>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </section>
      {/* Features Section */}{" "}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Contract Farming ?
            </h2>{" "}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides a comprehensive solution for modern
              agricultural partnerships, ensuring benefits for both farmers and
              buyers.{" "}
            </p>{" "}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {" "}
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                    <IconComponent className="h-6 w-6 text-green-600" />
                  </div>{" "}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {" "}
                    {feature.title}{" "}
                  </h3>{" "}
                  <p className="text-gray-600"> {feature.description} </p>{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </div>{" "}
      </section>
      {/* How It Works Section */}{" "}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works{" "}
            </h2>{" "}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to get started with contract farming{" "}
            </p>{" "}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {" "}
            {/* For Farmers */}{" "}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {" "}
                For Farmers{" "}
              </h3>{" "}
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1{" "}
                  </div>{" "}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {" "}
                      Login & Add Farms{" "}
                    </h4>{" "}
                    <p className="text-gray-600">
                      {" "}
                      Access your profile and add details about your farms,
                      crops, and farming practices.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2{" "}
                  </div>{" "}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {" "}
                      Create Contracts{" "}
                    </h4>{" "}
                    <p className="text-gray-600">
                      {" "}
                      List your crops with pricing, quality standards, and
                      delivery terms.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3{" "}
                  </div>{" "}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {" "}
                      Get Connected{" "}
                    </h4>{" "}
                    <p className="text-gray-600">
                      {" "}
                      Buyers will review and accept your contracts for
                      guaranteed sales.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
            {/* For Buyers */}{" "}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {" "}
                For Buyers{" "}
              </h3>{" "}
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1{" "}
                  </div>{" "}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {" "}
                      Browse Contracts{" "}
                    </h4>{" "}
                    <p className="text-gray-600">
                      {" "}
                      Explore available contracts filtered by crop type,
                      location, and quality.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2{" "}
                  </div>{" "}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {" "}
                      Accept & Negotiate{" "}
                    </h4>{" "}
                    <p className="text-gray-600">
                      {" "}
                      Accept contracts or negotiate terms directly with farmers.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3{" "}
                  </div>{" "}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {" "}
                      Secure Supply{" "}
                    </h4>{" "}
                    <p className="text-gray-600">
                      {" "}
                      Get guaranteed supply of quality produce at agreed prices.{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>
      {/* CTA Section */}{" "}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Agriculture ?
          </h2>{" "}
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and buyers who are already benefiting from
            transparent and secure contract farming.{" "}
          </p>
          {!user && (
            <div className="flex justify-center">
              <Link
                to="/login"
                className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Login to Get Started{" "}
              </Link>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
};

export default Home;
