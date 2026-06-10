import { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  getCustomerDataRequest,
  updateCustomerRequest,
} from '../../../saga/features/customer/customerSlice';

// Decode token function (copied from UserProfilePage)
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('decodeToken: Error decoding token:', error.message);
    return null;
  }
}

function Address() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customerData, customerLoading, customerError, updateCustomerLoading, updateCustomerError, user, isAuthenticated } = useSelector(
    (state) => state.customer
  );

  const [formData, setFormData] = useState({
    customer_name: '',
    mobile: '',
    customer_email: '',
    gender: '',
    customer_country: '',
    customer_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    customer_image: '',
  });
  const [initialData, setInitialData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const imageInputRef = useRef(null);

  const BASEURL = import.meta.env.VITE_API_URL;

  // Fetch customer data and check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isAuthenticated && !token) {
      navigate('/Home');
      alert("Please Login")
    } else {
      const decoded = token ? decodeToken(token) : null;
      if (decoded?.customer_id || user?.customer_id) {
        dispatch(getCustomerDataRequest());
      } else {
        navigate('/Home');
        alert("Please Login")
      }
    }
  }, [dispatch, user, isAuthenticated, navigate]);

  
  useEffect(() => {
    if (customerData && !initialData) {
      const data = Array.isArray(customerData) ? customerData[0] : customerData;
      const newData = {
        customer_name: data.customer_name || '',
        mobile: data.mobile || '',
        customer_email: data.customer_email || '',
        gender: data.gender || '',
        customer_country: data.customer_country || '',
        customer_address: {
          street: data.customer_address?.street || '',
          city: data.customer_address?.city || '',
          state: data.customer_address?.state || '',
          zip: data.customer_address?.zip || '',
        },
        customer_image: data.customer_image || '',
      };
      setFormData(newData);
      setInitialData(newData);
    }
  }, [customerData, initialData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'zip'].includes(name)) {
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
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle image upload
  const uploadFile = async (file) => {
    if (!file) return null;
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const response = await axios.post(`${BASEURL}/global/upload/file`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.url;
    } catch (error) {
      setErrors((prev) => ({ ...prev, customer_image: 'Failed to upload image' }));
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
        setFormData((prev) => ({ ...prev, customer_image: url }));
      }
    }
  };

  const triggerImageUpload = () => imageInputRef.current.click();

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name) newErrors.customer_name = 'Name is required';
    if (!formData.mobile) newErrors.mobile = 'Phone number is required';
    if (!formData.customer_email) newErrors.customer_email = 'Email is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.customer_country) newErrors.customer_country = 'Country is required';
    if (!formData.customer_address.street) newErrors.street = 'Street is required';
    if (!formData.customer_address.city) newErrors.city = 'City is required';
    if (!formData.customer_address.state) newErrors.state = 'State is required';
    if (!formData.customer_address.zip) newErrors.zip = 'Zip code is required';
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem('token');
    const decoded = token ? decodeToken(token) : null;
    const payload = {
      customer_id: customerData?.customer_id || decoded?.customer_id || 1,
      customer_name: formData.customer_name,
      mobile: formData.mobile,
      customer_email: formData.customer_email,
      gender: formData.gender,
      customer_country: formData.customer_country,
      customer_address: {
        street: formData.customer_address.street,
        city: formData.customer_address.city,
        state: formData.customer_address.state,
        zip: formData.customer_address.zip,
      },
      customer_image: formData.customer_image,
    };

    setFormData(payload);
    dispatch(updateCustomerRequest(payload));
  };

  // Handle success/error messages
  useEffect(() => {
    if (!updateCustomerLoading && !updateCustomerError && initialData) {
      setSuccessMessage('Profile updated successfully!');
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    } else if (!updateCustomerLoading && updateCustomerError) {
      setFormData(initialData);
    }
  }, [updateCustomerLoading, updateCustomerError, initialData]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Profile</h2>
      {/* {customerLoading && <p className="text-gray-500">Loading profile data...</p>}
      {customerError && <p className="text-red-500">Error: {customerError}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {updateCustomerError && <p className="text-red-500 mb-4">Error: {updateCustomerError}</p>}
      <div className="flex items-center mb-2">
        <FaMapMarkerAlt className="mr-2 text-gray-500" />
        <h3 className="font-semibold">Home</h3>
      </div>
      <p className="text-gray-600 mb-3 text-sm">
        {formData.customer_address.street
          ? `${formData.customer_address.street}, ${formData.customer_address.city}, ${formData.customer_address.state}, ${formData.customer_address.zip}`
          : '1012 Ocean Avenue, New York, USA 59008'}
      </p>
      <button className="text-blue-500 border border-dashed border-blue-500 p-2 rounded w-full mb-6">
        + Add new address
      </button> */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            name="customer_name"
            placeholder="Name"
            value={formData.customer_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.customer_name && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="mobile"
            placeholder="Phone Number"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
        </div>
        <div>
          <input
            type="email"
            name="customer_email"
            placeholder="Email"
            value={formData.customer_email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.customer_email && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
          )}
        </div>
        <div>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded text-gray-600"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>
        <div>
          <select
            name="customer_country"
            value={formData.customer_country}
            onChange={handleChange}
            className="w-full p-2 border rounded text-gray-600"
          >
            <option value="">Country</option>
            <option value="USA">USA</option>
            <option value="India">India</option>
            <option value="Canada">Canada</option>
          </select>
          {errors.customer_country && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_country}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="street"
            placeholder="Street"
            value={formData.customer_address.street}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
        </div>
        <div>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.customer_address.city}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>
        <div>
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.customer_address.state}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>
        <div>
          <input
            type="text"
            name="zip"
            placeholder="Zip Code"
            value={formData.customer_address.zip}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
          <div className="relative flex gap-4">
            {selectedImage && (
              <p className="text-gray-600 text-sm">Selected: {selectedImage.name}</p>
            )}
            {formData.customer_image && !selectedImage && (
              <img
                src={formData.customer_image}
                alt="Profile Preview"
                className="mt-2 w-16 h-16 rounded-full object-cover"
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
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              {formData.customer_image ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
        </div> */}
        <button
          type="submit"
          disabled={updateCustomerLoading || uploading}
          className={`w-full p-3 rounded-full text-white ${
            updateCustomerLoading || uploading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition`}
          
        >
          {updateCustomerLoading || uploading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}

export default Address;