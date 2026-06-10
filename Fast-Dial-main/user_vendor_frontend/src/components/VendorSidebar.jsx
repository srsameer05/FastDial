
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import speed from "../assets/Speeda.svg";
import speedb from "../assets/Speedometer.svg";
import req from "../assets/Check.svg";
import reqb from "../assets/Checkb.svg";
import mess from "../assets/Dots.svg";
import messb from "../assets/Dotsb.svg";
import acc from "../assets/User.svg";
import accb from "../assets/Userb.svg";
import out from "../assets/SignOut.svg";
import profileImg from "../assets/profile.png"; // Updated to profile.png
import VendorLogout from "../pages/vendor/VendorLogout"; // Adjust path

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch vendor data from Redux store
  const { vendor, profile, profileLoading } = useSelector((state) => state.vendor);

  // Determine the vendor name and image
  const vendorName = profile?.vendor_name || vendor?.name || "Vendor Name"; // Fallback to "Vendor Name"
  const vendorImage = profile?.image_url?.[0] || profileImg; // Use first image or fallback to profile.png

  const handleLogoutClick = () => {
    console.log("handleLogoutClick called in Sidebar");
    setIsLogoutOpen(true);
  };

  const handleLogoutConfirm = () => {
    console.log("handleLogoutConfirm called in Sidebar");
    setIsLogoutOpen(false);
    navigate("/vendorlogin", { replace: true });
  };

  const handleLogoutCancel = () => {
    console.log("handleLogoutCancel called in Sidebar");
    setIsLogoutOpen(false);
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex flex-col justify-between w-6 h-5 bg-transparent border-none cursor-pointer"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="w-full h-[2px] bg-black"></span>
        <span className="w-full h-[2px] bg-black"></span>
        <span className="w-full h-[2px] bg-black"></span>
      </button>

      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`bg-white pt-6 pl-10 shadow-md transition-all duration-300 ease-in-out
          fixed top-0 h-screen w-[250px] z-40
          ${isMobileMenuOpen ? 'left-0' : '-left-[250px]'}
          md:relative md:left-0 md:w-[15%] md:h-full
        `}
      >
        <div className="flex items-center space-x-3 mb-6">
          <img
            src={vendorImage}
            alt="Vendor"
            className="h-10 w-10 rounded-full border object-cover"
            onError={(e) => (e.target.src = profileImg)} // Fallback to profile.png if image URL fails
          />
          <div>
            {profileLoading ? (
              <p className="text-base font-medium m-0 pt-[10px]">Loading...</p>
            ) : (
              <p className="text-base font-medium m-0 pt-[10px]">{vendorName}</p>
            )}
            <p className="text-sm text-gray-500">Vendor</p>
          </div>
        </div>

        <ul className="space-y-4 mt-[20%] p-0">
          <li
            className={`cursor-pointer pb-[25px] ${
              location.pathname === "/vendordashboard"
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/vendordashboard")}
          >
            <img
              src={location.pathname === "/vendordashboard" ? speedb : speed}
              alt="Dashboard"
              className="h-6 w-6 inline-block mr-3 transition-opacity duration-300"
            />
            Dashboard
          </li>
          <li
            className={`cursor-pointer pb-[25px] ${
              location.pathname === "/vendorrequests"
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/vendorrequests")}
          >
            <img
              src={location.pathname === "/vendorrequests" ? reqb : req}
              alt="Requests"
              className="h-6 w-6 inline-block mr-3 transition-opacity duration-300"
            />
            Requests
          </li>
          <li
            className={`cursor-pointer pb-[25px] ${
              location.pathname === "/vendormessages"
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/vendormessages")}
          >
            <img
              src={location.pathname === "/vendormessages" ? messb : mess}
              alt="Messages"
              className="h-6 w-6 inline-block mr-3 transition-opacity duration-300"
            />
            Messages
          </li>
          <li
            className={`cursor-pointer pb-[25px] ${
              location.pathname === "/vendoraccount"
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/vendoraccount")}
          >
            <img
              src={location.pathname === "/vendoraccount" ? accb : acc}
              alt="Account"
              className="h-6 w-6 inline-block mr-3 transition-opacity duration-300"
            />
            Account
          </li>
          <li
            className="cursor-pointer pb-[25px] text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            onClick={handleLogoutClick}
          >
            <img
              src={out}
              alt="Logout"
              className="h-6 w-6 inline-block mr-3 transition-opacity duration-300"
            />
            Logout
          </li>
        </ul>
      </aside>

      {isLogoutOpen && (
        <VendorLogout onConfirm={handleLogoutConfirm} onCancel={handleLogoutCancel} />
      )}

      <style jsx>{`
        .transition-colors {
          transition-property: color;
          transition-duration: 0.3s;
          transition-timing-function: ease-in-out;
        }
        .transition-opacity {
          transition-property: opacity;
          transition-duration: 0.3s;
          transition-timing-function: ease-in-out;
        }
        aside {
          transition-property: width, left;
          transition-duration: 0.3s;
          transition-timing-function: ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
