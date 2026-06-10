import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bigImg from "../../assets/BigImg.png";
import Small1 from "../../assets/Small1.png";
import Small2 from "../../assets/Small2.png";
import Small3 from "../../assets/Small3.png";
import Small4 from "../../assets/Small4.png";
import Small5 from "../../assets/Small5.png";
import Header from "./Header";
import Footer from "./Footer";
import { FaShareAlt, FaStar, FaThumbsUp } from "react-icons/fa";
import { AiOutlineHeart, AiOutlineClose } from "react-icons/ai";

const Rating = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(bigImg);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = () => {
    // if (rating === 0 || review.trim() === "") {
    //   alert("Please provide a rating and review before submitting.");
    //   return;
    // }
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Full-width Header */}
      <Header />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto p-6">
        <button className="mb-4 text-gray-600" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>

        <div className="flex gap-6">
          <div className="flex flex-col gap-3">
            {[Small1, Small2, Small3, Small4, Small5].map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Thumbnail"
                className="w-22 h-22 cursor-pointer rounded-md border"
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>

          <div>
            <img
              src={selectedImage}
              alt="Main"
              className="w-[720px] h-[560px] rounded-lg object-cover"
            />
          </div>

          <div className="flex flex-col gap-5 p-6 bg-white rounded-lg shadow-md w-[400px]">
            <div className="flex justify-between items-center">
              <span className="bg-blue-200 text-blue-600 px-4 py-2 text-sm font-medium w-fit">
                Home Cleaning
              </span>
              <span className="text-yellow-500 font-bold text-lg flex items-center">
                ⭐ 4.8{" "}
                <span className="text-gray-600 text-sm ml-1">
                  (678 reviews)
                </span>
              </span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800">
              Deep House Cleaning
            </h2>
            <p className="text-gray-500 text-sm">
              📍 1012 Ocean Avenue, New York, USA
            </p>

            <div className="flex justify-between items-center mt-2">
              <button className="bg-blue-500 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-md hover:bg-blue-600 transition">
                Share <FaShareAlt />
              </button>
              <button className="border px-5 py-2 rounded-full flex items-center gap-2 shadow-md">
                Like <AiOutlineHeart className="text-gray-600" />
              </button>
            </div>

            <div className="bg-gray-100 p-5 rounded-lg w-full flex flex-col items-center text-center">
              <p className="text-gray-500 text-sm">Total Price</p>
              <p className="text-2xl font-bold text-gray-800">$110.00</p>
              <button className="bg-blue-500 text-white px-6 py-3 mt-3 rounded-lg font-semibold w-full hover:bg-blue-600 transition">
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-center text-lg font-semibold">
            Your overall rating of this product
          </h3>
          <div className="flex justify-center my-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer text-2xl ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-gray-600 font-medium mb-2">
              Enter detailed review
            </label>
            <textarea
              className="w-full border rounded-md p-3 text-gray-700"
              rows="4"
              placeholder="Enter your reason.."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input type="file" id="photo-upload" className="hidden" />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer text-gray-600 text-sm flex items-center gap-1"
            >
              📷 Add photo
            </label>
          </div>

          <button
            className="bg-blue-500 text-white px-6 py-3 mt-5 rounded-lg font-semibold w-full hover:bg-blue-600 transition"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-10 rounded-lg shadow-lg w-[600px] text-center relative">
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              <AiOutlineClose size={24} />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center">
              <FaThumbsUp className="text-blue-500 text-6xl mb-10" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Congratulations!
              </h2>
              <p className="text-gray-500 mt-3 text-lg mb-6">
                Your review has been added successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full-width Footer */}
      <Footer />
    </>
  );
};

export default Rating;
