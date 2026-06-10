 import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { vendorSignupRequest } from "../../../saga/features/vendor/vendorSlice";
import fastdialLogo from "../../../assets/Logo.svg";
import workman from "../../../assets/Workman.png";

const SignUp = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const vendorData = location.state || {};

  const handleSignUp = (e) => {
    e.preventDefault();
    const signupData = {
      ...vendorData,
      vendor_password: password,
    };
    console.log("Dispatching signup data:", signupData);
    dispatch(vendorSignupRequest(signupData));
    navigate("/vendorlogin");
  };

  return (
    <>
      <style jsx>{`
        .click-scale {
          transition: transform 0.2s ease-in-out;
        }
        .click-scale:active {
          transform: scale(0.95);
        }
        @media (max-width: 640px) {
          .image-section {
            display: none;
          }
          .form-section {
            width: 100%;
          }
        }
      `}</style>
      <div className="flex flex-col sm:flex-row h-screen">
        <div className="image-section w-full sm:w-1/2 h-48 sm:h-full overflow-hidden" style={{ backgroundColor: "#7AACFF" }}>
          <img src={workman} alt="Construction Worker" className="w-full h-full object-cover" />
        </div>
        <div className="form-section w-full sm:w-1/2 flex items-center justify-center" style={{ backgroundColor: "#7AACFF" }}>
          <div className="w-[90%] max-w-md p-4 sm:p-6 md:p-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img src={fastdialLogo} alt="Fastdial Logo" className="h-12 sm:h-14" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">Sign Up</h2>
            <p className="text-center text-white text-sm sm:text-base mb-4 sm:mb-6">Complete your signup with Quick Serve</p>
            <form className="bg-white p-4 sm:p-6 rounded-lg shadow-lg" onSubmit={handleSignUp}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={vendorData.vendor_name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm sm:text-base"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={vendorData.vendor_mobile || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm sm:text-base"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={vendorData.vendor_email || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm sm:text-base"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white py-2 rounded-lg hover:bg-[#7AACFF] transition duration-300 click-scale text-sm sm:text-base"
                style={{ backgroundColor: "#4285F4" }}
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;