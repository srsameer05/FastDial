 import React, { useState, useEffect } from "react";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";
import BookingDetails from "../../pages/admin/BookingDetails";
import BlockedVendors from "./BlockedVendors";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getVendorsRequest, blockVendorRequest, unblockVendorRequest } from "../../saga/features/admin/adminSlice";
import { FaEye, FaEllipsisV, FaFilter } from "react-icons/fa";
import axios from "axios";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || "Unknown error"}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const ManageVendor = () => {
  const [activeTab, setActiveTab] = useState("Vendor List");
  const [vendorFilter, setVendorFilter] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedVendorForActions, setSelectedVendorForActions] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [dropdownVendors, setDropdownVendors] = useState([]);
  const [dropdownVendorsLoading, setDropdownVendorsLoading] = useState(false);
  const [dropdownVendorsError, setDropdownVendorsError] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    vendors,
    getVendorsLoading,
    getVendorsError,
    blockVendorLoading,
    blockVendorError,
    unblockVendorLoading,
    unblockVendorError,
  } = useSelector((state) => state.admin);

  const subscribedVendorsApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  const unSubscribedVendorsApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  const trialVendorsApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  const serviceCategoriesApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });

  useEffect(() => {
    if (activeTab === "Vendor List" && !vendorFilter) {
      console.log("ManageVendor useEffect: Dispatching getVendorsRequest");
      dispatch(getVendorsRequest());
    }
  }, [dispatch, activeTab, vendorFilter]);

  useEffect(() => {
    const fetchDropdownVendors = async () => {
      setDropdownVendorsLoading(true);
      setDropdownVendorsError(null);
      try {
        let response;
        if (vendorFilter === "Subscribed") {
          response = await subscribedVendorsApi.get("/admin/data/getVendorsWithSubscription");
          console.log("Subscribed vendors response:", response.data);
        } else if (vendorFilter === "UnSubscribed") {
          response = await unSubscribedVendorsApi.get("/admin/data/getVendorsCompletedTrialNoPurchase");
          console.log("UnSubscribed vendors response:", response.data);
        } else if (vendorFilter === "Trial User") {
          response = await trialVendorsApi.get("/admin/data/getfreetrialvendors");
          console.log("Trial User vendors response:", response.data);
        }
        // Normalize response to ensure it's an array
        const vendorsData = Array.isArray(response.data.data) ? response.data.data : [response.data];
        // Add is_blocked: 0 if not present
        const normalizedVendors = vendorsData.map(vendor => ({
          ...vendor,
          is_blocked: vendor.is_blocked !== undefined ? vendor.is_blocked : 0,
          subscription_start_date: vendor.subscription_start_date || "N/A",
        }));
        setDropdownVendors(normalizedVendors);
      } catch (error) {
        console.error("Error fetching dropdown vendors:", error);
        setDropdownVendorsError(error.response?.data?.message || "Failed to fetch vendors");
      } finally {
        setDropdownVendorsLoading(false);
      }
    };

    if (vendorFilter) {
      fetchDropdownVendors();
    }
  }, [vendorFilter]);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const response = await serviceCategoriesApi.get("/admin/data/getSERVICE_CATEGORIES");
        console.log("Service categories response:", response.data);
        setServiceCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching service categories:", error);
        setCategoriesError(error.response?.data?.message || "Failed to fetch service categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (activeTab === "Vendor List") {
      fetchServiceCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    if (blockVendorError) {
      alert(`Failed to block vendor: ${blockVendorError}`);
    }
    if (unblockVendorError) {
      alert(`Failed to unblock vendor: ${unblockVendorError}`);
    }
  }, [blockVendorError, unblockVendorError]);

  const handleTabClick = (tab) => {
    console.log("Switching to tab:", tab);
    setActiveTab(tab);
    setSearchTerm("");
    setVendorFilter(null);
    setSelectedCategory(null);
    setShowCategoryDropdown(false);
    switch (tab) {
      case "Vendor List":
        navigate("/managevendor", { replace: true });
        break;
      case "Pending Approval":
        navigate("/pendingapproval", { replace: true });
        break;
      case "Vendor Payments":
        navigate("/vendorpayments", { replace: true });
        break;
      case "Service Category":
        navigate("/servicecategory", { replace: true });
        break;
      case "Booking Details":
        navigate("/bookingdetails", { replace: true });
        break;
      case "Blocked Vendors":
        navigate("/blockedvendors", { replace: true });
        break;
      default:
        break;
    }
  };

  const handleVendorFilterChange = (e) => {
    console.log("Vendor filter changed to:", e.target.value);
    setVendorFilter(e.target.value || null);
    setSelectedCategory(null);
    setShowCategoryDropdown(false);
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handleActionClick = (vendor) => {
    setSelectedVendorForActions(vendor);
    setBlockedReason("");
  };

  const closeModal = () => {
    setSelectedVendor(null);
  };

  const closeActionModal = () => {
    setSelectedVendorForActions(null);
    setBlockedReason("");
  };

  const handleBlockVendor = (vendor) => {
    if (!blockedReason.trim()) {
      alert("Please enter a reason for blocking the vendor.");
      return;
    }
    if (window.confirm(`Are you sure you want to block ${vendor.vendor_name}?`)) {
      const payload = {
        vendor_id: vendor.vendor_id,
        blocked_reason: blockedReason.trim(),
        is_blocked: 1,
        blocked_date: new Date().toISOString().split("T")[0],
      };
      console.log("Dispatching blockVendorRequest with payload:", payload);
      dispatch(blockVendorRequest(payload));
      closeActionModal();
      dispatch(getVendorsRequest());
    }
  };

  const handleUnblockVendor = (vendor) => {
    if (window.confirm(`Are you sure you want to unblock ${vendor.vendor_name}?`)) {
      dispatch(unblockVendorRequest({ vendor_id: vendor.vendor_id }));
      closeActionModal();
      dispatch(getVendorsRequest());
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBlockedReasonChange = (e) => {
    console.log("Blocked reason updated:", e.target.value);
    setBlockedReason(e.target.value);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown((prev) => !prev);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  const calculateTrialDays = (expiryDate) => {
    const currentDate = new Date();
    const expiry = new Date(expiryDate);
    if (currentDate > expiry) return 0;
    const diffTime = expiry - currentDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredVendors = (vendorFilter ? dropdownVendors : vendors).filter((vendor) => {
    const searchLower = searchTerm.toLowerCase();
    const name = vendor?.vendor_name?.toLowerCase() || "";
    const email = vendor?.vendor_email?.toLowerCase() || "";
    const phone = vendor?.vendor_mobile?.toString() || "";
    const category = vendor?.bussiness_category?.toLowerCase() || "";
    const businessName = vendor?.name_of_bussiness?.toLowerCase() || "";
    const status = vendor?.is_approved ? "active" : "pending";

    return (
      (!selectedCategory || vendor.bussiness_category === selectedCategory.service_category_name) &&
      (searchLower === "" ||
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        category.includes(searchLower) ||
        businessName.includes(searchLower) ||
        status.includes(searchLower))
    );
  });

  return (
    <>
      <style>
        {`
          .search-container {
            position: relative;
            width: 100%;
            max-width: 250px;
          }
          .search-input {
            width: 100%;
            padding-right: 2.5rem;
          }
          .filter-icon {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
          }
          .tabs-container {
            flex-direction: column;
            align-items: stretch;
          }
          @media (min-width: 640px) {
            .tabs-container {
              flex-direction: row;
              align-items: center;
            }
            .search-bar-container {
              margin-top: 0;
              align-self: center;
            }
          }
          @media (min-width: 1366px) {
            .search-bar-container {
              align-self: flex-end;
            }
          }
        `}
      </style>
      <div className="fixed top-0 w-full z-50 bg-white">
        <NavbarMain />
      </div>

      <div className="fixed left-0 top-[60px] w-[200px] sm:w-[250px] h-[calc(100vh-60px)] shadow-md bg-white overflow-y-auto">
        <SideNavbar />
      </div>

      <div className="ml-[200px] sm:ml-[250px] mt-[60px] h-[calc(100vh-60px)] overflow-auto p-4 sm:p-6 bg-gray-100">
        <div className="mb-6 relative">
          <div className="flex justify-between items-start gap-4 flex-wrap tabs-container">
            <div className="flex flex-wrap gap-2 sm:gap-[15px]">
              {["Vendor List", "Pending Approval", "Vendor Payments", "Service Category", "Booking Details", "Blocked Vendors"].map((tab) => (
                <div key={tab} className={tab === "Vendor List" ? "flex flex-col gap-4" : ""}>
                  <button
                    onClick={() => handleTabClick(tab)}
                    className={`px-3 py-2 rounded-lg text-sm sm:text-base ${
                      activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                  {tab === "Vendor List" && activeTab === "Vendor List" && (
                    <select
                      value={vendorFilter || ""}
                      onChange={handleVendorFilterChange}
                      className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none w-[150px] text-sm sm:text-base"
                    >
                      <option value="">All Vendors</option>
                      <option value="Subscribed">Subscribed</option>
                      <option value="UnSubscribed">UnSubscribed</option>
                      <option value="Trial User">Trial User</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
            {activeTab === "Vendor List" && (
              <div className="search-bar-container w-full sm:w-auto">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search"
                    className="search-input p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button
                    onClick={toggleCategoryDropdown}
                    className="filter-icon text-gray-500 hover:text-gray-700"
                  >
                    <FaFilter size={14} />
                  </button>
                </div>
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full max-w-[250px] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {categoriesLoading ? (
                      <div className="p-2 text-gray-500 text-sm">Loading categories...</div>
                    ) : categoriesError ? (
                      <div className="p-2 text-grey-500 text-sm">{categoriesError}</div>
                    ) : serviceCategories.length === 0 ? (
                      <div className="p-2 text-gray-500 text-sm">No categories available</div>
                    ) : (
                      serviceCategories.map((category) => (
                        <button
                          key={category.service_cat_id}
                          onClick={() => handleCategorySelect(category)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          {category.service_category_name}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {selectedCategory && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-700">
                      Filtered by: {selectedCategory.service_category_name}
                    </span>
                    <button
                      onClick={clearCategoryFilter}
                      className="ml-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ErrorBoundary>
          {activeTab === "Booking Details" ? (
            <BookingDetails />
          ) : activeTab === "Blocked Vendors" ? (
            <BlockedVendors />
          ) : (
            <div className="bg-white shadow-md rounded-xl overflow-hidden w-full">
              {(vendorFilter ? dropdownVendorsLoading : getVendorsLoading) ? (
                <div className="p-4 text-sm sm:text-base">Loading...</div>
              ) : (vendorFilter ? dropdownVendorsError : getVendorsError) ? (
                <div className="p-4 text-grey-500 text-sm sm:text-base">{vendorFilter ? dropdownVendorsError : getVendorsError}</div>
              ) : filteredVendors.length === 0 ? (
                <div className="p-4 text-sm sm:text-base">
                  {searchTerm || selectedCategory ? "No matching vendors found" : "No vendors available"}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[calc(100vh-170px)]">
                  <table className="w-full min-w-[600px] text-left border-collapse">
                    <thead className="bg-gray-200 text-gray-600">
                      <tr>
                        {vendorFilter === "Subscribed" ? (
                          <>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Name</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Price</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Plan Name</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Renewal Date</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Payment Date</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Payment ID</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Actions</th>
                          </>
                        ) : vendorFilter === "UnSubscribed" ? (
                          <>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Name</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Subscription ID</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Start Date</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Expiry Date</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Status</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Actions</th>
                          </>
                        ) : vendorFilter === "Trial User" ? (
                          <>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Name</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Subscription ID</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Start Date</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Expiry Date</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Status</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Trial Days</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Actions</th>
                          </>
                        ) : (
                          <>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Name</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Email</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Phone Number</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Category</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Status</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Business Name</th>
                            <th className="p-2 sm:p-3 font-semibold text-sm sm:text-base">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="overflow-y-auto">
                      {filteredVendors.map((vendor) => (
                        <tr
                          key={vendorFilter ? `${vendor.vendor_id}-${vendor.subscription_id}` : vendor.vendor_id}
                          className="border-b last:border-0 hover:bg-gray-100 text-sm sm:text-base"
                        >
                          {vendorFilter === "Subscribed" ? (
                            <>
                              <td className="p-2 sm:p-4">{vendor.vendor_name || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_price || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_name || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.payment_details?.renewal_date || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.payment_date ? new Date(vendor.payment_date).toLocaleDateString() : "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.payment_details?.razorpay_payment_id || "N/A"}</td>
                              <td className="p-2 sm:p-4 flex space-x-2">
                                <button onClick={() => handleViewDetails(vendor)}>
                                  <FaEye className="text-blue-500 hover:text-blue-700" />
                                </button>
                                <button onClick={() => handleActionClick(vendor)}>
                                  <FaEllipsisV className="text-gray-500 hover:text-gray-700" />
                                </button>
                              </td>
                            </>
                          ) : vendorFilter === "UnSubscribed" ? (
                            <>
                              <td className="p-2 sm:p-4">{vendor.vendor_name || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_id || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_start_date || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.expiry_date ? new Date(vendor.expiry_date).toLocaleDateString() : "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_status || "N/A"}</td>
                              <td className="p-2 sm:p-4 flex space-x-2">
                                <button onClick={() => handleViewDetails(vendor)}>
                                  <FaEye className="text-blue-500 hover:text-blue-700" />
                                </button>
                                <button onClick={() => handleActionClick(vendor)}>
                                  <FaEllipsisV className="text-gray-500 hover:text-gray-700" />
                                </button>
                              </td>
                            </>
                          ) : vendorFilter === "Trial User" ? (
                            <>
                              <td className="p-2 sm:p-4">{vendor.vendor_name || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_id || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_start_date || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_expiry_date ? new Date(vendor.subscription_expiry_date).toLocaleDateString() : "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_status || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.subscription_expiry_date ? calculateTrialDays(vendor.subscription_expiry_date) : "N/A"}</td>
                              <td className="p-2 sm:p-4 flex space-x-2">
                                <button onClick={() => handleViewDetails(vendor)}>
                                  <FaEye className="text-blue-500 hover:text-blue-700" />
                                </button>
                                <button onClick={() => handleActionClick(vendor)}>
                                  <FaEllipsisV className="text-gray-500 hover:text-gray-700" />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-2 sm:p-4">{vendor.vendor_name || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.vendor_email || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.vendor_mobile || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.bussiness_category || "N/A"}</td>
                              <td className="p-2 sm:p-4">{vendor.is_approved ? "Active" : "Pending"}</td>
                              <td className="p-2 sm:p-4">{vendor.name_of_bussiness || "N/A"}</td>
                              <td className="p-2 sm:p-4 flex space-x-2">
                                <button onClick={() => handleViewDetails(vendor)}>
                                  <FaEye className="text-blue-500 hover:text-blue-700" />
                                </button>
                                <button onClick={() => handleActionClick(vendor)}>
                                  <FaEllipsisV className="text-gray-500 hover:text-gray-700" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </ErrorBoundary>

        {selectedVendor && (() => {
          // Parse bussiness_address - can be a JSON string or an object
          let parsedAddress = selectedVendor.bussiness_address;
          if (typeof parsedAddress === "string") {
            try {
              parsedAddress = JSON.parse(parsedAddress);
            } catch (e) {
              parsedAddress = null;
            }
          }
          const addressDisplay = parsedAddress && typeof parsedAddress === "object"
            ? `${parsedAddress.street || ""}, ${parsedAddress.city || ""}, ${parsedAddress.state || ""}`.replace(/^, |, $/g, "").replace(/, ,/g, ",")
            : (typeof selectedVendor.bussiness_address === "string" ? selectedVendor.bussiness_address : "N/A");

          return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-[90%] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 pb-2">Vendor Details</h2>
              <table className="w-full text-xs sm:text-sm text-gray-700">
                <tbody>
                  {Object.entries({
                    "Vendor ID": selectedVendor.vendor_id || "N/A",
                    "Name": selectedVendor.vendor_name || "N/A",
                    "Email": selectedVendor.vendor_email || "N/A",
                    "Mobile": selectedVendor.vendor_mobile || "N/A",
                    "WhatsApp Number": selectedVendor.whatsapp_number || "N/A",
                    "Business Name": selectedVendor.name_of_bussiness || "N/A",
                    "Business Category": selectedVendor.bussiness_category || "N/A",
                    "Fast Service Category": selectedVendor.fast_service_category_name || "N/A",
                    "Business Proof Doc": selectedVendor.bussiness_proof_doc_url ? (
                      <a
                        href={selectedVendor.bussiness_proof_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    ) : (
                      "N/A"
                    ),
                    "GST Number": selectedVendor.gst_number || "N/A",
                    "Company Category": selectedVendor.company_category || "N/A",
                    "Service Radius": selectedVendor.service_radius ? `${selectedVendor.service_radius} km` : "N/A",
                    "Business Address": addressDisplay,
                    "Pincode": selectedVendor.pincode || "N/A",
                    "Service Start Time": selectedVendor.service_start_time || "N/A",
                    "Service End Time": selectedVendor.service_end_time || "N/A",
                    "Business Description": selectedVendor.bussiness_desc || "N/A",
                    "Annual Turnover": selectedVendor.annual_turnover ? `₹${Number(selectedVendor.annual_turnover).toLocaleString()}` : "N/A",
                    "Images": selectedVendor.image_url?.length > 0 ? (
                      <div className="space-y-1">
                        {selectedVendor.image_url.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline block"
                          >
                            Image {idx + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    ),
                    "Account Number": selectedVendor.account_details?.accountNumber || "N/A",
                    "IFSC Code": selectedVendor.account_details?.ifsc || "N/A",
                    "PAN Number": selectedVendor.kyc_docs?.pan || "N/A",
                    "Aadhaar Number": selectedVendor.kyc_docs?.aadhar || "N/A",
                    "PAN Photo": selectedVendor.kyc_docs?.pan_photo ? (
                      <a href={selectedVendor.kyc_docs.pan_photo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View PAN Photo</a>
                    ) : "N/A",
                    "Aadhaar Photo": selectedVendor.kyc_docs?.aadhar_photo ? (
                      <a href={selectedVendor.kyc_docs.aadhar_photo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Aadhaar Photo</a>
                    ) : "N/A",
                    "Services": Array.isArray(selectedVendor.services) && selectedVendor.services.length > 0
                      ? selectedVendor.services.join(", ")
                      : "N/A",
                    "Verified": selectedVendor.is_verified ? "Yes" : "No",
                    "Approval Status": selectedVendor.is_approved ? "Approved" : "Pending",
                    "Approved By": selectedVendor.approved_by || "N/A",
                    "Approved Date": selectedVendor.approved_date ? new Date(selectedVendor.approved_date).toLocaleDateString() : "N/A",
                    // "Rejected": selectedVendor.is_rejected ? "Yes" : "No",
                    // "Rejected By": selectedVendor.rejected_by || "N/A",
                    // "Rejected Date": selectedVendor.rejected_date ? new Date(selectedVendor.rejected_date).toLocaleDateString() : "N/A",
                    // "Blocked": selectedVendor.is_blocked ? "Yes" : "No",
                    // "Blocked Reason": selectedVendor.blocked_reason || "N/A",
                    // "Blocked Date": selectedVendor.blocked_date ? new Date(selectedVendor.blocked_date).toLocaleDateString() : "N/A",
                    "PAN Extracted": selectedVendor.pan_extracted || "N/A",
                    "Aadhaar Extracted": selectedVendor.aadhar_extracted || "N/A",
                    "Account Extracted": selectedVendor.account_extracted || "N/A",
                  }).map(([key, value]) => (
                    <tr key={key}>
                      <td className="py-2 sm:py-3 pr-4 font-medium text-gray-800 w-1/3 align-top">{key}</td>
                      <td className="py-2 sm:py-3 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right mt-4 sm:mt-6">
                <button
                  onClick={closeModal}
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-4 sm:px-5 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          );
        })()}

        {selectedVendorForActions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-xl w-[90%] max-w-[300px]">
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Actions for {selectedVendorForActions.vendor_name}
              </h3>
              <div className="flex flex-col space-y-2">
                {selectedVendorForActions.is_blocked ? (
                  <button
                    onClick={() => handleUnblockVendor(selectedVendorForActions)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
                    disabled={unblockVendorLoading}
                  >
                    {unblockVendorLoading ? "Unblocking..." : "Unblock Vendor"}
                  </button>
                ) : (
                  <>
                    <textarea
                      placeholder="Enter reason for blocking"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      value={blockedReason}
                      onChange={handleBlockedReasonChange}
                      rows={3}
                    />
                    <button
                      onClick={() => handleBlockVendor(selectedVendorForActions)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
                      disabled={blockVendorLoading}
                    >
                      {blockVendorLoading ? "Blocking..." : "Block Vendor"}
                    </button>
                  </>
                )}
                <button
                  onClick={closeActionModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageVendor;