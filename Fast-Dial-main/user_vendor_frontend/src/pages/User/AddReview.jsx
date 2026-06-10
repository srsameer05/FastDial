import { useState } from "react";
import { FaStar } from "react-icons/fa";

const AddReview = ({ onClose, onSubmit, review }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [reviewText, setReviewText] = useState(review?.review_text || "");
  const [hover, setHover] = useState(null);

  const handleSubmit = () => {
    if (rating === 0 || !reviewText.trim()) {
      alert("Please provide a rating and review text.");
      return;
    }
    onSubmit({ rating, reviewText });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {review ? "Edit Your Review" : "Add Your Review"}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Rating
          </label>
          <div className="flex mt-2">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    onChange={() => setRating(ratingValue)}
                    className="hidden"
                  />
                  <FaStar
                    className="cursor-pointer"
                    size={24}
                    color={
                      ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                    }
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setRating(ratingValue)}
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="4"
            placeholder="Write your review here..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {review ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReview;