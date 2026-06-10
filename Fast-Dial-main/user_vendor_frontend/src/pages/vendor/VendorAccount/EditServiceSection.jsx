 import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendorProfileRequest,
  updateVendorRequest,
  clearUpdateStatus,
  fetchServicesRequest,
  fetchVendorServicesRequest,
  updateVendorServiceRequest,
  clearUpdateServiceStatus,
} from "../../../saga/features/vendor/vendorSlice";
import uploadIcon from "../../../assets/upload-icon.png";
import axios from "axios";
const BASEURL = import.meta.env.VITE_API_URL;

const EditServiceSection = () => {
  const dispatch = useDispatch();
  const {
    profile,
    profileLoading,
    profileError,
    updateLoading,
    updateError,
    updateSuccess,
    services,
    servicesLoading,
    servicesError,
    vendorServices,
    vendorServicesLoading,
    vendorServicesError,
    updateServiceLoading,
    updateServiceError,
    updateServiceSuccess,
  } = useSelector((state) => state.vendor);

  const aadhaarInputRef = useRef(null);
  const panInputRef = useRef(null);
  const [vendorId, setVendorId] = useState(null);

  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_email: "",
    vendor_mobile: "",
    name_of_bussiness: "",
    bussiness_category: "",
    fast_service_category_name: "",
    bussiness_proof_doc_url: "",
    gst_number: "",
    company_category: "",
    service_radius: "",
    bussiness_address: "",
    pincode: "",
    service_start_time: "",
    service_end_time: "",
    bussiness_desc: "",
    image_url: [],
    account_details: { accountNumber: "", ifsc: "" },
    kyc_docs: { pan: "", aadhar: "", pan_photo: "", aadhar_photo: "" },
    services: [],
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [editServiceData, setEditServiceData] = useState([]);
  const [serviceSubmitLoading, setServiceSubmitLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  useEffect(() => {
    console.log("EditServiceSection useEffect - Fetching profile and services");
    const token = localStorage.getItem("vendorToken");
    console.log("Token from localStorage:", token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const extractedVendorId = payload.id;
        console.log("Extracted vendorId from token:", extractedVendorId);
        setVendorId(extractedVendorId);
        dispatch(fetchVendorProfileRequest(extractedVendorId));
        dispatch(fetchServicesRequest());
        dispatch(fetchVendorServicesRequest(extractedVendorId));
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    } else {
      console.log("No token found, skipping fetch");
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("Profile useEffect triggered, profile:", profile);
    if (profile) {
      setFormData({
        vendor_name: profile.vendor_name || "",
        vendor_email: profile.vendor_email || "",
        vendor_mobile: profile.vendor_mobile || "",
        name_of_bussiness: profile.name_of_bussiness || "",
        bussiness_category: profile.bussiness_category || "",
        fast_service_category_name: profile.fast_service_category_name || "",
        bussiness_proof_doc_url: profile.bussiness_proof_doc_url || "",
        gst_number: profile.gst_number || "",
        company_category: profile.company_category || "",
        service_radius: profile.service_radius || "",
        bussiness_address: profile.bussiness_address || "",
        pincode: profile.pincode || "",
        service_start_time: profile.service_start_time || "",
        service_end_time: profile.service_end_time || "",
        bussiness_desc: profile.bussiness_desc || "",
        image_url: profile.image_url || [],
        account_details: {
          accountNumber: profile.account_details?.accountNumber || "",
          ifsc: profile.account_details?.ifsc || "",
        },
        kyc_docs: {
          pan: profile.kyc_docs?.pan || "",
          aadhar: profile.kyc_docs?.aadhar || "",
          pan_photo: profile.kyc_docs?.pan_photo || "",
          aadhar_photo: profile.kyc_docs?.aadhar_photo || "",
        },
        services: profile.services || [],
      });
    }
  }, [profile]);

  useEffect(() => {
    if (vendorServices && vendorId) {
      const filteredServices = vendorServices.filter(
        (service) => service.vendor_id === vendorId
      );
      setEditServiceData(
        filteredServices.map((service) => ({
          id: service.id,
          service_name: service.service_description,
          service_price: service.service_price,
          vendor_id: service.vendor_id,
          service_id: service.service_id,
        }))
      );
    }
  }, [vendorServices, vendorId]);

  useEffect(() => {
    if (updateSuccess) {
      alert("Vendor profile updated successfully!");
      dispatch(clearUpdateStatus());
      setSelectedFiles([]);
      setAadhaarFile(null);
      setPanFile(null);
      setSelectedService("");
    }
    if (updateError) {
      alert(`Update failed: ${updateError || "Unknown error"}`);
      dispatch(clearUpdateStatus());
    }
  }, [updateSuccess, updateError, dispatch]);

  useEffect(() => {
    if (updateServiceSuccess) {
      alert("Service updated successfully!");
      dispatch(clearUpdateServiceStatus());
      if (vendorId) {
        dispatch(fetchVendorServicesRequest(vendorId));
      }
    }
    if (updateServiceError) {
      alert(`Service update failed: ${updateServiceError || "Unknown error"}`);
      dispatch(clearUpdateServiceStatus());
    }
  }, [updateServiceSuccess, updateServiceError, dispatch, vendorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("account_details") || name.includes("kyc_docs")) {
      const [section, field] = name.split(".");
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
      setSelectedService("");
    }
  };

  const removeService = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
    );
    if (validFiles.length !== files.length) {
      alert("Only JPG, JPEG, and PNG files are allowed!");
    }
    setSelectedFiles(validFiles);
    console.log("Selected files updated:", validFiles);
  };

  const handleAadhaarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadhaarFile(file);
      console.log("Aadhaar file updated:", file);
    }
  };

  const handlePanFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPanFile(file);
      console.log("PAN file updated:", file);
    }
  };

  const triggerAadhaarUpload = () => aadhaarInputRef.current.click();
  const triggerPanUpload = () => panInputRef.current.click();

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
      console.log("File uploaded, URL:", response.data.url);
      return response.data.url;
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleServiceDataChange = (id, field, value) => {
    setEditServiceData((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const handleServiceSelection = (id) => {
    setSelectedServiceId(id);
    const service = editServiceData.find((s) => s.id === id);
    if (service) {
      console.log("Selected service:", service);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered");

    const token = localStorage.getItem("vendorToken");
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const vendorId = payload.id;

      setUploading(true);

      let imageUrls = formData.image_url || [];
      if (selectedFiles.length > 0) {
        imageUrls = await Promise.all(
          selectedFiles.map(async (file) => await uploadFile(file))
        );
        imageUrls = imageUrls.filter((url) => url !== null);
      }

      const aadhaarPhotoUrl = aadhaarFile
        ? await uploadFile(aadhaarFile)
        : formData.kyc_docs.aadhar_photo || "";
      const panPhotoUrl = panFile
        ? await uploadFile(panFile)
        : formData.kyc_docs.pan_photo || "";

      const updatedData = {
        vendor_id: vendorId,
        vendor_name: formData.vendor_name,
        vendor_email: formData.vendor_email,
        vendor_mobile: Number(formData.vendor_mobile),
        name_of_bussiness: formData.name_of_bussiness,
        bussiness_category: formData.bussiness_category,
        fast_service_category_name: formData.fast_service_category_name,
        bussiness_proof_doc_url: formData.bussiness_proof_doc_url,
        gst_number: formData.gst_number,
        company_category: formData.company_category,
        service_radius: Number(formData.service_radius),
        bussiness_address: formData.bussiness_address,
        pincode: formData.pincode,
        service_start_time: formData.service_start_time,
        service_end_time: formData.service_end_time,
        bussiness_desc: formData.bussiness_desc,
        account_details: {
          accountNumber: formData.account_details.accountNumber,
          ifsc: formData.account_details.ifsc,
        },
        kyc_docs: {
          pan: formData.kyc_docs.pan,
          aadhar: formData.kyc_docs.aadhar,
          pan_photo: panPhotoUrl,
          aadhar_photo: aadhaarPhotoUrl,
        },
        image_url: imageUrls,
        services: formData.services,
      };

      console.log("Submitting updated vendor data:", updatedData);
      dispatch(updateVendorRequest(updatedData));

      // Update vendor services
      for (const service of editServiceData) {
        const serviceData = {
          id: service.id,
          vendor_id: service.vendor_id,
          service_id: service.service_id,
          service_description: service.service_name,
          service_price: parseFloat(service.service_price),
        };
        console.log("Updating vendor service:", serviceData);
        dispatch(updateVendorServiceRequest(serviceData));
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(`An error occurred while submitting: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    console.log("handleServiceSubmit triggered");

    const token = localStorage.getItem("vendorToken");
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    if (!selectedServiceId) {
      alert("Please select a service to update.");
      return;
    }

    try {
      const selectedService = editServiceData.find((s) => s.id === selectedServiceId);
      if (!selectedService) {
        throw new Error("Selected service not found.");
      }

      const servicePrice = parseFloat(selectedService.service_price);
      if (isNaN(servicePrice)) {
        throw new Error("Invalid service price.");
      }

      const servicePayload = {
        id: selectedService.id,
        vendor_id: selectedService.vendor_id,
        service_id: selectedService.service_id,
        service_description: selectedService.service_name || "",
        service_price: servicePrice.toFixed(2), // Format as string with 2 decimal places
      };

      console.log("Submitting service to API:", JSON.stringify(servicePayload, null, 2));

      setServiceSubmitLoading(true);
      const response = await axios.put(
  `${import.meta.env.VITE_API_URL}/vendors/data/updatevendor_services`,
  servicePayload,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

      console.log("Service update response:", response.data);
      alert("Vendor service updated successfully!");
      if (vendorId) {
        dispatch(fetchVendorServicesRequest(vendorId));
      }
    } catch (error) {
      console.error("Error in handleServiceSubmit:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update service. Please try again.";
      alert(errorMessage);
    } finally {
      setServiceSubmitLoading(false);
    }
  };

  // Get unique service categories
  const serviceCategories = [...new Set(services.map((item) => item.service_category_name))];

  return (
    <>
      <h2 className="text-2xl font-semibold text-[#4285F4] mb-6">
        Edit Service Details
      </h2>
      {profileLoading && <p className="text-gray-600 mb-4">Loading profile...</p>}
      {profileError && <p className="text-red-500 mb-4">Error: {profileError}</p>}
      <form onSubmit={handleSubmit} className="space-y-10">
        <div>
          <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Vendor Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Name</label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                placeholder="Vendor Name"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] mb-4"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Email</label>
              <input
                type="email"
                name="vendor_email"
                value={formData.vendor_email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Mobile Number</label>
              <input
                type="number"
                name="vendor_mobile"
                value={formData.vendor_mobile}
                onChange={handleChange}
                placeholder="Mobile Number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Name of the Business</label>
              <input
                type="text"
                name="name_of_bussiness"
                value={formData.name_of_bussiness}
                onChange={handleChange}
                placeholder="Name of the Business"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] mb-4"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Business Category</label>
              {servicesError ? (
                <p className="text-red-500 text-sm">Error loading categories: {servicesError}</p>
              ) : (
                <select
                  name="bussiness_category"
                  value={formData.bussiness_category}
                  onChange={handleChange}
                  disabled={servicesLoading}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] bg-white"
                >
                  <option value="" disabled>
                    {servicesLoading ? "Loading categories..." : "Select a category"}
                  </option>
                  {serviceCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Service Name</label>
              <input
                type="text"
                name="fast_service_category_name"
                value={formData.fast_service_category_name}
                onChange={handleChange}
                placeholder="Service Name"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] mb-4"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Business Proof URL</label>
              <input
                type="text"
                name="bussiness_proof_doc_url"
                value={formData.bussiness_proof_doc_url}
                onChange={handleChange}
                placeholder="Business Proof URL"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">GST Number</label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="GST Number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] mb-4"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Company Category</label>
              <input
                type="text"
                name="company_category"
                value={formData.company_category}
                onChange={handleChange}
                placeholder="Company Category"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Service Radius (km)</label>
              <input
                type="number"
                name="service_radius"
                value={formData.service_radius}
                onChange={handleChange}
                placeholder="Service Radius"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] mb-4"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Business Address</label>
              <input
                type="text"
                name="bussiness_address"
                value={formData.bussiness_address}
                onChange={handleChange}
                placeholder="Business Address"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] mb-4"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Starting Time</label>
              <input
                type="text"
                name="service_start_time"
                value={formData.service_start_time}
                onChange={handleChange}
                placeholder="e.g., 08:00 AM"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Closing Time</label>
              <input
                type="text"
                name="service_end_time"
                value={formData.service_end_time}
                onChange={handleChange}
                placeholder="e.g., 08:00 PM"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-4">Description</label>
              <textarea
                name="bussiness_desc"
                value={formData.bussiness_desc}
                onChange={handleChange}
                placeholder="Business Description"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] h-32"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-4">Photos</label>
              <div className="relative w-full">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] absolute opacity-0 cursor-pointer"
                />
                <div
                  className="w-full p-2 border-2 border-gray-300 border-dashed rounded-lg text-center cursor-pointer"
                  onClick={() => document.querySelector('input[type="file"]').click()}
                >
                  <p className="text-gray-500">
                    Drop file here or <span className="text-[#4285F4] underline">Select file</span>
                  </p>
                  <p className="text-gray-500 text-sm">Only JPG, JPEG and PNG files are allowed</p>
                </div>
                {selectedFiles.length > 0 && (
                  <p className="text-gray-600 mt-2">Selected files: {selectedFiles.length}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Account Number</label>
              <input
                type="text"
                name="account_details.accountNumber"
                value={formData.account_details.accountNumber}
                onChange={handleChange}
                placeholder="Account Number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] mb-4"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">IFSC Code</label>
              <input
                type="text"
                name="account_details.ifsc"
                value={formData.account_details.ifsc}
                onChange={handleChange}
                placeholder="IFSC Code"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#4285F4] mb-6">KYC Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Aadhaar Number</label>
              <input
                type="text"
                name="kyc_docs.aadhar"
                value={formData.kyc_docs.aadhar}
                onChange={handleChange}
                placeholder="Aadhaar Number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Upload Aadhaar</label>
              <div
                onClick={triggerAadhaarUpload}
                className="w-full p-2 border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              >
                <img src={uploadIcon} alt="Upload Icon" className="w-6 h-6" />
              </div>
              <input
                type="file"
                ref={aadhaarInputRef}
                onChange={handleAadhaarFileChange}
                className="hidden"
              />
              {aadhaarFile && (
                <p className="text-gray-600 mt-2">Selected file: {aadhaarFile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">PAN Number</label>
              <input
                type="text"
                name="kyc_docs.pan"
                value={formData.kyc_docs.pan}
                onChange={handleChange}
                placeholder="PAN Number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Upload PAN</label>
              <div
                onClick={triggerPanUpload}
                className="w-full p-2 border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              >
                <img src={uploadIcon} alt="Upload Icon" className="w-6 h-6" />
              </div>
              <input
                type="file"
                ref={panInputRef}
                onChange={handlePanFileChange}
                className="hidden"
              />
              {panFile && (
                <p className="text-gray-600 mt-2">Selected file: {panFile.name}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {servicesLoading ? "Loading services..." : "Select a service"}
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

        <div>
          <h3 className="text-xl font-semibold text-[#4285F4] mb-6">Vendor Service Details</h3>
          {vendorServicesLoading && <p className="text-gray-600 mb-4">Loading services...</p>}
          {vendorServicesError && (
            <p className="text-red-500 mb-4">Error: {vendorServicesError}</p>
          )}
          {editServiceData.length > 0 ? (
            <>
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Select Service to Update
                </label>
                <select
                  value={selectedServiceId || ""}
                  onChange={(e) => handleServiceSelection(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] bg-white"
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {editServiceData.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.service_name} (ID: {service.id})
                    </option>
                  ))}
                </select>
              </div>
              {selectedServiceId && (
                <>
                  {editServiceData
                    .filter((service) => service.id === selectedServiceId)
                    .map((service) => (
                      <div key={service.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-lg font-medium text-gray-700 mb-2">
                            Service Name
                          </label>
                          <input
                            type="text"
                            value={service.service_name}
                            onChange={(e) =>
                              handleServiceDataChange(service.id, "service_name", e.target.value)
                            }
                            placeholder="Service Name"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                          />
                        </div>
                        <div>
                          <label className="block text-lg font-medium text-gray-700 mb-2">
                            Service Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={service.service_price}
                            onChange={(e) =>
                              handleServiceDataChange(service.id, "service_price", e.target.value)
                            }
                            placeholder="Service Price"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                          />
                        </div>
                      </div>
                    ))}
                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={handleServiceSubmit}
                      disabled={serviceSubmitLoading || updateServiceLoading}
                      className="w-full bg-[#4285F4] text-white py-3 rounded-full hover:bg-blue-600 transition duration-300 text-lg font-medium disabled:bg-gray-400"
                    >
                      {serviceSubmitLoading || updateServiceLoading
                        ? "Submitting..."
                        : "Submit Service"}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-600">No services found for this vendor.</p>
          )}
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={updateLoading || uploading || updateServiceLoading}
            className="w-full bg-[#4285F4] text-white py-3 rounded-full hover:bg-blue-600 transition duration-300 text-lg font-medium disabled:bg-gray-400"
          >
            {updateLoading || uploading || updateServiceLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
};

export default EditServiceSection;