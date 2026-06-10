 import React, { useState, useEffect } from "react";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";
import BookingDetails from "../../pages/admin/BookingDetails";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { unblockVendorRequest } from "../../saga/features/admin/adminSlice";
import { FaEye, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : import.meta.env.VITE_API_URL || "/api/v1";

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

const BlockedVendors = () => {
  const [activeTab, setActiveTab] = useState("Blocked Vendors");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedVendorForActions, setSelectedVendorForActions] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { unblockVendorLoading, unblockVendorError } = useSelector((state) => state.admin);

  const fetchBlockedVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${API_BASE_URL}/admin/data/getblockvendors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVendors(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch blocked vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockVendor = async (vendor) => {
    if (window.confirm(`Are you sure you want to unblock ${vendor.vendor_name}?`)) {
      try {
        dispatch(unblockVendorRequest({ vendor_id: vendor.vendor_id }));
        closeActionModal();
        // Wait for the unblock action to complete
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust delay if needed
        await fetchBlockedVendors(); // Refetch vendors
      } catch (err) {
        console.error("Unblock error:", err);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "Blocked Vendors") {
      fetchBlockedVendors();
    }
  }, [activeTab]);

  useEffect(() => {
    if (unblockVendorError) {
      alert(`Failed to unblock vendor: ${unblockVendorError}`);
    }
  }, [unblockVendorError]);

  const handleTabClick = (tab) => {
    console.log("Switching to tab:", tab);
    setActiveTab(tab);
    setSearchTerm("");
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handleActionClick = (vendor) => {
    setSelectedVendorForActions(vendor);
  };

  const closeModal = () => {
    setSelectedVendor(null);
  };

  const closeActionModal = () => {
    setSelectedVendorForActions(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
      hour12: true,
    });
  };

  const filteredVendors = vendors.filter((vendor) => {
    const name = vendor?.vendor_name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <div className="fixed top-0 w-full z-50 bg-white">
        <NavbarMain />
      </div>

      <div className="fixed left-0 top-[60px] w-[250px] h-[calc(100vh-60px)] shadow-md bg-white">
        <SideNavbar />
      </div>

      <div className="ml-[250px] mt-[60px] h-[calc(100vh-60px)] overflow-auto p-4 bg-gray-100">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex space-x-4 gap-[15px] h-[46px]">
            {["Vendor List", "Pending Approval", "Vendor Payments", "Service Category", "Booking Details", "Blocked Vendors"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-3 rounded-lg ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab !== "Booking Details" && (
            <div>
              <input
                type="text"
                placeholder="Search by Name"
                className="w-[250px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          )}
        </div>

        <ErrorBoundary>
          {activeTab === "Booking Details" ? (
            <BookingDetails />
          ) : (
            <div className="bg-white shadow-md rounded-xl overflow-hidden w-full">
              {loading ? (
                <div className="p-4">Loading...</div>
              ) : error ? (
                <div className="p-4 text-red-500">Error: {error}</div>
              ) : filteredVendors.length === 0 ? (
                <div className="p-4">
                  {searchTerm ? "No matching vendors found" : "No blocked vendors available"}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[calc(100vh-170px)]">
                  <table className="w-full min-w-full text-left border-collapse">
                    <thead className="bg-gray-200 text-gray-600">
                      <tr>
                        <th className="p-3 font-semibold">Names</th>
                        <th className="p-3 font-semibold">Email</th>
                        <th className="p-3 font-semibold">Phone Number</th>
                        <th className="p-3 font-semibold">Category</th>
                        <th className="p-3 font-semibold">Business Name</th>
                        <th className="p-3 font-semibold">Blocked Reason</th>
                        <th className="p-3 font-semibold">Blocked Date</th>
                        <th className="p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="overflow-y-auto">
                      {filteredVendors.map((vendor) => (
                        <tr key={vendor.vendor_id} className="border-b last:border-0 hover:bg-gray-100">
                          <td className="p-4">{vendor.vendor_name || "N/A"}</td>
                          <td className="p-4">{vendor.vendor_email || "N/A"}</td>
                          <td className="p-4">{vendor.vendor_mobile || "N/A"}</td>
                          <td className="p-4">{vendor.bussiness_category || "N/A"}</td>
                          <td className="p-4">{vendor.name_of_bussiness || "N/A"}</td>
                          <td className="p-4">{vendor.blocked_reason || "N/A"}</td>
                          <td className="p-4">{formatDate(vendor.blocked_date)}</td>
                          <td className="p-4 flex space-x-2">
                            <button onClick={() => handleViewDetails(vendor)}>
                              <FaEye className="text-blue-500 hover:text-blue-700" />
                            </button>
                            <button onClick={() => handleActionClick(vendor)}>
                              <FaEllipsisV className="text-gray-500 hover:text-gray-700" />
                            </button>
                          </td>
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
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Vendor Details</h2>
              <table className="w-full text-sm text-gray-700">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries({
                    Name: selectedVendor.vendor_name || "N/A",
                    Email: selectedVendor.vendor_email || "N/A",
                    Phone: selectedVendor.vendor_mobile || "N/A",
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
                    Images: selectedVendor.image_url?.length > 0 ? (
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
                    "Account Details": `IFSC: ${selectedVendor.account_details?.ifsc || "N/A"}, Account Number: ${selectedVendor.account_details?.accountNumber || "N/A"}`,
                    "KYC Docs": `PAN: ${selectedVendor.kyc_docs?.pan || "N/A"}, Aadhar: ${selectedVendor.kyc_docs?.aadhar || "N/A"}`,
                    Status: selectedVendor.is_approved ? "Approved" : "Pending",
                    "Approved By": selectedVendor.approved_by || "N/A",
                    "Approved Date": selectedVendor.approved_date || "N/A",
                    Rejected: selectedVendor.is_rejected ? "Yes" : "No",
                    "Rejected By": selectedVendor.rejected_by || "N/A",
                    "Rejected Date": selectedVendor.rejected_date || "N/A",
                    "Blocked Reason": selectedVendor.blocked_reason || "N/A",
                    "Blocked Date": formatDate(selectedVendor.blocked_date),
                  }).map(([key, value]) => (
                    <tr key={key}>
                      <td className="py-3 pr-4 font-medium text-gray-800 w-1/3 align-top">{key}</td>
                      <td className="py-3 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right mt-6">
                <button
                  onClick={closeModal}
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-200"
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
            <div className="bg-white p-4 rounded-xl w-[300px]">
              <h3 className="text-lg font-semibold mb-2">
                Actions for {selectedVendorForActions.vendor_name}
              </h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleUnblockVendor(selectedVendorForActions)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={unblockVendorLoading}
                >
                  {unblockVendorLoading ? "Unblocking..." : "Unblock Vendor"}
                </button>
                <button
                  onClick={closeActionModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
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

export default BlockedVendors;