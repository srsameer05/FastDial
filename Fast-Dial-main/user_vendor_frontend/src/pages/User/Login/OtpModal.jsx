import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import LoginImage from "../../../assets/cuate.png";
import { loginRequest } from '../../../saga/features/customer/customerSlice';

const OtpModal = ({ isOpen, onClose, mobile, onOpenProfileModal, onOpenLoginModal }) => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user, newUser } = useSelector((state) => state.customer);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, newUser:', newUser);
      onClose();
      if (newUser) {
        console.log('Opening ProfileModal for new user');
        onOpenProfileModal();
      } else {
        console.log('Navigating to /home for existing user');
        window.location.href = '/home'; // Navigate to home, like LocationModal
      }
    }
  }, [isAuthenticated, newUser, onClose, onOpenProfileModal]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpValue = otp.join("");
    console.log('Verifying OTP:', { mobile, otp: otpValue });
    dispatch(loginRequest({ mobile, otp: otpValue }));
  };

  const handleBackToLogin = () => {
    console.log('Returning to LoginModal');
    onClose();
    onOpenLoginModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-[780px] h-auto md:h-[70%] flex flex-col md:flex-row relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg md:text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="w-full md:w-1/2 bg-blue-100 flex justify-center items-center p-4 md:p-6">
          <img src={LoginImage} alt="Login" className="w-full h-auto object-cover max-h-[250px] md:max-h-[500px]" />
        </div>
        <div className="w-full p-4 md:p-8 flex flex-col mt-4 md:mt-[7%] items-center gap-2 md:gap-2">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 text-center">Let's get things done!</h2>
          <p className="text-gray-500 text-xs md:text-sm text-center">
            Enter the OTP sent to +91-{mobile}
          </p>
          {error && <p className="text-red-500 text-xs md:text-sm">Error: {error}</p>}
          {loading && <p className="text-blue-500 text-xs md:text-sm">Verifying...</p>}
          {isAuthenticated && user && (
            <p className="text-green-500 text-xs md:text-sm">Welcome, {user.mobile}!</p>
          )}
          <div className="flex justify-center gap-1 md:gap-3 mt-4 md:mt-[15%]">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className="w-8 h-8 md:w-14 md:h-14 border border-gray-300 text-center text-lg md:text-2xl rounded-md focus:outline-none focus:border-blue-500"
              />
            ))}
          </div>
          <button
            className={`py-2 md:py-3 rounded-md w-full mt-3 md:mt-6 text-sm md:text-lg font-semibold ${
              otp.join("").length >= 4 && !loading
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleVerifyOTP}
            disabled={otp.join("").length < 4 || loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            className="mt-2 md:mt-4 text-blue-500 text-xs md:text-sm hover:underline"
            onClick={handleBackToLogin}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;