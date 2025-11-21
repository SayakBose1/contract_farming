import React from "react";
import { FaTractor, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {" "}
          {/* Logo and Description */}{" "}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FaTractor className="h-8 w-8 text-green-500" />
              <span className="text-xl font-bold">
                {" "}
                Contract Farming J & K{" "}
              </span>{" "}
            </div>{" "}
            <p className="text-gray-300 mb-4">
              Connecting farmers and buyers in Jammu & Kashmir through
              transparent and secure contract farming agreements.Building a
              sustainable agricultural ecosystem for better livelihoods.{" "}
            </p>{" "}
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <FaMapMarkerAlt className="h-4 w-4" />
                <span> Jammu & Kashmir, India </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>
          {/* Quick Links */}{" "}
          <div>
            <h3 className="text-lg font-semibold mb-4"> Quick Links </h3>{" "}
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  About Us{" "}
                </a>{" "}
              </li>{" "}
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  How It Works{" "}
                </a>{" "}
              </li>{" "}
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  For Farmers{" "}
                </a>{" "}
              </li>{" "}
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  For Buyers{" "}
                </a>{" "}
              </li>{" "}
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  Support{" "}
                </a>{" "}
              </li>{" "}
            </ul>{" "}
          </div>
          {/* Contact Info */}{" "}
          <div>
            <h3 className="text-lg font-semibold mb-4"> Contact Us </h3>{" "}
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-300">
                <FaEnvelope className="h-4 w-4" />
                <span> support @contractfarming - jk.com </span>{" "}
              </li>{" "}
              <li className="flex items-center space-x-2 text-gray-300">
                <FaPhone className="h-4 w-4" />
                <span> +91 - XXXX - XXXXXX </span>{" "}
              </li>{" "}
            </ul>
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2"> Business Hours </h4>{" "}
              <p className="text-gray-300 text-sm">
                Monday - Friday: 9: 00 AM - 6: 00 PM <br />
                Saturday: 9: 00 AM - 2: 00 PM <br />
                Sunday: Closed{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>
        {/* Bottom Section */}{" "}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              {" "}
              ©2025 Contract Farming J & K.All rights reserved.{" "}
            </div>{" "}
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-300 hover:text-green-500 text-sm transition-colors"
              >
                Privacy Policy{" "}
              </a>{" "}
              <a
                href="#"
                className="text-gray-300 hover:text-green-500 text-sm transition-colors"
              >
                Terms of Service{" "}
              </a>{" "}
              <a
                href="#"
                className="text-gray-300 hover:text-green-500 text-sm transition-colors"
              >
                Cookie Policy{" "}
              </a>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </footer>
  );
};

export default Footer;
