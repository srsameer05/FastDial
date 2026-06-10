import React from "react";
import { useNavigate } from "react-router-dom";
import Logoutimg from "../../../assets/Logoutimg.png";

const LogoutUser = ({ onConfirm, onCancel }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    onConfirm(); 
    setTimeout(() => {
      window.location.href = "/home";
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-[9%] pt-[30px] pb-[3%] px-[5%] rounded-2xl shadow-lg text-center">
        <img
          src={Logoutimg}
          alt="logoutimage"
          className="ml-[140px] mb-[50px]"
        />
        <h2 className="text-xl font-semibold mb-9 pb-[5%]">
          Are you sure do you want to logout?
        </h2>
        <div className="flex justify-center space-x-7">
          <button
            onClick={onCancel}
            className="bg-white border border-blue-500 text-blue-500 px-3 py-3 rounded-md w-[40%] hover:bg-blue-500 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="bg-white border border-blue-500 text-blue-500 px-3 py-3 rounded-md w-[40%] hover:bg-blue-500 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutUser;