import React, { useEffect } from "react";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateVendorStatusRequest } from "../../saga/features/admin/adminSlice";

const PendingApprovalView = () => {
  const { vendorId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    updateVendorStatusLoading,
    updateVendorStatusError,
    updateVendorStatusSuccess,
  } = useSelector((state) => state.admin);

  const vendor = state?.vendor || {};

  useEffect(() => {
    if (updateVendorStatusSuccess) {
      navigate("/pendingapproval");
      dispatch({ type: "admin/resetUpdateVendorStatus" });
    }
  }, [updateVendorStatusSuccess, dispatch, navigate]);

  const handleApprove = () => {
    dispatch(updateVendorStatusRequest({
      vendor_id: parseInt(vendorId),
      is_approved: 1,
      approved_by: 1,
      approved_date: new Date().toISOString().split("T")[0],
    }));
  };

  const handleReject = () => {
    dispatch(updateVendorStatusRequest({
      vendor_id: parseInt(vendorId),
      is_rejected: 1,
      rejected_by: 1,
    }));
  };

  if (!vendor || !vendor.vendor_id) {
    return (
      <div className="ml-[250px] mt-[60px] p-4">
        <h2 className="text-xl font-bold mb-4">Vendor Details</h2>
        <p className="text-red-500">No vendor data found.</p>
        <button onClick={() => navigate("/pendingapproval")} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
          Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 w-full z-50 bg-white">
        <NavbarMain />
      </div>
      <div className="fixed left-0 top-[60px] w-[250px] h-[calc(100vh-60px)] bg-white shadow-md">
        <SideNavbar />
      </div>
      <div className="ml-[250px] mt-[60px] p-4 bg-gray-100 min-h-screen overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Vendor Full Details</h2>

        {updateVendorStatusError && (
          <p className="text-red-500">Error: {updateVendorStatusError}</p>
        )}

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-6">
            <img
              src={vendor.image_url?.[0] || "https://via.placeholder.com/100"}
              className="w-24 h-24 rounded-full object-cover"
              alt="Vendor"
            />
            <div className="ml-4">
              <h3 className="text-xl font-semibold">{vendor.vendor_name}</h3>
              <p className="text-gray-600">{vendor.name_of_bussiness}</p>
              <p className="text-gray-600">📍 {vendor.bussiness_address?.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Email:</strong> {vendor.vendor_email || "N/A"}</p>
            <p><strong>Mobile:</strong> {vendor.vendor_mobile || "N/A"}</p>
            <p><strong>Category:</strong> {vendor.bussiness_category || "N/A"}</p>
            <p><strong>Service Time:</strong> {vendor.service_start_time} - {vendor.service_end_time}</p>
            <p><strong>Description:</strong> {vendor.bussiness_desc || "N/A"}</p>
            <p><strong>GST:</strong> {vendor.gst_number || "N/A"}</p>
            <p><strong>PAN:</strong> {vendor.kyc_docs?.pan || "N/A"}</p>
            <p><strong>Aadhar:</strong> {vendor.kyc_docs?.aadhar || "N/A"}</p>
            <p><strong>Account:</strong> {vendor.account_details?.accountNumber || "N/A"}</p>
            <p><strong>IFSC:</strong> {vendor.account_details?.ifsc || "N/A"}</p>
            <p><strong>Bank:</strong> {vendor.account_details?.bankName || "N/A"}</p>
          </div>

          <div className="mt-6">
            <h4 className="font-bold mb-2">KYC Documents</h4>
            <div className="flex gap-2 flex-wrap">
              {vendor.kyc_docs?.pan_photo && (
                <img src={vendor.kyc_docs.pan_photo} alt="PAN" className="w-20 h-20 object-cover rounded-lg" />
              )}
              {vendor.kyc_docs?.aadhar_photo && (
                <img src={vendor.kyc_docs.aadhar_photo} alt="Aadhar" className="w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
              disabled={updateVendorStatusLoading}
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white"
              disabled={updateVendorStatusLoading}
            >
              Approve
            </button>
            <button
              onClick={() => navigate("/pendingapproval")}
              className="px-4 py-2 border border-gray-500 text-gray-500 rounded hover:bg-gray-500 hover:text-white"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PendingApprovalView;
