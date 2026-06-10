import React from "react";
import { useSelector } from "react-redux"; // Import useSelector
import profileImg from "../../../assets/profile.png"; // Fallback image
import pro from "../../../assets/UserCircle.svg";
import edit from "../../../assets/Pencil.svg";
import issue from "../../../assets/Note.svg";
import boost from "../../../assets/RocketLaunch.svg";
import help from "../../../assets/Mark.svg";

const SidebarMenu = ({ activeSection, setActiveSection }) => {
  // Fetch vendor data from Redux store
  const { profile } = useSelector((state) => state.vendor);

  // Determine the vendor image
  const vendorImage = profile?.image_url?.[0] || profileImg; // Use first image or fallback to profile.png

  return (
    <div className="bg-white rounded-lg shadow h-full p-8 flex flex-col justify-between">
      <div>
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src={vendorImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => (e.target.src = profileImg)} // Fallback to profile.png if image URL fails
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-[#4285F4] rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"
                ></path>
              </svg>
            </span>
          </div>
        </div>
        <ul className="space-y-6">
          {[
            { name: "Your Profile", icon: pro },
            { name: "Edit Service Details", icon: edit },
            { name: "Raise Issue", icon: issue },
            { name: "Subscription", icon: boost },
            { name: "Help Center", icon: help },
          ].map((item) => (
            <li key={item.name}>
              <button
                onClick={() => {
                  console.log(`SidebarMenu: Switching to ${item.name}`);
                  setActiveSection(item.name);
                }}
                className={`flex items-center justify-between w-full ${
                  activeSection === item.name
                    ? "text-[#4285F4]"
                    : "text-gray-600 hover:text-[#4285F4]"
                } text-lg font-medium`}
              >
                <span className="flex items-center">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`w-5 h-5 mr-2 rounded-full ${
                      activeSection === item.name ? "text-[#4285F4]" : ""
                    }`}
                  />
                  {item.name}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
              <hr className="mt-4 border-gray-200" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SidebarMenu;