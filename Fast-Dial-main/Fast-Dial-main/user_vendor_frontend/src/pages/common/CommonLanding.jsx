 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fastdialLogo from '../../assets/Quick Serve 5.png';
import mobileImage1 from '../../assets/Mobile.png';
import mobileImage2 from '../../assets/Mobile2.svg';

const CommonLanding = () => {
  const navigate = useNavigate();
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        html, body {
          overflow-x: hidden; /* Prevent horizontal scrollbar */
          overflow-y: auto; /* Allow vertical scrolling */
          -webkit-overflow-scrolling: touch; /* Smooth scrolling on mobile */
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
        html, body {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .click-scale {
          transition: transform 0.2s ease-in-out;
        }
        .click-scale:active {
          transform: scale(0.95);
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
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#4285F4] to-[#7AACFF]">
        {/* Header */}
        <div className="w-[90%] max-w-7xl mx-auto mt-4 sm:mt-6 md:mt-10 h-16 sm:h-[70px] flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg">
          <img src={fastdialLogo} alt="Fastdial Logo" className="h-10 sm:h-12 md:h-[55px] ml-2 sm:ml-3" />
          <div className="relative">
            <button
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              className="bg-[#4285F4] text-white px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#7AACFF] transition duration-300 click-scale flex items-center"
            >
              Login
              <svg
                className="w-4 h-4 ml-1 sm:ml-2"
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
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg z-10 fade-in">
                <button
                  onClick={() => {
                    navigate('/vendorlogin');
                    setIsLoginDropdownOpen(false);
                  }}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm sm:text-base"
                >
                  Vendor Login
                </button>
                <button
                  onClick={() => {
                    navigate('/Home');
                    setIsLoginDropdownOpen(false);
                  }}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm sm:text-base"
                >
                  User Login
                </button>
                {/* <button
                  onClick={() => {
                    navigate('/adminlogin');
                    setIsLoginDropdownOpen(false);
                  }}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm sm:text-base"
                >
                  Admin Login
                </button> */}
              </div>
            )}
          </div>
        </div>

        {/* Main Content (Blue Section) */}
        <div className="w-[90%] max-w-5xl mx-auto pt-4 sm:pt-6 pb-6 sm:pb-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-lg text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              MULTIPLE SERVICES, ONE APP QUICK SERVE HAS YOU COVERED
            </h1>
            <p className="text-white text-base sm:text-lg mb-6 sm:mb-8">
              Find multiple services effortlessly with QUICK SERVE—your one-stop solution for quick, reliable, and professional assistance at your fingertips.
            </p>
            <button
              onClick={() => navigate('/Home')}
              className="bg-white text-[#4285F4] px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition duration-300 click-scale"
            >
              Find Service
            </button>
          </div>

          <div className="flex-1">
            <img
              src={mobileImage1}
              alt="FastDial App on Phone"
              className="w-full h-auto md:w-[140%] md:max-w-[1000px]"
            />
          </div>
        </div>

        {/* White Section */}
        <div className="flex flex-col bg-gradient-to-b from-white to-[rgba(255,180,77,0.2)]">
          <div className="w-[90%] max-w-7xl mx-auto py-8 sm:py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="max-w-md md:max-w-2xl">
              <img
                src={mobileImage2}
                alt="FastDial App on Phone with Service Card"
                className="w-full h-auto"
              />
            </div>

            <div className="max-w-lg text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4285F4] mb-4 sm:mb-6">
                List Your Service with QUICK SERVE and reach more customers effortlessly!
              </h1>
              <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8">
                Vendors can showcase their services on our platform with ease. Reach a wider audience and grow your business effortlessly. List your offerings, manage bookings, and connect with clients. Join us today and expand your business opportunities.
              </p>
              <button
                onClick={() => navigate('/vendorlist')}
                className="bg-[#4285F4] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-[#7AACFF] transition duration-300 click-scale"
              >
                List your Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommonLanding;