 import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector
import profileImg from "../assets/profile.png"; // Fallback image
import bell from "../assets/bell.svg";
import logo from "../assets/Quick Serve 5.png";
import { getVendorFreeTrialDetailsRequest } from "../saga/features/vendor/vendorSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor, profile, profileLoading, isAuthenticated, error, getVendorFreeTrialDetailsSuccess } = useSelector((state) => state.vendor);
  const dispatch = useDispatch();
  const vendorName = profile?.vendor_name || vendor?.name || "Vendor Name";
  const vendorImage = profile?.image_url?.[0] || profileImg;
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/vendordashboard":
        return "Dashboard";
      case "/vendorrequests":
        return "Requests";
      case "/vendormessages":
        return "Messages";
      case "/vendoraccount":
        return "Account";
      default:
        return "Dashboard";
    }
  };

  useEffect(() => {
    dispatch(getVendorFreeTrialDetailsRequest())
  }, [dispatch])


  const pageTitle = getPageTitle(location.pathname);


  const [isNotificationOpen, setIsNotificationOpen] = useState(false);


  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New Service Request Alert!",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      time: "2h",
    },
    {
      id: 2,
      message: "New Service Request Alert!",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      time: "1h",
    },
    {
      id: 3,
      message: "New Service Request Alert!",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      time: "1h",
    },
    {
      id: 4,
      message: "New Service Request Alert!",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      time: "1h",
    },
  ]);

  const prevAuthRef = useRef(false)
  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated) {
      setNotifications(prev => [
        {
          id: Date.now(),
          message: "Successfully Logged in",
          details: "You’re  credentials is authenticated and you are ready to go.",
          time: "just now",
        },
        ...prev,
      ]);
    }
    prevAuthRef.current = isAuthenticated;


  }, [isAuthenticated])


  const hasShownFreeTrialRef = useRef(false);
  // Show free trial notification only once
  useEffect(() => {
    if (!hasShownFreeTrialRef.current && getVendorFreeTrialDetailsSuccess?.start_date && getVendorFreeTrialDetailsSuccess?.expiry_date) {
      const startDate = new Date(getVendorFreeTrialDetailsSuccess.start_date);
      const expiryDate = new Date(getVendorFreeTrialDetailsSuccess.expiry_date);
      const today = new Date();

      const daysLeft = Math.max(0, Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)));

      const message = "You're currently on a Free Trial.";
      const details = `Your trial started on ${startDate.toDateString()}. You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left.`;
      console.log(message, details);

      setNotifications(prev => [
        {
          id: Date.now(),
          message,
          details,
          time: "just now",
        },
        ...prev,
      ]);
      hasShownFreeTrialRef.current = true; // prevent future repeats

    }
  }, [getVendorFreeTrialDetailsSuccess]);

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };


  const handleClearNotifications = () => {
    setNotifications([])
  };

  return (
    <>
      <nav className="bg-white shadow-sm pl-12 pr-4 md:px-8 py-2 flex items-center justify-between border-b relative">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Fastdial Logo" className="h-10 md:h-12 w-auto" />
        </div>

        <h1 className="text-base md:text-lg text-[#4285F4] font-semibold flex-1 ml-4 md:ml-1">{pageTitle}</h1>

        <div className="flex items-center space-x-2 md:space-x-4 relative">
          <img
            src={bell}
            alt="bell"
            className="mr-2 md:mr-[15px] cursor-pointer"
            onClick={handleBellClick}
          />
          <div className="flex items-center space-x-2 md:space-x-3">
            <img
              src={vendorImage}
              alt="Vendor"
              className="h-6 w-6 md:h-8 md:w-8 rounded-full border mb-0 md:mb-[5px] object-cover cursor-pointer"
              onError={(e) => (e.target.src = profileImg)}
              onClick={() => navigate("/vendoraccount")}
            />
            <div>
              {profileLoading ? (
                <p className="text-xs md:text-sm font-medium mb-[0px] mt-[5px]">Loading...</p>
              ) : (
                <p className="text-xs md:text-sm font-medium mb-[0px] mt-[5px]">{vendorName}</p>
              )}
              <p className="text-[10px] md:text-xs text-gray-500">Vendor</p>
            </div>
          </div>
        </div>

        {isNotificationOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setIsNotificationOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-[90%] max-w-[390px] max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
            >
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Notification</h2>
                <button
                  className="text-xs md:text-sm text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
                  onClick={handleClearNotifications}
                >
                  Clear
                </button>
              </div>
              {notifications.length ? <div className="text-gray-500 text-xs md:text-sm mb-4">TODAY</div> : <div>No Notifications </div>}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start mb-4 pb-2 border-b last:border-b-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#4285F4] bg-opacity-20 rounded-full flex items-center justify-center mr-2 md:mr-3">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-[#4285F4]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs md:text-sm font-medium text-black">{notification.message}</p>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1">{notification.details}</p>
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-500 ml-2">{notification.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;