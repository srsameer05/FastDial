import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const NotificationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: "Service Booked Successfully!",
      time: "1h",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 2,
      title: "Service Booked Successfully!",
      time: "1h",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 3,
      title: "Service Booked Successfully!",
      time: "1h",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 4,
      title: "Service Booked Successfully!",
      time: "1h",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-30">
      <div className="bg-white w-[600px] rounded-lg shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <IoMdClose size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Notification</h2>
        <div className="text-gray-500 text-sm font-medium mb-2">TODAY</div>

        {/* Notifications List */}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-3 py-4 border-b"
          >
            <div className="bg-orange-100 text-orange-500 p-2 rounded-full">
              <FaRegCheckCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-gray-600 text-sm">
                {notification.description}
              </p>
            </div>
            <div className="text-gray-400 text-xs">{notification.time}</div>
          </div>
        ))}

        {/* Clear Button */}
        <div className="text-right mt-4">
          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
