import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllPaymentDetailsRequest } from "../../saga/features/admin/adminSlice";
import { FaEye } from "react-icons/fa";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";

export default function UserPaymentDetails() {
  const [activeTab, setActiveTab] = useState("User Payment Details");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    allPaymentDetails,
    getAllPaymentDetailsLoading,
    getAllPaymentDetailsError,
  } = useSelector((state) => state.admin);


  useEffect(() => {
    dispatch(getAllPaymentDetailsRequest());
  }, [dispatch]);

  // Debug Redux state
  useEffect(() => {
    console.log("allPaymentDetails:", allPaymentDetails);
    console.log("loading:", getAllPaymentDetailsLoading);
    console.log("error:", getAllPaymentDetailsError);
  }, [allPaymentDetails, getAllPaymentDetailsLoading, getAllPaymentDetailsError]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShowDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const handleCloseDetails = () => {
    setSelectedPayment(null);
  };


  const paymentDetailsArray = Array.isArray(allPaymentDetails)
    ? allPaymentDetails
    : allPaymentDetails?.data || [];

  const filteredPaymentDetails = paymentDetailsArray.filter((payment) => {
    const query = searchQuery.toLowerCase();
    return payment.customer_name?.toLowerCase()?.includes(query) || false;
  });

  console.log("filteredPaymentDetails:", filteredPaymentDetails);

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
              onClick={() => {
                setActiveTab("User Details");
                navigate("/userdetails");
              }}
            >
              User Details
            </button>
            <button
              className={`px-4 py-2 rounded-2xl transition-all ${
                activeTab === "User Payment Details"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("User Payment Details")}
            >
              User Payment Details
            </button>
            <div className="ml-[10%]">
              <input
                type="text"
                placeholder="Search by Customer Name"
                className="w-[180%] border border-gray-300 rounded-3xl p-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden h-[500px] w-full">
            {getAllPaymentDetailsLoading ? (
              <div className="p-4">Loading...</div>
            ) : getAllPaymentDetailsError ? (
              <div className="p-4 text-red-500">
                Error: {getAllPaymentDetailsError}
              </div>
            ) : filteredPaymentDetails.length === 0 ? (
              <div className="p-4">
                {searchQuery
                  ? "No matching payment details found"
                  : "No payment details available"}
              </div>
            ) : (
              <table className="w-full min-w-full text-left border-collapse">
                <thead className="bg-gray-200 text-gray-600">
                  <tr>
                    <th className="p-3 font-semibold">Customer Name</th>
                    <th className="p-3 font-semibold">Payment Date</th>
                    <th className="p-3 font-semibold">Payment ID</th>
                    <th className="p-3 font-semibold">Vendor ID</th>
                    <th className="p-3 font-semibold">Service Category</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentDetails.map((payment, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-gray-100"
                    >
                      <td className="p-4">{payment.customer_name || "N/A"}</td>
                      <td className="p-4">{formatDate(payment.payment_date)}</td>
                      <td className="p-4">{payment.payment_ref_no || "N/A"}</td>
                      <td className="p-4">{payment.vendor_id || "N/A"}</td>
                      <td className="p-4">
                        {payment.service_category_name || "N/A"}
                      </td>
                      <td className="p-4 text-right">₹ {payment.payment_amount || 0}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleShowDetails(payment)}
                          className="text-blue-500 hover:text-blue-700"
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

          {selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                  Payment Details
                </h2>

                <table className="w-full text-sm text-gray-800 border-collapse">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600 w-[40%]">Customer ID</td>
                      <td className="py-3">{selectedPayment.customer_id || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Customer Name</td>
                      <td className="py-3">{selectedPayment.customer_name || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Mobile</td>
                      <td className="py-3">{selectedPayment.mobile || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Country</td>
                      <td className="py-3">{selectedPayment.customer_country || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Gender</td>
                      <td className="py-3">{selectedPayment.gender || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Address</td>
                      <td className="py-3">
                        {selectedPayment.customer_address
                          ? `${selectedPayment.customer_address.street || "N/A"}, ${selectedPayment.customer_address.city || "N/A"}, ${selectedPayment.customer_address.state || "N/A"}, ${selectedPayment.customer_address.zip || "N/A"}`
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Email</td>
                      <td className="py-3">{selectedPayment.customer_email || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Vendor ID</td>
                      <td className="py-3">{selectedPayment.vendor_id || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Service Category ID</td>
                      <td className="py-3">{selectedPayment.service_cat_id || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Service Category</td>
                      <td className="py-3">{selectedPayment.service_category_name || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Service Description</td>
                      <td className="py-3">{selectedPayment.service_desc || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Service Price</td>
                      <td className="py-3">₹ {selectedPayment.service_price || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Service URL</td>
                      <td className="py-3">
                        {selectedPayment.service_category_url ? (
                          <img
                            src={selectedPayment.service_category_url}
                            alt="Service"
                            className="h-20 rounded border"
                          />
                        ) : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Payment ID</td>
                      <td className="py-3">{selectedPayment.payment_id || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Booking ID</td>
                      <td className="py-3">{selectedPayment.booking_id || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Payment Amount</td>
                      <td className="py-3">₹ {selectedPayment.payment_amount || 0}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Payment Date</td>
                      <td className="py-3">{formatDate(selectedPayment.payment_date) || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3 font-medium text-gray-600">Payment Ref No</td>
                      <td className="py-3">{selectedPayment.payment_ref_no || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <button
                    onClick={handleCloseDetails}
                    className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
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
}