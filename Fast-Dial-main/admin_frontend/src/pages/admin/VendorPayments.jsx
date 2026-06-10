import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavbarMain from "../../components/NevbarMain";
import SideNavbar from "../../components/SideNevBar";
import { useNavigate } from "react-router-dom";
import { getVendorPaymentDetailsRequest } from "../../saga/features/admin/adminSlice";
import { FaSort, FaEye, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";

const VendorPayments = () => {
  const [activeTab, setActiveTab] = useState("Vendor Payments");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSortCategory, setSelectedSortCategory] = useState();
  const [sortCategories, setSortCategories] = useState([{ name: "date ASC", icon: FaSortAlphaDown }, { name: "date DSC", icon: FaSortAlphaUp }]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { vendorPaymentDetails, getVendorPaymentDetailsLoading, getVendorPaymentDetailsError } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(getVendorPaymentDetailsRequest());
  }, [dispatch]);

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

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const closeModal = () => {
    setSelectedPayment(null);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(prev => !prev)
  }

  const handleSortSelect = (sortItem) => {
    console.log(sortItem)
    setSelectedSortCategory(sortItem)
    setShowSortDropdown(false)

  }
  const clearCategorySort = () => {
    setSelectedSortCategory()
  }

  const filteredPayments = vendorPaymentDetails.filter((payment) =>
    typeof payment.vendor_name === "string"
      ? payment.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  ).sort((a, b) => {
    if (!selectedSortCategory) return 0;

    const dateA = new Date(a.payment_date);
    const dateB = new Date(b.payment_date);

    if (selectedSortCategory.name === "date ASC") {
      return dateA - dateB;
    } else if (selectedSortCategory.name === "date DSC") {
      return dateB - dateA;
    }
    return 0;
  });

  // if (getVendorPaymentDetailsLoading) {
  //   return <div className="ml-[250px] mt-[60px] p-4">Loading...</div>;
  // }

  if (getVendorPaymentDetailsError) {
    return (
      <div className="ml-[250px] mt-[60px] p-4 text-red-500">
        Error: {getVendorPaymentDetailsError}
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .search-container {
            position: relative;
            width: 250px;
          }
          .search-input {
            width: 100%;
            padding-right: 2.5rem; /* Space for the filter icon */
          }
          .filter-icon {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
          }
          @media (max-width: 1366px) {
            .search-bar-container {
              margin-top: 0 !important;
              align-self: flex-start;
            }
            .tabs-container {
              align-items: flex-start;
            }
          }
        `}
      </style>
      <div className="fixed top-0 w-full z-50 bg-white">
        <NavbarMain />
      </div>

      <div className="fixed left-0 top-[60px] w-[250px] h-[calc(100vh-60px)] shadow-md bg-white">
        <SideNavbar />
      </div>

      <div className="ml-[250px] mt-[60px] h-[calc(100vh-60px)] overflow-auto p-4 bg-gray-100">
        <div className="flex space-x-4 mb-4 gap-[15px] h-[46px]">
          {["Vendor List", "Pending Approval", "Vendor Payments", "Service Category", "Booking Details","Blocked Vendors"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-3 rounded-lg ${
                activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="search-bar-container mb-2">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search Vendor"
                className="search-input p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={toggleSortDropdown}
                className="filter-icon text-gray-500 hover:text-gray-700"
              >
                <FaSort />
              </button>
            </div>
            {showSortDropdown && (
              <div className="absolute z-10 mt-2 w-[250px] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {(sortCategories.map((sortItem) => {
                  const IconComponent = sortItem.icon

                  return (
                    <button
                      key={sortItem.name}
                      onClick={() => handleSortSelect(sortItem)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                    >
                      {sortItem.name}
                      <IconComponent />
                    </button>
                  )
                })
                )}

              </div>
            )}
            {selectedSortCategory && (
              <div className=" flex items-center">
                <span className="text-sm text-gray-700">
                  Sort by: {selectedSortCategory.name}
                </span>
                <button
                  onClick={clearCategorySort}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
          <table className="w-full min-w-full text-left border-collapse">
            <thead className="bg-gray-200 text-gray-600">
              <tr>
                <th className="p-3 font-semibold">Vendor Name</th>
                <th className="p-3 font-semibold">Vendor ID</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Payment ID</th>
                <th className="p-3 font-semibold">Renewal Date</th>
                <th className="p-3 font-semibold">Plan</th>
                <th className="p-3 font-semibold">Amount</th>
                <th className="p-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.payment_id} className="border-b last:border-0 hover:bg-gray-100">
                  <td className="p-4">{payment && payment.vendor_name ? payment.vendor_name : 'N/A'}</td>
                  <td className="p-4">{payment && payment.vendor_id ? payment.vendor_id : 'N/A'}</td>
                  <td className="p-4">{payment && payment.payment_date ? new Date(payment.payment_date).toLocaleString() : 'N/A'}</td>
                  <td className="p-4">{payment && payment.payment_details && payment.payment_details.razorpay_payment_id ? payment.payment_details.razorpay_payment_id : 'N/A'}</td>
                  <td className="p-4">{payment && payment.payment_details && payment.payment_details.renewal_date ? new Date(payment.payment_details.renewal_date).toLocaleString() : 'N/A'}</td>
                  <td className="p-4">{payment && payment.payment_details && payment.payment_details.plan_name ? payment.payment_details.plan_name : 'N/A'}</td>
                  <td className="p-4 text-right">{payment && payment.payment_details && payment.payment_details.price ? payment.payment_details.price : 'N/A'}</td>
                  <td className="p-4">
                    <button onClick={() => handleViewDetails(payment)}>
                      <FaEye className="h-5 w-5 text-blue-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Payment Details</h2>
            <table className="w-full text-sm text-gray-700">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800 w-1/3">Payment ID</td>
                  <td className="py-3">{selectedPayment.payment_id}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Subscription ID</td>
                  <td className="py-3">{selectedPayment.subscription_id}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Vendor Name</td>
                  <td className="py-3">{selectedPayment.vendor_name || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Vendor Email</td>
                  <td className="py-3">{selectedPayment.vendor_email || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Business Name</td>
                  <td className="py-3">{selectedPayment.name_of_bussiness || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Payment Date</td>
                  <td className="py-3">{new Date(selectedPayment.payment_date).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Razorpay Payment ID</td>
                  <td className="py-3">{selectedPayment.payment_details?.razorpay_payment_id || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Razorpay Signature</td>
                  <td className="py-3">{selectedPayment.payment_details?.razorpay_signature || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Renewal Date</td>
                  <td className="py-3">{new Date(selectedPayment.payment_details.renewal_date).toLocaleString() || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Plan</td>
                  <td className="py-3">{selectedPayment.payment_details?.plan_name || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-800">Amount</td>
                  <td className="py-3">{selectedPayment.payment_details?.price || "N/A"}</td>
                </tr>
              </tbody>
            </table>
            <div className="text-right mt-6">
              <button
                onClick={closeModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorPayments;