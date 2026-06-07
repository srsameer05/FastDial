 import Sidebar from "../../components/VendorSidebar";
import Navbar from "../../components/VendorNavbar";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchServiceRequestsRequest, 
  fetchCompletedRequestsRequest, 
  fetchFailedRequestsRequest, 
  updateServiceBookingRequest 
} from '../../saga/features/vendor/vendorSlice';
import requestUserImage1 from "../../assets/Workman.png";
import axios from 'axios';

const Requests = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [animate, setAnimate] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingBookingId, setLoadingBookingId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState(null);
  const [justPerformedAction, setJustPerformedAction] = useState(false);

  const dispatch = useDispatch();
  const { 
    serviceRequests, 
    serviceRequestsLoading, 
    serviceRequestsError, 
    completedRequests, 
    completedRequestsLoading, 
    completedRequestsError, 
    failedRequests,
    failedRequestsLoading,
    failedRequestsError,
    updateServiceBookingLoading,
    updateServiceBookingError,
    updateServiceBookingSuccess,
    isAuthenticated 
  } = useSelector((state) => state.vendor);

  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const vendorId = payload.id;

        dispatch(fetchServiceRequestsRequest(vendorId));
        dispatch(fetchCompletedRequestsRequest(vendorId));
        dispatch(fetchFailedRequestsRequest(vendorId));

        const fetchReviews = async () => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/vendors/data/getcustomerreview/${vendorId}?t=${Date.now()}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Cache-Control': 'no-cache'
                },
              }
            );
            if (response.data.success) {
              const reviewsData = Array.isArray(response.data.data) 
                ? response.data.data 
                : [response.data.data].filter(Boolean);
              setReviews(reviewsData);
            }
          } catch (error) {
            console.error("Error fetching reviews:", error.message);
          }
        };
        fetchReviews();
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if ((updateServiceBookingSuccess || updateServiceBookingError) && justPerformedAction) {
      setLoadingBookingId(null);
      setJustPerformedAction(false);
      if (updateServiceBookingSuccess) {
        alert("Request updated successfully!");
        const token = localStorage.getItem('vendorToken');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const vendorId = payload.id;
            dispatch(fetchServiceRequestsRequest(vendorId));
            dispatch(fetchCompletedRequestsRequest(vendorId));
            dispatch(fetchFailedRequestsRequest(vendorId));
          } catch (e) {
            console.error("Failed to decode token on update success:", e);
          }
        }
      } else if (updateServiceBookingError) {
        alert("Failed to update request. Please try again.");
      }
    }
  }, [updateServiceBookingSuccess, updateServiceBookingError, dispatch, justPerformedAction]);

  // Helper: Format address
  const formatAddress = (address) => {
    if (!address) return "No address provided";
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null) {
      const { street, city, state, zip } = address;
      return [street, city, state, zip].filter(Boolean).join(", ");
    }
    return "Invalid address";
  };

  // Helper: Format time like "16:30 - 23/04/2025"
  const formatBookingTime = (request) => {
    let dateTime;

    if (request.scheduled_date) {
      dateTime = new Date(request.scheduled_date);
    } else if (request.created_at) {
      dateTime = new Date(request.created_at);
    } else {
      return "Time not available";
    }

    if (isNaN(dateTime.getTime())) return "Invalid date";

    const time = dateTime.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const date = dateTime.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    return `${time} - ${date}`;
  };

  // Sort by latest first
  const sortByLatest = (requests) => {
    return [...requests].sort((a, b) => {
      const dateA = new Date(a.scheduled_date || a.created_at || 0);
      const dateB = new Date(b.scheduled_date || b.created_at || 0);
      return dateB - dateA;
    });
  };

  // Pending Requests
  const pendingRequests = Array.isArray(serviceRequests)
    ? sortByLatest(
        serviceRequests
          .filter(r => r.is_booked == "1" && r.is_completed == "0" && r.is_cancelled == "0")
      )
      .map((request) => ({
        image: request.service_category_url || requestUserImage1,
        title: request.service_category_name || "Unknown Service",
        description: `${request.customer_name || "Customer"} requested ${request.service_category_name || "a service"}.`,
        time: formatBookingTime(request),
        location: formatAddress(request.customer_address),
        status: "Pending",
        details: {
          vendor_id: request.vendor_id,
          customer_name: request.customer_name || "Unknown",
          mobile: request.mobile || "N/A",
          customer_country: request.customer_country || "N/A",
          gender: request.gender || "N/A",
          customer_address: formatAddress(request.customer_address),
          customer_email: request.customer_email || "N/A",
          service_category_name: request.service_category_name || "Unknown",
          service_desc: request.service_desc || "No description",
          service_price: request.service_price || 0,
          service_category_url: request.service_category_url || "",
          booking_id: request.booking_id,
          service_id: request.service_id,
          customer_id: request.customer_id,
          service_cat_id: request.service_cat_id,
        },
      }))
    : [];

  // Completed Requests
  const completedRequestsMapped = Array.isArray(completedRequests)
    ? sortByLatest(completedRequests)
      .map((request) => ({
        image: request.service_category_url || requestUserImage1,
        title: request.service_category_name || "Unknown Service",
        description: `${request.customer_name || "Customer"} completed ${request.service_category_name || "service"}.`,
        time: formatBookingTime(request),
        location: formatAddress(request.customer_address),
        status: "Completed",
        reviews: reviews.filter(r => 
          String(r.booking_id) === String(request.booking_id)
        ),
        details: {
          vendor_id: request.vendor_id,
          customer_name: request.customer_name || "Unknown",
          mobile: request.mobile || "N/A",
          customer_country: request.customer_country || "N/A",
          gender: request.gender || "N/A",
          customer_address: formatAddress(request.customer_address),
          customer_email: request.customer_email || "N/A",
          service_category_name: request.service_category_name || "Unknown",
          service_desc: request.service_desc || "No description",
          service_price: request.service_price || 0,
          service_category_url: request.service_category_url || "",
          booking_id: request.booking_id,
          service_cat_id: request.service_cat_id,
          customer_id: request.customer_id,
        },
      }))
    : [];

  // Failed/Cancelled Requests
  const failedRequestsMapped = Array.isArray(failedRequests)
    ? sortByLatest(failedRequests)
      .map((request) => ({
        image: request.service_category_url || requestUserImage1,
        title: request.service_category_name || "Unknown Service",
        description: `${request.customer_name || "Customer"} cancelled ${request.service_category_name || "service"}.`,
        time: formatBookingTime(request),
        location: formatAddress(request.customer_address),
        status: "Failed",
        reviews: reviews.filter(r => 
          String(r.booking_id) === String(request.booking_id)
        ),
        details: {
          vendor_id: request.vendor_id,
          customer_name: request.customer_name || "Unknown",
          mobile: request.mobile || "N/A",
          customer_country: request.customer_country || "N/A",
          gender: request.gender || "N/A",
          customer_address: formatAddress(request.customer_address),
          customer_email: request.customer_email || "N/A",
          service_category_name: request.service_category_name || "Unknown",
          service_desc: request.service_desc || "No description",
          service_price: request.service_price || 0,
          service_category_url: request.service_category_url || "",
          cancelled_reason: request.cancelled_reason || "No reason provided",
          booking_id: request.booking_id,
          service_cat_id: request.service_cat_id,
          customer_id: request.customer_id,
        },
      }))
    : [];

  const filteredRequests = activeTab === "Pending" 
    ? pendingRequests 
    : activeTab === "Completed" 
    ? completedRequestsMapped 
    : failedRequestsMapped;

  useEffect(() => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 10);
  }, [activeTab]);

  const handleDetailedView = (request) => setSelectedRequest(request);
  const handleCloseDetailedView = () => setSelectedRequest(null);
  const handleReviewsView = (reviews) => reviews?.length > 0 && setSelectedReviews(reviews);
  const handleCloseReviewsView = () => setSelectedReviews(null);

  const handleCompleteRequest = (request) => {
    setJustPerformedAction(true);
    setLoadingBookingId(request.details.booking_id);
    dispatch(updateServiceBookingRequest({
      booking_id: request.details.booking_id,
      // service_cat_id: request.details.service_cat_id,
      customer_id: request.details.customer_id,
      vendor_id: request.details.vendor_id,
      is_completed: 1,
      is_cancelled: 0,
    }));
  };

  const handleCancelRequest = (request) => {
    setJustPerformedAction(true);
    setLoadingBookingId(request.details.booking_id);
    dispatch(updateServiceBookingRequest({
      booking_id: request.details.booking_id,
      // service_cat_id: request.details.service_cat_id,
      customer_id: request.details.customer_id,
      vendor_id: request.details.vendor_id,
      is_completed: 0,
      is_cancelled: 1,
    }));
  };

  const handleImageError = (e) => {
    e.target.src = requestUserImage1;
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen md:flex-row md:h-screen">
        <Sidebar />
        <div className="flex-1 p-4 md:px-6 md:py-6 bg-gray-100 slide-up overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-[#4285F4] ml-10 md:ml-0">{activeTab} Requests</h2>
            <div className="flex flex-wrap gap-2">
              {["Pending", "Completed", "Failed"].map(tab => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full transition duration-300 text-sm md:text-base ${
                    activeTab === tab
                      ? "bg-[#4285F4] text-white"
                      : "bg-white text-gray-600 border border-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className={`space-y-4 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] overflow-y-auto scrollbar-hidden transition-all duration-300 transform ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <div key={request.details.booking_id || index} className="bg-white p-4 md:p-6 rounded-lg shadow border">
                  <div className="flex flex-col md:grid md:grid-cols-[auto_1fr] md:gap-4">
                    <div className="flex justify-center mb-4 md:mb-0">
                      <img
                        src={request.image}
                        alt="Service"
                        className="w-full h-auto max-w-[150px] md:max-w-[180px] rounded-lg object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        <h3 className="text-base md:text-lg font-medium">{request.title}</h3>
                        <p className="text-sm md:text-base text-gray-600">{request.description}</p>
                        <div className="flex flex-col md:flex-row md:items-center text-xs md:text-base text-gray-500 mt-1 gap-1 md:gap-2">
                          <span>{request.time}</span>
                          <span className="hidden md:inline mx-2">|</span>
                          <span>{request.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 mt-4">
                        {activeTab === "Pending" && (
                          <>
                            <button className="w-full md:w-auto bg-white text-[#4285F4] border border-[#4285F4] px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-[#4285F4] hover:text-white transition text-sm md:text-base"
                              onClick={() => handleDetailedView(request)}>
                              Detailed View
                            </button>
                            <button className="w-full md:w-auto bg-white text-[#4285F4] border border-[#4285F4] px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-[#4285F4] hover:text-white transition text-sm md:text-base"
                              onClick={() => handleCancelRequest(request)}
                              disabled={loadingBookingId === request.details.booking_id}>
                              {loadingBookingId === request.details.booking_id ? "Cancelling..." : "Cancel"}
                            </button>
                            <button className="w-full md:w-auto bg-white text-[#4285F4] border border-[#4285F4] px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-[#4285F4] hover:text-white transition text-sm md:text-base"
                              onClick={() => handleCompleteRequest(request)}
                              disabled={loadingBookingId === request.details.booking_id}>
                              {loadingBookingId === request.details.booking_id ? "Completing..." : "Complete"}
                            </button>
                          </>
                        )}

                        {(activeTab === "Completed" || activeTab === "Failed") && (
                          <>
                            <button className="w-full md:w-auto bg-white text-[#4285F4] border border-[#4285F4] px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-[#4285F4] hover:text-white transition text-sm md:text-base"
                              onClick={() => handleDetailedView(request)}>
                              Detailed View
                            </button>
                            <button 
                              className={`w-full md:w-auto px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base ${
                                request.reviews?.length > 0 
                                  ? "bg-white text-[#4285F4] border border-[#4285F4] hover:bg-[#4285F4] hover:text-white" 
                                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                              } transition`}
                              onClick={() => handleReviewsView(request.reviews)}
                              disabled={!request.reviews || request.reviews.length === 0}>
                              View Reviews ({request.reviews?.length || 0})
                            </button>
                            <button className={`w-full md:w-auto px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-medium ${
                              activeTab === "Completed" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                            }`}>
                              {activeTab === "Completed" ? "Completed" : "Cancelled"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center text-sm md:text-base">No {activeTab.toLowerCase()} requests found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseDetailedView}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold">Request Details</h3>
              <button onClick={handleCloseDetailedView} className="text-gray-500 hover:text-red-600">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Customer:</strong> {selectedRequest.details.customer_name}</p>
              <p><strong>Mobile:</strong> {selectedRequest.details.mobile}</p>
              <p><strong>Address:</strong> {selectedRequest.details.customer_address}</p>
              <p><strong>Service:</strong> {selectedRequest.details.service_category_name}</p>
              <p><strong>Price:</strong> ₹{selectedRequest.details.service_price}</p>
              {selectedRequest.details.cancelled_reason && (
                <p><strong>Cancel Reason:</strong> {selectedRequest.details.cancelled_reason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {selectedReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseReviewsView}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold">Customer Reviews</h3>
              <button onClick={handleCloseReviewsView} className="text-gray-500 hover:text-red-600">✕</button>
            </div>
            {selectedReviews.map((review, i) => (
              <div key={i} className="text-center py-4 border-b last:border-0">
                <div className="flex justify-center gap-1 text-2xl mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <span key={idx} className={idx < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                </div>
                <p className="italic text-gray-700">"{review.review_text}"</p>
                <p className="text-xs text-gray-500 mt-2">Review #{review.review_id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx="true">{`
        .slide-up { animation: slideUp 0.7s cubic-bezier(0.25, 0.8, 0.25, 1); }
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default Requests;