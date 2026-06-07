import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUpcomingBookingsRequest } from "../../../saga/features/customer/customerSlice";

const BASEURL = import.meta.env.VITE_API_URL;

const Upcoming = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { upcoming, bookingsLoading, bookingsError } = useSelector((state) => state.customer.bookings);
  const customerId = localStorage.getItem('customer_id');
  const [favorites, setFavorites] = useState({});
  const [expanded, setExpanded] = useState({});
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelBooking = async (booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(booking.booking_id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASEURL}/customers/data/updateservicebooking`,
        {
          booking_id: booking.booking_id,
          vendor_id: booking.vendor_id,
          customer_id: Number(customerId),
          is_booked: booking.is_booked ?? 1,
          is_completed: booking.is_completed ?? 0,
          is_cancelled: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Booking cancelled successfully!");
      dispatch(getUpcomingBookingsRequest({ customer_id: customerId }));
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (customerId) {
      dispatch(getUpcomingBookingsRequest({ customer_id: customerId }));
    }
  }, [dispatch, customerId]);

  const toggleFavorite = (bookingId) => {
    setFavorites((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const toggleExpanded = (bookingId) => {
    setExpanded((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId] || true,
    }));
  };

  if (bookingsLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (bookingsError) {
    return <div className="text-center p-4 text-red-600">Error: {bookingsError}</div>;
  }

  if (!upcoming || upcoming.length === 0) {
    return <div className="text-center p-4">No upcoming bookings found.</div>;
  }

  return (
    <div className="mt-6 space-y-4">
      {upcoming.map((booking) => (
        <div
          key={booking.booking_id}
          className="bg-white p-4 rounded-2xl shadow-md border w-full max-w-md"
        >
          <div className="flex bg-white p-4 rounded-lg shadow-md items-center gap-4 relative">
            <div className="relative w-28 h-28">
              <img
                src={booking.service_category_url }
                alt={booking.service_category_name || "Service"}
                className="w-full h-full object-cover rounded-lg border"
                // onError={(e) => (e.target.src = "https://picsum.photos/200g")}
              />
            </div>

            <div className="flex-1 relative">
              <span className="absolute top-1 left-0 bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                {booking.service_category_name || "Unknown Service"}
              </span>

              <span
                className="absolute top-2 right-2 cursor-pointer"
                onClick={() => toggleFavorite(booking.booking_id)}
              >
                {favorites[booking.booking_id] ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
              </span>

              <h3 className="text-lg font-semibold mt-8 text-gray-900">
                {booking.service_description || `${booking.service_name} Service`}
              </h3>

              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <span className="text-gray-800">Vendor ID:{booking.vendor_id || "Unknown Vendor"}</span> •
                <FaStar className="text-yellow-500" /> {booking.rating || "N/A"}
              </p>

              <p className="text-blue-600 text-base font-bold mt-1">
                ${booking.service_price || "N/A"} / Per hour
              </p>
            </div>
          </div>

          {expanded[booking.booking_id] && (
            <div className="text-xs text-gray-700 mt-4 border-t pt-2">
              <p className="flex justify-between">
                <span className="text-gray-400">Booking Date</span>
                <span className="font-medium block">
                  {booking.booking_date
                    ? new Date(booking.booking_date).toLocaleString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : "TBD"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Customer</span>
                <span className="font-medium block">{booking.customer_name || "N/A"}</span>
              </p>
            </div>
          )}

          <button
            className="mt-4 w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-full hover:bg-blue-700 transition disabled:bg-gray-400"
            onClick={() => handleCancelBooking(booking)}
            disabled={cancellingId === booking.booking_id}
          >
            {cancellingId === booking.booking_id ? "Cancelling..." : "Cancel"}
          </button>

          <div
            className="flex items-center justify-center text-gray-500 text-xs mt-2 cursor-pointer"
            onClick={() => toggleExpanded(booking.booking_id)}
          >
            View {expanded[booking.booking_id] ? "Less" : "More"}
            <IoIosArrowDown
              className={`ml-1 transform ${expanded[booking.booking_id] ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Upcoming;
