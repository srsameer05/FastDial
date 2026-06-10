import { useState, useEffect } from "react";
import { FaPaperclip } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import SideNevbar from "../../components/SideNevBar";
import NavbarMain from "../../components/NevbarMain";
import { useDispatch, useSelector } from "react-redux";
import { getVendorComplaintsRequest, getCustomerComplaintsRequest } from "../../saga/features/admin/adminSlice";

export default function Complaints() {
  const [activeTab, setActiveTab] = useState("Open");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const dispatch = useDispatch();
  const {
    vendorComplaints,
    getVendorComplaintsLoading,
    getVendorComplaintsError,
    customerComplaints,
    getCustomerComplaintsLoading,
    getCustomerComplaintsError,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    if (activeTab === "Open") {
      dispatch(getVendorComplaintsRequest());
    } else if (activeTab === "Closed") {
      dispatch(getCustomerComplaintsRequest());
    }
  }, [activeTab, dispatch]);

  const vendorComplaintsWithData = vendorComplaints.filter(
    (complaint) =>
      complaint.vend_comp_id !== null &&
      (complaint.vendor_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const customerComplaintsWithData = customerComplaints.filter(
    (complaint) =>
      complaint.cust_comp_id !== null &&
      (complaint.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
  };


  const displayedComplaints =
    activeTab === "Open" ? vendorComplaintsWithData : customerComplaintsWithData;


  const highlightText = (text, query) => {
    if (!query || !text) return text || "No description";
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <NavbarMain />
      <div className="flex h-screen w-[100%]">
        <SideNevbar />
        <div className="flex border rounded-lg w-[80%]">
          <div className="w-[40%] border-r p-4 bg-gray-100">
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full p-2 rounded border mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="mb-4">
              <button
                className={`px-4 py-2 rounded-2xl mr-[10px] ${
                  activeTab === "Open"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setActiveTab("Open")}
              >
                Vendor
              </button>
              <button
                className={`px-4 py-2 rounded-2xl ${
                  activeTab === "Closed"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setActiveTab("Closed")}
              >
                Customer
              </button>
            </div>

            {/* Complaint List */}
            <div className="max-h-[500px] overflow-y-auto">
              {(activeTab === "Open" && getVendorComplaintsLoading) ||
              (activeTab === "Closed" && getCustomerComplaintsLoading) ? (
                <p className="text-gray-500">Loading...</p>
              ) : (activeTab === "Open" && getVendorComplaintsError) ||
                (activeTab === "Closed" && getCustomerComplaintsError) ? (
                <p className="text-red-500">
                  Error: {activeTab === "Open" ? getVendorComplaintsError : getCustomerComplaintsError}
                </p>
              ) : displayedComplaints.length > 0 ? (
                displayedComplaints.map((complaint) => (
                  <div
                    key={complaint.vend_comp_id || complaint.cust_comp_id}
                    className={`p-3 bg-white rounded shadow-md mb-2 cursor-pointer hover:bg-gray-50 ${
                      selectedComplaint?.vend_comp_id === complaint.vend_comp_id ||
                      selectedComplaint?.cust_comp_id === complaint.cust_comp_id
                        ? "border-l-4 border-blue-500"
                        : ""
                    }`}
                    onClick={() => handleComplaintClick(complaint)}
                  >
                    <p className="font-bold text-gray-800">
                      {complaint.vendor_name || complaint.customer_name || "Unnamed"}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {complaint.vend_comp_desc || complaint.cust_comp_desc || "No description"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {complaint.vend_comp_date || complaint.cust_comp_date
                        ? new Date(complaint.vend_comp_date || complaint.cust_comp_date).toLocaleString()
                        : "No date"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No {activeTab === "Open" ? "vendor" : "customer"} complaints found.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Complaint Details */}
          <div className="w-2/3 flex flex-col bg-white">
            {selectedComplaint ? (
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedComplaint.vendor_name || selectedComplaint.customer_name || "Unnamed"}
                  </h2>
                  {/* <p className="text-sm text-green-600">Online</p> */}
                </div>

                {/* Detailed Complaint Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <p className="text-sm">
                      <strong className="text-gray-700">Complaint ID:</strong>{" "}
                      <span className="text-gray-900">
                        {selectedComplaint.vend_comp_id || selectedComplaint.cust_comp_id}
                      </span>
                    </p>
                    <p className="text-sm">
                      <strong className="text-gray-700">Date:</strong>{" "}
                      <span className="text-gray-900">
                        {selectedComplaint.vend_comp_date || selectedComplaint.cust_comp_date
                          ? new Date(
                              selectedComplaint.vend_comp_date || selectedComplaint.cust_comp_date
                            ).toLocaleString()
                          : "No date"}
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <p className="text-sm">
                      <strong className="text-gray-700">Email:</strong>{" "}
                      <span className="text-gray-900">
                        {selectedComplaint.vendor_email || selectedComplaint.customer_email || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <strong className="text-gray-700">Mobile:</strong>{" "}
                      <span className="text-gray-900">
                        {selectedComplaint.vendor_mobile || selectedComplaint.mobile || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Description:</p>
                    <p className="text-gray-900 leading-relaxed">
                      {highlightText(
                        selectedComplaint.vend_comp_desc || selectedComplaint.cust_comp_desc,
                        searchQuery
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                  Select a complaint to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}