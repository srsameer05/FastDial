import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import fastdialLogo from '/src/assets/Quick Serve 5.png';
import phoneImage from '/src/assets/Mobile.png';
import uploadIcon from '/src/assets/upload-icon.png';
import { fetchServicesRequest } from '../../saga/features/vendor/vendorSlice';
import z from "zod";
import TimePicker from '../../components/TimePicker';

const BASEURL = import.meta.env.VITE_API_URL;

const VendorList = () => {
  const location = useLocation();
  const fromVendorLogin = location.state?.fromVendorLogin;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [requireGST, setRequireGST] = useState(false)
  const initialFormData = {
    vendor_name: '',
    vendor_email: '',
    vendor_mobile: '',
    name_of_bussiness: '',
    bussiness_category: '',
    fast_service_category_name: '',
    bussiness_proof_doc_url: '',
    annual_turnover: '',
    gst_number: '',
    company_category: '',
    service_radius: '',
    bussiness_address: {
      city: '',
      state: '',
      street: '',
    },
    pincode: '',
    service_start_time: '',
    service_end_time: '',
    bussiness_desc: '',
    image_url: [],
    account_details: { accountNumber: '', ifsc: '' },
    kyc_docs: { pan: '', aadhar: '', pan_photo: '', aadhar_photo: '' },
    services: [],
  }
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const aadhaarInputRef = useRef(null);
  const panInputRef = useRef(null);
  const dispatch = useDispatch();
  const { services, servicesLoading, servicesError } = useSelector((state) => state.vendor);
  const [selectedService, setSelectedService] = useState('');

  // Validation Schema for vendor registration form
  const vendorSchema = z.object({
    vendor_name: z
      .string()
      .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters a-z")
      .min(1, "Vendor Name is required"),
    vendor_email: z
      .string()
      .email("Invalid email format")
      .min(1, "Email is required"),
    vendor_mobile: z
      .string()
      .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .min(1, "Mobile number is required"),
    name_of_bussiness: z.string().min(1, "Name of business is required"),
    bussiness_category: z.string().min(1, "Business category is required"),
    fast_service_category_name: z.string().min(1, "Fast service category name is required"),
    bussiness_proof_doc_url: z.string().optional(),
    annual_turnover: z.string().min(1, "turnover must be more than 0"),
    gst_number: requireGST
      ? z.string()
        .regex(/^[A-Z0-9]{15}$/, "GST number must be exactly 15 alphanumeric characters")
        .min(14, "GST number is required")
      : z.string().optional().refine(
        (val) => !val || /^[A-Z0-9]{15}$/.test(val),
        { message: "GST number must be exactly 15 alphanumeric characters" }
      ),
    company_category: z.enum(["Manufacturing", "Trading", "Service", "Others"], {
      errorMap: () => ({ message: "Please select a valid company category" })
    }),
    service_radius: z.string().min(1, "Service radius is required"),
    bussiness_address: z.object({
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      street: z.string().min(1, "Street is required"),
    }),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
      .min(1, "Pincode is required"),
    service_start_time: z
      .string()
      .regex(/^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i, "Invalid time format (e.g., 6:00 AM)")
      .min(1, "Service start time is required"),
    service_end_time: z
      .string()
      .regex(/^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i, "Invalid time format (e.g., 6:00 PM)")
      .min(1, "Service end time is required"),
    bussiness_desc: z.string().min(1, "Business description is required"),
    image_url: z.array(z.string()).min(1, "Photo is required"),
    account_details: z.object({
      accountNumber: z
        .string()
        .regex(/^\d{11,16}$/, "Account number must be 11 to 16 digits")
        .min(1, "Account number is required"),
      ifsc: z
        .string()
        .regex(/^[A-Z0-9]{11}$/, "IFSC must be an 11-character alphanumeric code")
        .min(1, "IFSC is required"),
    }),
    kyc_docs: z.object({
      pan: z
        .string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)")
        .min(1, "PAN is required"),
      aadhar: z
        .string()
        .regex(/^[2-9]{1}[0-9]{11}$/, "Invalid Aadhaar number (12 digits, starting with 2-9)")
        .min(1, "Aadhar is required"),
      pan_photo: z.string().min(1, "PAN photo is required"),
      aadhar_photo: z.string().min(1, "Aadhar photo is required"),
    }),
    services: z.array(z.any()),
  });

  // Fetch services on component mount
  useEffect(() => {
    dispatch(fetchServicesRequest());
    if (fromVendorLogin)
      setIsModalOpen(fromVendorLogin)
  }, [dispatch]);

  useEffect(() => {
    validateFormData();
  }, [formData]);

  // Get unique service categories
  const serviceCategories = [...new Set(services.map((item) => item.service_category_name))];

  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
    setAadhaarFile(null);
    setPanFile(null);
    setSelectedService('');
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "annual_turnover") {
      const turnover = Number(value);
      if (!isNaN(turnover)) {
        setRequireGST(turnover > 2000000); // 20 lakhs = 2,000,000
      }
    }

    if (name.includes('account_details') || name.includes('kyc_docs') || name.includes('bussiness_address')) {
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceSelect = (e) => {
    setSelectedService(e.target.value);
  };

  const addService = () => {
    if (selectedService && !formData.services.includes(selectedService)) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, selectedService],
      }));
      setSelectedService('');
    }
  };

  const removeService = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const uploadFile = async (file) => {
    if (!file) return null;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const response = await axios.post(
        `${BASEURL}/global/upload/file`,
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.url;
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (files.length > 0) {
      const uploadedUrls = await Promise.all(files.map(file => uploadFile(file)));
      setFormData((prev) => ({ ...prev, image_url: uploadedUrls.filter(url => url !== null) }));
    }
  };

  const handleAadhaarFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadhaarFile(file);
      const url = await uploadFile(file);
      if (url) {
        setFormData((prev) => ({
          ...prev,
          kyc_docs: { ...prev.kyc_docs, aadhar_photo: url },
        }));
      }
    }
  };

  const handlePanFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPanFile(file);
      const url = await uploadFile(file);
      if (url) {
        setFormData((prev) => ({
          ...prev,
          kyc_docs: { ...prev.kyc_docs, pan_photo: url },
        }));
      }
    }
  };

  const triggerAadhaarUpload = () => aadhaarInputRef.current.click();
  const triggerPanUpload = () => panInputRef.current.click();

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateFormData = () => {
    const result = vendorSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = {};
      result.error.errors.forEach(err => {
        const path = err.path.join(".");
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched to trigger validation display
    const allFields = {};
    Object.keys(initialFormData).forEach(key => {
      if (key === 'account_details' || key === 'kyc_docs' || key === 'bussiness_address') {
        Object.keys(initialFormData[key]).forEach(subKey => {
          allFields[`${key}.${subKey}`] = true;
        });
      } else {
        allFields[key] = true;
      }
    });
    setTouched(allFields);

    if (validateFormData()) {
      const submissionData = {
        ...formData,
        vendor_mobile: Number(formData.vendor_mobile),
        service_radius: Number(formData.service_radius),
      };
      console.log('VendorList Form Data:', submissionData);
      navigate('/vendorsignup', { state: submissionData });
    }
    setIsSubmitting(false);
  };

  const companyCategories = ["Manufacturing", "Trading", "Service", "Others"];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #4285F4 0%, #7AACFF 50%, #ffffff)' }}>
      <div className="w-4/5 mx-auto mt-10 h-[70px] flex items-center justify-between p-2 bg-white rounded-lg">
        <img src={fastdialLogo} alt="Fastdial Logo" className="h-12" />
        <button
          onClick={openModal}
          className="bg-[#4285F4] text-white px-6 py-2 rounded-lg text-base font-semibold hover:bg-blue-600 transition duration-300 click-scale"
        >
          List your service
        </button>
      </div>

      <div className="w-4/5 mx-auto pt-[35px] pb-8 flex flex-1 items-center justify-between">
        <div className="max-w-lg">
          <h3 className="text-5xl font-bold text-white mb-6">
            List Your Service with QUICK SERVE and reach more customers effortlessly!
          </h3>
          <p className="text-white text-lg mb-8">
            Vendors can showcase their services on our platform with ease. Reach a wider audience and grow your business effortlessly.
          </p>
          <button
            onClick={openModal}
            className="bg-[#FFFFFF] text-[#4285F4] px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300 click-scale"
          >
            List your business
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <img src={phoneImage} alt="FastDial App on Phone" style={{ width: '120%', maxWidth: '1000px', height: 'auto' }} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 fade-in">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative h-[80vh] flex flex-col">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-4">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div>
                  <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Vendor Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="vendor_name"
                        value={formData.vendor_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.vendor_name && touched.vendor_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.vendor_name && touched.vendor_name && <span className='text-red-400 text-sm font-medium'>{errors.vendor_name}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="email"
                        name="vendor_email"
                        value={formData.vendor_email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.vendor_email && touched.vendor_email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.vendor_email && touched.vendor_email && <span className='text-red-400 text-sm font-medium'>{errors.vendor_email}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="vendor_mobile"
                        value={formData.vendor_mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.vendor_mobile && touched.vendor_mobile ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.vendor_mobile && touched.vendor_mobile && <span className='text-red-400 text-sm font-medium'>{errors.vendor_mobile}</span>}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Business Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Name of the Business <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="name_of_bussiness"
                        value={formData.name_of_bussiness}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.name_of_bussiness && touched.name_of_bussiness ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.name_of_bussiness && touched.name_of_bussiness && <span className='text-red-400 text-sm font-medium'>{errors.name_of_bussiness}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Business Category <span className="text-red-500">*</span></label>
                      {servicesError ? (
                        <p className="text-red-500 text-sm">Error loading categories: {servicesError}</p>
                      ) : (
                        <select
                          name="bussiness_category"
                          value={formData.bussiness_category}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={servicesLoading}
                          className={`w-full p-2 border ${errors.bussiness_category && touched.bussiness_category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] bg-white`}
                        >
                          <option value="" disabled>
                            {servicesLoading ? 'Loading categories...' : 'Select a category'}
                          </option>
                          {serviceCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.bussiness_category && touched.bussiness_category && <span className='text-red-400 text-sm font-medium'>{errors.bussiness_category}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Service Name <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="fast_service_category_name"
                        value={formData.fast_service_category_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.fast_service_category_name && touched.fast_service_category_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.fast_service_category_name && touched.fast_service_category_name && <span className='text-red-400 text-sm font-medium'>{errors.fast_service_category_name}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Business Proof URL (Optional)</label>
                      <input
                        type="text"
                        name="bussiness_proof_doc_url"
                        value={formData.bussiness_proof_doc_url}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.bussiness_proof_doc_url && touched.bussiness_proof_doc_url ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.bussiness_proof_doc_url && touched.bussiness_proof_doc_url && <span className='text-red-400 text-sm font-medium'>{errors.bussiness_proof_doc_url}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Annual Turnover<span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="annual_turnover"
                        value={formData.annual_turnover}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.annual_turnover && touched.annual_turnover ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.annual_turnover && touched.annual_turnover && <span className='text-red-400 text-sm font-medium'>{errors.annual_turnover}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">GST Number {requireGST && <span className="text-red-500">*</span>}</label>
                      <input
                        required
                        type="text"
                        name="gst_number"
                        value={formData.gst_number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.gst_number && touched.gst_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.gst_number && touched.gst_number && <span className='text-red-400 text-sm font-medium'>{errors.gst_number}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Company Category <span className="text-red-500">*</span></label>
                      <select
                        name="company_category"
                        value={formData.company_category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.company_category && touched.company_category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] bg-white`}
                      >
                        <option value="" disabled>Select a category</option>
                        {companyCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.company_category && touched.company_category && <span className='text-red-400 text-sm font-medium'>{errors.company_category}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Service Radius (km) <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        name="service_radius"
                        value={formData.service_radius}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.service_radius && touched.service_radius ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.service_radius && touched.service_radius && <span className='text-red-400 text-sm font-medium'>{errors.service_radius}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">City<span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="bussiness_address.city"
                        value={formData.bussiness_address.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors["bussiness_address.city"] && touched["bussiness_address.city"] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors["bussiness_address.city"] && touched["bussiness_address.city"] && <span className='text-red-400 text-sm font-medium'>{errors["bussiness_address.city"]}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">State<span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="bussiness_address.state"
                        value={formData.bussiness_address.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors["bussiness_address.state"] && touched["bussiness_address.state"] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors["bussiness_address.state"] && touched["bussiness_address.state"] && <span className='text-red-400 text-sm font-medium'>{errors["bussiness_address.state"]}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Street<span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="bussiness_address.street"
                        value={formData.bussiness_address.street}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors["bussiness_address.street"] && touched["bussiness_address.street"] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors["bussiness_address.street"] && touched["bussiness_address.street"] && <span className='text-red-400 text-sm font-medium'>{errors["bussiness_address.street"]}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Pincode <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.pincode && touched.pincode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.pincode && touched.pincode && <span className='text-red-400 text-sm font-medium'>{errors.pincode}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Starting Time <span className="text-red-500">*</span></label>
                      <TimePicker
                        required
                        type="text"
                        name="service_start_time"
                        value={formData.service_start_time}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 10:00 AM"
                        className={`w-full p-2 border ${errors.service_start_time && touched.service_start_time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.service_start_time && touched.service_start_time && <span className='text-red-400 text-sm font-medium'>{errors.service_start_time}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Closing Time <span className="text-red-500">*</span></label>
                      <TimePicker
                        required
                        type="text"
                        name="service_end_time"
                        value={formData.service_end_time}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 6:00 PM"
                        className={`w-full p-2 border ${errors.service_end_time && touched.service_end_time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors.service_end_time && touched.service_end_time && <span className='text-red-400 text-sm font-medium'>{errors.service_end_time}</span>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-lg font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                      <textarea
                        name="bussiness_desc"
                        value={formData.bussiness_desc}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors.bussiness_desc && touched.bussiness_desc ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] h-32`}
                      />
                      {errors.bussiness_desc && touched.bussiness_desc && <span className='text-red-400 text-sm font-medium'>{errors.bussiness_desc}</span>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-lg font-medium text-gray-700 mb-4">Photos <span className="text-red-500">*</span></label>
                      <div className="relative w-full">
                        <input
                          name="image_url"
                          required
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          onBlur={handleBlur}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] absolute opacity-0 cursor-pointer"
                        />
                        <div
                          className={`w-full p-2 border-2 ${errors.image_url && touched.image_url ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-100`}
                          onClick={() => document.querySelector('input[name="image_url"]').click()}
                        >
                          <p className="text-gray-500">
                            Drop file here or <span className="text-[#4285F4] underline">Select file</span>
                          </p>
                        </div>
                        {errors.image_url && touched.image_url && <span className='text-red-400 text-sm font-medium'>{errors.image_url}</span>}
                        {selectedFiles.length > 0 && (
                          <p className="text-gray-600 mt-2">Selected files: {selectedFiles.length}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Account Number <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="account_details.accountNumber"
                        value={formData.account_details.accountNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors["account_details.accountNumber"] && touched["account_details.accountNumber"] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors["account_details.accountNumber"] && touched["account_details.accountNumber"] && <span className='text-red-400 text-sm font-medium'>{errors["account_details.accountNumber"]}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">IFSC Code <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="account_details.ifsc"
                        value={formData.account_details.ifsc}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors["account_details.ifsc"] && touched["account_details.ifsc"] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors["account_details.ifsc"] && touched["account_details.ifsc"] && <span className='text-red-400 text-sm font-medium'>{errors["account_details.ifsc"]}</span>}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#4285F4] mb-6">KYC Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Aadhaar Number <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="kyc_docs.aadhar"
                        value={formData.kyc_docs.aadhar}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors["kyc_docs.aadhar"] && touched["kyc_docs.aadhar"] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors["kyc_docs.aadhar"] && touched["kyc_docs.aadhar"] && <span className='text-red-400 text-sm font-medium'>{errors["kyc_docs.aadhar"]}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Upload Aadhaar <span className="text-red-500">*</span></label>
                      <div
                        onClick={triggerAadhaarUpload}
                        className={`w-full p-2 border ${errors["kyc_docs.aadhar_photo"] && touched["kyc_docs.aadhar_photo"] ? 'border-red-500' : 'border-gray-300'} rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      >
                        <img src={uploadIcon} alt="Upload Icon" className="w-6 h-6" />
                      </div>
                      <input
                        required
                        name="kyc_docs.aadhar_photo"
                        type="file"
                        ref={aadhaarInputRef}
                        onChange={handleAadhaarFileChange}
                        onBlur={handleBlur}
                        className="hidden"
                      />
                      {errors["kyc_docs.aadhar_photo"] && touched["kyc_docs.aadhar_photo"] && <span className='text-red-400 text-sm font-medium'>{errors["kyc_docs.aadhar_photo"]}</span>}
                      {aadhaarFile && <p className="text-gray-600 mt-2">Selected file: {aadhaarFile.name}</p>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">PAN Number <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="kyc_docs.pan"
                        value={formData.kyc_docs.pan}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2 border ${errors["kyc_docs.pan"] && touched["kyc_docs.pan"] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      />
                      {errors["kyc_docs.pan"] && touched["kyc_docs.pan"] && <span className='text-red-400 text-sm font-medium'>{errors["kyc_docs.pan"]}</span>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Upload PAN <span className="text-red-500">*</span></label>
                      <div
                        onClick={triggerPanUpload}
                        className={`w-full p-2 border ${errors["kyc_docs.pan_photo"] && touched["kyc_docs.pan_photo"] ? 'border-red-500' : 'border-gray-300'} rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4]`}
                      >
                        <img src={uploadIcon} alt="Upload Icon" className="w-6 h-6" />
                      </div>
                      <input
                        name="kyc_docs.pan_photo"
                        required
                        type="file"
                        ref={panInputRef}
                        onChange={handlePanFileChange}
                        onBlur={handleBlur}
                        className="hidden"
                      />
                      {errors["kyc_docs.pan_photo"] && touched["kyc_docs.pan_photo"] && <span className='text-red-400 text-sm font-medium'>{errors["kyc_docs.pan_photo"]}</span>}
                      {panFile && <p className="text-gray-600 mt-2">Selected file: {panFile.name}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Services</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">Select Service</label>
                      {servicesError ? (
                        <p className="text-red-500 text-sm">Error loading services: {servicesError}</p>
                      ) : (
                        <select
                          value={selectedService}
                          onChange={handleServiceSelect}
                          disabled={servicesLoading}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] bg-white"
                        >
                          <option value="" disabled>
                            {servicesLoading ? 'Loading services...' : 'Select a service'}
                          </option>
                          {services.map((service) => (
                            <option key={service.service_name} value={service.service_name}>
                              {service.service_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addService}
                        disabled={!selectedService || servicesLoading}
                        className="w-full bg-[#4285F4] text-white p-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
                      >
                        Add Service
                      </button>
                    </div>
                  </div>
                  {formData.services.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-lg font-medium text-gray-700 mb-2">Selected Services</label>
                      <ul className="space-y-2">
                        {formData.services.map((service) => (
                          <li key={service} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                            <span className="text-gray-700">{service}</span>
                            <button
                              type="button"
                              onClick={() => removeService(service)}
                              className="text-red-500 hover:text-red-700 font-semibold"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                className="w-full bg-[#4285F4] text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-300 flex items-center justify-center disabled:bg-gray-400"
                disabled={uploading || isSubmitting}
              >
                {uploading || isSubmitting ? <span className="loader"></span> : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .click-scale { animation: clickScale 0.2s ease-in-out; }
        @keyframes clickScale {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
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
      <style jsx global>{`
        html, body {
          overflow-x: hidden;
          overflow-y: auto;
          background: linear-gradient(180deg, #4285F4 0%, #7AACFF 50%, rgba(255, 180, 77, 0.2) 100%);
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        html, body { -ms-overflow-style: none; scrollbar-width: none; }
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.5em;
        }
        select:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default VendorList;