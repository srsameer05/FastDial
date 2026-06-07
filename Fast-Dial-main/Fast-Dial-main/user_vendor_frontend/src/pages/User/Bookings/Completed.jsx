import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import {
  getCompletedBookingsRequest,
  getReviewsRequest,
  insertReviewRequest,
  updateReviewRequest,
  deleteReviewRequest,
} from "../../../saga/features/customer/customerSlice";
import AddReview from "../AddReview";

const Completed = () => {
  const dispatch = useDispatch();
  const { completed, bookingsLoading, bookingsError } = useSelector(
    (state) => state.customer.bookings
  );
  const {
    reviews,
    reviewsLoading,
    reviewsError,
    updateReviewError,
    deleteReviewError,
  } = useSelector((state) => state.customer);
  const customerId = localStorage.getItem("customer_id");
  const [isFavorite, setIsFavorite] = useState({});
  const [isAddReviewOpen, setIsAddReviewOpen] = useState({});
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(null);

  useEffect(() => {
    if (customerId) {
      dispatch(getCompletedBookingsRequest({ customer_id: customerId }));
      dispatch(getReviewsRequest());
    }
  }, [dispatch, customerId]);

  const toggleFavorite = (bookingId) => {
    setIsFavorite((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const toggleAddReview = (bookingId) => {
    setIsAddReviewOpen((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const handleAddReview = (bookingId, vendorId, reviewData) => {
    const reviewPayload = {
      booking_id: bookingId,
      customer_id: parseInt(customerId),
      vendor_id: vendorId,
      rating: reviewData.rating,
      review_text: reviewData.reviewText,
    };
    dispatch(insertReviewRequest(reviewPayload));
    toggleAddReview(bookingId);
  };

  const handleEditReview = (review) => {
    setIsEditReviewOpen(review);
  };

  const handleUpdateReview = (reviewId, vendorId, reviewData) => {
    const reviewPayload = {
      review_id: reviewId,
      booking_id: isEditReviewOpen.booking_id,
      customer_id: parseInt(customerId),
      vendor_id: vendorId,
      rating: reviewData.rating,
      review_text: reviewData.reviewText,
    };
    dispatch(updateReviewRequest(reviewPayload));
    setIsEditReviewOpen(null);
  };

  const handleDeleteReview = (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to delete a review.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deleteReviewRequest(reviewId));
    }
  };

  if (bookingsLoading || reviewsLoading) {
    return <div>Loading...</div>;
  }

  if (bookingsError) {
    return <div>Error: {bookingsError}</div>;
  }

  if (reviewsError) {
    return <div>Error: {reviewsError}</div>;
  }

  if (updateReviewError) {
    alert(`Failed to update review: ${updateReviewError}`);
  }

  if (deleteReviewError) {
    alert(`Failed to delete review: ${deleteReviewError}`);
  }

  if (!completed.length) {
    return <div>No completed bookings found.</div>;
  }

  return (
    <div className="mt-6 space-y-4">
      {completed.map((booking) => (
        <div
          key={booking.booking_id}
          className="bg-white p-4 rounded-2xl shadow-md border w-full max-w-md"
        >
          <div className="flex items-center gap-4 relative">
            <div className="relative w-28 h-28">
              <img
                src={booking.service_category_url || "https://picsum.photos/200g"}
                alt={booking.service_category_name}
                className="w-full h-full object-cover rounded-lg border"
              />
            </div>

            <div className="flex-1 relative">
              <span className="absolute top-1 left-0 bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                {booking.service_category_name}
              </span>

              <span
                className="absolute top-2 right-2 cursor-pointer"
                onClick={() => toggleFavorite(booking.booking_id)}
              >
                {isFavorite[booking.booking_id] ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
              </span>

              <h3 className="text-lg font-semibold mt-8 text-gray-900">
                {booking.service_description}
              </h3>

              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <span className="text-gray-800">
                  Vendor ID: {booking.vendor_id}
                </span>{" "}
                • <FaStar className="text-yellow-500" /> 4.8
              </p>

              <p className="text-blue-600 text-base font-bold mt-1">
                ${booking.service_price} / Per service
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-700 mt-4 border-t pt-2">
            <p className="flex justify-between">
              <span className="text-gray-400">Booking Date</span>
              <span className="font-medium block">TBD</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Customer</span>
              <span className="font-medium block">{booking.customer_name}</span>
            </p>
          </div>

          {/* Review Section */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold">Reviews</h4>
              <button
                className="flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => toggleAddReview(booking.booking_id)}
              >
                <IoMdAddCircleOutline className="mr-1 text-lg" />
                Add Review
              </button>
            </div>

            {reviews
              .filter((review) => review.booking_id === booking.booking_id)
              .map((review) => (
                <div key={review.review_id} className="border-t pt-4">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h5 className="font-semibold">
                          {booking.customer_name}
                        </h5>
                        <span className="text-gray-500 text-sm">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-yellow-500 mt-1">
                        {Array(review.rating)
                          .fill()
                          .map((_, i) => (
                            <FaStar key={i} />
                          ))}
                      </div>
                      <p className="text-gray-600 mt-2">{review.review_text}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.review_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

            {isAddReviewOpen[booking.booking_id] && (
              <AddReview
                onClose={() => toggleAddReview(booking.booking_id)}
                onSubmit={(reviewData) =>
                  handleAddReview(
                    booking.booking_id,
                    booking.vendor_id,
                    reviewData
                  )
                }
              />
            )}

            {isEditReviewOpen &&
              isEditReviewOpen.booking_id === booking.booking_id && (
                <AddReview
                  review={isEditReviewOpen}
                  onClose={() => setIsEditReviewOpen(null)}
                  onSubmit={(reviewData) =>
                    handleUpdateReview(
                      isEditReviewOpen.review_id,
                      booking.vendor_id,
                      reviewData
                    )
                  }
                />
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Completed;
