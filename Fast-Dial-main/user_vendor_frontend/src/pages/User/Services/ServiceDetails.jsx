import { FaCommentDots, FaPhoneAlt } from "react-icons/fa";
import Footer from "../../User/Footer.jsx";

const ServiceDetails = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">About Service</h2>
          <p className="text-gray-600 mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Curabitur
            non nulla sit amet nisl tempus convallis quis ac lectus. Donec
            sollicitudin molestie malesuada. Nulla quis lorem ut libero malesuada
            feugiat.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Service Provider</h2>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-14 h-14 rounded-full bg-gray-300"></div>

            <div className="flex-1">
              <h3 className="text-lg font-medium">Andrew</h3>
              <p className="text-gray-500">Service Provider</p>
            </div>

            <div className="flex gap-3">
              <button className="p-2 bg-green-200 rounded-full hover:bg-gray-300">
                 <p>+91 9845637445</p>
              </button>
              <button className="p-2 bg-blue-200 rounded-full hover:bg-gray-300">
                <FaCommentDots className="text-blue-500 text-xl" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Opening Time</h2>
          <ul className="mt-3 text-gray-600 space-y-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
              (day) => (
                <li key={day} className="flex justify-between">
                  <span>{day}</span>
                  <span>9:00 - 17:00</span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ServiceDetails;
