import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import frame from '../../../../src/assets/Frame.png';
import logo from '../../../assets/Quick Serve 10.png';
import { 
  adminLoginRequest, 
  adminLogout,
  forgetPasswordRequest,
  verifyOtpRequest,
  updatePasswordRequest,
  resetForgotPassword
} from '../../../saga/features/admin/adminSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [step, setStep] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    loading, 
    error, 
    isAuthenticated,
    forgotPasswordLoading,
    forgotPasswordError,
    forgotPasswordSuccess,
    otpLoading,
    otpError,
    otpSuccess,
    otpToken,
    updatePasswordLoading,
    updatePasswordError,
    updatePasswordSuccess
  } = useSelector((state) => state.admin);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/managevendor');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(adminLogout()); 
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(adminLogout());
  }, [dispatch]);

  useEffect(() => {
    if (forgotPasswordSuccess) {
      setStep(2);
    }
    if (otpSuccess) {
      setStep(3);
      if (otpToken) {
        localStorage.setItem('adminToken', otpToken);
      }
    }
    if (updatePasswordSuccess) {
      resetForm(); // Call reset function on success
    }
  }, [forgotPasswordSuccess, otpSuccess, updatePasswordSuccess, otpToken, dispatch]);

  // Function to reset all form fields and state
  const resetForm = () => {
    setShowForgotPassword(false);
    setStep(1);
    setPhone('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMatchError('');
    dispatch(resetForgotPassword());
    localStorage.removeItem('adminToken');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const credentials = { email, password };
    dispatch(adminLoginRequest(credentials));
  };

  const handleForgetPassword = (e) => {
    e.preventDefault();
    dispatch(forgetPasswordRequest({ phone }));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    dispatch(verifyOtpRequest({ phone, otp }));
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMatchError("Passwords do not match");
      return;
    }
    setPasswordMatchError('');
    dispatch(updatePasswordRequest({ phone, password: newPassword }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#7AACFF]">
      <div className="bg-gray-200 flex items-center justify-center w-full md:w-1/2">
        <img
          src={frame}
          alt="Login Visual"
          className="h-screen w-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 p-4 flex flex-col items-center justify-center">
        <div className="text-center mb-6 flex flex-col items-center">
          <img
            src={logo}
            alt="Fastdial Logo"
            className="mb-4 h-auto"
          />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
        <p className="text-white mb-6">Welcome back to Quick Serve</p>

        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
          {!showForgotPassword ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#7AACFF]"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#7AACFF]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7AACFF] text-white py-3 rounded-lg hover:bg-blue-600 mt-[20px] transition"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              {error && <p className="text-red-500 mt-2">Enter correct Email and Password</p>}
              <p 
                className="text-blue-500 mt-4 cursor-pointer text-center"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </p>
            </form>
          ) : (
            <>
              {step === 1 && (
                <form onSubmit={handleForgetPassword}>
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-lg font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#7AACFF]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#7AACFF] text-white py-3 rounded-lg hover:bg-blue-600 mt-[20px] transition"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                  {forgotPasswordError && <p className="text-red-500 mt-2">{forgotPasswordError}</p>}
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4">
                    <label htmlFor="otp" className="block text-lg font-medium text-gray-700">
                      OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#7AACFF]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#7AACFF] text-white py-3 rounded-lg hover:bg-blue-600 mt-[20px] transition"
                    disabled={otpLoading}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  {otpError && <p className="text-red-500 mt-2">{otpError}</p>}
                </form>
              )}
              {step === 3 && (
                <form onSubmit={handleUpdatePassword}>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-lg font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#7AACFF]"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#7AACFF]"
                      required
                    />
                  </div>
                  {passwordMatchError && <p className="text-red-500 mt-2">{passwordMatchError}</p>}
                  <button
                    type="submit"
                    className="w-full bg-[#7AACFF] text-white py-3 rounded-lg hover:bg-blue-600 mt-[20px] transition"
                    disabled={updatePasswordLoading}
                  >
                    {updatePasswordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  {updatePasswordError && <p className="text-red-500 mt-2">{updatePasswordError}</p>}
                </form>
              )}
              <p 
                className="text-blue-500 mt-4 cursor-pointer text-center"
                onClick={resetForm} // Use resetForm here too
              >
                Back to Login
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;