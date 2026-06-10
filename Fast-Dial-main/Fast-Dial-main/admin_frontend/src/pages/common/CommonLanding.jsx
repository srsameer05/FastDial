import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fastdialLogo from '../../assets/Logo2.svg';
import mobileImage1 from '../../assets/Mobile.png'; // First mobile image (blue section)
import mobileImage2 from '../../assets/Mobile2.svg'; // Second mobile image (white section)

const CommonLanding = () => {
  const navigate = useNavigate();
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Blue Section */}
      <div
        className="flex flex-col min-h-screen"
        style={{
          background: 'linear-gradient(180deg, #4285F4 0%, #7AACFF 100%)',
        }}
      >
        {/* Header */}
        <div className="w-4/5 mx-auto mt-10 h-[70px] flex items-center justify-between p-2 bg-white rounded-lg">
          <img src={fastdialLogo} alt="Fastdial Logo" className="h-12" />
          <div className="relative">
            <button
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="bg-[#4285F4] text-white px-6 py-2 rounded-lg text-base font-semibold hover:bg-[#7AACFF] transition duration-300 click-scale flex items-center"
            >
              Login
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isLoginDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    navigate('/vendorlogin');
                    setIsLoginDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Vendor Login
                </button>
                <button
                  onClick={() => {
                    navigate('/User/Login');
                    setIsLoginDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  User Login
                </button>
                <button
                  onClick={() => {
                    navigate('/adminlogin');
                    setIsLoginDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content (Blue Section) */}
        <div className="w-4/5 mx-auto pt-[0px] pb-8 flex flex-1 items-center justify-between">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-white mb-6">
              MULTIPLE SERVICES, ONE APP FASTDIAL HAS YOU COVERED
            </h1>
            <p className="text-white text-lg mb-8">
              Find multiple services effortlessly with FastDial—your one-stop solution for quick, reliable, and professional assistance at your fingertips.
            </p>
            <button
              onClick={() => navigate('/Home')}
              className="bg-[#FFFFFF] text-[#4285F4] px-6 py-3 rounded-lg text-lg font-semibold transition duration-300 click-scale"
            >
              Find Service
            </button>
          </div>

          <div className="flex-1">
            <img
              src={mobileImage1}
              alt="FastDial App on Phone"
              className="" // Updated: Removed transform rotate-12
              style={{ width: '140%', maxWidth: '1000px', height: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* White Section */}
      <div
        className="flex flex-col bg-white"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 180, 77, 0.2) 100%)',
        }}
      >
        <div className="w-4/5 mx-auto py-16 flex items-center justify-between">
          <div className="max-w-2xl relative">
            <img
              src={mobileImage2}
              alt="FastDial App on Phone with Service Card"
              className="w-full h-auto"
            />
          </div>

          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-[#4285F4] mb-6">
              List Your Service with FastDial and reach more customers effortlessly!
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Vendors can showcase their services on our platform with ease. Reach a wider audience and grow your business effortlessly. List your offerings, manage bookings, and connect with clients. Join us today and expand your business opportunities.
            </p>
            <button
              onClick={() => navigate('/vendorlist')}
              className="bg-[#4285F4] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#7AACFF] transition duration-300 click-scale"
            >
              List your Service
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        /* Hide scrollbar for the entire page */
        html, body {
          overflow-x: hidden; /* Prevent horizontal scrollbar */
          overflow-y: auto; /* Allow vertical scrolling */
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
        html, body {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .click-scale {
          animation: clickScale 0.2s ease-in-out;
        }
        @keyframes clickScale {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CommonLanding;