 import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getService_CategoriesRequest,
  getServicesByCategoryRequest,
  getVendorsWithServicesRequest,
  selectCategory,
} from "../../saga/features/customer/customerSlice";
import Header from "./Header";
import Footer from "./Footer";
import { FaArrowLeft } from "react-icons/fa";

const Categories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Always "later" – this page is only for Book Later
  const bookingType = "later";
  const locationDetails = location.state?.locationDetails || null;

  // Safely extract city (supports string or { city: "Bangalore" })
  const getUserCity = () => {
    if (!locationDetails) return null;
    if (typeof locationDetails === "string") return locationDetails.trim();
    if (locationDetails?.city) return locationDetails.city.trim();
    return null;
  };

  const userCityLower = getUserCity()?.toLowerCase();

  const {
    serviceCategoriesget: categories,
    servicecategoriesLoading,
    servicecategoriesError,
    selectedCategory,
    servicesByCategory,
    servicesByCategoryLoading,
    servicesByCategoryError,
    vendorsWithServices,
    vendorsWithServicesLoading,
    vendorsWithServicesError,
  } = useSelector((state) => state.customer);

  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    dispatch(getService_CategoriesRequest());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory?.service_cat_id) {
      dispatch(getServicesByCategoryRequest(selectedCategory.service_cat_id));
      setSelectedService(null);
    }
  }, [selectedCategory, dispatch]);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    dispatch(getVendorsWithServicesRequest());
  };

  const handleCategoryClick = (category) => {
    dispatch(selectCategory(category));
    setSelectedService(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
  };

  const handleBookLater = (vendor) => {
    navigate("/AddressForm", {
      state: {
        hideSlot: false,           // Always show slot picker (Book Later)
        service_id: vendor.service_id,
        vendor_id: vendor.vendor_id,
        bookingType: "later",      // Fixed to "later"
        locationDetails,
      },
    });
  };

  const handleCall = (mobile) => {
    window.location.href = `tel:${mobile}`;
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/300";
  };

  // Filter vendors by service + city (if provided)
  const filteredVendors = selectedService
    ? vendorsWithServices.filter((v) => {
        const matchesService = v.service_id === selectedService.service_id;

        if (!userCityLower) return matchesService;

        const vendorCity = v.vendor_address?.city?.toLowerCase();
        return matchesService && vendorCity === userCityLower;
      })
    : [];

  return (
    <>
      <Header />
      <div className="w-[95%] mx-auto py-6 min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-black font-semibold hover:text-blue-600"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedService
              ? "Book Later - Choose Vendor"
              : selectedCategory
              ? `${selectedCategory.service_category_name} Services`
              : "Book Later - All Categories"}
          </h2>
        </div>

        {/* 1. Categories Grid */}
        {!selectedCategory && !selectedService && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {servicecategoriesLoading ? (
              <p className="col-span-full text-center">Loading categories...</p>
            ) : servicecategoriesError ? (
              <p className="col-span-full text-red-500 text-center">{servicecategoriesError}</p>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.service_cat_id}
                  onClick={() => handleCategoryClick(category)}
                  className="flex flex-col items-center cursor-pointer hover:scale-105 transition"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-300">
                    {category.service_category_url ? (
                      <img
                        src={category.service_category_url}
                        alt={category.service_category_name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                        {category.service_category_name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-2 text-center font-medium text-blue-600">
                    {category.service_category_name}
                  </p>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No categories found</p>
            )}
          </div>
        )}

        {/* 2. Services List */}
        {selectedCategory && !selectedService && (
          <>
            {servicesByCategoryLoading ? (
              <p className="text-center">Loading services...</p>
            ) : servicesByCategoryError ? (
              <p className="text-red-500 text-center">{servicesByCategoryError}</p>
            ) : servicesByCategory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesByCategory.map((service) => (
                  <div
                    key={service.service_id}
                    onClick={() => handleServiceClick(service)}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                  >
                    <img
                      src={service.service_image_url || "https://via.placeholder.com/300"}
                      alt={service.service_name}
                      className="w-full h-48 object-cover"
                      onError={handleImageError}
                    />
                    <div className="p-5">
                      <h3 className="font-bold text-lg">{service.service_name}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {service.service_description}
                      </p>
                      <p className="text-blue-600 font-bold text-2xl mt-4">
                        ₹{service.service_price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No services in this category</p>
            )}
          </>
        )}

        {/* 3. Vendors List (Book Later Only) */}
        {selectedService && (
          <>
            <button
              onClick={handleBackToServices}
              className="mb-6 text-blue-600 font-medium flex items-center gap-2 hover:underline"
            >
              <FaArrowLeft /> Back to Services
            </button>

            <h3 className="text-2xl font-bold mb-6">
              {selectedService.service_name} - Select Vendor & Date
            </h3>

            {vendorsWithServicesLoading ? (
              <p className="text-center">Loading vendors...</p>
            ) : vendorsWithServicesError ? (
              <p className="text-red-500 text-center">{vendorsWithServicesError}</p>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg">
                  No vendors available {userCityLower ? `in ${getUserCity()}` : "for this service"}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.vendor_id}
                    className="border rounded-xl bg-white shadow-md hover:shadow-xl transition overflow-hidden"
                  >
                    <img
                      src={vendor.service_image_url || "https://via.placeholder.com/300"}
                      alt={vendor.service_name}
                      className="w-full h-48 object-cover"
                      onError={handleImageError}
                    />
                    <div className="p-5">
                      <h3 className="font-bold text-lg">{vendor.service_name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{vendor.service_description}</p>
                      <p className="text-blue-600 font-bold text-2xl mt-4">
                        ₹{vendor.service_price}
                      </p>

                      <div className="mt-4 space-y-1 text-sm text-gray-700">
                        <p><strong>Vendor:</strong> {vendor.vendor_name}</p>
                        <p><strong>Business:</strong> {vendor.name_of_bussiness}</p>
                        <p><strong>Location:</strong> {vendor.vendor_address?.city || "N/A"}</p>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => handleCall(vendor.vendor_mobile)}
                          className="flex-1 bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700"
                        >
                          Call Now
                        </button>
                        <button
                          onClick={() => handleBookLater(vendor)}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700"
                        >
                          Book service
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Categories;