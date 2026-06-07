import { useState } from "react";
import { FaSearch, FaStar, FaTimes } from "react-icons/fa";

const FilterModal = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [price, setPrice] = useState(20);
  const [selectedRating, setSelectedRating] = useState(null);

  const categories = [
    "All",
    "Cleaning",
    "Plumbing",
    "Electrician",
    "Gardening",
    "Mechanic",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] md:w-[600px] p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-semibold">Filter</h2>

        <div className="mt-4">
          <label className="block text-gray-600 mb-1">Location</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search for service"
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-600 mb-1">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full border ${
                  selectedCategory === category
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 border-gray-300"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 w-full">
          <label className="block text-gray-600 mb-10 font-medium">
            Price Range
          </label>

          <div className="relative flex items-center gap-3 p=3">
            <div
              className="absolute -top-9 bg-orange-100 text-orange-600 px-3 py-1 
                     rounded-md text-xs font-medium"
              style={{ left: `calc(${price}% - 12px)` }}
            >
              ${price}
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full appearance-none h-2 rounded-lg outline-none transition-all
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:bg-orange-700
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:bg-orange-700 [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, orange ${price}%, #ddd ${price}%)`,
              }}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-600 mb-1">Reviews</label>
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex text-orange-500">
                  {[...Array(rating)].map((_, index) => (
                    <FaStar key={index} />
                  ))}
                </div>
                <span className="text-gray-700">{rating} Stars</span>
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating(rating)}
                  className="ml-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
