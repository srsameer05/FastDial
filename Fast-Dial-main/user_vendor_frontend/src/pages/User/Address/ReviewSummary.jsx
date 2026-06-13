import { FaRegHeart } from "react-icons/fa";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import bigImg from "../../../assets/cleaning.png";

const ReviewSummary = () => {
  return (
    <div className="w-full max-w mx-auto bg-white shadow-lg rounded-lg p-4 border border-gray-200">
      <div className="relative flex gap-4 p-4">
        <img
          src={bigImg}
          alt="Car Wash Service"
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="flex-1">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
            Cleaning
          </span>
          <h3 className="text-lg font-semibold mt-2">Car wash Service</h3>
          <div className="flex items-center text-gray-500 text-sm">
            <span>Adam & Co</span>
            <span className="ml-2 flex items-center">
              ⭐ <span className="ml-1">4.8</span>
            </span>
          </div>
          <p className="text-blue-600 font-semibold mt-1">
            $110.00 / Per hour
          </p>
        </div>
        <FaRegHeart className="text-gray-400 text-lg cursor-pointer" />
      </div>

      <hr className="border-gray-200" />

      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <p className="text-gray-500">Booking Date</p>
          <p className="font-semibold">October 04, 2025 | 9:00 AM</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-500">Customer</p>
          <p className="font-semibold">Esther Howard</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-500">Amount</p>
          <p className="font-semibold">$180.00</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-500">Tax & Fees</p>
          <p className="font-semibold">$10.00</p>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="p-4 flex justify-between text-lg font-semibold">
        <p>Total:</p>
        <p className="text-gray-900">$190.00</p>
      </div>

      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center text-gray-600">
          <FaRegMoneyBillAlt className="mr-2" />
          <span>Cash</span>
        </div>
        <button className="text-blue-600 font-semibold hover:underline">
          Change
        </button>
      </div>

      <button className="w-full bg-blue-500 text-white text-lg font-semibold py-3 rounded-lg mt-4 hover:bg-blue-600 transition">
        Continue
      </button>
    </div>
  );
};

export default ReviewSummary;
