import React, { useState, useEffect } from "react";
import NavbarMain from "../../../components/NevbarMain";
import SideNavbar from "../../../components/SideNevBar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addSubscriptionRequest, resetAddSubscription } from '../../../saga/features/admin/adminSlice';

export default function Addsubscription() {
  const [activeTab, setActiveTab] = useState("Add Subscriptions");
  const [formData, setFormData] = useState({
    subscription_name: "",
    subscription_price: "",
    subscription_desc: "",
    duration_in_days: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    addSubscriptionLoading,
    addSubscriptionError,
    addSubscriptionSuccess
  } = useSelector((state) => state.admin);

  useEffect(() => {
    if (addSubscriptionSuccess) {
      alert("Subscription added successfully!");
      setFormData({ subscription_name: "", subscription_price: "", subscription_desc: "" });
      dispatch(resetAddSubscription());
      navigate("/subscriptions");
    } else if (addSubscriptionError) {
      alert(`Error: ${addSubscriptionError}`);
      dispatch(resetAddSubscription());
    }
  }, [addSubscriptionSuccess, addSubscriptionError, dispatch, navigate]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Subscriptions") {
      navigate("/subscriptions");
    } else if (tab === "Add Subscriptions") {
      navigate("/addsubscriptions");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subscription_name || !formData.subscription_price || !formData.subscription_desc) {
      alert("Please fill in all fields");
      return;
    }
    const payload = {
      ...formData,
      subscription_price: parseFloat(formData.subscription_price) || 0,
    };
    dispatch(addSubscriptionRequest(payload));
  };

  return (
    <>
      <NavbarMain />
      <div className="flex bg-gray-100 h-screen">
        <SideNavbar />
        <div className="flex-1 p-6">
          <div className="w-[100%] mx-auto">
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
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 w-[80%]">
              <h3 className="text-xl font-semibold text-blue-500 mb-6">Add Subscription</h3>
              {addSubscriptionError && (
                <div className="mb-4 text-red-500">{addSubscriptionError}</div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Subscription Name</label>
                    <input
                      type="text"
                      name="subscription_name"
                      className="w-full p-2 border rounded"
                      placeholder="Enter subscription name"
                      value={formData.subscription_name}
                      onChange={handleChange}
                      required
                      disabled={addSubscriptionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Subscription Price</label>
                    <input
                      type="number"
                      name="subscription_price"
                      className="w-full p-2 border rounded"
                      placeholder="Enter price"
                      value={formData.subscription_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                      disabled={addSubscriptionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Subscription Duration</label>
                    <input
                      type="number"
                      name="duration_in_days"
                      className="w-full p-2 border rounded"
                      placeholder="Enter duration in Days"
                      value={formData.duration_in_days}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                      disabled={addSubscriptionLoading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Subscription Description</label>
                  <textarea
                    name="subscription_desc"
                    className="w-full p-2 border rounded"
                    placeholder="Enter description"
                    value={formData.subscription_desc}
                    onChange={handleChange}
                    required
                    disabled={addSubscriptionLoading}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={addSubscriptionLoading}
                  >
                    {addSubscriptionLoading ? "Adding..." : "Add Subscription"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}