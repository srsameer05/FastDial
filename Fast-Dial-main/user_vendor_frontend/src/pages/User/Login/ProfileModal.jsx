import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerCustomerRequest } from "../../../saga/features/customer/customerSlice";
import axios from "axios";
import uploadIcon from "/src/assets/upload-icon.png";

const BASEURL = import.meta.env.VITE_API_URL;

const ProfileModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { registerLoading, registerError, registeredCustomerId } = useSelector((state) => state.customer);
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_country: "",
    gender: "",
    customer_address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    customer_email: "",
    customer_image: "",
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle success/failure via Redux state
  useEffect(() => {
    if (registeredCustomerId) {
      onClose();
      // Navigate to home with forced reload, similar to LocationModal
      window.location.href = "/home";
      // Reset form and errors after success
      setFormData({
        customer_name: "",
        customer_country: "",
        gender: "",
        customer_address: { street: "", city: "", state: "", zip: "" },
        customer_email: "",
        customer_image: "",
      });
      setSelectedImage(null);
    }
    if (registerError) {
      setErrors({ api: registerError || "Failed to register customer" });
    }
  }, [registeredCustomerId, registerError, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "zip"].includes(name)) {
      setFormData({
        ...formData,
        customer_address: {
          ...formData.customer_address,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const uploadFile = async (file) => {
    if (!file) return null;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const response = await axios.post(`${BASEURL}/global/upload/file`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.url;
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      setErrors({ ...errors, customer_image: "Failed to upload image" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = await uploadFile(file);
      if (url) {
        setFormData({ ...formData, customer_image: url });
      }
    }
  };

  const triggerImageUpload = () => imageInputRef.current.click();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name) newErrors.customer_name = "Name is required";
    if (!formData.customer_country) newErrors.customer_country = "Country is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.customer_address.street) newErrors.street = "Street is required";
    if (!formData.customer_address.city) newErrors.city = "City is required";
    if (!formData.customer_address.state) newErrors.state = "State is required";
    if (!formData.customer_address.zip) newErrors.zip = "Zip code is required";
    if (!formData.customer_email) newErrors.customer_email = "Email is required";
    if (!formData.customer_image) newErrors.customer_image = "Image is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    dispatch(registerCustomerRequest(formData));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 fade-in">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative h-[80vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-4">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  />
                  {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  />
                  {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="customer_country"
                    value={formData.customer_country}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  />
                  {errors.customer_country && <p className="text-red-500 text-sm mt-1">{errors.customer_country}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.customer_address.street}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  />
                  {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.customer_address.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.customer_address.state}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Zip Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.customer_address.zip}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                  />
                  {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-lg font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="relative w-full">
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={triggerImageUpload}
                      className="w-full p-2 border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                    >
                      <img src={uploadIcon} alt="Upload Icon" className="w-6 h-6" />
                    </div>
                    {selectedImage && (
                      <p className="text-gray-600 mt-2">Selected file: {selectedImage.name}</p>
                    )}
                    {errors.customer_image && <p className="text-red-500 text-sm mt-1">{errors.customer_image}</p>}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {errors.api && <p className="text-red-500 text-sm mt-2 text-center">{errors.api}</p>}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#4285F4] text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-300 flex items-center justify-center disabled:bg-gray-400"
            disabled={registerLoading || uploading}
          >
            {registerLoading || uploading ? (
              <span className="loader"></span>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .fade-in { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .loader {
          width: 24px;
          height: 24px;
          border: 3px solid #ffffff;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;