import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSubscriptionsRequest, 
  createOrderRequest, 
  clearOrderStatus, 
  verifyPaymentRequest, 
  clearPaymentVerificationStatus, 
  fetchVendorPaymentDetailsRequest 
} from '../../../saga/features/vendor/vendorSlice';
import gold from "../../../assets/gold.svg";
const key  = import.meta.env.VITE_RAZORPAY_KEY; 

const BoostServiceSection = () => {
  const dispatch = useDispatch();
  const { 
    subscriptions, 
    subscriptionsLoading, 
    subscriptionsError, 
    orderLoading, 
    orderError, 
    orderSuccess, 
    orderData,
    paymentVerificationLoading,
    paymentVerificationError,
    paymentVerificationSuccess,
    paymentVerificationResponse,
    purchasedSubscriptions,
    profile,
    vendorPaymentDetailsLoading,
    vendorPaymentDetailsError,
  } = useSelector((state) => state.vendor);

  const [processingSubscriptionId, setProcessingSubscriptionId] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    console.log("BoostServiceSection useEffect - Fetching subscriptions and payment details");
    const token = localStorage.getItem('vendorToken');
    console.log("Token from localStorage:", token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const vendorId = payload.id;
        console.log("Extracted vendorId from token:", vendorId);
        dispatch(fetchSubscriptionsRequest());
        dispatch(fetchVendorPaymentDetailsRequest(vendorId));
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    } else {
      console.log("No token found, skipping fetch");
    }
  }, [dispatch]);

  useEffect(() => {
    if (orderSuccess && orderData) {
      console.log("Order created successfully, opening Razorpay:", orderData);
      openRazorpay(orderData);
      dispatch(clearOrderStatus());
    }
  }, [orderSuccess, orderData, dispatch]);

  useEffect(() => {
    if (paymentVerificationSuccess && paymentVerificationResponse) {
      console.log("Payment verified successfully:", paymentVerificationResponse);
      setProcessingSubscriptionId(null);
      setShowSuccessOverlay(true);
    }
  }, [paymentVerificationSuccess, paymentVerificationResponse]);

  useEffect(() => {
    if (paymentVerificationError) {
      setProcessingSubscriptionId(null);
    }
  }, [paymentVerificationError]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (order) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay SDK. Please check your internet connection.");
      setProcessingSubscriptionId(null);
      return;
    }

    const options = {
      key: key,
      amount: order.amount * 100,
      currency: order.currency,
      name: "Your Company Name",
      description: "Subscription Payment",
      order_id: order.orderId,
      handler: function (response) {
        console.log("Payment successful:", response);
        const paymentData = {
          razorpay_order_id: order.orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          subscription_id: order.subscription_id,
        };
        dispatch(verifyPaymentRequest(paymentData));
      },
      prefill: {
        name: profile?.vendor_name || "Vendor",
        email: profile?.vendor_email || "",
        contact: profile?.vendor_mobile || "",
      },
      theme: {
        color: "#4285F4",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      console.log("Payment failed:", response.error);
      alert("Payment failed: " + response.error.description);
      setProcessingSubscriptionId(null);
    });
    paymentObject.open();
  };

  const handleUpgradeClick = (subscriptionId) => {
    if (purchasedSubscriptions.includes(subscriptionId)) return;
    setProcessingSubscriptionId(subscriptionId);
    const subscriptionData = { subscription_id: subscriptionId };
    console.log("Creating order for subscription:", subscriptionData);
    dispatch(createOrderRequest(subscriptionData));
  };

  const handleCloseSuccessOverlay = () => {
    setShowSuccessOverlay(false);
    dispatch(clearPaymentVerificationStatus());
  };

  const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];
  console.log("Subscriptions Array after fallback:", subscriptionsArray);
  console.log("Purchased Subscriptions:", purchasedSubscriptions);

  const SuccessOverlay = () => {
    const subscription = subscriptionsArray.find(
      (sub) => sub.subscription_id === paymentVerificationResponse?.subscription_id
    );
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-[9%] pt-[30px] pb-[3%] px-[5%] rounded-2xl shadow-lg text-center">
          <img src={gold} alt="success" className="ml-[140px] mb-[50px] w-12 h-12" />
          <h2 className="text-xl font-semibold mb-9 pb-[5%]">Payment Successful!</h2>
          {subscription && (
            <div className="mb-6">
              <p className="text-gray-700">Plan: {subscription.subscription_name}</p>
              <p className="text-gray-700">Price: ₹{subscription.subscription_price} / month</p>
            </div>
          )}
          <p className="text-gray-700 mb-6">{paymentVerificationResponse?.message}</p>
          <button
            onClick={handleCloseSuccessOverlay}
            className="bg-white border border-blue-500 text-blue-500 px-3 py-3 rounded-md w-[40%] hover:bg-blue-500 hover:text-white"
            disabled={paymentVerificationLoading}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="text-3xl font-semibold mb-6 text-[#4285F4]">
        Subscription
      </h2>
      {(subscriptionsLoading || vendorPaymentDetailsLoading) && (
        <p className="text-gray-600 mb-8 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-[#4285F4]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading subscriptions...
        </p>
      )}
      {(subscriptionsError || vendorPaymentDetailsError) && (
        <p className="text-red-500 mb-8">Error: {subscriptionsError || vendorPaymentDetailsError}</p>
      )}
      {!subscriptionsLoading && !subscriptionsError && subscriptionsArray.length === 0 && (
        <p className="text-gray-600 mb-8">No subscriptions available.</p>
      )}
      {!subscriptionsLoading && !subscriptionsError && subscriptionsArray.length > 0 && (
        <>
          <p className="text-gray-600 mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionsArray.map((plan) => {
              const isPurchased = purchasedSubscriptions.includes(plan.subscription_id);
              const isProcessing = processingSubscriptionId === plan.subscription_id;
              return (
                <div
                  key={plan.subscription_id}
                  className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-center items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl max-w-sm mx-auto"
                >
                  <img
                    src={gold}
                    alt={`${plan.subscription_name} Plan`}
                    className="w-12 h-12 rounded-full mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{plan.subscription_name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {plan.subscription_desc}
                  </p>
                  <p className="text-xl font-bold mb-4">
                    {plan.subscription_price ? `₹${plan.subscription_price} / month` : '0'}
                  </p>
                  <button
                    className={`text-white text-sm py-3 px-6 rounded-full transition duration-300 ${
                      isPurchased
                        ? "bg-green-500 hover:bg-green-600 cursor-not-allowed"
                        : "bg-[#4285F4] hover:bg-blue-600"
                    }`}
                    onClick={() => handleUpgradeClick(plan.subscription_id)}
                    disabled={isPurchased || isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : isPurchased ? "Purchased" : "Upgrade Now"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
      {(orderError || paymentVerificationError) && (
        <p className="text-red-500 mt-4 text-center">
          Error: {orderError || paymentVerificationError}
        </p>
      )}
      {showSuccessOverlay && <SuccessOverlay />}
    </>
  );
};

export default BoostServiceSection;