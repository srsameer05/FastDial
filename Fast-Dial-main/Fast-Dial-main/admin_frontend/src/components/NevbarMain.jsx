import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Bell from "../assets/Bell.png";
import Setpricing from "../pages/admin/Setpricing";
import logo from "../assets/Quick Serve 5.png";
import profile from "../assets/profile.png";

const NavbarMain = () => {
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fetch admin name from localStorage
  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleConfirm = () => {
    setIsPopupOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm px-8 py-2 flex items-center justify-between border-b position-fixed">
      <div className="flex items-center space-x-2">
        <img src={logo} alt="Fastdial Logo" className="h-[53px] w-full " />
      </div>

      <h1 className="text-lg font-semibold mr-[64%] ml-3">Manage Vendor</h1>

      <div className="flex items-center space-x-4">
        <img src={Bell} alt="bell" className="mr-[10px]" />
        <div className="flex items-center space-x-3 ">
          {/* <img
            src={profile}
            alt="Admin"
            className="h-8 w-8 rounded-full border mb-[5px]"
          /> */}
          <div>
            <p className="text-sm font-medium mb-[0px] mt-[5px]">{adminName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
      {isPopupOpen && <Setpricing onConfirm={handleConfirm} onCancel={handleClosePopup} />}
    </nav>
  );
};

export default NavbarMain;