import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerCustomerRequest } from "../../../saga/features/customer/customerSlice";
import axios from "axios";
import uploadIcon from "/src/assets/upload-icon2.png";
import cameraIcon from "/src/assets/Camera.png";

const BASEURL = import.meta.env.VITE_API_URL;
const getPendingRegistration = () => {
    try {
        const raw = localStorage.getItem("pending_customer_registration");
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("NewProfileModal: failed to parse pending registration", error);
        return null;
    }
};

const defaultProfileData = {
    customer_name: "",
    gender: "",
    customer_country: "",
    customer_email: "",
    customer_image: "",
    customer_address: {
        street: "",
        city: "",
        state: "",
        zip: "",
    }
};

const NewProfileModal = ({ isOpen, onClose, onOpenLocationModal, setFormDataFromProfile }) => {

    const dispatch = useDispatch();
    const { registerLoading, registerError, registeredCustomerId } = useSelector((state) => state.customer);
    const imageInputRef = useRef(null);

    const [formData, setFormData] = useState(() => getPendingRegistration() || defaultProfileData);

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
            setFormData(defaultProfileData);
            setSelectedImage(null);
        }
        if (registerError) {
            setErrors({ api: registerError || "Failed to register customer" });
        }
    }, [registeredCustomerId, registerError, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const pending = getPendingRegistration();
        if (pending) {
            setFormData(pending);
            setFormDataFromProfile(pending);
        }
    }, [isOpen, setFormDataFromProfile]);

    useEffect(() => {
        localStorage.setItem("pending_customer_registration", JSON.stringify(formData));
        setFormDataFromProfile(formData);
    }, [formData, setFormDataFromProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

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
        if (!formData.gender) newErrors.gender = "Gender is required";
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
        setFormDataFromProfile(formData)
        onClose()
        onOpenLocationModal();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 fade-in">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl  p-8 py-4 relative flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="m-auto max-w-[60%]">
                    <form onSubmit={handleSubmit} className="space-y-2 mb-10">
                        <div className="mb-4">

                            <h3 className="text-xl text-center font-semibold mb-4">Complete Your Profile</h3>
                            <p className="text-center text-[16px] text-gray-400">Don’t worry, only you can see your personal data.
                                No one else will be able to see it.</p>
                        </div>

                        <div className="mb-2">

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
                                    className={`w-[100px] h-[100px] p-2 border border-gray-300 rounded-[50%] m-auto flex items-center justify-center cursor-pointer bg-[#C6DAFC] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4] relative ${formData.customer_image ? 'overflow-hidden' : ''}`}
                                >
                                    {formData.customer_image ? <img src={formData.customer_image} alt="Upload Icon" className="w-[100%] h-[100%] object-cover" /> :
                                        <>
                                            <img src={uploadIcon} alt="Upload Icon" className="w-10 h-10" />
                                            <img src={cameraIcon} alt="Camera Icon" className="w-6 h-6 absolute bottom-1 right-1" />
                                        </>
                                    }

                                </div>
                                {selectedImage && (
                                    <p className="text-gray-600 mt-2">Selected file: {selectedImage.name}</p>
                                )}
                                {errors.customer_image && <p className="text-red-500 text-sm mt-1">{errors.customer_image}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                />
                                {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                />
                                {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                            </div>
                        </div>

                    </form>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[#4285F4] text-white py-3 rounded-[30px] text-lg font-semibold hover:bg-blue-600 transition duration-300 flex items-center justify-center disabled:bg-gray-400"
                        disabled={registerLoading || uploading}
                    >
                        {registerLoading || uploading ? (
                            <span className="loader"></span>
                        ) : (
                            "Complete Profile"
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

    )
}

export default NewProfileModal