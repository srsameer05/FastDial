import { useState, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaRegHeart,
  FaRegMoneyBillAlt,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleServiceRequest,
  insertServiceBookingRequest,
  insertServiceBookingLaterRequest,
  getCustomerServiceDetailsRequest,
  initiatePaymentRequest,
  verifyPaymentRequest,
  clearPaymentStatus,
  setPaymentMethod,
  initiatePaymentBookNowRequest,
  initiatePaymentBookNowSuccess,
  initiatePaymentBookNowFailure,
  verifyPaymentBookNowRequest,
  verifyPaymentBookNowSuccess,
  verifyPaymentBookNowFailure,
  clearPaymentBookNowStatus,
  insertAddressRequest,
  getCustomerAddressRequest,
  insertAddressSuccess,
  insertAddressFailure,
  getCustomerAddressSuccess,
  getCustomerAddressFailure,
  setSelectedAddressId,
  setSelectedAddress,
} from "../../saga/features/customer/customerSlice";
import Header from "./Header";
import Footer from "./Footer";
import image from "../../assets/image.png";
import bigImg from "../../assets/BigImg.png";
const key = import.meta.env.VITE_RAZORPAY_KEY;
const GoogleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const PaymentOption = ({ title, subtitle }) => (
  <div className="border-b py-3 sm:py-4 flex justify-between items-center cursor-pointer">
    <div>
      <p className="text-sm sm:text-md font-medium">{title}</p>
      <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
    </div>
    <span className="text-gray-400">●</span>
  </div>
);

const PaymentMethod = ({ bookingId, singleService, bookingType }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor_id } = location.state || {};
  const {
    customerServiceDetails,
    customerServiceDetailsLoading,
    customerServiceDetailsError,
    paymentInitiateLoading,
    paymentInitiateError,
    paymentInitiateSuccess,
    paymentOrderData,
    paymentVerificationLoading,
    paymentVerificationError,
    paymentVerificationSuccess,
    paymentVerificationResponse,
    paymentInitiateBookNowLoading,
    paymentInitiateBookNowError,
    paymentInitiateBookNowSuccess,
    paymentVerifyBookNowLoading,
    paymentVerifyBookNowError,
    paymentVerifyBookNowSuccess,
    paymentVerifyBookNowResponse,
    selectedPaymentMethod,
  } = useSelector((state) => state.customer);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (
      bookingType === "now" &&
      paymentInitiateBookNowSuccess &&
      paymentOrderData
    ) {
      console.log(
        "PaymentMethod: Book Now payment order created:",
        paymentOrderData
      );
      openRazorpay(paymentOrderData, bookingId, "now");
      dispatch(clearPaymentBookNowStatus());
    } else if (
      bookingType === "later" &&
      paymentInitiateSuccess &&
      paymentOrderData
    ) {
      console.log(
        "PaymentMethod: Book Later payment order created:",
        paymentOrderData
      );
      openRazorpay(paymentOrderData, bookingId, "later");
      dispatch(clearPaymentStatus());
    }
  }, [
    paymentInitiateBookNowSuccess,
    paymentInitiateSuccess,
    paymentOrderData,
    dispatch,
    bookingId,
    bookingType,
  ]);

  useEffect(() => {
    if (
      (bookingType === "now" &&
        paymentVerifyBookNowSuccess &&
        paymentVerifyBookNowResponse) ||
      (bookingType === "later" &&
        paymentVerificationSuccess &&
        paymentVerificationResponse)
    ) {
      console.log("PaymentMethod: Payment verified successfully:", {
        bookingType,
        paymentVerifyBookNowResponse,
        paymentVerificationResponse,
      });
      setShowSuccessModal(true);
    }
  }, [
    paymentVerifyBookNowSuccess,
    paymentVerifyBookNowResponse,
    paymentVerificationSuccess,
    paymentVerificationResponse,
    bookingType,
  ]);

  useEffect(() => {
    if (
      paymentInitiateBookNowError ||
      paymentVerifyBookNowError ||
      paymentInitiateError ||
      paymentVerificationError
    ) {
      alert(
        `Payment error: ${paymentInitiateBookNowError ||
        paymentVerifyBookNowError ||
        paymentInitiateError ||
        paymentVerificationError
        }`
      );
      dispatch(
        bookingType === "now"
          ? clearPaymentBookNowStatus()
          : clearPaymentStatus()
      );
    }
  }, [
    paymentInitiateBookNowError,
    paymentVerifyBookNowError,
    paymentInitiateError,
    paymentVerificationError,
    dispatch,
    bookingType,
  ]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      console.log("PaymentMethod: Loading Razorpay script...");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        console.log("PaymentMethod: Razorpay script loaded successfully");
        resolve(true);
      };
      script.onerror = () => {
        console.error("PaymentMethod: Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (order, bookingId, type) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert(
        "Failed to load Razorpay SDK. Please check your internet connection."
      );
      dispatch(
        type === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus()
      );
      return;
    }

    const booking = customerServiceDetails?.find(
      (b) => Number(b.booking_id) === Number(bookingId)
    );
    const options = {
      key: order.key || key,
      amount: Number(order.amount),
      currency: "INR",
      name: "Your Company Name",
      description: "Service Booking Payment",
      order_id: order.order_id,
      handler: function (response) {
        console.log("PaymentMethod: Razorpay payment successful:", response);
        const paymentData = {
          order_id: order.order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          booking_id: bookingId,
        };
        dispatch(
          type === "now"
            ? verifyPaymentBookNowRequest(paymentData)
            : verifyPaymentRequest(paymentData)
        );
      },
      prefill: {
        name: booking?.customer_name || "",
        email: booking?.customer_email || "",
        contact: booking?.mobile || "",
      },
      theme: {
        color: "#4285F4",
      },
    };
    console.log("Frontend Razorpay key:", key);
    console.log("Razorpay Order Data:", JSON.stringify(order, null, 2));
    console.log("Razorpay Options:", JSON.stringify(options, null, 2));

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", function (response) {
      console.error("PaymentMethod: Razorpay payment failed:", response.error);
      alert(`Payment failed: ${response.error.description}`);
      dispatch(
        type === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus()
      );
    });
    paymentObject.on("payment.cancel", function () {
      console.log("PaymentMethod: Razorpay modal closed by user");
      alert("Payment cancelled. Please try again.");
      dispatch(
        type === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus()
      );
    });
    paymentObject.open();
  };

  const handleContinue = () => {
    if (!bookingId) {
      alert("Booking ID is missing. Please complete the booking process.");
      return;
    }
    dispatch(
      bookingType === "now"
        ? initiatePaymentBookNowRequest({ booking_id: bookingId })
        : initiatePaymentRequest({ booking_id: bookingId })
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 w-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        Select payment method
      </h2>
      <p className="text-gray-500 text-sm mb-4">
        Amount to pay: ₹{singleService?.service_price || "N/A"}
      </p>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold mb-4">
          Pay with Razorpay
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Securely pay using Razorpay with the following options:
        </p>
        <div className="space-y-3">
          <PaymentOption
            title="Cards"
            subtitle="Pay using Debit or Credit Card"
          />
          <PaymentOption title="UPI" subtitle="Pay using any UPI app" />
          <PaymentOption
            title="Netbanking"
            subtitle="Pay directly from your bank account"
          />
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition text-sm sm:text-base w-48"
            onClick={handleContinue}
            disabled={
              paymentInitiateLoading ||
              paymentVerificationLoading ||
              paymentInitiateBookNowLoading ||
              paymentVerifyBookNowLoading
            }
          >
            {paymentInitiateLoading ||
              paymentVerificationLoading ||
              paymentInitiateBookNowLoading ||
              paymentVerifyBookNowLoading
              ? "Processing..."
              : "Continue"}
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-[90%] max-w-md relative"
          >
            <button
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowSuccessModal(false);
                dispatch(
                  bookingType === "now"
                    ? clearPaymentBookNowStatus()
                    : clearPaymentStatus()
                );
              }}
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2, rotate: 360 }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="flex items-center justify-center"
            >
              <span className="text-5xl sm:text-7xl text-green-500">✔</span>
            </motion.div>

            <h2 className="text-center text-lg sm:text-2xl font-semibold mt-4 sm:mt-5">
              Congratulations!
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base mt-2 sm:mt-3">
              Your service has been booked and payment{" "}
              {bookingType === "now" && selectedPaymentMethod === "cash"
                ? "set to Cash on Delivery"
                : "verified"}
              . You can check your booking on the home screen.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                className="px-4 sm:px-6 py-2 border rounded-lg text-blue-600 hover:bg-blue-100 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(
                    bookingType === "now"
                      ? clearPaymentBookNowStatus()
                      : clearPaymentStatus()
                  );
                  navigate("/home");
                }}
              >
                Go Home
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(
                    bookingType === "now"
                      ? clearPaymentBookNowStatus()
                      : clearPaymentStatus()
                  );
                  navigate("/MyBookings");
                }}
              >
                View My Bookings
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  navigate("/deliverystatus", {
                    state: { bookingId: bookingId, vendor_id: vendor_id },
                  });
                }}
              >
                View Vendor Location
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(
                    bookingType === "now"
                      ? clearPaymentBookNowStatus()
                      : clearPaymentStatus()
                  );
                  navigate("/Rating");
                }}
              >
                Rate Us
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ReviewSummary = ({
  setActiveSection,
  bookingId,
  singleService,
  bookingType,
  onPaymentMethodSelected,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendor_id } = useLocation().state || {};
  const {
    customerServiceDetails,
    customerServiceDetailsLoading,
    customerServiceDetailsError,
    paymentInitiateBookNowSuccess,
    paymentInitiateBookNowError,
    selectedPaymentMethod,
    customerAddresses,
  } = useSelector((state) => state.customer);
  const [retryCount, setRetryCount] = useState(0);
  const [showPaymentOptions, setShowPaymentOptions] = useState(
    bookingType === "now"
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const maxRetries = 5;
  const retryDelay = 2000;

  useEffect(() => {
    if (bookingId && !customerServiceDetailsLoading) {
      console.log(
        "ReviewSummary: Dispatching getCustomerServiceDetailsRequest for booking_id:",
        bookingId
      );
      dispatch(getCustomerServiceDetailsRequest());
    }
  }, [dispatch, bookingId]);

  useEffect(() => {
    if (
      bookingId &&
      !customerServiceDetailsLoading &&
      retryCount < maxRetries
    ) {
      const booking = customerServiceDetails?.find(
        (b) => Number(b.booking_id) === Number(bookingId)
      );
      if (!booking && !customerServiceDetailsError) {
        console.log(
          `ReviewSummary: Booking ID ${bookingId} not found, retrying (${retryCount + 1
          }/${maxRetries})`
        );
        setTimeout(() => {
          dispatch(getCustomerServiceDetailsRequest());
          setRetryCount(retryCount + 1);
        }, retryDelay);
      }
    }
  }, [
    customerServiceDetails,
    customerServiceDetailsLoading,
    customerServiceDetailsError,
    bookingId,
    retryCount,
    dispatch,
  ]);

  useEffect(() => {
    if (paymentInitiateBookNowSuccess && selectedPaymentMethod === "cash") {
      console.log(
        "ReviewSummary: Cash on Delivery payment initiated successfully"
      );
      setShowPaymentOptions(false);
      dispatch(clearPaymentBookNowStatus());
      setShowSuccessModal(true);
    }
    if (paymentInitiateBookNowError) {
      alert(`Payment error: ${paymentInitiateBookNowError}`);
      dispatch(clearPaymentBookNowStatus());
    }
  }, [
    paymentInitiateBookNowSuccess,
    paymentInitiateBookNowError,
    selectedPaymentMethod,
    dispatch,
  ]);

  if (!bookingId) {
    return (
      <div className="text-sm sm:text-base text-red-500">
        No booking ID provided
      </div>
    );
  }

  if (customerServiceDetailsLoading) {
    return (
      <div className="text-sm sm:text-base">Loading booking details...</div>
    );
  }

  if (customerServiceDetailsError) {
    return (
      <div className="text-red-500 text-sm sm:text-base">
        Error: {customerServiceDetailsError}
      </div>
    );
  }

  const booking = customerServiceDetails?.find(
    (b) => Number(b.booking_id) === Number(bookingId)
  );

  const address = customerAddresses?.find(
    (addr) => Number(addr.address_id) === Number(booking?.address_id)
  );

  const service = booking
    ? {
      name: booking.service_name || "Unknown Service",
      category: booking.service_category_name || "Unknown Category",
      price: booking.service_price || "Contact for Price",
      rating: 4.8,
      image: booking.service_category_url || bigImg,
      provider:
        booking.vendor_name ||
        booking.name_of_bussiness ||
        "Unknown Provider",
    }
    : {
      name: singleService?.service_name || "Unknown Service",
      category: singleService?.service_name || "Unknown Category",
      price: singleService?.service_price || "Contact for Price",
      rating: singleService?.rating || "N/A",
      image: singleService?.service_image_url || bigImg,
      provider: singleService?.provider || "Unknown Provider",
    };

  let bookingDate;
  let bookingStatus;
  if (booking?.booking_type === "later") {
    if (booking.scheduled_date) {
      const parsedDate = new Date(booking.scheduled_date);
      bookingDate = isNaN(parsedDate)
        ? "Invalid Date"
        : parsedDate.toLocaleDateString();
      bookingStatus = "Scheduled";
    } else {
      console.warn(
        "ReviewSummary: Missing scheduled_date for Book Later booking:",
        booking
      );
      bookingDate = "Date not available";
      bookingStatus = "Scheduled";
    }
  } else {
    bookingDate = booking?.booking_created_at
      ? new Date(booking.booking_created_at).toLocaleDateString()
      : new Date().toLocaleDateString();
    bookingStatus = "Immediate";
  }

  const taxAndFees = 0;
  const totalPrice = parseFloat(service.price || 0) + taxAndFees;

  const handlePaymentSelection = (method) => {
    dispatch(setPaymentMethod(method));
    if (method === "cash") {
      dispatch(
        initiatePaymentBookNowRequest({
          booking_id: bookingId,
          payment_method: "cash",
        })
      );
    } else {
      onPaymentMethodSelected(method);
    }
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4">
        <img
          src={service.image}
          alt={service.name}
          className="w-20 sm:w-24 h-20 sm:h-24 rounded-lg object-cover self-center sm:self-start"
        />
        <div className="flex-1">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
            {service.category}
          </span>
          <h3 className="text-base sm:text-lg font-semibold mt-2">
            {service.name}
          </h3>
          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
            <span>{service.provider}</span>
            <span className="ml-2 sm:ml-4 flex items-center">
              ⭐ <span className="ml-1">{service.rating}</span>
            </span>
          </div>
          <p className="text-blue-600 font-semibold mt-1 text-sm sm:text-base">
            ₹{service.price} / Per service
          </p>
        </div>
        <FaRegHeart className="text-gray-400 text-base sm:text-lg cursor-pointer self-center sm:self-start" />
      </div>

      <hr className="border-gray-200 my-3 sm:my-4" />

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex justify-between text-xs sm:text-sm">
          <p className="text-gray-500">Booking Date</p>
          <p className="font-semibold">
            {bookingDate} | {bookingStatus}
          </p>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <p className="text-gray-500">Customer</p>
          <p className="font-semibold">
            {booking?.customer_name || "Unknown Customer"}
          </p>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <p className="text-gray-500">Address</p>
          <p className="font-semibold">
            {address?.full_addres || "No address selected"}
          </p>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <p className="text-gray-500">Amount</p>
          <p className="font-semibold">₹{service.price}</p>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <p className="text-gray-500">Tax & Fees</p>
          <p className="font-semibold">₹{taxAndFees.toFixed(2)}</p>
        </div>
      </div>

      <hr className="border-gray-200 my-3 sm:my-4" />

      <div className="p-3 sm:p-4 flex justify-between text-base sm:text-lg font-semibold">
        <p>Total:</p>
        <p className="text-gray-900">₹{totalPrice.toFixed(2)}</p>
      </div>

      {showPaymentOptions && (
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold mb-2">
            Select Payment Method
          </h3>
          <div className="flex gap-4">
            <button
              className="flex-1 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition text-sm sm:text-base"
              onClick={() => handlePaymentSelection("cash")}
            >
              Cash on Delivery
            </button>
            <button
              className="flex-1 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition text-sm sm:text-base"
              onClick={() => handlePaymentSelection("online")}
            >
              Online Payment
            </button>
          </div>
        </div>
      )}

      {bookingType === "later" && (
        <button
          className="w-full bg-blue-500 text-white text-sm sm:text-lg font-semibold py-2 sm:py-3 rounded-lg mt-3 sm:mt-4 hover:bg-blue-600 transition"
          onClick={() => {
            dispatch(initiatePaymentRequest({ booking_id: bookingId }));
            setActiveSection("Payment Method");
          }}
        >
          Continue
        </button>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-[90%] max-w-md relative"
          >
            <button
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowSuccessModal(false);
                dispatch(clearPaymentBookNowStatus());
              }}
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2, rotate: 360 }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="flex items-center justify-center"
            >
              <span className="text-5xl sm:text-7xl text-green-500">✔</span>
            </motion.div>

            <h2 className="text-center text-lg sm:text-2xl font-semibold mt-4 sm:mt-5">
              Congratulations!
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base mt-2 sm:mt-3">
              Your service has been booked and payment set to Cash on Delivery.
              You can check your booking on the home screen.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                className="px-4 sm:px-6 py-2 border rounded-lg text-blue-600 hover:bg-blue-100 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(clearPaymentBookNowStatus());
                  navigate("/home");
                }}
              >
                Go Home
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(clearPaymentBookNowStatus());
                  navigate("/MyBookings");
                }}
              >
                View My Bookings
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  navigate("/deliverystatus", {
                    state: { bookingId: bookingId, vendor_id: vendor_id },
                  });
                }}
              >
                View Vendor Location
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(clearPaymentBookNowStatus());
                  navigate("/Rating");
                }}
              >
                Rate Us
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const BookingConfirmationSection = ({
  serviceId,
  vendorId,
  onConfirm,
  singleService,
  singleServiceLoading,
  singleServiceError,
  bookingType,
  addressId,
  address,
}) => {
  const dispatch = useDispatch();
  const { user, bookingLoading, bookingError, lastBookingId } = useSelector(
    (state) => state.customer
  );
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [bookingAttempted, setBookingAttempted] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  const handleDisallowCopyPaste = (e) => {
    e.preventDefault();
  };

  const handleImageError = (e) => {
    console.log(`BookingConfirmation: Image failed to load: ${e.target.src}`);
    e.target.src = image;
  };

  const selectedService = singleService
    ? {
      name: singleService.service_name || "Unknown Service",
      category: singleService.service_name || "Unknown Category",
      price: singleService.service_price || "Contact for Price",
      rating: singleService.rating || "N/A",
      reviews: singleService.reviews || 678,
      image: singleService.service_image_url || bigImg,
      provider: singleService.provider || "Unknown Provider",
      description:
        singleService.service_description || "Comprehensive service",
    }
    : {
      name: "Unknown Service",
      category: "Unknown Category",
      price: "Contact for Price",
      rating: "N/A",
      reviews: "N/A",
      image: bigImg,
      provider: "Unknown Provider",
      description: "Comprehensive service",
    };

  console.log(
    "BookingConfirmation: addressId:",
    addressId,
    "address:",
    address
  );

  const handleConfirmBooking = () => {
    const customerId = user?.customer_id || localStorage.getItem("customer_id");
    if (!customerId) {
      setErrorMessage("Please log in to book a service");
      return;
    }
    if (!serviceId) {
      setErrorMessage("Service ID is missing");
      return;
    }
    if (!addressId) {
      setErrorMessage("Address is mandatory. Please add an address.");
      return;
    }

    let bookingData;
    let action;
    if (bookingType === "now") {
      bookingData = {
        service_id: parseInt(serviceId),
        customer_id: parseInt(customerId),
        address_id: parseInt(addressId),
      };
      action = insertServiceBookingRequest(bookingData);
    } else if (bookingType === "later") {
      if (!vendorId) {
        setErrorMessage("Vendor ID is missing for Book Later");
        return;
      }
      if (!scheduledDate) {
        setErrorMessage("Please select a scheduled date for Book Later");
        return;
      }
      const parsedDate = new Date(scheduledDate);
      if (isNaN(parsedDate)) {
        setErrorMessage("Invalid date format selected");
        return;
      }
      if (parsedDate < new Date().setHours(0, 0, 0, 0)) {
        setErrorMessage("Scheduled date cannot be in the past");
        return;
      }
      bookingData = {
        vendor_id: parseInt(vendorId),
        service_id: parseInt(serviceId),
        customer_id: parseInt(customerId),
        booking_type: "later",
        scheduled_date: parsedDate.toISOString().split("T")[0],
        address_id: parseInt(addressId),
      };
      action = insertServiceBookingLaterRequest(bookingData);
    } else {
      setErrorMessage("Invalid booking type");
      return;
    }

    console.log("BookingConfirmation: Dispatching action with:", bookingData);
    setBookingAttempted(true);
    dispatch(action);
  };

  useEffect(() => {
    if (bookingAttempted) {
      if (bookingError) {
        setErrorMessage(bookingError);
        setSuccessMessage(null);
        setBookingAttempted(false);
      } else if (!bookingLoading && lastBookingId) {
        setErrorMessage(null);
        setSuccessMessage("Service booked successfully!");
        dispatch(getCustomerServiceDetailsRequest());
        onConfirm(lastBookingId);
      } else if (!bookingLoading && !lastBookingId) {
        setErrorMessage(
          "Booking failed: No booking ID returned. Please try again."
        );
        setBookingAttempted(false);
      }
    }
  }, [
    bookingLoading,
    bookingError,
    bookingAttempted,
    lastBookingId,
    dispatch,
    onConfirm,
  ]);

  return (
    <div className="w-full p-4 sm:p-6">
      {singleServiceLoading ? (
        <div className="text-sm sm:text-base">Loading service...</div>
      ) : singleServiceError ? (
        <div className="text-red-500 text-sm sm:text-base">
          Error loading service: {singleServiceError}
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          <img
            src={selectedService.image}
            alt={selectedService.name}
            className="rounded-lg w-full max-w-[200px] sm:max-w-[250px] h-auto mx-auto sm:mx-0"
            onError={handleImageError}
            onContextMenu={handleDisallowCopyPaste}
            onCopy={handleDisallowCopyPaste}
            onPaste={handleDisallowCopyPaste}
            onCut={handleDisallowCopyPaste}
            onDrag={handleDisallowCopyPaste}
            onDrop={handleDisallowCopyPaste}
          />
          <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
            {selectedService.category}
          </span>
          <h2 className="text-lg sm:text-xl font-semibold">
            {selectedService.name}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {selectedService.description}
          </p>
          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
            <span>👤 {selectedService.provider}</span>
            <span className="ml-2 sm:ml-4 flex items-center">
              ⭐ <span className="ml-1">{selectedService.rating}</span>
            </span>
          </div>
          <p className="text-blue-600 font-semibold text-sm sm:text-base">
            ₹{selectedService.price} / Per service
          </p>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-gray-700 font-medium text-sm sm:text-base">
              Selected Address
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {address?.full_addres || "No address selected"}
            </p>
          </div>
          {bookingType === "later" && (
            <div className="mt-3 sm:mt-4">
              <label className="text-gray-700 font-medium text-sm sm:text-base">
                Select Scheduled Date
              </label>
              <p className="text-gray-500 text-xs sm:text-sm mb-2">
                Choose a future date for your service
              </p>
              <input
                type="date"
                className="border rounded-md p-2 w-full mt-1 sm:mt-2 text-sm sm:text-base"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
              {scheduledDate && (
                <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
                  Scheduled for: {new Date(scheduledDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          {errorMessage && (
            <div className="text-red-500 text-xs sm:text-sm mt-2">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="text-green-500 text-xs sm:text-sm mt-2">
              {successMessage}
            </div>
          )}
          <button
            className="w-full bg-blue-500 text-white p-2 sm:p-3 rounded-full mt-4 sm:mt-6 hover:bg-blue-600 transition text-sm sm:text-base"
            onClick={handleConfirmBooking}
            disabled={bookingLoading || singleServiceLoading || !addressId}
          >
            {bookingLoading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
};


const AddAddressSection = ({ onAddressAdded }) => {
  const dispatch = useDispatch();
  const {
    insertAddressLoading,
    insertAddressError,
    getCustomerAddressLoading,
    getCustomerAddressError,
    selectedAddressId,
    selectedAddress,
  } = useSelector((state) => state.customer);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [geolocationError, setGeolocationError] = useState(null);
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [locationMode, setLocationMode] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);
  const placesServiceRef = useRef(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GoogleMapsApiKey}&libraries=places`;
        script.async = true;
        script.onload = () => {
          console.log("AddAddressSection: Google Maps API loaded");
          initializeMapAndServices();
        };
        script.onerror = () => {
          console.error("AddAddressSection: Failed to load Google Maps API");
          setErrorMessage("Failed to load Google Maps API. Please try again.");
        };
        document.body.appendChild(script);
      } else {
        initializeMapAndServices();
      }
    };

    const initializeMapAndServices = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteRef.current =
          new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        const tempDiv = document.createElement("div");
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          tempDiv
        );
        initializeMap();
        console.log("AddAddressSection: Google Maps services initialized");
      }
    };

    loadGoogleMapsScript();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) {
      console.error(
        "AddAddressSection: Map container or Google Maps API not available"
      );
      return;
    }

    const defaultLocation = { lat: 13.0827, lng: 80.2707 };
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 15,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    });

    if (locationMode === "search") {
      mapInstanceRef.current.addListener("click", (event) => {
        const position = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        placeMarker(position);
        fetchAddressFromCoords(position);
      });
    }

    if (navigator.geolocation && locationMode === "geolocation") {
      setGeolocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstanceRef.current.setCenter(userLocation);
          placeMarker(userLocation);
          fetchAddressFromCoords(userLocation);
          setGeolocationLoading(false);
          console.log("AddAddressSection: Map centered on geolocation:", userLocation);
        },
        (error) => {
          console.warn(
            "AddAddressSection: Geolocation for map centering failed:",
            error.message
          );
          placeMarker(defaultLocation);
          setGeolocationLoading(false);
          setGeolocationError(
            "Unable to fetch current location. Please select 'Search Location' or try again."
          );
        }
      );
    } else {
      placeMarker(defaultLocation);
    }

    console.log("AddAddressSection: Map initialized for mode:", locationMode);
  };

  const placeMarker = (position) => {
    if (!mapInstanceRef.current) {
      console.warn("AddAddressSection: Map not initialized");
      return;
    }

    const numericPosition = {
      lat: parseFloat(position.lat),
      lng: parseFloat(position.lng),
    };
    if (isNaN(numericPosition.lat) || isNaN(numericPosition.lng)) {
      console.error("AddAddressSection: Invalid position for marker:", position);
      setErrorMessage("Invalid coordinates. Please try again.");
      return;
    }

    if (markerRef.current) {
      markerRef.current.setPosition(numericPosition);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: numericPosition,
        map: mapInstanceRef.current,
        draggable: locationMode === "search",
        title: "Selected Location",
      });

      if (locationMode === "search") {
        markerRef.current.addListener("dragend", () => {
          const newPosition = {
            lat: markerRef.current.getPosition().lat(),
            lng: markerRef.current.getPosition().lng(),
          };
          setLatitude(newPosition.lat.toFixed(5));
          setLongitude(newPosition.lng.toFixed(5));
          fetchAddressFromCoords(newPosition);
        });
      }
    }
    setLatitude(numericPosition.lat.toFixed(5));
    setLongitude(numericPosition.lng.toFixed(5));
    mapInstanceRef.current.setCenter(numericPosition);
    console.log("AddAddressSection: Marker placed and map centered at:", numericPosition);
  };

  const fetchAddressFromCoords = (position) => {
    if (!geocoderRef.current) {
      setErrorMessage("Geocoder service not initialized");
      return;
    }
    const numericPosition = {
      lat: parseFloat(position.lat),
      lng: parseFloat(position.lng),
    };
    if (isNaN(numericPosition.lat) || isNaN(numericPosition.lng)) {
      setErrorMessage("Invalid coordinates provided");
      return;
    }
    geocoderRef.current.geocode(
      { location: numericPosition },
      (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
          setFullAddress(results[0].formatted_address);
          console.log(
            "AddAddressSection: Address fetched from coordinates:",
            results[0].formatted_address
          );
        } else {
          console.error("AddAddressSection: Geocoding failed:", status);
          setFullAddress("");
          setErrorMessage(
            "Unable to fetch address for this location. Please try another spot."
          );
        }
      }
    );
  };

  useEffect(() => {
    dispatch(getCustomerAddressRequest());
  }, [dispatch]);

  useEffect(() => {
    if (insertAddressError) {
      setErrorMessage(insertAddressError);
      setSuccessMessage(null);
      console.log("AddAddressSection: Insert address error:", insertAddressError);
    }
  }, [insertAddressError]);

  useEffect(() => {
    if (!insertAddressLoading && selectedAddressId) {
      console.log(
        "AddAddressSection: Address addition successful, selectedAddressId:",
        selectedAddressId,
        "selectedAddress:",
        selectedAddress
      );
      const newAddress = {
        address_id: selectedAddressId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        full_addres: fullAddress,
      };
      setSuccessMessage("Address added successfully!");
      setErrorMessage(null);
      dispatch(setSelectedAddress(newAddress));
      onAddressAdded({ addressId: selectedAddressId, address: newAddress });
      dispatch(getCustomerAddressRequest());
    }
  }, [
    insertAddressLoading,
    selectedAddressId,
    selectedAddress,
    latitude,
    longitude,
    fullAddress,
    onAddressAdded,
    dispatch,
  ]);

  useEffect(() => {
    if (locationMode === "search" && searchQuery && autocompleteRef.current) {
      autocompleteRef.current.getPlacePredictions(
        { input: searchQuery, types: ["address"] },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            console.log(
              "AddAddressSection: Place suggestions fetched:",
              predictions
            );
            setPlaceSuggestions(predictions);
          } else {
            console.log(
              "AddAddressSection: No place suggestions found or error:",
              status
            );
            setPlaceSuggestions([]);
          }
        }
      );
    } else {
      setPlaceSuggestions([]);
    }
  }, [searchQuery, locationMode]);

  const handlePlaceSelect = (place) => {
    if (!place || !place.place_id) {
      setErrorMessage("Invalid place selected");
      return;
    }

    placesServiceRef.current.getDetails(
      { placeId: place.place_id },
      (placeResult, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          console.log("AddAddressSection: Place details fetched:", placeResult);
          const lat = placeResult.geometry.location.lat();
          const lng = placeResult.geometry.location.lng();
          const address = placeResult.formatted_address;
          setLatitude(lat.toFixed(5));
          setLongitude(lng.toFixed(5));
          setFullAddress(address);
          setSearchQuery(address);
          setPlaceSuggestions([]);
          setIsSearchFocused(false);
          if (mapInstanceRef.current) {
            const position = { lat, lng };
            mapInstanceRef.current.setCenter(position);
            placeMarker(position);
            console.log(
              "AddAddressSection: Map centered and marker placed at:",
              position
            );
          } else {
            console.error(
              "AddAddressSection: Map instance not available"
            );
            setErrorMessage("Map failed to load. Please try again.");
          }
          console.log("AddAddressSection: Selected place coordinates:", {
            lat,
            lng,
            address,
          });
        } else {
          console.error(
            "AddAddressSection: Failed to fetch place details:",
            status
          );
          setErrorMessage("Failed to fetch place details. Please try again.");
        }
      }
    );
  };

  useEffect(() => {
    if (locationMode === "geolocation" && navigator.geolocation) {
      setGeolocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat.toFixed(5));
          setLongitude(lon.toFixed(5));
          setGeolocationError(null);
          console.log("AddAddressSection: Geolocation fetched:", {
            lat,
            lon,
          });
          if (mapInstanceRef.current) {
            const position = { lat, lng: lon };
            mapInstanceRef.current.setCenter(position);
            placeMarker(position);
            fetchAddressFromCoords(position);
          } else {
            console.warn("AddAddressSection: Map not initialized for geolocation");
            fetchAddressFromCoords({ lat, lng: lon });
          }
          setGeolocationLoading(false);
        },
        (error) => {
          console.error(
            "AddAddressSection: Geolocation error:",
            error.message
          );
          setGeolocationLoading(false);
          setGeolocationError(
            "Unable to fetch current location. Please select 'Search Location' or try again."
          );
        }
      );
    } else if (locationMode === "geolocation" && !navigator.geolocation) {
      setGeolocationLoading(false);
      setGeolocationError("Geolocation is not supported by this browser.");
    }
  }, [locationMode]);

  const handleAddAddress = () => {
    if (!latitude || !longitude || !fullAddress) {
      setErrorMessage(
        "Please provide both location coordinates and full address."
      );
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      setErrorMessage("Invalid latitude or longitude values.");
      return;
    }

    const addressData = {
      address: {
        latitude: lat,
        longitude: lon,
        full_addres: fullAddress,
      },
    };

    console.log(
      "AddAddressSection: Dispatching insertAddressRequest with:",
      addressData
    );
    dispatch(insertAddressRequest(addressData));
  };

  return (
    <div className="w-full p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Add Address</h2>
      {geolocationError && locationMode === "geolocation" && (
        <div className="text-red-500 text-xs sm:text-sm mb-2">
          {geolocationError}
        </div>
      )}
      {getCustomerAddressError && (
        <div className="text-red-500 text-xs sm:text-sm mb-2">
          {getCustomerAddressError}
        </div>
      )}
      {errorMessage && (
        <div className="text-red-500 text-xs sm:text-sm mb-2">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="text-green-500 text-xs sm:text-sm mb-2">
          {successMessage}
        </div>
      )}
      {geolocationLoading && (
        <div className="text-gray-500 text-xs sm:text-sm mb-2">
          Fetching current location...
        </div>
      )}
      <div className="space-y-4">
        <div className="flex gap-4 mb-4">
          <button
            className={`flex-1 p-2 rounded-md text-sm sm:text-base transition ${locationMode === "geolocation"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            onClick={() => {
              setLocationMode("geolocation");
              setSearchQuery("");
              setPlaceSuggestions([]);
              setLatitude("");
              setLongitude("");
              setFullAddress("");
              setSuccessMessage(null);
              setErrorMessage(null);
              setGeolocationError(null);
              setGeolocationLoading(false);
              if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
              }
            }}
            disabled={geolocationLoading}
          >
            Fetch Current Location
          </button>
          <button
            className={`flex-1 p-2 rounded-md text-sm sm:text-base transition ${locationMode === "search"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            onClick={() => {
              setLocationMode("search");
              setLatitude("");
              setLongitude("");
              setFullAddress("");
              setSearchQuery("");
              setPlaceSuggestions([]);
              setSuccessMessage(null);
              setErrorMessage(null);
              setGeolocationError(null);
              setGeolocationLoading(false);
              if (!mapInstanceRef.current) {
                initializeMap();
              }
            }}
            disabled={geolocationLoading}
          >
            Search Location
          </button>
        </div>
        {locationMode === "search" && (
          <div className="relative">
            <label className="text-gray-700 font-medium text-sm sm:text-base">
              Search Address
            </label>
            <input
              type="text"
              className="border rounded-md p-2 w-full mt-1 sm:mt-2 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Type to search for an address (e.g., Chennai)"
              disabled={geolocationLoading}
            />
            {isSearchFocused && placeSuggestions.length > 0 && (
              <div className="absolute w-full max-w-[calc(100%-2rem)] bg-white border rounded-md shadow-md z-10 max-h-60 overflow-y-auto mt-1">
                {placeSuggestions.map((place) => (
                  <div
                    key={place.place_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                    onClick={() => handlePlaceSelect(place)}
                  >
                    {place.description}
                  </div>
                ))}
              </div>
            )}
            {isSearchFocused &&
              placeSuggestions.length === 0 &&
              searchQuery && (
                <div className="absolute w-full max-w-[calc(100%-2rem)] bg-white border rounded-md shadow-md z-10 p-2 mt-1">
                  <p className="text-sm">No addresses found</p>
                </div>
              )}
          </div>
        )}
        <div>
          <div>
            <label className="text-gray-700 font-medium text-sm sm:text-base">
              Map
            </label>
            <div
              ref={mapRef}
              className="w-full h-96 mt-2 rounded-md border"
            ></div>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              {locationMode === "search"
                ? "Click on the map to drop a pin or drag the pin to select a location"
                : "Map shows your current location. Please confirm the address below."}
            </p>
          </div>
          <label className="text-gray-700 font-medium text-sm sm:text-base">
            Latitude
          </label>
          <input
            type="text"
            className="border rounded-md p-2 w-full mt-1 sm:mt-2 text-sm sm:text-base"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Enter latitude or use selected method"
            disabled={geolocationLoading}
          />
        </div>
        <div>
          <label className="text-gray-700 font-medium text-sm sm:text-base">
            Longitude
          </label>
          <input
            type="text"
            className="border rounded-md p-2 w-full mt-1 sm:mt-2 text-sm sm:text-base"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Enter longitude or use selected method"
            disabled={geolocationLoading}
          />
        </div>
        <div>
          <label className="text-gray-700 font-medium text-sm sm:text-base">
            Full Address
          </label>
          <textarea
            className="border rounded-md p-2 w-full mt-1 sm:mt-2 text-sm sm:text-base"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            placeholder="Enter full address (e.g., 123 Anna Salai, Chennai)"
            rows="4"
            disabled={geolocationLoading}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white p-2 sm:p-3 rounded-full mt-4 sm:mt-6 hover:bg-blue-600 transition text-sm sm:text-base"
          onClick={handleAddAddress}
          disabled={
            insertAddressLoading ||
            getCustomerAddressLoading ||
            geolocationLoading ||
            (!latitude && !longitude && !fullAddress)
          }
        >
          {insertAddressLoading
            ? "Adding Address..."
            : "Add Address"}
        </button>
      </div>
    </div>
  );
};


const AddressForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    hideSlot,
    service_id,
    vendor_id,
    bookingType = "now",
  } = location.state || {};
  const {
    singleService,
    singleServiceLoading,
    singleServiceError,
    lastBookingId,
    selectedPaymentMethod,
    customerAddresses,
    selectedAddressId,
    selectedAddress,
  } = useSelector((state) => state.customer);
  const [activeSection, setActiveSection] = useState("Add Address");
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("AddressForm: location.state:", {
      hideSlot,
      service_id,
      vendor_id,
      bookingType,
    });
    console.log("AddressForm: Redux state:", {
      selectedAddressId,
      selectedAddress,
      customerAddresses,
    });
    if (!service_id) {
      setError("Service ID is missing. Please select a service.");
      navigate("/home");
      return;
    }
    if (bookingType === "later" && !vendor_id) {
      setError("Vendor ID is missing for Book Later. Please select a vendor.");
      navigate("/home");
      return;
    }
    dispatch(getSingleServiceRequest(service_id));
    dispatch(getCustomerAddressRequest());
  }, [dispatch, service_id, vendor_id, bookingType, navigate]);

  const sections = [
    {
      name: "Add Address",
      icon: <FaMapMarkerAlt className="mr-1 sm:mr-2 text-gray-500" size={16} />,
    },
    {
      name: "Booking Confirmation",
      icon: <FaMapMarkerAlt className="mr-1 sm:mr-2 text-gray-500" size={16} />,
    },
    {
      name: "Review Summary",
      icon: <FaMapMarkerAlt className="mr-1 sm:mr-2 text-gray-500" size={16} />,
    },
    {
      name: "Payment Method",
      icon: (
        <FaRegMoneyBillAlt className="mr-1 sm:mr-2 text-gray-500" size={16} />
      ),
      hidden: bookingType === "later",
    },
  ].filter((section) => !section.hidden);

  const handleAddressAdded = ({ addressId, address }) => {
    console.log(
      "AddressForm: Address added with addressId:",
      addressId,
      "address:",
      address
    );
    dispatch(setSelectedAddressId(addressId));
    dispatch(setSelectedAddress(address));
    setActiveSection("Booking Confirmation");
  };

  const handleConfirmBooking = (bookingId) => {
    if (bookingId) {
      console.log(
        "AddressForm: Moving to Review Summary with lastBookingId:",
        bookingId
      );
      setActiveSection("Review Summary");
    } else {
      console.error(
        "AddressForm: No lastBookingId available when moving to Review Summary"
      );
      setError("Booking ID is missing. Please try again.");
    }
  };

  const handlePaymentMethodSelected = (method) => {
    dispatch(setPaymentMethod(method));
    if (method === "cash") {
      dispatch(
        initiatePaymentBookNowRequest({
          booking_id: lastBookingId,
          payment_method: "cash",
        })
      );
    } else {
      setActiveSection("Payment Method");
    }
  };

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-red-500 text-sm sm:text-base">
        {error}
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .content-container {
            min-height: calc(100vh - 120px);
            -webkit-overflow-scrolling: touch;
          }
          .sidebar {
            transition: all 0.3s ease;
          }
          .section-item {
            transition: background-color 0.2s ease;
          }
          @media (max-width: 640px) {
            .sidebar {
              width: 100%;
              max-width: none;
            }
            .content-area {
              width: 100%;
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="w-full max-w-[95%] mx-auto p-4 sm:p-6 content-container">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-full sm:w-64 sidebar bg-gray-50 border rounded-lg p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                Booking
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.name}
                    className={`section-item p-2 sm:p-3 rounded-lg flex items-center cursor-pointer ${activeSection === section.name
                      ? "bg-gray-200"
                      : "border hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      if (
                        section.name !== "Add Address" &&
                        !selectedAddressId &&
                        section.name !== activeSection
                      ) {
                        alert("Please add an address first.");
                        return;
                      }
                      setActiveSection(section.name);
                    }}
                  >
                    {section.icon}
                    <span className="text-sm sm:text-base">{section.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 content-area bg-white shadow-md rounded-lg p-4 sm:p-6">
              {activeSection === "Add Address" && (
                <AddAddressSection onAddressAdded={handleAddressAdded} />
              )}
              {activeSection === "Booking Confirmation" && (
                <BookingConfirmationSection
                  serviceId={service_id}
                  vendorId={vendor_id}
                  onConfirm={handleConfirmBooking}
                  singleService={singleService}
                  singleServiceLoading={singleServiceLoading}
                  singleServiceError={singleServiceError}
                  bookingType={bookingType}
                  addressId={selectedAddressId}
                  address={selectedAddress}
                />
              )}
              {activeSection === "Review Summary" && (
                <ReviewSummary
                  setActiveSection={setActiveSection}
                  bookingId={lastBookingId}
                  singleService={singleService}
                  bookingType={bookingType}
                  onPaymentMethodSelected={handlePaymentMethodSelected}
                />
              )}
              {activeSection === "Payment Method" && (
                <PaymentMethod
                  bookingId={lastBookingId}
                  singleService={singleService}
                  bookingType={bookingType}
                />
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AddressForm;
