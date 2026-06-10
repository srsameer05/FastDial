 import Sidebar from "../../components/VendorSidebar";
import Navbar from "../../components/VendorNavbar";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchServiceRequestsRequest,
  updateServiceBookingRequest,
  fetchCancelledBookingsCountRequest,
  fetchCompletedBookingsCountRequest,
  fetchTotalServiceRequestsPerMonthRequest,
  fetchVendorEarningsRequest,
} from '../../saga/features/vendor/vendorSlice';
import requestUserImage1 from "../../assets/Workman.png";

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    serviceRequests,
    serviceRequestsLoading,
    serviceRequestsError,
    updateServiceBookingLoading,
    updateServiceBookingError,
    updateServiceBookingSuccess,
    cancelledBookingsCount,
    cancelledBookingsCountLoading,
    cancelledBookingsCountError,
    completedBookingsCount,
    completedBookingsCountLoading,
    completedBookingsCountError,
    totalServiceRequestsPerMonth,
    totalServiceRequestsPerMonthLoading,
    totalServiceRequestsPerMonthError,
    vendorEarnings,
    vendorEarningsLoading,
    vendorEarningsError,
    vendor,
    isAuthenticated,
    error
  } = useSelector((state) => state.vendor);

  const getCurrentMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Generate list of months for the dropdown (last 12 months)
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      options.push(`${year}-${month}`);
    }
    return options;
  };

  useEffect(() => {
    console.log("Dashboard useEffect - vendor:", vendor, "isAuthenticated:", isAuthenticated, "error:", error);
    const token = localStorage.getItem('vendorToken');
    console.log("Token from localStorage:", token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const vendorId = payload.id;
        console.log("Extracted vendorId from token:", vendorId);
        dispatch(fetchServiceRequestsRequest(vendorId));
        dispatch(fetchCancelledBookingsCountRequest(vendorId));
        dispatch(fetchCompletedBookingsCountRequest(vendorId));
        dispatch(fetchTotalServiceRequestsPerMonthRequest(vendorId));
        dispatch(fetchVendorEarningsRequest(vendorId));
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    } else {
      console.log("No token found, skipping fetch");
    }
  }, [dispatch, isAuthenticated, error]);

  const formatAddress = (address) => {
    if (!address) return "No address provided";
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null) {
      const { street, city, state, zip } = address;
      return [street, city, state, zip].filter(Boolean).join(", ");
    }
    return "Invalid address";
  };

  const formatBookingTime = (scheduledDate) => {
    if (!scheduledDate) return "Now";
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) return "Invalid date";
    const fullStr = date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const [datePart, timePart] = fullStr.split(', ');
    return `${timePart} - ${datePart}`;
  };

  const filteredRequests = Array.isArray(serviceRequests)
    ? serviceRequests
        .filter((request) => request.is_booked == "1" && request.is_completed == "0" && request.is_cancelled == "0")
    : [];

  const sortedRequests = filteredRequests.sort((a, b) => b.booking_id - a.booking_id);

  const recentRequests = sortedRequests.map((request) => ({
    image: request.service_category_url || requestUserImage1,
    title: request.service_category_name,
    description: `${request.customer_name} has requested a ${request.service_category_name}.`,
    time: formatBookingTime(request.scheduled_date),
    location: formatAddress(request.customer_address),
    details: {
      vendor_id: request.vendor_id,
      customer_name: request.customer_name,
      mobile: request.mobile,
      customer_country: request.customer_country,
      gender: request.gender,
      customer_address: formatAddress(request.customer_address),
      customer_email: request.customer_email,
      service_category_name: request.service_category_name,
      service_desc: request.service_desc,
      service_price: request.service_price,
      service_category_url: request.service_category_url,
      booking_id: request.booking_id,
      service_id: request.service_id,
      customer_id: request.customer_id,
      service_cat_id: request.service_cat_id,
    },
  }));

  const totalRequestsCount = Array.isArray(totalServiceRequestsPerMonth)
    ? totalServiceRequestsPerMonth.find((item) => item.month === selectedMonth)?.total_requests || 0
    : 0;

  const cancelledCount = Array.isArray(cancelledBookingsCount)
    ? cancelledBookingsCount.find((item) => item.month === selectedMonth)?.cancelled_count || 0
    : 0;

  const completedCount = Array.isArray(completedBookingsCount)
    ? completedBookingsCount.find((item) => item.month === selectedMonth)?.completed_count || 0
    : 0;

  const monthlyData = {
    success: true,
    data: Array.isArray(totalServiceRequestsPerMonth)
      ? totalServiceRequestsPerMonth.map((item) => ({
          month: item.month,
          total_requests: item.total_requests || 0,
          completed_count: completedBookingsCount.find((c) => c.month === item.month)?.completed_count || 0,
          cancelled_count: cancelledBookingsCount.find((c) => c.month === item.month)?.cancelled_count || 0,
        }))
      : [],
  };

  console.log("Service Requests from Redux (Recent):", serviceRequests);
  console.log("Recent Requests after filter:", recentRequests);
  console.log("Total Service Requests Per Month from Redux:", totalServiceRequestsPerMonth);
  console.log("Total Requests for", selectedMonth, ":", totalRequestsCount);
  console.log("Cancelled Bookings Count from Redux:", cancelledBookingsCount);
  console.log("Cancelled Count for", selectedMonth, ":", cancelledCount);
  console.log("Completed Bookings Count from Redux:", completedBookingsCount);
  console.log("Completed Count for", selectedMonth, ":", completedCount);
  console.log("Vendor Earnings from Redux:", vendorEarnings);
  console.log("Monthly Data:", monthlyData);

  const handleCompleteRequest = (request) => {
    const bookingData = {
      booking_id: request.details.booking_id,
      // service_cat_id: request.details.service_cat_id,
      customer_id: request.details.customer_id,
      vendor_id: request.details.vendor_id,
      is_completed: 1,
      is_cancelled: 0,
    };
    dispatch(updateServiceBookingRequest(bookingData));
  };

  const handleCancelRequest = (request) => {
    const bookingData = {
      booking_id: request.details.booking_id,
      // service_cat_id: request.details.service_cat_id,
      customer_id: request.details.customer_id,
      vendor_id: request.details.vendor_id,
      is_completed: 0,
      is_cancelled: 1,
    };
    dispatch(updateServiceBookingRequest(bookingData));
  };

  const handleImageError = (e) => {
    console.log("Image failed to load, falling back to default:", e.target.src);
    e.target.src = requestUserImage1;
  };

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 pl-12 p-4 md:px-8 md:py-6 bg-gray-100 slide-up flex flex-col overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-[#4285F4] mb-2 md:mb-0">Insights</h2>
            <div className="flex items-center">
              <label htmlFor="monthFilter" className="mr-2 text-gray-600 text-sm md:text-base">Filter by Month:</label>
              <select
                id="monthFilter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 md:px-3 md:py-2 text-gray-600 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              >
                {getMonthOptions().map((month) => (
                  <option key={month} value={month}>
                    {new Date(month + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#4285F4] p-4 md:p-6 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-gray-200 rounded-full mr-2">
                  <img src="/src/assets/roll.svg" alt="" />
                </div>
                <p className="text-lg md:text-xl text-white">My Earnings</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {vendorEarningsLoading ? "Loading..." : vendorEarnings?.total_earnings ? `₹${vendorEarnings.total_earnings}` : "₹0"}
              </p>
              {vendorEarningsError && (
                <p className="text-red-300 text-sm mt-1">{vendorEarningsError}</p>
              )}
            </div>
            <div className="bg-[#4285F4] p-4 md:p-6 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white-200 rounded-full mr-2">
                  <img src="/src/assets/one.svg" alt="" />
                </div>
                <p className="text-lg md:text-xl text-white">Requests ({selectedMonth})</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {totalServiceRequestsPerMonthLoading ? "Loading..." : totalRequestsCount}
              </p>
              {totalServiceRequestsPerMonthError && (
                <p className="text-red-300 text-sm mt-1">{totalServiceRequestsPerMonthError}</p>
              )}
            </div>
            <div className="bg-[#4285F4] p-4 md:p-6 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white-200 rounded-full mr-2">
                  <img src="/src/assets/two.svg" alt="" />
                </div>
                <p className="text-base text-white">Completed ({selectedMonth})</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {completedBookingsCountLoading ? "Loading..." : completedCount}
              </p>
              {completedBookingsCountError && (
                <p className="text-red-300 text-sm mt-1">{completedBookingsCountError}</p>
              )}
            </div>
            <div className="bg-[#4285F4] p-4 md:p-6 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white-200 rounded-full mr-2">
                  <img src="/src/assets/three.svg" alt="" />
                </div>
                <p className="text-base text-white">Cancelled ({selectedMonth})</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {cancelledBookingsCountLoading ? "Loading..." : cancelledCount}
              </p>
              {cancelledBookingsCountError && (
                <p className="text-red-300 text-sm mt-1">{cancelledBookingsCountError}</p>
              )}
            </div>
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-[#4285F4] mb-4">Recent Requests</h2>
          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hidden">
            {serviceRequestsLoading ? (
              <p className="text-gray-600 text-center">Loading recent requests...</p>
            ) : serviceRequestsError ? (
              <p className="text-red-500 text-center">{serviceRequestsError}</p>
            ) : recentRequests.length > 0 ? (
              recentRequests.map((request, index) => (
                <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow border">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={request.image}
                        alt="Service"
                        className="w-full h-auto md:w-[180px] md:h-[180px] rounded-lg object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base md:text-lg font-medium">{request.title}</h3>
                        <p className="text-sm md:text-base text-gray-600">{request.description}</p>
                        <div className="flex items-center text-sm md:text-base text-gray-500 mt-1">
                          <span>{request.time}</span>
                          <span className="mx-2">|</span>
                          <span>{request.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0">
                        <button
                          className="w-full md:w-auto bg-white text-[#4285F4] border border-[#4285F4] px-4 md:px-6 py-2 rounded-full hover:bg-[#4285F4] hover:text-white transition duration-300"
                          onClick={() => handleCancelRequest(request)}
                          disabled={updateServiceBookingLoading}
                        >
                          {updateServiceBookingLoading ? "Cancelling..." : "Cancel"}
                        </button>
                        <button
                          className="w-full md:w-auto bg-white text-[#4285F4] border border-[#4285F4] px-4 md:px-6 py-2 rounded-full hover:bg-[#4285F4] hover:text-white transition duration-300"
                          onClick={() => handleCompleteRequest(request)}
                          disabled={updateServiceBookingLoading}
                        >
                          {updateServiceBookingLoading ? "Completing..." : "Complete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No recent requests found.</p>
            )}
            {updateServiceBookingError && (
              <p className="text-red-500 text-center mt-4">{updateServiceBookingError}</p>
            )}
            {updateServiceBookingSuccess && (
              <p className="text-green-500 text-center mt-4">Request updated successfully!</p>
            )}
          </div>
        </div>
      </div>
      <style jsx="true">{`
        .slide-up {
          animation: slideUp 0.7s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        @keyframes slideUp {
          from {
            transform: translateY(60px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Dashboard;