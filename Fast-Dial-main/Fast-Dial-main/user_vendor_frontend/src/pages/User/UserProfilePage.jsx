import { useState, useEffect, useRef } from "react";
import {
  FiUser,
  FiHelpCircle,
  FiLock,
  FiLogOut,
  FiChevronRight,
  FiEdit,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // Use jwt-decode library
import dummyImage from "../../assets/dummyImage.png";
import Header from "./Header";
import Footer from "./Footer";
import LogoutUser from "./Login/LogoutUser";
import {
  getCustomerDataRequest,
  updateCustomerRequest,
  insertComplaintRequest,
  getComplaintsRequest,
  updateComplaintRequest,
  deleteComplaintRequest,
} from "../../saga/features/customer/customerSlice";
import axios from "axios";

const BASEURL = import.meta.env.VITE_API_URL;

function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("decodeToken: Error decoding token:", error.message);
    return null;
  }
}

export default function UserProfilePage() {
  const [selectedSection, setSelectedSection] = useState("profile");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, customerData, customerLoading, customerError, isAuthenticated } = useSelector(
    (state) => state.customer
  );

  useEffect(() => {
    console.log("UserProfilePage useEffect: Redux State:", { user, isAuthenticated });
    const token = localStorage.getItem("token");
    console.log("UserProfilePage: Token from localStorage:", token);
    if (!isAuthenticated && !token) {
      console.warn("UserProfilePage: No token found, redirecting to login");
      navigate("/Home");
      alert("Please Login")
    } else {
      try {
        const decoded = token ? jwtDecode(token) : null;
        console.log("UserProfilePage: Decoded token:", decoded);
        if (decoded?.customer_id || user?.customer_id) {
          console.log(
            "UserProfilePage: Dispatching getCustomerDataRequest with customer_id:",
            decoded?.customer_id || user?.customer_id
          );
          dispatch(getCustomerDataRequest({ customer_id: decoded?.customer_id || user?.customer_id }));
          dispatch(getComplaintsRequest()); 
        } else {
          console.warn("UserProfilePage: No customer_id found, redirecting to login");
          navigate("/Home");
          alert("Please Login")
        }
      } catch (error) {
        console.error("UserProfilePage: Error decoding token:", error.message);
        navigate("/Home");
        alert("Please Login")
      }
    }
  }, [dispatch, user, isAuthenticated, navigate]);

  const menuItems = [
    { id: "profile", label: "Your Profile", icon: <FiUser /> },
    { id: "help", label: "Help Center", icon: <FiHelpCircle /> },
    { id: "privacy", label: "Privacy & Policy", icon: <FiLock /> },
    { id: "rise issue", label: "Raise Issue", icon: <FiEdit /> },
    { id: "logout", label: "Logout", icon: <FiLogOut /> },
  ];

  const handleMenuClick = (id) => {
    if (id === "logout") {
      setIsLogoutModalOpen(true);
    } else {
      setSelectedSection(id);
    }
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 p-4 md:p-8 bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg md:w-1/3 lg:w-1/4 min-w-[250px]">
          <div className="flex flex-col items-center">
            <img
              src={customerData?.customer_image || dummyImage}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover"
            />
            <h3 className="mt-2 text-lg font-semibold">{customerData?.customer_name || "User"}</h3>
            <p className="text-gray-500">{customerData?.customer_email || "No email provided"}</p>
          </div>
          <div className="mt-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex justify-between items-center w-full px-4 py-3 border-b ${
                  selectedSection === item.id && item.id !== "logout"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon} {item.label}
                </span>
                <FiChevronRight className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex-1 mt-6 md:mt-0 md:ml-6">
          {customerLoading && <p className="text-gray-500">Loading profile data...</p>}
          {customerError && <p className="text-red-500">Error: {customerError}</p>}
          {selectedSection === "profile" && <ProfileForm />}
          {selectedSection === "help" && <HelpCenter />}
          {selectedSection === "privacy" && <PrivacyPolicy />}
          {selectedSection === "rise issue" && <RiseIssue />}
        </div>
      </div>
      {isLogoutModalOpen && (
        <LogoutUser onConfirm={handleLogoutConfirm} onCancel={handleLogoutCancel} />
      )}
      <Footer />
    </div>
  );
}

function ProfileForm() {
  const dispatch = useDispatch();
  const { customerData, updateCustomerLoading, updateCustomerError } = useSelector(
    (state) => state.customer
  );
  const [formData, setFormData] = useState({
    customer_name: "",
    mobile: "",
    gender: "",
    customer_country: "",
    customer_email: "",
    customer_address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    customer_image: "",
  });
  const [initialData, setInitialData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    console.log("ProfileForm useEffect: CustomerData:", customerData);
    if (customerData && !initialData) {
      const data = Array.isArray(customerData) ? customerData[0] : customerData;
      const newData = {
        customer_name: data.customer_name || "",
        mobile: data.mobile || "",
        gender: data.gender || "",
        customer_country: data.customer_country || "",
        customer_email: data.customer_email || "",
        customer_address: {
          street: data.customer_address?.street || "",
          city: data.customer_address?.city || "",
          state: data.customer_address?.state || "",
          zip: data.customer_address?.zip || "",
        },
        customer_image: data.customer_image || "",
      };
      console.log("ProfileForm: Setting formData:", newData);
      setFormData(newData);
      setInitialData(newData);
    }
  }, [customerData, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("ProfileForm handleChange:", { name, value });
    if (["street", "city", "state", "zip"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        customer_address: {
          ...prev.customer_address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    console.log("ProfileForm uploadFile: Uploading file:", file.name);
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", file);
    try {
      const response = await axios.post(`${BASEURL}/global/upload/file`, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("ProfileForm uploadFile: Success, URL:", response.data.url);
      return response.data.url;
    } catch (error) {
      console.error("ProfileForm uploadFile: Error:", error.response?.data || error.message);
      setErrors((prev) => ({ ...prev, customer_image: "Failed to upload image" }));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("ProfileForm handleImageChange: File selected:", file.name);
      setSelectedImage(file);
      const url = await uploadFile(file);
      if (url) {
        setFormData((prev) => ({ ...prev, customer_image: url }));
      }
    }
  };

  const triggerImageUpload = () => imageInputRef.current.click();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name) newErrors.customer_name = "Name is required";
    if (!formData.mobile) newErrors.mobile = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.customer_country) newErrors.customer_country = "Country is required";
    if (!formData.customer_email) newErrors.customer_email = "Email is required";
    if (!formData.customer_address.street) newErrors.street = "Street is required";
    if (!formData.customer_address.city) newErrors.city = "City is required";
    if (!formData.customer_address.state) newErrors.state = "State is required";
    if (!formData.customer_address.zip) newErrors.zip = "Zip code is required";
    console.log("ProfileForm validateForm: Errors:", newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ProfileForm handleSubmit: Form submitted");
    setSuccessMessage("");
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.log("ProfileForm handleSubmit: Validation errors:", validationErrors);
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const payload = {
      customer_id: customerData?.customer_id || decoded?.customer_id,
      customer_name: formData.customer_name,
      mobile: formData.mobile,
      gender: formData.gender,
      customer_country: formData.customer_country,
      customer_email: formData.customer_email,
      customer_address: {
        street: formData.customer_address.street,
        city: formData.customer_address.city,
        state: formData.customer_address.state,
        zip: formData.customer_address.zip,
      },
      customer_image: formData.customer_image,
    };

    console.log("ProfileForm handleSubmit: Dispatching updateCustomerRequest with payload:", payload);
    dispatch(updateCustomerRequest(payload));
  };

  useEffect(() => {
    console.log("ProfileForm useEffect: Update status:", {
      updateCustomerLoading,
      updateCustomerError,
    });
    if (!updateCustomerLoading && !updateCustomerError && initialData) {
      console.log("ProfileForm: Profile updated successfully");
      setSuccessMessage("Profile updated successfully!");
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    } else if (!updateCustomerLoading && updateCustomerError) {
      console.log("ProfileForm: Reverting to initialData due to error:", updateCustomerError);
      setFormData(initialData);
    }
  }, [updateCustomerLoading, updateCustomerError, initialData]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {updateCustomerError && <p className="text-red-500 mb-4">Error: {updateCustomerError}</p>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.customer_name && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            name="customer_country"
            value={formData.customer_country}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.customer_country && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_country}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.customer_email && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
          <input
            type="text"
            name="street"
            value={formData.customer_address.street}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.customer_address.city}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="state"
            value={formData.customer_address.state}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
          <input
            type="text"
            name="zip"
            value={formData.customer_address.zip}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
          <div className="relative flex gap-[10%]">
            {selectedImage && (
              <p className="text-gray-600 text-sm">Selected: {selectedImage.name}</p>
            )}
            {formData.customer_image && !selectedImage && (
              <img
                src={formData.customer_image}
                alt="Profile Preview"
                className="mt-2 w-20 h-20 rounded-full object-cover"
              />
            )}
            {errors.customer_image && (
              <p className="text-red-500 text-sm mt-1">{errors.customer_image}</p>
            )}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerImageUpload}
              className="w-[30%] h-12 p-3 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-[22px]"
            >
              {formData.customer_image ? "Change Image" : "Upload Image"}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={updateCustomerLoading || uploading}
          className={`w-full p-3 rounded-md text-white ${
            updateCustomerLoading || uploading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {updateCustomerLoading || uploading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Quick Serve?",
      answer:
        "Quick Serve is a local business listing and service directory app that helps users connect with businesses, service providers, and vendors in their area.",
    },
    {
      question: "How does Quick Serve work?",
      answer:
        "Users can search for businesses, read reviews, and contact service providers directly through the app. Businesses can list their services to reach potential customers.",
    },
    {
      question: "Is Quick Serve free to use?",
      answer:
        "Yes, Quick Serve is free for users to browse listings. However, businesses may have paid listing options for better visibility.",
    },
    {
      question: "How can I list my business on Quick Serve?",
      answer:
        "To list your business, simply register on our platform, provide the required details, and submit your listing for approval.",
    },
    {
      question: "Can users leave reviews on Quick Serve?",
      answer:
        "Yes, users can leave honest reviews based on their experiences. However, false, misleading, or offensive reviews may be removed.",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Help Center</h2>
      <h3 className="text-blue-600 mt-4">FAQ</h3>
      <div className="space-y-4 mt-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border rounded-lg shadow p-4">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex justify-between items-center w-full font-semibold text-left text-gray-700"
            >
              <span>{faq.question}</span>
              <svg
                className={`w-5 h-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === index && <div className="mt-2 text-gray-600">{faq.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Privacy & Policy</h2>
      <div className="max-h-[500px] overflow-y-auto pr-4">
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Introduction</strong>
            <p>
              Quick Serve is a platform that connects users with local businesses, service providers,
              and vendors. We act as an intermediary and do not directly provide services or products
              listed on our platform.
            </p>
          </li>
          <li>
            <strong>Acceptance of Terms</strong>
            <p>
              By using Quick Serve, you agree to abide by these Terms and our Privacy Policy. If you do
              not agree, please do not use our services.
            </p>
          </li>
          <li>
            <strong>User Accounts</strong>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>To access certain features, you may need to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>Providing false information may result in account suspension.</li>
            </ul>
          </li>
          <li>
            <strong>Listing and Reviews</strong>
            <p>
              Businesses may list their services or products, but they must provide accurate and legal
              information. Users can leave reviews, but they must not include false, misleading, or
              defamatory content.
            </p>
          </li>
          <li>
            <strong>Quick Serve's Rights</strong>
            <p>Quick Serve reserves the right to remove any listing or review that violates our policies.</p>
          </li>
          <li>
            <strong>Payments and Transactions</strong>
            <p>
              Some services may require payments, which are securely processed through third-party
              payment gateways. Quick Serve is not responsible for disputes between users and businesses
              regarding transactions.
            </p>
          </li>
          <li>
            <strong>Prohibited Activities</strong>
            <p>Users must not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Post misleading, illegal, or offensive content.</li>
              <li>Attempt to hack, scrape, or exploit our platform.</li>
            </ul>
          </li>
          <li>
            <strong>Limitation of Liability</strong>
            <p>Quick Serve is not liable for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>The quality, accuracy, or reliability of services listed on our platform.</li>
              <li>Disputes between users and businesses.</li>
            </ul>
          </li>
          <li>
            <strong>Privacy Policy</strong>
            <p>
              We collect and process user data as outlined in our Privacy Policy. By using Quick Serve,
              you consent to this data collection.
            </p>
          </li>
          <li>
            <strong>Modifications to Terms</strong>
            <p>
              We may update these Terms at any time. Continued use of Quick Serve after updates means
              you accept the revised Terms.
            </p>
          </li>
          <li>
            <strong>Termination of Access</strong>
            <p>
              We reserve the right to terminate or suspend accounts violating these Terms without
              prior notice.
            </p>
          </li>
          <li>
            <strong>Governing Law</strong>
            <p>
              These Terms are governed by the laws of India, Karnataka. Any disputes will be handled
              in the courts of Bangalore.
            </p>
          </li>
          <li>
            <strong>Contact Information</strong>
            <p>
              For any questions or concerns regarding these Terms, please contact us at{" "}
              <a href="mailto:quickserve@gmail.com" className="text-blue-600 underline">
                quickserve@gmail.com
              </a>
              .
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}

function RiseIssue() {
  const dispatch = useDispatch();
  const {
    complaints,
    complaintsLoading,
    complaintsError,
    insertComplaintLoading,
    insertComplaintError,
    updateComplaintLoading,
    updateComplaintError,
    deleteComplaintLoading,
    deleteComplaintError,
    user,
  } = useSelector((state) => state.customer);

  const [formData, setFormData] = useState({
    cust_comp_desc: "",
    cust_comp_date: new Date().toISOString().slice(0, 16),
  });
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(getComplaintsRequest());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cust_comp_desc) newErrors.cust_comp_desc = "Complaint description is required";
    if (!formData.cust_comp_date) newErrors.cust_comp_date = "Complaint date is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const payload = {
      customer_id: user?.customer_id || decoded?.customer_id,
      cust_comp_desc: formData.cust_comp_desc,
      cust_comp_date: formData.cust_comp_date,
      ...(editingComplaint ? { cust_comp_id: editingComplaint.cust_comp_id } : {}),
    };

    if (editingComplaint) {
      dispatch(updateComplaintRequest(payload));
    } else {
      dispatch(insertComplaintRequest(payload));
    }

    setFormData({
      cust_comp_desc: "",
      cust_comp_date: new Date().toISOString().slice(0, 16),
    });
    setEditingComplaint(null);
  };

  const handleEdit = (complaint) => {
    setFormData({
      cust_comp_desc: complaint.cust_comp_desc,
      cust_comp_date: new Date(complaint.cust_comp_date).toISOString().slice(0, 16),
    });
    setEditingComplaint(complaint);
  };

  const handleDelete = (complaintId) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      dispatch(deleteComplaintRequest(complaintId));
    }
  };

  useEffect(() => {
    if (!insertComplaintLoading && !insertComplaintError) {
      setSuccessMessage("Complaint submitted successfully!");
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
    if (!updateComplaintLoading && !updateComplaintError && editingComplaint) {
      setSuccessMessage("Complaint updated successfully!");
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
    if (!deleteComplaintLoading && !deleteComplaintError) {
      setSuccessMessage("Complaint deleted successfully!");
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [
    insertComplaintLoading,
    insertComplaintError,
    updateComplaintLoading,
    updateComplaintError,
    deleteComplaintLoading,
    deleteComplaintError,
    editingComplaint,
  ]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Raise an Issue</h2>
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {(insertComplaintError || updateComplaintError || deleteComplaintError) && (
        <p className="text-red-500 mb-4">
          Error: {insertComplaintError || updateComplaintError || deleteComplaintError}
        </p>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Description</label>
          <textarea
            name="cust_comp_desc"
            value={formData.cust_comp_desc}
            onChange={handleChange}
            rows="4"
            placeholder="Describe your issue..."
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.cust_comp_desc && (
            <p className="text-red-500 text-sm mt-1">{errors.cust_comp_desc}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="datetime-local"
            name="cust_comp_date"
            value={formData.cust_comp_date}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.cust_comp_date && (
            <p className="text-red-500 text-sm mt-1">{errors.cust_comp_date}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={insertComplaintLoading || updateComplaintLoading}
          className={`w-full p-3 rounded-md text-white ${
            insertComplaintLoading || updateComplaintLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {editingComplaint
            ? updateComplaintLoading
              ? "Updating..."
              : "Update Complaint"
            : insertComplaintLoading
            ? "Submitting..."
            : "Submit Complaint"}
        </button>
      </form>
      <h3 className="text-lg font-semibold mt-6 mb-4">Your Complaints</h3>
      {complaintsLoading && <p className="text-gray-500">Loading complaints...</p>}
      {complaintsError && <p className="text-red-500">Error: {complaintsError}</p>}
      {complaints.length === 0 && !complaintsLoading && <p className="text-gray-500">No complaints found.</p>}
      {complaints.length > 0 && (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.cust_comp_id} className="bg-white border rounded-lg shadow p-4">
              <p>
                <strong>Description:</strong> {complaint.cust_comp_desc}
              </p>
              <p>
                <strong>Date:</strong> {new Date(complaint.cust_comp_date).toLocaleString()}
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleEdit(complaint)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(complaint.cust_comp_id)}
                  disabled={deleteComplaintLoading}
                  className={`px-4 py-2 rounded-md text-white ${
                    deleteComplaintLoading
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteComplaintLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}