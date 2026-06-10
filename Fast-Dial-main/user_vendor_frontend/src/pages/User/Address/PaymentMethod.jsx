 import { useState, useEffect } from "react";
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
} from "../../saga/features/customer/customerSlice";
import Header from "./Header";
import Footer from "./Footer";
import image from "../../assets/image.png";
import bigImg from "../../assets/BigImg.png";

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
    selectedPaymentMethod, // Added to useSelector
  } = useSelector((state) => state.customer);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (bookingType === "now" && paymentInitiateBookNowSuccess && paymentOrderData) {
      console.log("PaymentMethod: Book Now payment order created:", paymentOrderData);
      openRazorpay(paymentOrderData, bookingId, "now");
      dispatch(clearPaymentBookNowStatus());
    } else if (bookingType === "later" && paymentInitiateSuccess && paymentOrderData) {
      console.log("PaymentMethod: Book Later payment order created:", paymentOrderData);
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
      (bookingType === "now" && paymentVerifyBookNowSuccess && paymentVerifyBookNowResponse) ||
      (bookingType === "later" && paymentVerificationSuccess && paymentVerificationResponse)
    ) {
      console.log("PaymentMethod: Payment verified successfully:", {
        bookingType,
        paymentVerifyBookNowResponse,
        paymentVerificationResponse,
        selectedPaymentMethod, // Log to verify value
      });
      setShowSuccessModal(true);
    }
  }, [
    paymentVerifyBookNowSuccess,
    paymentVerifyBookNowResponse,
    paymentVerificationSuccess,
    paymentVerificationResponse,
    bookingType,
    selectedPaymentMethod, // Added to dependencies
  ]);

  useEffect(() => {
    if (paymentInitiateBookNowError || paymentVerifyBookNowError || paymentInitiateError || paymentVerificationError) {
      alert(`Payment error: ${paymentInitiateBookNowError || paymentVerifyBookNowError || paymentInitiateError || paymentVerificationError}`);
      dispatch(bookingType === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
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
    console.log("PaymentMethod: Opening Razorpay with order:", order, "bookingId:", bookingId, "type:", type);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      console.error("PaymentMethod: Failed to load Razorpay script");
      alert("Failed to load Razorpay SDK. Please check your internet connection.");
      dispatch(type === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
      return;
    }

    const booking = customerServiceDetails?.find(
      (b) => Number(b.booking_id) === Number(bookingId)
    );
    const options = {
      key: "rzp_test_yDUVN35n9Fudx5", // Replace with your Razorpay key
      amount: parseFloat(order.amount) * 100, // Convert to paise
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
        dispatch(type === "now" ? verifyPaymentBookNowRequest(paymentData) : verifyPaymentRequest(paymentData));
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

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", function (response) {
      console.error("PaymentMethod: Razorpay payment failed:", response.error);
      alert(`Payment failed: ${response.error.description}`);
      dispatch(type === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
    });
    paymentObject.on("payment.cancel", function () {
      console.log("PaymentMethod: Razorpay modal closed by user");
      alert("Payment cancelled. Please try again.");
      dispatch(type === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
    });
    paymentObject.open();
  };

  const handleContinue = () => {
    if (!bookingId) {
      alert("Booking ID is missing. Please complete the booking process.");
      return;
    }
    console.log("PaymentMethod: Initiating payment for bookingId:", bookingId, "type:", bookingType);
    dispatch(
      bookingType === "now"
        ? initiatePaymentBookNowRequest({ booking_id: bookingId })
        : initiatePaymentRequest({ booking_id: bookingId })
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 w-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Select payment method</h2>
      <p className="text-gray-500 text-sm mb-4">Amount to pay: ₹{singleService?.service_price || "N/A"}</p>

      <PaymentOption title="Cards" subtitle="Add a new card" />
      <PaymentOption title="UPI" subtitle="Add a new UPI ID" />
      <PaymentOption title="Netbanking" subtitle="Netbanking" />

      <button
        className="w-full bg-blue-500 text-white p-3 rounded-full mt-4 sm:mt-6 hover:bg-blue-600 transition text-sm sm:text-base"
        onClick={handleContinue}
        disabled={paymentInitiateLoading || paymentVerificationLoading || paymentInitiateBookNowLoading || paymentVerifyBookNowLoading}
      >
        {(paymentInitiateLoading || paymentVerificationLoading || paymentInitiateBookNowLoading || paymentVerifyBookNowLoading)
          ? "Processing..."
          : "Continue"}
      </button>

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
                dispatch(bookingType === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
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
              Your service has been booked and payment {bookingType === "now" && selectedPaymentMethod === "cash" ? "set to Cash on Delivery" : "verified"}.
              You can check your booking on the home screen.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                className="px-4 sm:px-6 py-2 border rounded-lg text-blue-600 hover:bg-blue-100 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(bookingType === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
                  navigate("/home");
                }}
              >
                Go Home
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  setShowSuccessModal(false);
                  dispatch(bookingType === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
                  navigate("/MyBookings");
                }}
              >
                View My Bookings
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={() => {
                  navigate("/devilerystatus", {
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
                  dispatch(bookingType === "now" ? clearPaymentBookNowStatus() : clearPaymentStatus());
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

export default PaymentMethod;