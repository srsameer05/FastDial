 import Sidebar from "../../../components/VendorSidebar";
import Navbar from "../../../components/VendorNavbar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SidebarMenu from "./SidebarMenu";
import ProfileSection from "./ProfileSection";
import EditServiceSection from "./EditServiceSection";
import RaiseIssueSection from "./RaiseIssueSection";
import BoostServiceSection from "./BoostServiceSection";
import HelpCenterSection from "./HelpCenterSection";

const VendorAccount = () => {
  const [activeSection, setActiveSection] = useState("Your Profile");
  const [mobileContentOpen, setMobileContentOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.vendor);

  useEffect(() => {
    console.log("VendorAccount useEffect - isAuthenticated:", isAuthenticated);
    if (!isAuthenticated) {
      console.log("VendorAccount: Not authenticated, redirecting to /vendorlogin");
      navigate("/vendorlogin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setMobileContentOpen(true);
    }
  }, []);

  if (!isAuthenticated) {
    console.log("VendorAccount rendering blocked - not authenticated");
    return null;
  }

  const handleSectionSelect = (section) => {
    setActiveSection(section);
    setMobileContentOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeSection === "Raise Issue") {
      console.log("Issue raised");
      alert("Issue submitted successfully!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-gray-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:gap-4 h-[94%]">
            <div className={`w-full md:w-[35%] ${mobileContentOpen ? 'hidden md:block' : 'block md:block'}`}>
              <SidebarMenu
                activeSection={activeSection}
                setActiveSection={handleSectionSelect}
              />
            </div>
            <div className={`w-full md:w-[65%] ${mobileContentOpen ? 'block' : 'hidden md:block'} bg-white rounded-lg shadow h-full p-4 md:p-8 mx-0 md:mx-3 overflow-y-auto scrollbar-hide slide-up`}>
              <button 
                className="md:hidden mb-4 text-[#4285F4] font-bold text-lg"
                onClick={() => setMobileContentOpen(false)}
              >
                ← Back to Menu
              </button>
              {activeSection === "Your Profile" && <ProfileSection />}
              {activeSection === "Edit Service Details" && (
                <div>
                  {console.log(
                    "Rendering EditServiceSection with activeSection:",
                    activeSection
                  )}
                  <EditServiceSection />
                </div>
              )}
              {activeSection === "Raise Issue" && (
                <RaiseIssueSection handleSubmit={handleSubmit} />
              )}
              {activeSection === "Subscription" && <BoostServiceSection />}
              {activeSection === "Help Center" && <HelpCenterSection />}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slide-up {
          animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default VendorAccount;