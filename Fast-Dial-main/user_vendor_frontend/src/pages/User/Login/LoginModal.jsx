import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupRequest } from '../../../saga/features/customer/customerSlice';
import LoginImage from "../../../assets/cuate.png";

const useLogin = (onOpenOtpModal) => {
  const dispatch = useDispatch();
  const { loading, error, signupLoading, signupError } = useSelector((state) => state.customer);
  const [mobile, setMobile] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [pendingOtpMobile, setPendingOtpMobile] = useState('');

  const handleLogin = () => {
    if (mobile && agreeTerms && mobile.length === 10) {
      console.log('useLogin: Submitting mobile:', mobile);
      setPendingOtpMobile(mobile);
      dispatch(signupRequest({ mobile }));
    } else {
      console.log('useLogin: Invalid input:', { mobile, agreeTerms });
    }
  };

  useEffect(() => {
    if (!pendingOtpMobile) return;
    if (signupLoading) return;
    if (signupError) {
      setPendingOtpMobile('');
      return;
    }

    onOpenOtpModal(pendingOtpMobile);
    setPendingOtpMobile('');
  }, [pendingOtpMobile, signupLoading, signupError, onOpenOtpModal]);

  return {
    mobile,
    setMobile,
    agreeTerms,
    setAgreeTerms,
    handleLogin,
    loading,
    error,
    signupLoading,
    signupError,
  };
};

const LoginForm = ({
  mobile,
  setMobile,
  agreeTerms,
  setAgreeTerms,
  handleLogin,
  loading,
  error,  
  signupLoading,
  signupError,
}) => {
  return (
    <div className="p-4 md:p-6 flex flex-col justify-center gap-4 md:gap-5 w-full">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Let's get things done!</h2>
      <p className="text-gray-400 text-xs md:text-sm">Let us handle the hard work while you sit back.</p>

      <div className="border p-2 md:p-3 rounded-md mt-[5%] flex items-center gap-2 md:gap-3 bg-gray-100">
        <span className="text-gray-500 font-medium text-sm md:text-base">+91</span>
        <input
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
          className="w-full bg-transparent outline-none text-sm md:text-base"
          maxLength={10}
        />
      </div>

      {error && <p className="text-red-500 text-xs md:text-sm">Login Error: {error}</p>}
      {loading && <p className="text-blue-500 text-xs md:text-sm">Logging in...</p>}
      {signupError && <p className="text-red-500 text-xs md:text-sm">Signup Error: {signupError}</p>}
      {signupLoading && <p className="text-blue-500 text-xs md:text-sm">Sending OTP...</p>}

      <div className="flex items-center gap-2 md:gap-3">
        <input 
          type="checkbox" 
          id="terms" 
          className="w-4 h-4"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
        />
        <label htmlFor="terms" className="text-gray-600 text-xs md:text-sm">
          <a href="/T&C" target="_blank" rel="noopener noreferrer">
            Agree with our <span className="text-blue-500 cursor-pointer">Terms & Conditions</span>
          </a>
        </label>
      </div>

      <button
        className={`bg-blue-500 text-white py-2 md:py-3 rounded-md w-full text-base md:text-lg font-semibold hover:bg-blue-600 transition ${
          (!mobile || mobile.length !== 10 || !agreeTerms || signupLoading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleLogin}
        disabled={!mobile || mobile.length !== 10 || !agreeTerms || signupLoading}
      >
        {signupLoading ? 'Sending OTP...' : 'Login with OTP'}
      </button>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onOpenOtpModal }) => {
  const {
    mobile,
    setMobile,
    agreeTerms,
    setAgreeTerms,
    handleLogin,
    loading,
    error,
    signupLoading,
    signupError,
  } = useLogin((mobile) => {
    console.log('LoginModal: Opening OtpModal with mobile:', mobile);
    onClose();
    onOpenOtpModal(mobile);
  });

  // Debug customer_id after login
  const { user } = useSelector((state) => state.customer);
  console.log('LoginModal: Current customer user:', user);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[90%] md:max-w-[780px] h-auto md:h-[70%] flex flex-col md:flex-row relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg md:text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="w-full md:w-1/2 bg-blue-100 flex justify-center items-center p-4 md:p-6">
          <img src={LoginImage} alt="Login" className="w-full h-auto object-cover max-h-[300px] md:max-h-[500px]" />
        </div>
        <LoginForm
          mobile={mobile}
          setMobile={setMobile}
          agreeTerms={agreeTerms}
          setAgreeTerms={setAgreeTerms}
          handleLogin={handleLogin}
          loading={loading}
          error={error}
          signupLoading={signupLoading}
          signupError={signupError}
        />
      </div>
    </div>
  );
};

export default LoginModal;