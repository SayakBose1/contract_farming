import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300"> 404 </h1>{" "}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {" "}
            Page Not Found{" "}
          </h2>{" "}
          <p className="text-gray-600 mb-8">
            The page you 're looking for doesn' t exist or has been moved.{" "}
          </p>{" "}
        </div>
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FaHome className="mr-2 h-4 w-4" />
            Go Home{" "}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Go Back{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default NotFound;
