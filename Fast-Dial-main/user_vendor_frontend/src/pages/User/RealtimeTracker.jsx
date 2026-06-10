import { useState, useEffect, useRef } from "react";
import Navbar from "./Header";
import Goback from "../../assets/Goback.png";
import Footer from "./Footer";
import ServiceImg from "../../assets/Carwash.png";
import LiveMap from "./LiveMap";
import ChatCircleDots from "../../assets/ChatCircleDots.png";
import { connectSocket } from "../User/Services/socket";
import { useDispatch, useSelector } from "react-redux";
import { bookingDetailsRequest, getCustomerServiceDetailsRequest } from "../../saga/features/customer/customerSlice";
import { Link, useLocation } from "react-router-dom";

const RealtimeTracker = () => {
  const dispatch = useDispatch();
  const { customerServiceDetails } = useSelector((state) => state.customer);

  const [token, setToken] = useState(null);
  const location = useLocation();
  const { bookingId, vendor_id } = location.state || { bookingId: 475, vendor_id: 4 };
  const [customerId, setCustomerId] = useState("");
  const [bookingInfo, setBookingInfo] = useState(null); // Store single booking
  const [expandedBooking, setExpandedBooking] = useState(null); // Track expanded state

  const socketRef = useRef(null);

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    const getCustomerId = localStorage.getItem("customer_id");
    setCustomerId(Number(getCustomerId));
    setToken(getToken);
  }, []);

  useEffect(() => {
    dispatch(getCustomerServiceDetailsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (customerServiceDetails && bookingId) {
      const matchingBooking = customerServiceDetails.find(
        (item) => item.customer_id === customerId && item.is_completed === 0 && item.booking_id === bookingId
      );
      setBookingInfo(matchingBooking || null);
      console.log("Selected Booking Info:", matchingBooking);
    }
  }, [customerServiceDetails, customerId, bookingId]);

  useEffect(() => {
    if (!token || !bookingId) return;
    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_booking", bookingId);
    });

    socket.on("location_update", (data) => {
      console.log("📍 Live location update:", data);
    });

    return () => {
      socket.emit("leave_booking", bookingId);
      socket.disconnect();
    };
  }, [token, bookingId]);

  const toggleDetails = () => {
    setExpandedBooking((prev) => (prev === bookingId ? null : bookingId)); // Toggle open/close
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 md:px-10 py-5 pt-5">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard">
            <img src={Goback} alt="Go Back" className="w-6 md:w-8" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold">Booking Details</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col lg:w-1/3 max-h-[80vh] overflow-y-auto rounded-md p-2">
            {bookingInfo ? (
              <div
                className="border border-gray-300 p-4 w-full rounded-lg shadow-md space-y-4 mt-4 hover:bg-blue-100"
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-start sm:gap-6 border rounded-md p-3 shadow cursor-pointer"
                  onClick={toggleDetails}
                >
                  <img
                    src={bookingInfo.service_category_url || ServiceImg}
                    alt="Service"
                    className="h-[80px] rounded w-full sm:w-auto"
                  />
                  <div>
                    <p className="font-semibold">{bookingInfo.service_name}</p>
                    <p className="text-gray-500 text-sm">
                      {bookingInfo.name_of_bussiness ? bookingInfo.name_of_bussiness : "unassigned vendor"}
                    </p>
                    <p className="text-blue-600 font-bold mt-1">$110.00 / Per hour</p>
                    <p className="font-semibold">Booking ID: #{bookingInfo.booking_id}</p>
                  </div>
                </div>

                {expandedBooking === bookingInfo.booking_id && (
                  <div className="moreDetails">
                    <p><strong>Booking Date:</strong> October 04, 2025 | 9:00 AM</p>
                    <p><strong>Vendor Name:</strong> {bookingInfo.vendor_name}</p>
                    <div className="flex flex-col gap-4 mt-4">
                      <h1 className="text-xl font-bold">Vendor Details</h1>
                      {bookingInfo.vendor_id !== null ? (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <img
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                              alt="Vendor"
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <p className="font-semibold">{bookingInfo.vendor_name}</p>
                              <p className="text-sm text-gray-600">+91 98765 43210</p>
                            </div>
                          </div>
                          <img src={ChatCircleDots} className="w-6 md:w-8" alt="Chat" />
                        </div>
                      ) : (
                        <p className="font-semibold text-lg bg-white text-red-500 text-center rounded-md p-1">
                          Unassigned Vendor
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm sm:text-base p-4">
                No booking found for Booking ID #{bookingId}
              </p>
            )}
          </div>
          <div className="w-full lg:w-2/3 rounded-xl shadow-md flex flex-col gap-4">
            <LiveMap bookingId={bookingId} userToken={token} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RealtimeTracker;