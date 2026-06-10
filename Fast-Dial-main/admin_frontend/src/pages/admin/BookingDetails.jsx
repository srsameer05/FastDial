import React, { useState, useEffect } from "react";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";
import { useDispatch, useSelector } from "react-redux";
import {
  getCustomerServiceDetailsRequest,
  getVendorsRequest,
  updateServiceBookingRequest,
} from "../../saga/features/admin/adminSlice";
import { FaEye, FaEllipsisV, FaFilter, FaSort } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import requestUserImage1 from "../../assets/Workman.png";

const API_BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : import.meta.env.VITE_API_URL || "/api/v1";

const BookingDetails = () => {
  const [selectedCustomerService, setSelectedCustomerService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Booking Details");
  const [selectedServiceForAssignment, setSelectedServiceForAssignment] =
    useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showSection, setShowSection] = useState("service");
  const [reviews, setReviews] = useState({});
  const [selectedReviews, setSelectedReviews] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    customerServiceDetails,
    getCustomerServiceDetailsLoading,
    getCustomerServiceDetailsError,
    vendors,
    getVendorsLoading,
    getVendorsError,
    updateServiceBookingLoading,
    updateServiceBookingError,
    updateServiceBookingSuccess,
  } = useSelector((state) => state.admin);

  const serviceCategoriesApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(getCustomerServiceDetailsRequest());
    dispatch(getVendorsRequest());
  }, [dispatch, navigate]);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const response = await serviceCategoriesApi.get(
          "/admin/data/getSERVICE_CATEGORIES"
        );
        console.log("Service categories response:", response.data);
        setServiceCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching service categories:", error);
        setCategoriesError(
          error.response?.data?.message || "Failed to fetch service categories"
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchServiceCategories();
  }, []);

  useEffect(() => {
    if (updateServiceBookingSuccess) {
      setSelectedServiceForAssignment(null);
      setSelectedVendor(null);
      setShowSection("service");
      dispatch({ type: "admin/resetUpdateServiceBooking" });
    }
  }, [updateServiceBookingSuccess, dispatch]);

  useEffect(() => {
    if (showSection === "assigned" && customerServiceDetails) {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setReviewError("No admin token found");
        return;
      }

      const uniqueVendorIds = [
        ...new Set(
          customerServiceDetails
            .filter((service) => service.vendor_id !== null)
            .map((service) => service.vendor_id)
        ),
      ];

      const fetchReviews = async () => {
        try {
          setReviewError(null);
          const reviewPromises = uniqueVendorIds.map(async (vendorId) => {
            const response = await axios.get(
              `${API_BASE_URL}/admin/data/getReviewsByVendorId/${vendorId}?t=${Date.now()}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Cache-Control": "no-cache",
                },
              }
            );
            if (response.data.success) {
              const reviewsData = Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data].filter(Boolean);
              return { vendorId, reviews: reviewsData };
            }
            return { vendorId, reviews: [] };
          });

          const reviewResults = await Promise.all(reviewPromises);
          const newReviews = reviewResults.reduce(
            (acc, { vendorId, reviews }) => ({
              ...acc,
              [vendorId]: reviews,
            }),
            {}
          );
          setReviews(newReviews);
        } catch (error) {
          setReviewError("Failed to load reviews. Please try again.");
        }
      };

      fetchReviews();
    }
  }, [showSection, customerServiceDetails]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setSelectedCategory(null);
    setShowCategoryDropdown(false);
    setSortOption("");
    setShowSortDropdown(false);
    switch (tab) {
      case "Vendor List":
        navigate("/managevendor");
        break;
      case "Pending Approval":
        navigate("/pendingapproval");
        break;
      case "Vendor Payments":
        navigate("/vendorpayments");
        break;
      case "Service Category":
        navigate("/servicecategory");
        break;
      case "Booking Details":
        navigate("/bookingdetails");
        break;
      case "Blocked Vendors":
        navigate("/blockedvendors", { replace: true });
        break;
      default:
        break;
    }
  };

  const handleViewCustomerServiceDetails = (service) => {
    setSelectedCustomerService(service);
  };

  const handleAssignVendor = (service) => {
    setSelectedServiceForAssignment(service);
    setSelectedVendor(null);
    setShowSection("assign");
  };

  const handleVendorSelection = (vendorId) => {
    setSelectedVendor(vendorId);
    setSelectedCustomerService(selectedServiceForAssignment);
  };

  const confirmAssignment = () => {
    if (!selectedVendor || !selectedServiceForAssignment?.booking_id) {
      return;
    }
    dispatch(
      updateServiceBookingRequest({
        booking_id: selectedServiceForAssignment.booking_id,
        vendor_id: selectedVendor,
      })
    );
  };

  const closeModal = () => {
    setSelectedCustomerService(null);
    setSelectedServiceForAssignment(null);
    setSelectedVendor(null);
    setShowSection("service");
  };

  const handleReviewsView = (reviews) => {
    if (reviews && reviews.length > 0) {
      setSelectedReviews(reviews);
    }
  };

  const handleCloseReviewsView = () => {
    setSelectedReviews(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown((prev) => !prev);
    setShowSortDropdown(false); // Close sort dropdown when opening filter
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown((prev) => !prev);
    setShowCategoryDropdown(false); // Close filter dropdown when opening sort
  };

  const handleSortSelect = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  const clearSort = () => {
    setSortOption("");
  };

  const handleImageError = (e) => {
    e.target.src = requestUserImage1;
  };

  const sortServices = (services) => {
    if (!sortOption) return services;
    const sorted = [...services];
    switch (sortOption) {
      case "A-Z":
        return sorted.sort((a, b) =>
          (a.customer_name || "").localeCompare(b.customer_name || "")
        );
      case "New-Old":
        return sorted.sort(
          (a, b) =>
            new Date(b.booking_date || 0) - new Date(a.booking_date || 0)
        );
      case "Old-New":
        return sorted.sort(
          (a, b) =>
            new Date(a.booking_date || 0) - new Date(b.booking_date || 0)
        );
      default:
        return sorted;
    }
  };

  const filteredUnassignedServices = sortServices(
    (customerServiceDetails || []).filter(
      (service) =>
        (service?.customer_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        service.vendor_id === null &&
        (!selectedCategory ||
          service.service_category_name ===
            selectedCategory.service_category_name)
    )
  );

  const filteredAssignedServices = sortServices(
    (customerServiceDetails || [])
      .filter(
        (service) =>
          (service?.customer_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          service.vendor_id !== null &&
          (!selectedCategory ||
            service.service_category_name ===
              selectedCategory.service_category_name)
      )
      .map((service) => {
        const reviewsForService =
          reviews[service.vendor_id]?.filter(
            (review) =>
              review.booking_id === service.booking_id ||
              String(review.booking_id) === String(service.booking_id)
          ) || [];
        return { ...service, reviews: reviewsForService };
      })
  );

  const getStatus = (service) => {
    if (service.is_cancelled) return "Cancelled";
    if (service.is_completed) return "Completed";
    if (service.is_booked) return "Booked";
    return "Pending";
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== "object") return "N/A";
    return `${address.street || ""}, ${address.city || ""}, ${
      address.state || ""
    }, ${address.zip || ""}`
      .replace(/, ,/g, ",")
      .replace(/,$/, "");
  };

  return (
    <>
      <style>
        {`
    .search-bar-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      max-width: 600px;
    }
    .search-container {
      flex: 1;
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      outline: none;
    }
    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .action-button:hover {
      background-color: #f3f4f6;
    }
    .tabs-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
    @media (min-width: 640px) {
      .tabs-container {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
      .search-bar-container {
        margin-top: 0;
      }
    }
    @media (min-width: 1366px) {
      .search-bar-container {
        justify-content: flex-end;
      }
    }
    .dropdown-menu {
      position: absolute;
      z-index: 10;
      margin-top: 0.5rem;
      width: 200px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 200px;
      overflow-y: auto;
    }
    .dropdown-item {
      display: block;
      width: 100%;
      padding: 0.5rem 1rem;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .dropdown-item:hover {
      background-color: #f3f4f6;
    }
    .filter-status {
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
  `}
      </style>
      <div className="fixed top-0 w-full z-50 bg-white">
        <NavbarMain />
      </div>

      <div className="fixed left-0 top-[60px] w-[250px] h-[calc(100vh-60px)] shadow-md bg-white">
        <SideNavbar />
      </div>

      <div className="ml-[250px] mt-[60px] h-[calc(100vh-60px)] overflow-auto p-6 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-start mb-6 tabs-container">
          <div className="flex space-x-4 gap-[15px] h-[54px]">
            {[
              "Vendor List",
              "Pending Approval",
              "Vendor Payments",
              "Service Category",
              "Booking Details",
              "Blocked Vendors",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="search-bar-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by Name"
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="relative">
              <button onClick={toggleSortDropdown} className="action-button">
                <FaSort size={14} />
                Sort
              </button>
              {showSortDropdown && (
                <div className="dropdown-menu">
                  {["A-Z", "New-Old", "Old-New"].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSortSelect(option)}
                      className="dropdown-item"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={toggleCategoryDropdown}
                className="action-button"
              >
                <FaFilter size={14} />
                Filter
              </button>
              {showCategoryDropdown && (
                <div className="dropdown-menu">
                  {categoriesLoading ? (
                    <div className="p-2 text-gray-500 text-sm">
                      Loading categories...
                    </div>
                  ) : categoriesError ? (
                    <div className="p-2 text-red-500 text-sm">
                      {categoriesError}
                    </div>
                  ) : serviceCategories.length === 0 ? (
                    <div className="p-2 text-gray-500 text-sm">
                      No categories available
                    </div>
                  ) : (
                    serviceCategories.map((category) => (
                      <button
                        key={category.service_cat_id}
                        onClick={() => handleCategorySelect(category)}
                        className="dropdown-item"
                      >
                        {category.service_category_name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          {(selectedCategory || sortOption) && (
            <div className="filter-status w-full">
              {selectedCategory && (
                <span className="text-sm text-gray-700">
                  Filtered by: {selectedCategory.service_category_name}
                  <button
                    onClick={clearCategoryFilter}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Clear
                  </button>
                </span>
              )}
              {sortOption && (
                <span className="text-sm text-gray-700 ml-4">
                  Sorted by: {sortOption}
                  <button
                    onClick={clearSort}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Clear Sort
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setShowSection("service")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              showSection === "service"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Service Request
          </button>
          <button
            onClick={() => setShowSection("assigned")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              showSection === "assigned"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            disabled={!filteredAssignedServices.length}
          >
            Assigned
          </button>
        </div>

        {showSection === "service" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Service Requests
            </h2>
            {getCustomerServiceDetailsLoading ? (
              <p className="text-gray-600">Loading...</p>
            ) : getCustomerServiceDetailsError ? (
              <p className="text-red-500">No Records Found</p>
            ) : filteredUnassignedServices.length === 0 ? (
              <p className="text-gray-600">
                {searchTerm || selectedCategory || sortOption
                  ? "No matching unassigned customer services found"
                  : "No unassigned customer services available"}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUnassignedServices.map((service, index) => (
                  <div
                    key={`${service.customer_id}-${
                      service.booking_id || index
                    }`}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {service.customer_name || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Mobile: {service.mobile || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Category: {service.service_category_name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {getStatus(service)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() =>
                          handleViewCustomerServiceDetails(service)
                        }
                        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FaEye className="mr-2" /> View
                      </button>
                      <button
                        onClick={() => handleAssignVendor(service)}
                        className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Assign Vendor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showSection === "assigned" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Assigned Services
            </h2>
            {getCustomerServiceDetailsLoading ? (
              <p className="text-gray-600">Loading...</p>
            ) : getCustomerServiceDetailsError ? (
              <p className="text-red-500">No Records Found</p>
            ) : filteredAssignedServices.length === 0 ? (
              <p className="text-gray-600">
                {searchTerm || selectedCategory || sortOption
                  ? "No matching assigned services found"
                  : "No assigned services available"}
              </p>
            ) : (
              <>
                {reviewError && (
                  <p className="text-red-500 mb-4">{reviewError}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssignedServices.map((service, index) => (
                    <div
                      key={`${service.customer_id}-${
                        service.booking_id || index
                      }`}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {service.customer_name || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Mobile: {service.mobile || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Category: {service.service_category_name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ₹ {service.service_price || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Status: {getStatus(service)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Vendor ID: {service.vendor_id || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() =>
                            handleViewCustomerServiceDetails(service)
                          }
                          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <FaEye className="mr-2" /> View
                        </button>
                        <button
                          onClick={() => handleReviewsView(service.reviews)}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            !service.reviews || service.reviews.length === 0
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-gray-500 text-white hover:bg-gray-600"
                          }`}
                          disabled={
                            !service.reviews || service.reviews.length === 0
                          }
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {showSection === "assign" && selectedServiceForAssignment && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
              Assign Vendor for Booking ID:{" "}
              {selectedServiceForAssignment.booking_id}
            </h2>

            {getVendorsLoading ? (
              <p className="text-gray-600">Loading vendors...</p>
            ) : getVendorsError ? (
              <p className="text-red-500">No Records Found</p>
            ) : vendors.length === 0 ? (
              <p className="text-gray-600">No vendors available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.vendor_id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {vendor.vendor_name || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Business: {vendor.name_of_bussiness || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Category: {vendor.bussiness_category || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Mobile: {vendor.vendor_mobile || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Hours: {vendor.service_start_time} -{" "}
                          {vendor.service_end_time}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => handleVendorSelection(vendor.vendor_id)}
                        className={`w-full text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedVendor === vendor.vendor_id
                            ? "bg-blue-600 text-white"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {selectedVendor === vendor.vendor_id
                          ? "Selected"
                          : "Assign Vendor"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedVendor && (
              <div className="text-right mt-6">
                <button
                  onClick={() =>
                    setSelectedCustomerService(selectedServiceForAssignment)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-200"
                >
                  Confirm Selection
                </button>
              </div>
            )}
          </div>
        )}

        {selectedCustomerService && showSection !== "assign" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-[700px] max-h-[80vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                Customer Service Details
              </h2>

              <table className="w-full text-sm text-gray-800 border-collapse">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600 w-[40%]">
                      Customer ID
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.customer_id || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Customer Name
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.customer_name || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Mobile
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.mobile || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Email
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.customer_email || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Country
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.customer_country || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Gender
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.gender || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Address
                    </td>
                    <td className="py-3">
                      {formatAddress(selectedCustomerService.customer_address)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Booking ID
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.booking_id || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Vendor ID
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.vendor_id || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Service Category
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.service_category_name || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Service Description
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.service_desc || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Service Price
                    </td>
                    <td className="py-3">
                      ₹ {selectedCustomerService.service_price || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Service Image
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.service_category_url ? (
                        <img
                          src={selectedCustomerService.service_category_url}
                          alt="Service"
                          className="h-20 rounded border"
                          onError={handleImageError}
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Status
                    </td>
                    <td className="py-3">
                      {getStatus(selectedCustomerService)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-medium text-gray-600">
                      Cancelled Reason
                    </td>
                    <td className="py-3">
                      {selectedCustomerService.cancelled_reason || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCustomerService && showSection === "assign" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                Confirm Vendor Assignment
              </h2>

              <div className="space-y-4 text-gray-700 text-sm">
                <p>
                  <span className="font-medium">Booking ID:</span>{" "}
                  {selectedServiceForAssignment?.booking_id || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Customer Name:</span>{" "}
                  {selectedServiceForAssignment?.customer_name || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Selected Vendor ID:</span>{" "}
                  {selectedVendor || "N/A"}
                </p>

                {vendors.find((v) => v.vendor_id === selectedVendor) && (
                  <p>
                    <span className="font-medium">Vendor Name:</span>{" "}
                    {vendors.find((v) => v.vendor_id === selectedVendor)
                      .vendor_name || "N/A"}
                  </p>
                )}

                {updateServiceBookingError && (
                  <p className="text-red-600 font-medium">No Records Found</p>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssignment}
                  className={`${
                    updateServiceBookingLoading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-5 py-2 rounded-lg font-medium transition duration-200`}
                  disabled={updateServiceBookingLoading}
                >
                  {updateServiceBookingLoading
                    ? "Assigning..."
                    : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedReviews && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  Customer Reviews (Booking ID: {selectedReviews[0]?.booking_id}
                  )
                </h2>
                <button
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  onClick={handleCloseReviewsView}
                >
                  Close
                </button>
              </div>
              <div className="space-y-6">
                {selectedReviews.map((review, index) => (
                  <div key={index} className="border-b pb-4 text-center">
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-2xl ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      "{review.review_text}"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Review ID: {review.review_id}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingDetails;
