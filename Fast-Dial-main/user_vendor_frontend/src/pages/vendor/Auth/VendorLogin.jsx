 import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  vendorLoginRequest, 
  forgotPasswordRequest, 
  verifyOtpRequest, 
  resetPasswordRequest, 
  clearForgotPasswordStatus 
} from '../../../saga/features/vendor/vendorSlice';
import fastdialLogo from '../../../assets/Quick Serve 10.png';
import workman from '../../../assets/Workman.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [forgotMobile, setForgotMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const otpRefs = useRef([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    loading, 
    error, 
    isAuthenticated, 
    forgotPasswordLoading, 
    forgotPasswordError, 
    forgotPasswordSuccess, 
    verifyOtpLoading, 
    verifyOtpError, 
    verifyOtpSuccess, 
    resetPasswordLoading, 
    resetPasswordError, 
    resetPasswordSuccess 
  } = useSelector((state) => state.vendor);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Navigating to /vendordashboard');
      navigate('/vendordashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (forgotPasswordSuccess) {
      setMessage(`The OTP has been sent to ${forgotMobile}. Please check your phone!`);
      setTimeout(() => {
        setMessage('');
        setStep(2);
        dispatch(clearForgotPasswordStatus());
      }, 2000);
    }
    if (forgotPasswordError) {
      setMessage(forgotPasswordError);
    }
  }, [forgotPasswordSuccess, forgotPasswordError, forgotMobile, dispatch]);

  useEffect(() => {
    if (verifyOtpSuccess) {
      setMessage('');
      setStep(3);
      dispatch(clearForgotPasswordStatus());
    }
    if (verifyOtpError) {
      setMessage(verifyOtpError);
    }
  }, [verifyOtpSuccess, verifyOtpError, dispatch]);

  useEffect(() => {
    if (resetPasswordSuccess) {
      setMessage('Password has been updated successfully!');
      setTimeout(() => {
        setShowForgotPassword(false);
        setStep(1);
        setForgotMobile('');
        setOtp(['', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        setMessage('');
        dispatch(clearForgotPasswordStatus());
      }, 2000);
    }
    if (resetPasswordError) {
      setMessage(resetPasswordError);
    }
  }, [resetPasswordSuccess, resetPasswordError, dispatch]);

  const handleLogin = (e) => {
    e.preventDefault();
    const credentials = { vendor_email: email, vendor_password: password };
    console.log('Login credentials:', credentials);
    dispatch(vendorLoginRequest(credentials));
  };

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    const mobileData = { vendor_mobile: forgotMobile };
    console.log('Forgot Password Mobile:', mobileData);
    dispatch(forgotPasswordRequest(mobileData));
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 4) {
      const otpData = { vendor_mobile: forgotMobile, otp: otpValue };
      console.log('OTP Data:', otpData);
      dispatch(verifyOtpRequest(otpData));
    } else {
      setMessage('Please enter a valid 4-digit OTP!');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    const passwordData = { vendor_mobile: forgotMobile, new_password: newPassword };
    console.log('Update Password Data:', passwordData);
    dispatch(resetPasswordRequest(passwordData));
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    const digit = value.replace(/\D/, '');
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      otpRefs.current[index + 1].focus();
    }
    if (!digit && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .click-scale {
          transition: transform 0.2s ease-in-out;
        }
        .click-scale:active {
          transform: scale(0.95);
        }
        @media (max-width: 640px) {
          .image-section {
            display: none;
          }
          .form-section {
            width: 100%;
          }
          .modal {
            width: 90%;
            max-width: 360px;
          }
        }
      `}</style>
      <div className="flex flex-col sm:flex-row h-screen">
        <div className="image-section w-full sm:w-1/2 h-48 sm:h-full overflow-hidden" style={{ backgroundColor: '#7AACFF' }}>
          <img src={workman} alt="Construction Worker" className="w-full h-full object-cover" />
        </div>
        <div className="form-section w-full sm:w-1/2 flex items-center justify-center" style={{ backgroundColor: '#7AACFF' }}>
          <div className="w-[90%] max-w-md p-4 sm:p-6 md:p-8 fade-in">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img src={fastdialLogo} alt="Fastdial Logo" className="h-12 sm:h-15" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">Login</h2>
            <p className="text-center text-white text-sm sm:text-base mb-4 sm:mb-6">Hi! Welcome back to Quick Serve</p>
            {error && <p className="text-center text-red-500 text-sm sm:text-base mb-4">{error}</p>}
            <form className="bg-gray-200 p-4 sm:p-6 rounded-lg shadow-lg" onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-1">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-sm sm:text-base"
                  required
                />
              </div>
              <div className="text-right mb-4">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}
                  className="text-xs sm:text-sm text-[#9E9E9E] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-white py-2 rounded-lg hover:bg-[#7AACFF] transition duration-300 click-scale text-sm sm:text-base"
                style={{ backgroundColor: '#4285F4' }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            <p className="text-center text-white text-sm sm:text-base mt-3 sm:mt-4">
              Don't have an account?{' '}
              <Link to="/vendorlist" className="text-black hover:underline" state={{ fromVendorLogin: true }}>
                Sign Up
              </Link>
            </p>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in">
                <div className="modal bg-white p-4 sm:p-6 rounded-lg shadow-lg w-[90%] max-w-sm sm:max-w-md" style={{ borderRadius: '15px' }}>
                  {step === 1 && (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4">Forgot Password</h3>
                      <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                        To reset your password, please enter your mobile number.
                      </p>
                      <form onSubmit={handleMobileSubmit}>
                        <div className="mb-4 sm:mb-6">
                          <input
                            type="text"
                            value={forgotMobile}
                            onChange={(e) => setForgotMobile(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-sm sm:text-base"
                            placeholder="Enter your mobile number"
                            required
                          />
                        </div>
                        {forgotPasswordError && (
                          <p className="text-center text-red-500 text-sm mb-4">{forgotPasswordError}</p>
                        )}
                        {message && (
                          <p className="text-center text-green-600 text-sm mb-4">{message}</p>
                        )}
                        <button
                          type="submit"
                          className="w-full text-white py-2 rounded-lg hover:bg-[#7AACFF] transition duration-300 click-scale text-sm sm:text-base"
                          style={{ backgroundColor: '#4285F4', borderRadius: '5px' }}
                          disabled={forgotPasswordLoading}
                        >
                          {forgotPasswordLoading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                      </form>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4">Enter OTP</h3>
                      <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                        Enter the 4-digit OTP sent to {forgotMobile}.
                      </p>
                      <form onSubmit={handleOtpSubmit}>
                        <div className="flex justify-center mb-4 sm:mb-6">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              ref={(el) => (otpRefs.current[index] = el)}
                              className="w-10 sm:w-12 h-10 sm:h-12 mx-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-sm sm:text-base"
                              required
                            />
                          ))}
                        </div>
                        {verifyOtpError && (
                          <p className="text-center text-red-500 text-sm mb-4">{verifyOtpError}</p>
                        )}
                        {message && (
                          <p className="text-center text-green-600 text-sm mb-4">{message}</p>
                        )}
                        <button
                          type="submit"
                          className="w-full text-white py-2 rounded-lg hover:bg-[#7AACFF] transition duration-300 click-scale text-sm sm:text-base"
                          style={{ backgroundColor: '#4285F4', borderRadius: '5px' }}
                          disabled={verifyOtpLoading}
                        >
                          {verifyOtpLoading ? 'Verifying...' : 'Submit'}
                        </button>
                      </form>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4">Set New Password</h3>
                      <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-4 sm:mb-6">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-sm sm:text-base"
                            placeholder="New Password"
                            required
                          />
                        </div>
                        <div className="mb-4 sm:mb-6">
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-sm sm:text-base"
                            placeholder="Re-Enter Password"
                            required
                          />
                        </div>
                        {resetPasswordError && (
                          <p className="text-center text-red-500 text-sm mb-4">{resetPasswordError}</p>
                        )}
                        {message && (
                          <p className="text-center text-green-600 text-sm mb-4">{message}</p>
                        )}
                        <button
                          type="submit"
                          className="w-full text-white py-2 rounded-lg hover:bg-[#7AACFF] transition duration-300 click-scale text-sm sm:text-base"
                          style={{ backgroundColor: '#4285F4', borderRadius: '5px' }}
                          disabled={resetPasswordLoading}
                        >
                          {resetPasswordLoading ? 'Saving...' : 'Save'}
                        </button>
                      </form>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setStep(1);
                      setForgotMobile('');
                      setOtp(['', '', '', '']);
                      setNewPassword('');
                      setConfirmPassword('');
                      setMessage('');
                      dispatch(clearForgotPasswordStatus());
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg sm:text-xl"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;