import { FaStar } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import Footer from "../Footer";
import { useState } from "react";
import AddReview from "../AddReview"; 

const reviews = [
  {
    id: 1,
    name: "Daniel Luke",
    avatar: "https://via.placeholder.com/50",
    rating: 5,
    timeAgo: "1 month ago",
    reviewText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Donec sollicitudin molestie malesuada. Nulla quis lorem ut libero malesuada feugiat.",
  },
  {
    id: 2,
    name: "Daniel Luke",
    avatar: "https://via.placeholder.com/50",
    rating: 5,
    timeAgo: "1 month ago",
    reviewText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Donec sollicitudin molestie malesuada. Nulla quis lorem ut libero malesuada feugiat.",
  },
];

const ReviewsSection = () => {
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);

  const handleAddReview = (reviewData) => {
    console.log("Review submitted:", reviewData);
    // Add your review submission logic here (e.g., update the reviews state or API call)
    setIsAddReviewOpen(false);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <button
            className="flex items-center text-gray-500 hover:text-gray-700"
            onClick={() => setIsAddReviewOpen(true)}
          >
            <IoMdAddCircleOutline className="mr-1 text-lg" />
            Add Review
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Review"
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-t pt-4">
              <div className="flex items-start">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full mr-4"
                />

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{review.name}</h3>
                    <span className="text-gray-500 text-sm">
                      {review.timeAgo}
                    </span>
                  </div>

                  <div className="flex text-yellow-500 mt-1">
                    {Array(review.rating)
                      .fill()
                      .map((_, i) => (
                        <FaStar key={i} />
                      ))}
                  </div>

                  <p className="text-gray-600 mt-2">{review.reviewText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-5">
        <Footer />
      </div>
      {isAddReviewOpen && (
        <AddReview
          onClose={() => setIsAddReviewOpen(false)}
          onSubmit={handleAddReview}
        />
      )}
    </div>
  );
};

export default ReviewsSection;