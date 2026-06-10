import { FaTrash, FaArrowLeft, FaUserShield, FaStar } from "react-icons/fa";
import { useState } from "react";
import Gardening from "../../assets/Gardening.png";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const categoryColors = {
  Gardening: "bg-green-500",
  Cleaning: "bg-blue-500",
  Mechanic: "bg-yellow-500",
  Laundry: "bg-pink-500",
  "Pest Control": "bg-indigo-500",
  Electrical: "bg-orange-500",
  Plumbing: "bg-teal-500",
};

const services = [
  {
    id: 1,
    name: "Gardening Service",
    image: Gardening,
    category: "Gardening",
    provider: "Adam & Co",
    rating: 4.8,
    price: 110,
  },
];

const PopularServices = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto pr-4 pl-4">
        <div className="mt-6 flex items-center">
          <button
            className="flex items-center text-black font-semibold"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
        </div>
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">Popular Services</h2>

            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-4 rounded-lg shadow-md relative flex gap-4 items-center"
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-50 w-50 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <span
                    className={`px-3 py-1 text-sm rounded-full text-white justify-center text-center ${
                      categoryColors[service.category]
                    }`}
                  >
                    {service.category}
                  </span>
                  <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <FaUserShield className="text-gray-500" /> {service.provider}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FaStar className="text-yellow-500" /> {service.rating}
                  </p>
                  <p className="text-orange-600 font-bold mt-1">
                    ${service.price}.00 / Per hour
                  </p>
                </div>

                <FaTrash
                  className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-red-500"
                  onClick={() => setShowModal(true)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <div className="flex justify-center">
              <div className="bg-red-500 p-3 rounded-full">
                <FaTrash className="text-white text-2xl" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mt-4">
              Would you like to remove this from your favorites?
            </h2>
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PopularServices;
