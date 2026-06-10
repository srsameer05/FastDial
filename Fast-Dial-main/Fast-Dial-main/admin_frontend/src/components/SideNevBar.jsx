import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import usersthree from "../assets/UsersThree.png";
import messages from "../assets/ChatTeardropDots.png";
import handcoins from "../assets/HandCoins.png";
import file from "../assets/File.png";
import logout from "../assets/SignOut.png";
import Logoutadmin from "../pages/admin/auth/Logoutadmin";
import usersthreehr from "../assets/UsersThreehr.png";
import messageshr from "../assets/ChatTeardropDotshr.png";
import filehr from "../assets/Filehr.png";
import handcoinshr from "../assets/HandCoinshr.png";
import logouthr from "../assets/SignOuthr.png";
import subactive from "../assets/subactive.png";
import subscription from "../assets/subscription.png";

const SideNevbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Fetch admin name from localStorage
  const adminName = localStorage.getItem("adminName") || "Admin";

  const [userthreee, setUserthreee] = useState(usersthree);
  const [messagesIcon, setMessagesIcon] = useState(messages);
  const [handcoinsIcon, setHandcoinsIcon] = useState(handcoins);
  const [fileIcon, setFileIcon] = useState(file);
  const [logoutIcon, setLogoutIcon] = useState(logout);
  const [subscriptionIcon, setSubscriptionIcon] = useState(subscription);

  // Handle icon hover states
  const handleUserthreeHr = () => setUserthreee(usersthreehr);
  const handleUserthree = () => setUserthreee(usersthree);

  const handleMessagesHr = () => setMessagesIcon(messageshr);
  const handleMessages = () => setMessagesIcon(messages);

  const handleHandcoinsHr = () => setHandcoinsIcon(handcoinshr);
  const handleHandcoins = () => setHandcoinsIcon(handcoins);

  const handleFileHr = () => setFileIcon(filehr);
  const handleFile = () => setFileIcon(file);

  const handleLogoutHr = () => setLogoutIcon(logouthr);
  const handleLogout = () => setLogoutIcon(logout);

  const handleSubscriptionHr = () => setSubscriptionIcon(subactive);
  const handleSubscription = () => setSubscriptionIcon(subscription);

  const handleLogoutNavigation = () => {
    navigate("/");
    localStorage.removeItem("adminName"); // Clear admin name on logout
  };

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutPopup(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className="w-[250px] bg-white pt-5 pl-9 shadow-md h-screen">
        <div className="flex items-center space-x-2 mb-5">
          <div>
            <p className="text-sm font-medium m-0 pt-[10px]">{adminName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>

        <ul className="space-y-3 mt-[20%] p-0">
          {/* Manage Vendor */}
          <li
            className={`cursor-pointer pb-[20px] ${
              isActive("/managevendor") ||
              isActive("/pendingapproval") ||
              isActive("/vendorpayments") ||
              isActive("/servicecategory")
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/managevendor")}
            onMouseEnter={handleUserthreeHr}
            onMouseLeave={handleUserthree}
          >
            <img
              src={
                isActive("/managevendor") ||
                isActive("/pendingapproval") ||
                isActive("/vendorpayments") ||
                isActive("/servicecategory")
                  ? usersthreehr
                  : userthreee
              }
              alt="Manage Vendor"
              className="h-5 w-5 inline-block mr-2"
            />
            Manage Vendors
          </li>

          {/* Messages */}
          <li
            className={`cursor-pointer pb-[20px] ${
              isActive("/messages")
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/messages")}
            onMouseEnter={handleMessagesHr}
            onMouseLeave={handleMessages}
          >
            <img
              src={isActive("/messages") ? messageshr : messagesIcon}
              alt="Messages"
              className="h-5 w-5 inline-block mr-2"
            />
            Messages
          </li>

          {/* User Details */}
          <li
            className={`cursor-pointer pb-[20px] ${
              isActive("/userdetails") || isActive("/userpaymentdetails")
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/userdetails")}
            onMouseEnter={handleHandcoinsHr}
            onMouseLeave={handleHandcoins}
          >
            <img
              src={
                isActive("/userdetails") || isActive("/userpaymentdetails")
                  ? handcoinshr
                  : handcoinsIcon
              }
              alt="User Details"
              className="h-5 w-5 inline-block mr-2"
            />
            User Details
          </li>

          {/* Complaints */}
          <li
            className={`cursor-pointer pb-[20px] ${
              isActive("/admincomplains")
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/admincomplains")}
            onMouseEnter={handleFileHr}
            onMouseLeave={handleFile}
          >
            <img
              src={isActive("/admincomplains") ? filehr : fileIcon}
              alt="Complaints"
              className="h-5 w-5 inline-block mr-2"
            />
            Complaints
          </li>

          <li
            className={`cursor-pointer pb-[20px] ${
              isActive("/subscriptions") || isActive("/addsubscriptions")
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={() => navigate("/subscriptions")}
            onMouseEnter={handleSubscriptionHr}
            onMouseLeave={handleSubscription}
          >
            <img
              src={
                isActive("/subscriptions") || isActive("/addsubscriptions")
                  ? subactive
                  : subscriptionIcon
              }
              alt="subscriptions"
              className="h-5 w-5 inline-block mr-2"
            />
            Subscriptions
          </li>

          {/* Logout */}
          <li
            className={`cursor-pointer pb-[20px] ${
              isActive("/logout")
                ? "text-[#4285F4]"
                : "text-gray-500 hover:text-[#4285F4] transition-colors duration-300"
            }`}
            onClick={handleLogoutClick}
            onMouseEnter={handleLogoutHr}
            onMouseLeave={handleLogout}
          >
            <img
              src={isActive("/logout") ? logouthr : logoutIcon}
              alt="Logout"
              className="h-5 w-5 inline-block mr-2"
            />
            Logout
          </li>
        </ul>
      </aside>

      {showLogoutPopup && (
        <Logoutadmin
          onConfirm={handleLogoutNavigation}
          onCancel={handleCancelLogout}
        />
      )}
    </>
  );
};

export default SideNevbar;