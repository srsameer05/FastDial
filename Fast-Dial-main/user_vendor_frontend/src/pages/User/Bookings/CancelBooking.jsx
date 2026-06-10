import { useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";

export default function CancelBooking() {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [showModal, setShowModal] = useState(false);

  const reasons = [
    "Change in plans",
    "Found another provider",
    "Unexpected work",
    "Change in requirements",
    "Conflict in scheduling",
    "Other",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-col items-center p-6 max-w-md mx-auto flex-grow">
        <button className="self-start text-lg">
          ← <span className="font-semibold">Cancel Bookings</span>
        </button>
        <p className="text-gray-500 mt-4 text-sm">
          Please select the reason for cancellation:
        </p>
        <div className="mt-4 w-full">
          {reasons.map((reason) => (
            <label
              key={reason}
              className="flex items-center space-x-2 py-2 cursor-pointer"
            >
              <input
                type="radio"
                name="cancellationReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="w-4 h-4"
              />
              <span className="text-gray-700">{reason}</span>
            </label>
          ))}
        </div>

        {selectedReason === "Other" && (
          <div className="w-full mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Other
            </label>
            <textarea
              className="w-full p-2 mt-1 border rounded-lg"
              placeholder="Enter your reason..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          </div>
        )}

        <button
          className="mt-4 w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-full hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          Cancel Appointment
        </button>
      </div>

      <Footer />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative"
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <IoClose size={24} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2, rotate: 360 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="flex items-center justify-center"
            >
              <span className="text-6xl text-green-500">✔</span>
            </motion.div>

            <h2 className="text-center text-2xl font-bold mt-4 text-gray-800">
              Success!
            </h2>
            <p className="text-center text-gray-600 mt-2">
              Your deep house cleaning service was cancelled successfully
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                className="px-6 py-2 border rounded-lg text-blue-600 hover:bg-blue-100 transition"
                onClick={() => setShowModal(false)}
              >
                Home
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
