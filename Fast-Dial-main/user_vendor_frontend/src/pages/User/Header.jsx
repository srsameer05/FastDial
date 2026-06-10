 import { useState, useRef, useEffect } from "react";
import {
  FiUser,
  FiMapPin,
  FiHelpCircle,
  FiLock,
  FiLogOut,
  FiChevronRight,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MessageModal from "./MessageModal";
import ChatModal from "./ChatModal";
import NotificationModal from "./NotificationModal";
import LoginModal from "../../pages/User/Login/LoginModal";
import OtpModal from "../../pages/User/Login/OtpModal";
import ProfileModal from "../../pages/User/Login/ProfileModal";
import LocationModal from "../../pages/User/Login/LocationModal";
import ManualLocationModal from "../../pages/User/Login/ManualLocationModal";
import fastdia from "../../assets/Quick Serve 5.png";
import Vector from "../../assets/Vector.png";
import Wbell from "../../assets/Wbell.png";
import Admin from "../../assets/Admin.png";
import MagnifyingGlass from "../../assets/MagnifyingGlass.png";
import Location from "../../assets/Location.png";
import LogoutUser from "./Login/LogoutUser";
import NewProfileModal from "./Login/NewProfileModal";
import AutomaticLocationModal from "./Login/AutomaticLocationModal";

const getPendingCustomerRegistration = () => {
  try {
    const raw = localStorage.getItem("pending_customer_registration");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Header: failed to parse pending customer registration", error);
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpMobile, setOtpMobile] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isManualLocationModalOpen, setIsManualLocationModalOpen] = useState(false);
  const [isAutomaticLocationModal, setIsAutomaticLocationModal] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [formDataFromProfile, setFormDataFromProfile] = useState(() => getPendingCustomerRegistration());

  const handleFocus = () => setShowRecentSearches(true);
  const handleClose = () => setShowRecentSearches(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token") || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNewProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleOpenOtpModal = (mobile) => {
    setOtpMobile(mobile);
    setIsOtpModalOpen(true);
  };

  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleOpenLocationModal = () => setIsLocationModalOpen(true);
  const handleOpenManualLocationModal = () => setIsManualLocationModalOpen(true);
  const handleOpenAutomaticLocationModal = () => setIsAutomaticLocationModal(true);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-blue-200 p-4 flex justify-between items-center w-full">
        <img src={fastdia} alt="Fastdial Logo" className="h-[53px] ml-4 md:ml-7" />
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            {isMobileMenuOpen ? (
              <FiX className="h-8 w-8 text-blue-600" />
            ) : (
              <FiMenu className="h-8 w-8 text-blue-600" />
            )}
          </button>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {token && (
            <div className="flex gap-6 p-4">
              <button
                onClick={() => navigate("/home")}
                className={`text-${location.pathname === "/home" ? "black" : "blue"}-600 font-semibold relative group`}
              >
                Home
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${location.pathname === "/home" ? "w-full" : "w-0 group-hover:w-full"}`}
                ></span>
              </button>
              <button
                onClick={() => navigate("/MyBookings")}
                className={`text-${location.pathname === "/MyBookings" ? "black" : "blue"}-600 font-semibold relative group`}
              >
                Booking
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${location.pathname === "/MyBookings" ? "w-full" : "w-0 group-hover:w-full"}`}
                ></span>
              </button>
              <button
                onClick={() => navigate("/T&C")}
                className={`text-${location.pathname === "/T&C" ? "black" : "blue"}-600 font-semibold relative group`}
              >
                T&C
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ${location.pathname === "/T&C" ? "w-full" : "w-0 group-hover:w-full"}`}
                ></span>
              </button>
            </div>
          )}
          <button
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md"
            onClick={() => navigate("/vendorlist")}
          >
            List your service
          </button>
          {!token && (
            <>
              <button
                onClick={handleOpenLoginModal}
                className="bg-blue-600 text-white border border-white px-4 py-2 rounded-md"
              >
                Login
              </button>
              <button
                onClick={handleNewProfileModal}
                className="bg-blue-600 text-white border border-white px-4 py-2 rounded-md mr-6"
              >
                Sign Up
              </button>
            </>
          )}
          {token && (
            <div className="flex gap-4 items-center">
              <img
                src={Wbell}
                alt="Notification Bell"
                className="h-7 w-7 cursor-pointer"
                onClick={() => setIsNotificationModalOpen(true)}
              />
              <img
                onClick={() => setMessageModalOpen(true)}
                src={Vector}
                alt="Message"
                className="h-6 w-6 cursor-pointer"
              />
              <div className="relative admin-dropdown" ref={dropdownRef}>
                <img
                  src={Admin}
                  alt="Admin"
                  className="h-8 w-8 rounded-full cursor-pointer border border-gray-300"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg overflow-hidden z-50 transition-all duration-200">
                    <Link
                      to="/UserProfilePage"
                      className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 border-b"
                      onClick={handleOpenProfileModal}
                    >
                      <span className="flex items-center gap-3">
                        <FiUser className="text-gray-600" /> Your Profile
                      </span>
                      <FiChevronRight className="text-gray-400" />
                    </Link>
                    <Link
                      to="/UserProfilePage"
                      className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 border-b"
                    >
                      <span className="flex items-center gap-3">
                        <FiHelpCircle className="text-gray-600" /> Help Center
                      </span>
                      <FiChevronRight className="text-gray-400" />
                    </Link>
                    <Link
                      to="/UserProfilePage"
                      className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 border-b"
                    >
                      <span className="flex items-center gap-3">
                        <FiLock className="text-gray-600" /> Privacy & Policy
                      </span>
                      <FiChevronRight className="text-gray-400" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-gray-100"
                    >
                      <span className="flex items-center gap-3">
                        <FiLogOut className="text-gray-600" /> Logout
                      </span>
                      <FiChevronRight className="text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-200 p-4 flex flex-col gap-4">
          {token && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  navigate("/home");
                  setIsMobileMenuOpen(false);
                }}
                className={`text-${location.pathname === "/home" ? "black" : "blue"}-600 font-semibold text-left`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate("/MyBookings");
                  setIsMobileMenuOpen(false);
                }}
                className={`text-${location.pathname === "/MyBookings" ? "black" : "blue"}-600 font-semibold text-left`}
              >
                Booking
              </button>
              <button
                onClick={() => {
                  navigate("/T&C");
                  setIsMobileMenuOpen(false);
                }}
                className={`text-${location.pathname === "/T&C" ? "black" : "blue"}-600 font-semibold text-left`}
              >
                T&C
              </button>
            </div>
          )}
          <button
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md text-left"
            onClick={() => {
              navigate("/vendorlist");
              setIsMobileMenuOpen(false);
            }}
          >
            List your service
          </button>
          {!token && (
            <div className="flex flex-col gap-4">
              <button
                onClick={handleOpenLoginModal}
                className="bg-blue-600 text-white border border-white px-4 py-2 rounded-md text-left"
              >
                Login
              </button>
              <button
                onClick={handleNewProfileModal}
                className="bg-blue-600 text-white border border-white px-4 py-2 rounded-md text-left"
              >
                Sign Up
              </button>
            </div>
          )}
          {token && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setIsNotificationModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-blue-600"
              >
                <img src={Wbell} alt="Notification Bell" className="h-7 w-7" />
                Notifications
              </button>
              <button
                onClick={() => {
                  setMessageModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-blue-600"
              >
                <img src={Vector} alt="Message" className="h-6 w-6" />
                Messages
              </button>
              <div className="flex flex-col gap-2">
                <Link
                  to="/UserProfilePage"
                  className="flex items-center gap-3 text-blue-600"
                  onClick={() => {
                    handleOpenProfileModal();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <FiUser className="text-gray-600" /> Your Profile
                </Link>
                <Link
                  to="/UserProfilePage"
                  className="flex items-center gap-3 text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiHelpCircle className="text-gray-600" /> Help Center
                </Link>
                <Link
                  to="/UserProfilePage"
                  className="flex items-center gap-3 text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiLock className="text-gray-600" /> Privacy & Policy
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-blue-600 text-left"
                >
                  <FiLogOut className="text-gray-600" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render Modals */}
      {isLogoutModalOpen && (
        <LogoutUser
          onConfirm={() => setIsLogoutModalOpen(false)}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
      {isMessageModalOpen && (
        <MessageModal
          open={isMessageModalOpen}
          onClose={() => setMessageModalOpen(false)}
        />
      )}
      {isNotificationModalOpen && (
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      )}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onOpenOtpModal={handleOpenOtpModal}
        />
      )}
      {isOtpModalOpen && (
        <OtpModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          mobile={otpMobile}
          onOpenProfileModal={handleOpenProfileModal}
          onOpenLoginModal={handleOpenLoginModal}
        />
      )}
      {isProfileModalOpen && (
        <NewProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onOpenLocationModal={handleOpenAutomaticLocationModal}
          setFormDataFromProfile={setFormDataFromProfile}
        />
      )}
      {isLocationModalOpen && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onOpenManualLocationModal={handleOpenManualLocationModal}
        />
      )}
      {isManualLocationModalOpen && (
        <ManualLocationModal
          isOpen={isManualLocationModalOpen}
          onClose={() => setIsManualLocationModalOpen(false)}
          onOpenAutomaticLocationModal={handleOpenAutomaticLocationModal}
          setFormData={setFormDataFromProfile}
          formData={formDataFromProfile}
        />
      )}
      {isAutomaticLocationModal && (
        <AutomaticLocationModal
          isOpen={true}
          onClose={() => setIsAutomaticLocationModal(false)}
          onOpenManualLocationModal={handleOpenManualLocationModal}
          setFormData={setFormDataFromProfile}
          formData={formDataFromProfile}
        />
      )}
    </>
  );
};

export default Header;