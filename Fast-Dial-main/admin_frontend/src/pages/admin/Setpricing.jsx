import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addSubscriptionRequest, resetAddSubscription } from '../../saga/features/admin/adminSlice';

const Setpricing = ({ onConfirm, onCancel }) => {
  const [formData, setFormData] = useState({
    subscription_name: "",
    subscription_price: "",
    subscription_desc: ""
  });
  const dispatch = useDispatch();
  const { addSubscriptionLoading, addSubscriptionError, addSubscriptionSuccess } = useSelector((state) => state.admin);

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
      subscription_price: parseFloat(formData.subscription_price) || 0 
    };
    dispatch(addSubscriptionRequest(payload));
  };

  React.useEffect(() => {
    if (addSubscriptionSuccess) {
      alert("Subscription added successfully!");
      onConfirm();
      setFormData({ subscription_name: "", subscription_price: "", subscription_desc: "" }); 
      dispatch(resetAddSubscription()); 
    } else if (addSubscriptionError) {
      alert(`Error: ${addSubscriptionError}`);
      dispatch(resetAddSubscription()); 
    }
  }, [addSubscriptionSuccess, addSubscriptionError, onConfirm, dispatch]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">
        <h2 className="text-xl font-semibold mb-4 text-blue-500 text-center mb-[40px]">Set Price Details</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            Subscription Name
            <input
              type="text"
              name="subscription_name"
              value={formData.subscription_name}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              disabled={addSubscriptionLoading}
            />
          </label>
          <label className="block mb-4">
            Subscription Price
            <input
              type="number"
              name="subscription_price"
              value={formData.subscription_price}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              step="0.01" // Allow decimals like 49.99
              min="0"
              disabled={addSubscriptionLoading}
            />
          </label>
          <label className="block mb-4">
            Subscription Description
            <textarea
              name="subscription_desc"
              value={formData.subscription_desc}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1 h-24"
              disabled={addSubscriptionLoading}
            ></textarea>
          </label>
          <div className="flex justify-center space-x-7">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white border border-blue-500 text-blue-500 px-3 py-3 rounded-md w-[40%] hover:bg-blue-500 hover:text-white"
              disabled={addSubscriptionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-white border border-blue-500 text-blue-500 px-3 py-3 rounded-md w-[40%] hover:bg-blue-500 hover:text-white"
              disabled={addSubscriptionLoading}
            >
              {addSubscriptionLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setpricing;
