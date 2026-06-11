import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegHeart, FaHeart, FaMapMarkerAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import axios from "axios";
import { getUpcomingBookingsRequest } from "../../../saga/features/customer/customerSlice";

const BASEURL = import.meta.env.VITE_API_URL;

const Upcoming = () => {
  const dispatch = useDispatch();
  const { upcoming, bookingsLoading, bookingsError } = useSelector((state) => state.customer.bookings);
  const customerId = localStorage.getItem("customer_id");
  const [favorites, setFavorites] = useState({});
  const [expanded, setExpanded] = useState({});
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (customerId) {
      dispatch(getUpcomingBookingsRequest({ customer_id: customerId }));
    }
  }, [dispatch, customerId]);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Booking cancelled successfully!");
      dispatch(getUpcomingBookingsRequest({ customer_id: customerId }));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const toggleFavorite = (id) => setFavorites((p) => ({ ...p, [id]: !p[id] }));
  const toggleExpanded = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const formatAddress = (addr) => {
    if (!addr) return "N/A";
    if (typeof addr === "string") {
      try { addr = JSON.parse(addr); } catch { return addr; }
    }
    return [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(", ");
  };

  if (bookingsLoading) return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (bookingsError) return (
    <div className="text-center py-10 text-red-500">Error: {bookingsError}</div>
  );

  if (!upcoming || upcoming.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📅</div>
      <p className="text-gray-500 text-lg font-medium">No upcoming bookings found.</p>
      <p className="text-gray-400 text-sm mt-1">Your scheduled services will appear here.</p>
    </div>
  );

  return (
    <div className="mt-4 space-y-4">
      {upcoming.map((booking) => (
        <div key={booking.booking_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={booking.service_category_url}
                alt={booking.service_category_name || "Service"}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/96x96?text=Service"; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {booking.service_category_name || "Service"}
                </span>
                <button onClick={() => toggleFavorite(booking.booking_id)} className="text-gray-300 hover:text-red-400 transition ml-2">
                  {favorites[booking.booking_id] ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-2 truncate">
                {booking.service_description || booking.service_category_name || "Service"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {booking.vendor_name || "Vendor not yet assigned"}
              </p>
              <p className="text-blue-600 text-sm font-bold mt-1">
                ₹{booking.service_price || "N/A"} / Per service
              </p>
            </div>
          </div>

          {expanded[booking.booking_id] && (
            <div className="px-4 pb-3 border-t border-gray-50 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Booking ID</span>
                <span className="font-medium text-gray-700">#{booking.booking_id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Type</span>
                <span className="font-medium text-gray-700 capitalize">{booking.booking_type || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Scheduled</span>
                <span className="font-medium text-gray-700">
                  {booking.scheduled_date
                    ? new Date(booking.scheduled_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                    : booking.booking_type === "now" ? "Immediate" : "TBD"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Booked On</span>
                <span className="font-medium text-gray-700">
                  {booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </div>
              {booking.booking_address && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1"><FaMapMarkerAlt /> Address</span>
                  <span className="font-medium text-gray-700 text-right max-w-[60%]">
                    {formatAddress(booking.booking_address)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Status</span>
                <span className="font-medium text-amber-600">Pending Assignment</span>
              </div>
            </div>
          )}

          <div className="px-4 pb-4 pt-2">
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-xl transition disabled:opacity-50"
              onClick={() => handleCancelBooking(booking)}
              disabled={cancellingId === booking.booking_id}
            >
              {cancellingId === booking.booking_id ? "Cancelling..." : "Cancel Booking"}
            </button>
          </div>

          <button
            className="w-full flex items-center justify-center text-gray-400 text-xs py-2 border-t border-gray-50 hover:bg-gray-50 transition"
            onClick={() => toggleExpanded(booking.booking_id)}
          >
            {expanded[booking.booking_id] ? "View Less" : "View More"}
            <IoIosArrowDown className={`ml-1 transition-transform ${expanded[booking.booking_id] ? "rotate-180" : ""}`} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Upcoming;