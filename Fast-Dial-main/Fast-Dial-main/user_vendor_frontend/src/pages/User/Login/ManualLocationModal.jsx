import { useDispatch, useSelector } from "react-redux";
import MapPinG from "../../../assets/MapPinG.png";
import LocationDropDownMenuComponent from "../LocationDropDownMenuComponent";
import { registerCustomerRequest } from "../../../saga/features/customer/customerSlice";
import { useEffect } from "react";


const ManualLocationModal = ({ isOpen, onClose, onOpenAutomaticLocationModal, setFormData, formData }) => {
  const dispatch = useDispatch();
  const {
    registeredCustomerId, registerError, registerLoading
  } = useSelector((state) => state.customer);
  useEffect(() => {
    if (registeredCustomerId) {
      onClose();
      // Force reload before navigating
      window.location.href = "/home";
    }
  }, [registeredCustomerId])

  const handleComplete = () => {
    dispatch(registerCustomerRequest(formData));
    console.log("Manual LocationModal: Dispatching registerCustomerRequest")

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 flex flex-col gap-5 relative">
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Enter Your Location
        </h2>
        <LocationDropDownMenuComponent placeholder={"Search your location"} styles={"border p-3 rounded-md w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"} setLocation={setFormData} />

        <div className="flex items-center gap-2 text-gray-600 cursor-pointer mt-2 hover:text-blue-500 transition-colors">
          <img src={MapPinG} alt="Location Icon" className="w-5 h-5" />
          <span onClick={onOpenAutomaticLocationModal}>Use my current location</span>
        </div>

        <hr className="my-3 border-gray-300" />

        <span className="text-gray-500 text-sm">Search result</span>

        {formData?.customer_country && <div
          className="flex flex-col gap-1 cursor-pointer p-3 hover:bg-gray-50 rounded-md transition-colors"
          onClick={handleComplete}
        >
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <img src={MapPinG} alt="Location Icon" className="w-5 h-5" />
            {formData?.customer_address.city}
          </div>
          <span className="text-gray-500 text-sm">
            ` {formData?.customer_address.street} {formData?.customer_address.state} {formData?.customer_country}`
          </span>
        </div>}
      </div>
    </div>
  );
};

export default ManualLocationModal;