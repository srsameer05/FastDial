import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavbarMain from "../../../components/NevbarMain";
import SideNevbar from "../../../components/SideNevBar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addServiceCategoryRequest,
  updateServiceCategoryRequest,
  resetAddCategory,
  resetUpdateCategory,
} from "../../../saga/features/admin/adminSlice";
import { FaEye, FaTimes } from "react-icons/fa";
import axios from "axios";
const BASEURL = import.meta.env.DEV ? '/api/v1' : (import.meta.env.VITE_API_URL || '/api/v1');

const AddServiceCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    addCategoryLoading,
    addCategoryError,
    addCategorySuccess,
    updateCategoryLoading,
    updateCategoryError,
    updateCategorySuccess,
  } = useSelector((state) => state.admin);

  const isEdit = location.state?.isEdit || false;
  const editCategory = location.state?.category || null;

  const [formData, setFormData] = useState({
    service_name: isEdit ? editCategory.service_name : "",
    service_description: isEdit ? editCategory.service_description : "",
    service_image_url: isEdit ? editCategory.service_image_url : null,
    ...(isEdit && { service_cat_id: editCategory.service_cat_id }), 
  });

  const [previewUrl, setPreviewUrl] = useState(isEdit ? editCategory.service_image_url : null);
  const [uploadedUrl, setUploadedUrl] = useState(isEdit ? editCategory.service_image_url : null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      service_name: "",
      service_description: "",
      service_image_url: null,
      service_cat_id: null,
    });
    removeImage();
    setUploadedUrl(null);
    dispatch(isEdit ? resetUpdateCategory() : resetAddCategory());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (addCategorySuccess || updateCategorySuccess) {
      resetForm();
      alert(isEdit ? "Service Category updated successfully!" : "Service Category added successfully!");
      navigate("/servicecategory");
    }
    if (addCategoryError || updateCategoryError) {
      alert(`Error: ${addCategoryError || updateCategoryError}`);
    }
  }, [addCategorySuccess, updateCategorySuccess, addCategoryError, updateCategoryError, dispatch, navigate, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let serviceCategoryUrl = uploadedUrl;
      if (file) {
        serviceCategoryUrl = await uploadFile(file);
        setUploadedUrl(serviceCategoryUrl);
      }
      if (isEdit && !file && uploadedUrl) {
        serviceCategoryUrl = uploadedUrl;
      }
      if (!serviceCategoryUrl && !isEdit) {
        alert("Please upload a service category image.");
        return;
      }
      const payload = {
        service_name: formData.service_name,
        service_description: formData.service_description,
        service_image_url: serviceCategoryUrl,
        ...(isEdit && { service_cat_id: formData.service_cat_id }),
      };
      if (isEdit) {
        dispatch(updateServiceCategoryRequest(payload));
      } else {
        dispatch(addServiceCategoryRequest(payload));
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(`Failed to ${isEdit ? "update" : "add"} service category: ${error.message}`);
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
            <h2 className="text-2xl font-bold mb-4">Service Category</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-blue-500 mb-6">
                {isEdit ? "Edit Category" : "Add Category"}
              </h3>
              {(addCategoryError || updateCategoryError) && (
                <div className="mb-4 text-red-500">{addCategoryError || updateCategoryError}</div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="service_name"
                      className="w-full p-2 border rounded"
                      placeholder="Enter name"
                      value={formData.service_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Service Icon</label>
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
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={addCategoryLoading || updateCategoryLoading || uploading}
                  >
                    {addCategoryLoading || updateCategoryLoading || uploading
                      ? "Processing..."
                      : isEdit
                      ? "Update Category"
                      : "Add Category"}
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

export default AddServiceCategory;