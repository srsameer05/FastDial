import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavbarMain from "../../../components/NevbarMain";
import SideNevbar from "../../../components/SideNevBar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addSubServiceRequest,
  updateSubServiceRequest,
  resetAddSubService,
  resetUpdateSubService,
} from "../../../saga/features/admin/adminSlice";
import { FaEye, FaTimes } from "react-icons/fa";
import axios from "axios";
const BASEURL = import.meta.env.VITE_API_URL;

const AddSubService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    addSubServiceLoading,
    addSubServiceError,
    addSubServiceSuccess,
    updateSubServiceLoading,
    updateSubServiceError,
    updateSubServiceSuccess,
  } = useSelector((state) => state.admin);

  const isEdit = location.state?.isEdit || false;
  const subService = location.state?.subService || null;
  const serviceCatId = location.state?.serviceCatId || (isEdit ? subService?.service_cat_id : null);

  const [formData, setFormData] = useState({
    service_name: isEdit ? subService?.service_name : "",
    service_description: isEdit ? subService?.service_description : "",
    service_price: isEdit ? subService?.service_price : "",
    service_image_url: isEdit ? subService?.service_image_url : null,
    service_cat_id: serviceCatId,
    ...(isEdit && { service_id: subService?.service_id }), 
  });

  const [previewUrl, setPreviewUrl] = useState(isEdit ? subService?.service_image_url : null);
  const [uploadedUrl, setUploadedUrl] = useState(isEdit ? subService?.service_image_url : null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      service_name: "",
      service_description: "",
      service_price: "",
      service_image_url: null,
      service_cat_id: serviceCatId,
      service_id: null,
    });
    removeImage();
    setUploadedUrl(null);
    dispatch(isEdit ? resetUpdateSubService() : resetAddSubService());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "service_price" ? parseFloat(value) || "" : value,
    }));
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(fileUrl);
    setFile(selectedFile);
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFile(null);
    setUploadedUrl(null);
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  };

  const uploadFile = async (fileToUpload) => {
    if (!fileToUpload) return null;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", fileToUpload);

    try {
      const response = await axios.post(`${BASEURL}/global/upload/file`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.url;
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (addSubServiceSuccess || updateSubServiceSuccess) {
      resetForm();
      alert(isEdit ? "Sub-Service updated successfully!" : "Sub-Service added successfully!");
      navigate("/servicecategory");
      // Reset error states
      dispatch(resetAddSubService());
      dispatch(resetUpdateSubService());
    }
    if (addSubServiceError || updateSubServiceError) {
      alert(`Error: ${addSubServiceError || updateSubServiceError}`);
      // Reset error states after displaying
      dispatch(resetAddSubService());
      dispatch(resetUpdateSubService());
    }
  }, [
    addSubServiceSuccess,
    updateSubServiceSuccess,
    addSubServiceError,
    updateSubServiceError,
    dispatch,
    navigate,
    isEdit,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate price
      if (formData.service_price <= 0) {
        alert("Price must be a positive number.");
        return;
      }

      let subServiceUrl = uploadedUrl;
      if (file) {
        subServiceUrl = await uploadFile(file);
        setUploadedUrl(subServiceUrl);
      }
      if (isEdit && !file && uploadedUrl) {
        subServiceUrl = uploadedUrl; // Reuse existing image for updates
      }
      if (!subServiceUrl && !isEdit) {
        alert("Please upload a sub-service image.");
        return;
      }

      const payload = {
        service_name: formData.service_name,
        service_description: formData.service_description,
        service_price: formData.service_price,
        service_image_url: subServiceUrl,
        service_cat_id: formData.service_cat_id,
        ...(isEdit && { service_id: formData.service_id }), // Use service_id to match Postman
      };

      if (isEdit) {
        dispatch(updateSubServiceRequest(payload));
      } else {
        dispatch(addSubServiceRequest(payload));
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(`Failed to ${isEdit ? "update" : "add"} sub-service: ${error.message}`);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      <NavbarMain />
      <div className="flex bg-gray-100 h-screen">
        <SideNevbar />
        <div className="flex-1 p-6">
          <div className="w-[80%] mx-auto">
            <h2 className="text-2xl font-bold mb-4">Sub-Service</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-blue-500 mb-6">
                {isEdit ? "Edit Sub-Service" : "Add Sub-Service"}
              </h3>
              {(addSubServiceError || updateSubServiceError) && (
                <div className="mb-4 text-red-500">{addSubServiceError || updateSubServiceError}</div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Sub-Service Name</label>
                    <input
                      type="text"
                      name="service_name"
                      className="w-full p-2 border rounded"
                      placeholder="Enter sub-service name"
                      value={formData.service_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Sub-Service Icon</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        className="w-full p-2 border rounded"
                        onChange={handleImageChange}
                        required={!isEdit && !uploadedUrl}
                      />
                      {previewUrl && (
                        <div className="flex gap-2">
                          <span
                            onClick={() => window.open(previewUrl, "_blank")}
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                            title="View image"
                          >
                            <FaEye className="w-5 h-5" />
                          </span>
                          <span
                            onClick={removeImage}
                            className="cursor-pointer text-red-600 hover:text-red-800"
                            title="Remove image"
                          >
                            <FaTimes className="w-5 h-5" />
                          </span>
                        </div>
                      )}
                    </div>
                    {previewUrl && (
                      <div className="mt-2 relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Sub-Service Price</label>
                    <input
                      type="number"
                      name="service_price"
                      className="w-full p-2 border rounded"
                      placeholder="Enter price"
                      value={formData.service_price}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Description</label>
                  <textarea
                    name="service_description"
                    className="w-full p-2 border rounded"
                    placeholder="Enter description"
                    value={formData.service_description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/servicecategory")}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={addSubServiceLoading || updateSubServiceLoading || uploading}
                  >
                    {addSubServiceLoading || updateSubServiceLoading || uploading
                      ? "Processing..."
                      : isEdit
                      ? "Update Sub-Service"
                      : "Add Sub-Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddSubService;