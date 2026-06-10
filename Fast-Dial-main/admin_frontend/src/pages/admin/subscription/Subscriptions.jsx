import React, { useState, useEffect } from "react";
import NavbarMain from "../../../components/NevbarMain";
import SideNavbar from "../../../components/SideNevBar";
import { useNavigate } from "react-router-dom"; // Added useNavigate
import { useDispatch, useSelector } from 'react-redux';
import {
  getSubscriptionsRequest,
  updateSubscriptionRequest,
  deleteSubscriptionRequest
} from '../../../saga/features/admin/adminSlice';

export default function Subscription() {
  const [activeTab, setActiveTab] = useState("Subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const navigate = useNavigate(); // Added navigate hook
  const dispatch = useDispatch();
  const {
    subscriptions,
    getSubscriptionsLoading,
    getSubscriptionsError,
    updateSubscriptionLoading,
    updateSubscriptionError,
    updateSubscriptionSuccess,
    deleteSubscriptionLoading,
    deleteSubscriptionError,
    deleteSubscriptionSuccess
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getSubscriptionsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (updateSubscriptionSuccess || deleteSubscriptionSuccess) {
      dispatch(getSubscriptionsRequest()); // Refresh after update or delete
      dispatch({ type: 'admin/resetSubscriptionActions' }); // Reset success state
      if (updateSubscriptionSuccess) setIsModalOpen(false); // Close modal on success
    }
  }, [updateSubscriptionSuccess, deleteSubscriptionSuccess, dispatch]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Add Subscriptions") {
      navigate("/addsubscriptions"); // Use navigate instead of window.location.href
    } else if (tab === "Subscriptions") {
      navigate("/subscriptions"); // Optional: ensures correct active tab state
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (subscription) => {
    setSelectedSubscription({ ...subscription }); // Create a copy to edit
    setIsModalOpen(true);
  };

  const handleDelete = (subscriptionId) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      dispatch(deleteSubscriptionRequest(subscriptionId));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedSubscription((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (selectedSubscription) {
      dispatch(updateSubscriptionRequest(selectedSubscription));
    }
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const name = subscription.subscription_name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <NavbarMain />
      <div className="flex h-[659px] bg-gray-100">
        <SideNavbar />
        <div className="p-6 flex-1">
          <div className="flex gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-2xl transition-all ${activeTab === "Subscriptions"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
                }`}
              onClick={() => handleTabClick("Subscriptions")}
            >
              Subscriptions
            </button>
            <button
              className={`px-4 py-2 rounded-2xl transition-all ${activeTab === "Add Subscriptions"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
                }`}
              onClick={() => handleTabClick("Add Subscriptions")}
            >
              Add Subscriptions
            </button>
            <div className="ml-[10%] flex-1">
              <input
                type="text"
                placeholder="Search by Name"
                className="w-[50%] border border-gray-300 rounded-3xl p-2"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden h-[500px] w-full overflow-y-auto">
            {getSubscriptionsLoading || deleteSubscriptionLoading || updateSubscriptionLoading ? (
              <div className="p-4">Loading...</div>
            ) : getSubscriptionsError ? (
              <div className="p-4 text-red-500">Error: {getSubscriptionsError}</div>
            ) : deleteSubscriptionError ? (
              <div className="p-4 text-red-500">Delete Error: {deleteSubscriptionError}</div>
            ) : updateSubscriptionError ? (
              <div className="p-4 text-red-500">Update Error: {updateSubscriptionError}</div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="p-4">
                {searchTerm ? "No matching subscriptions found" : "No subscriptions available"}
              </div>
            ) : (
              <table className="w-full min-w-full text-left border-collapse">
                <thead className="bg-gray-200 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Price</th>
                    <th className="p-3 font-semibold">Description</th>
                              <th className="p-3 font-semibold">Duration</th>
                    <th className="p-3 font-semibold">Edit</th>
                    <th className="p-3 font-semibold">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => (
                    <tr
                      key={subscription.subscription_id}
                      className="border-b last:border-0 hover:bg-gray-100"
                    >
                      <td className="p-4 max-w-[200px]">{subscription.subscription_name || 'N/A'}</td>
                      <td className="p-4 whitespace-nowrap">₹ {subscription.subscription_price || 'N/A'}</td>
                      <td className="p-4 max-w-[250px] ">{subscription.subscription_desc || 'N/A'}</td>
                      <td className="p-4 whitespace-nowrap">{subscription.duration_in_days || 'N/A'} Days</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleEdit(subscription)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(subscription.subscription_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Edit Subscription</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="subscription_name"
                value={selectedSubscription.subscription_name || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Price</label>
              <input
                type="number"
                name="subscription_price"
                value={selectedSubscription.subscription_price || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Duration</label>
              <input
                type="number"
                name="duration_in_days"
                value={selectedSubscription.duration_in_days || ""}
                placeholder="Days"
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea
                name="subscription_desc"
                value={selectedSubscription.subscription_desc || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
                rows="3"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={updateSubscriptionLoading}
              >
                {updateSubscriptionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}