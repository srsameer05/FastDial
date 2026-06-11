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
import dummyImage from "../../../assets/image.png";

const Completed = () => {
  const dispatch = useDispatch();
  const { completed, bookingsLoading, bookingsError } = useSelector((state) => state.customer.bookings);
  const { reviews, reviewsLoading, reviewsError } = useSelector((state) => state.customer);
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

  const toggleFavorite = (id) => setIsFavorite((p) => ({ ...p, [id]: !p[id] }));
  const toggleAddReview = (id) => setIsAddReviewOpen((p) => ({ ...p, [id]: !p[id] }));

  const handleAddReview = (bookingId, vendorId, reviewData) => {
    dispatch(insertReviewRequest({
      booking_id: bookingId,
      customer_id: parseInt(customerId),
      vendor_id: vendorId,
      rating: reviewData.rating,
      review_text: reviewData.reviewText,
    }));
    toggleAddReview(bookingId);
  };

  const handleUpdateReview = (reviewId, vendorId, reviewData) => {
    dispatch(updateReviewRequest({
      review_id: reviewId,
      booking_id: isEditReviewOpen.booking_id,
      customer_id: parseInt(customerId),
      vendor_id: vendorId,
      rating: reviewData.rating,
      review_text: reviewData.reviewText,
    }));
    setIsEditReviewOpen(null);
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deleteReviewRequest(reviewId));
    }
  };

  if (bookingsLoading || reviewsLoading) return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (bookingsError) return <div className="text-center py-10 text-red-500">Error: {bookingsError}</div>;
  if (reviewsError) return <div className="text-center py-10 text-red-500">Error: {reviewsError}</div>;

  if (!completed || completed.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">✅</div>
      <p className="text-gray-500 text-lg font-medium">No completed bookings yet.</p>
      <p className="text-gray-400 text-sm mt-1">Completed services will appear here.</p>
    </div>
  );

  return (
    <div className="mt-4 space-y-4">
      {completed.map((booking) => (
        <div key={booking.booking_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={booking.service_category_url}
                alt={booking.service_category_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = dummyImage;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <span className="inline-block bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {booking.service_category_name || "Service"}
                </span>
                <button onClick={() => toggleFavorite(booking.booking_id)} className="text-gray-300 hover:text-red-400 transition ml-2">
                  {isFavorite[booking.booking_id] ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-2 truncate">
                {booking.service_description || booking.service_category_name || "Service"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {booking.vendor_name || "Vendor not assigned"}
              </p>
              <p className="text-blue-600 text-sm font-bold mt-1">
                ₹{booking.service_price || "N/A"} / Per service
              </p>
            </div>
          </div>

          <div className="px-4 pb-3 border-t border-gray-50 pt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Booking ID</span>
              <span className="font-medium text-gray-700">#{booking.booking_id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Customer</span>
              <span className="font-medium text-gray-700">{booking.customer_name || "N/A"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Status</span>
              <span className="font-medium text-green-600">Completed ✓</span>
            </div>
          </div>

          {/* Reviews */}
          <div className="px-4 pb-4 border-t border-gray-50 pt-3">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Reviews</h4>
              <button
                className="flex items-center text-blue-500 hover:text-blue-700 text-xs"
                onClick={() => toggleAddReview(booking.booking_id)}
              >
                <IoMdAddCircleOutline className="mr-1 text-base" /> Add Review
              </button>
            </div>

            {reviews
              .filter((r) => r.booking_id === booking.booking_id)
              .map((review) => (
                <div key={review.review_id} className="bg-gray-50 rounded-xl p-3 mb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex text-yellow-400">
                      {Array(review.rating).fill().map((_, i) => <FaStar key={i} className="text-xs" />)}
                    </div>
                    <span className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">{review.review_text}</p>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setIsEditReviewOpen(review)} className="text-blue-500 text-xs hover:underline">Edit</button>
                    <button onClick={() => handleDeleteReview(review.review_id)} className="text-red-500 text-xs hover:underline">Delete</button>
                  </div>
                </div>
              ))}

            {isAddReviewOpen[booking.booking_id] && (
              <AddReview
                onClose={() => toggleAddReview(booking.booking_id)}
                onSubmit={(data) => handleAddReview(booking.booking_id, booking.vendor_id, data)}
              />
            )}
            {isEditReviewOpen && isEditReviewOpen.booking_id === booking.booking_id && (
              <AddReview
                review={isEditReviewOpen}
                onClose={() => setIsEditReviewOpen(null)}
                onSubmit={(data) => handleUpdateReview(isEditReviewOpen.review_id, booking.vendor_id, data)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Completed;