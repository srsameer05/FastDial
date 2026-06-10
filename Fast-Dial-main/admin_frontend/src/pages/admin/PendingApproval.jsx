import React, { useState, useEffect } from "react";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingVendorsRequest,
  updateVendorStatusRequest,
} from "../../saga/features/admin/adminSlice";
import { FaTimes } from "react-icons/fa";

const PendingApproval = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Pending Approval");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    pendingVendors,
    getPendingVendorsLoading,
    getPendingVendorsError,
    updateVendorStatusLoading,
    updateVendorStatusError,
    updateVendorStatusSuccess,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getPendingVendorsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (updateVendorStatusSuccess) {
      dispatch(getPendingVendorsRequest());
      dispatch({ type: "admin/resetUpdateVendorStatus" });
    }
  }, [updateVendorStatusSuccess, dispatch]);

  const handleApprove = (vendorId) => {
    dispatch(
      updateVendorStatusRequest({
        vendor_id: vendorId,
        is_approved: 1,
        approved_by: 1,
        approved_date: new Date().toISOString().split("T")[0],
      })
    );
  };

  const handleReject = (vendorId) => {
    dispatch(
      updateVendorStatusRequest({
        vendor_id: vendorId,
        is_rejected: 1,
        rejected_by: 1,
      })
    );
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
        navigate("/bookingdetails", { replace: true });
        break;
      case "Blocked Vendors":
        navigate("/blockedvendors", { replace: true });
        break;
      default:
        break;
    }
  };

  const handleViewMore = (vendor) => {
    setSelectedVendor(vendor);
  };

  const closeModal = () => {
    setSelectedVendor(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredVendors = (pendingVendors || []).filter((vendor) =>
    (vendor?.vendor_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex space-x-4 mb-4 gap-[15px] h-[46px]">
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
                className={`px-3 rounded-lg ${activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Name"
              className="w-[250px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {updateVendorStatusError && (
          <p className="text-red-500 mb-2">Error: {updateVendorStatusError}</p>
        )}

        {getPendingVendorsLoading ? (
          <p>Loading...</p>
        ) : getPendingVendorsError ? (
          <p className="text-red-500">Error: {getPendingVendorsError}</p>
        ) : filteredVendors.length === 0 ? (
          <p>No pending vendors found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.vendor_id}
                className="bg-white p-5 rounded-xl shadow-md"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={
                      vendor?.image_url?.[0] || "https://picsum.photos/200"
                    }
                    alt="Vendor"
                    className="w-14 h-14 rounded-full object-cover mr-4 border"
                    onError={(e) => (e.target.src = "https://picsum.photos/200")}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vendor.vendor_name || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {vendor.name_of_bussiness || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {vendor?.bussiness_address?.city
                        ? vendor.bussiness_address.city
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-1">
                  <strong>Availability:</strong>{" "}
                  {vendor.service_start_time} - {vendor.service_end_time}
                </p>
                <p className="text-sm mb-2">
                  <strong>Description:</strong>{" "}
                  {vendor.bussiness_desc || "N/A"}
                </p>

                <div className="mb-3">
                  <strong className="text-sm">Photos:</strong>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {Array.isArray(vendor.image_url) &&
                      vendor.image_url.length > 0 ? (
                      vendor.image_url.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Vendor Photo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md border"
                          onError={(e) =>
                            (e.target.src = "https://picsum.photos/200")
                          }
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No photos</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleReject(vendor.vendor_id)}
                    className="bg-white border border-red-500 text-red-500 px-4 py-1 rounded hover:bg-red-500 hover:text-white transition"
                    disabled={updateVendorStatusLoading}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(vendor.vendor_id)}
                    className="bg-white border border-green-500 text-green-500 px-4 py-1 rounded hover:bg-green-500 hover:text-white transition"
                    disabled={updateVendorStatusLoading}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleViewMore(vendor)}
                    className="bg-white border border-blue-500 text-blue-500 px-4 py-1 rounded hover:bg-blue-500 hover:text-white transition"
                  >
                    View More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Updated "View More" Modal with Sectioned Layout */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
              {/* Close Button (Top Right) */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition duration-200"
              >
                <FaTimes size={24} />
              </button>

              {/* Modal Header */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                Vendor Details
              </h2>

              {/* Sectioned Layout */}
              <div className="space-y-8">
                {/* Vendor Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Vendor Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
                    {Object.entries({
                      "Name": selectedVendor.vendor_name || "N/A",
                      "Email": selectedVendor.vendor_email || "N/A",
                      "Phone": selectedVendor.vendor_mobile || "N/A",
                      "Business Name": selectedVendor.name_of_bussiness || "N/A",
                      "Business Category": selectedVendor.bussiness_category || "N/A",
                      "Fast Service Category": selectedVendor.fast_service_category_name || "N/A",
                      "GST Number": selectedVendor.gst_number || "N/A",
                      "Company Category": selectedVendor.company_category || "N/A",
                      "Service Radius": selectedVendor.service_radius || "N/A",
                      "City": selectedVendor.bussiness_address?.city || "N/A",
                      "State": selectedVendor.bussiness_address?.state || "N/A",
                      "Street": selectedVendor.bussiness_address?.street || "N/A",
                      "Pincode": selectedVendor.pincode || "N/A",
                      "Service Start Time": selectedVendor.service_start_time || "N/A",
                      "Service End Time": selectedVendor.service_end_time || "N/A",
                      "Business Description": selectedVendor.bussiness_desc || "N/A",
                      "Status": selectedVendor.is_approved ? "Approved" : "Pending",
                      "Approved By": selectedVendor.approved_by || "N/A",
                      "Approved Date": selectedVendor.approved_date || "N/A",
                      "Rejected": selectedVendor.is_rejected ? "Yes" : "No",
                      "Rejected By": selectedVendor.rejected_by || "N/A",
                      "Rejected Date": selectedVendor.rejected_date || "N/A",
                    }).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="font-semibold text-gray-800">{key}</span>
                        <span className="text-gray-600 mt-1">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KYC Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    KYC Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
                    {Object.entries({
                      "PAN": selectedVendor.kyc_docs?.pan || "N/A",
                      "Aadhar": selectedVendor.kyc_docs?.aadhar || "N/A",
                    }).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="font-semibold text-gray-800">{key}</span>
                        <span className="text-gray-600 mt-1">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
                    {Object.entries({
                      "IFSC": selectedVendor.account_details?.ifsc || "N/A",
                      "Account Number": selectedVendor.account_details?.accountNumber || "N/A",
                    }).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="font-semibold text-gray-800">{key}</span>
                        <span className="text-gray-600 mt-1">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Documents
                  </h3>
                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Business Proof Document
                      </span>
                      <span className="text-gray-600 mt-1">
                        {selectedVendor.bussiness_proof_doc_url ? (
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
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Images
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedVendor.image_url?.length > 0 ? (
                          selectedVendor.image_url.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={url}
                                alt={`Vendor Photo ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-md border hover:opacity-80 transition duration-200"
                                onError={(e) => (e.target.src = "https://picsum.photos/200")}
                              />
                            </a>
                          ))
                        ) : (
                          <span className="text-gray-600">No photos</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button (Bottom Right) */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PendingApproval;