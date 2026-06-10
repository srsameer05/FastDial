import React, { useState, useEffect } from "react";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCustomersRequest,
  getUserPaymentDetailsRequest,
} from "../../saga/features/admin/adminSlice";
import { FaEye } from "react-icons/fa";

export default function UserDetails() {
  const [activeTab, setActiveTab] = useState("User Details");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    customers,
    getCustomersLoading,
    getCustomersError,
    userPaymentDetails,
    getUserPaymentDetailsLoading,
    getUserPaymentDetailsError,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getCustomersRequest());
  }, [dispatch]);

  useEffect(() => {
    console.log("userPaymentDetails updated:", userPaymentDetails);
    console.log("getUserPaymentDetailsLoading:", getUserPaymentDetailsLoading);
    console.log("getUserPaymentDetailsError:", getUserPaymentDetailsError);
    if (userPaymentDetails && userPaymentDetails.length > 0) {
      setSelectedPaymentDetails(userPaymentDetails);
      setIsModalOpen(true);
    } else if (getUserPaymentDetailsError) {
      setSelectedPaymentDetails(null);
      setIsModalOpen(true);
    }
  }, [userPaymentDetails, getUserPaymentDetailsLoading, getUserPaymentDetailsError]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "User Details":
        navigate("/userdetails");
        break;
      case "User Payment Details":
        navigate("/userpaymentdetails");
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewPaymentDetails = (customerId) => {
    console.log("Fetching payment details for customerId:", customerId);
    dispatch(getUserPaymentDetailsRequest(customerId));
    setSelectedPaymentDetails(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPaymentDetails(null);
  };

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.customer_name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getAddressString = (address) => {
    if (!address) return "N/A";
    if (typeof address === "string") return address;
    const { city, state, street, zip } = address; // Use 'zip' instead of 'zipcode'
    return `${street || ""}, ${city || ""}, ${state || ""}, ${zip || ""}`
      .replace(/, ,/g, ", ")
      .trim();
  };

  return (
    <>
      <NavbarMain />
      <div className="flex h-screen bg-gray-100">
        <SideNavbar />
        <div className="p-6 flex-1">
          <div className="flex gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-2xl transition-all ${
                activeTab === "User Details"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => handleTabClick("User Details")}
            >
              User Details
            </button>
            <button
              className={`px-4 py-2 rounded-2xl transition-all ${
                activeTab === "User Payment Details"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => handleTabClick("User Payment Details")}
            >
              User Payment Details
            </button>
            <div className="ml-[10%]">
              <input
                type="text"
                placeholder="Search by Name"
                className="w-[180%] border border-gray-300 rounded-3xl p-2"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden h-[500px] w-full overflow-y-auto">
            {getCustomersLoading ? (
              <div className="p-4">Loading...</div>
            ) : getCustomersError ? (
              <div className="p-4 text-red-500">Error: {getCustomersError}</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-4">
                {searchTerm ? "No matching customers found" : "No customers available"}
              </div>
            ) : (
              <table className="w-full min-w-full text-left border-collapse">
                <thead className="bg-gray-200 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Mobile Number</th>
                    <th className="p-3 font-semibold">Country</th>
                    <th className="p-3 font-semibold">Gender</th>
                    <th className="p-3 font-semibold">Address</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.customer_id}
                      className="border-b last:border-0 hover:bg-gray-100"
                    >
                      <td className="p-4">{customer.customer_name || "N/A"}</td>
                      <td className="p-4">{customer.mobile || "N/A"}</td>
                      <td className="p-4">{customer.customer_country || "N/A"}</td>
                      <td className="p-4">{customer.gender || "N/A"}</td>
                      <td className="p-4">{getAddressString(customer.customer_address)}</td>
                      <td className="p-4">{customer.customer_email || "N/A"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewPaymentDetails(customer.customer_id)}
                          className="text-blue-500 hover:text-blue-700"
                          title="View Payment Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                  Payment Details
                </h2>

                {getUserPaymentDetailsLoading ? (
                  <p>Loading payment details...</p>
                ) : selectedPaymentDetails ? (
                  Array.isArray(selectedPaymentDetails) && selectedPaymentDetails.length > 0 ? (
                    selectedPaymentDetails.map((payment, index) => (
                      <div key={index}>
                        {payment.data && payment.data.length > 0 ? (
                          payment.data.map((paymentItem, idx) => (
                            <table key={idx} className="w-full text-sm text-gray-800 mb-8 border-collapse">
                              <tbody className="divide-y divide-gray-200">
                                {[
                                  ['Customer ID', paymentItem.customer_id],
                                  ['Customer Name', paymentItem.customer_name],
                                  ['Mobile', paymentItem.mobile],
                                  ['Country', paymentItem.customer_country],
                                  ['Gender', paymentItem.gender],
                                  ['Address', getAddressString(paymentItem.customer_address)],
                                  ['Email', paymentItem.customer_email],
                                  ['Vendor ID', paymentItem.vendor_id],
                                  ['Service Category ID', paymentItem.service_cat_id],
                                  ['Service Category', paymentItem.service_category_name],
                                  ['Service Description', paymentItem.service_description],
                                  ['Service Price', `₹ ${paymentItem.service_price}`],
                                  ['Service Image', (
                                    paymentItem.service_image_url ? (
                                      <img
                                        src={paymentItem.service_image_url}
                                        alt="Service"
                                        className="h-20 rounded border"
                                      />
                                    ) : 'N/A'
                                  )],
                                  ['Payment ID', paymentItem.payment_id],
                                  ['Booking ID', paymentItem.booking_id],
                                  ['Payment Amount', `₹ ${paymentItem.payment_amount}`],
                                  ['Payment Date', paymentItem.payment_date ? new Date(paymentItem.payment_date).toLocaleString() : 'N/A'],
                                  ['Payment Reference', paymentItem.payment_ref_no],
                                ].map(([label, value], idx) => (
                                  <tr key={idx}>
                                    <td className="py-3 pr-3 font-medium text-gray-600 w-[40%]">{label}</td>
                                    <td className="py-3">{value || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ))
                        ) : (
                          <p>No payment data found.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No payment details available.</p>
                  )
                ): getUserPaymentDetailsError ? (
                  <p className="text-black-500">No payment details available</p>
                ) : (
                  <p className="text-gray-500">No payment details available.</p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="mt-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};