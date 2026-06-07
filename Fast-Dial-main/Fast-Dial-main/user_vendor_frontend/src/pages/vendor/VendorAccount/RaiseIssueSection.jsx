import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchComplaintsRequest, 
  insertComplaintRequest, 
  clearInsertStatus, 
  updateComplaintRequest, 
  clearUpdateComplaintStatus,
  deleteComplaintRequest,
  clearDeleteComplaintStatus 
} from "../../../saga/features/vendor/vendorSlice";

const RaiseIssueSection = () => {
  const [activeTab, setActiveTab] = useState("insert");
  const dispatch = useDispatch();
  const { 
    complaints, 
    complaintsLoading, 
    complaintsError, 
    insertComplaintLoading, 
    insertComplaintError, 
    insertComplaintSuccess,
    updateComplaintLoading,
    updateComplaintError,
    updateComplaintSuccess,
    deleteComplaintLoading,
    deleteComplaintError,
    deleteComplaintSuccess
  } = useSelector((state) => state.vendor);

  const [insertFormData, setInsertFormData] = useState({ issueDescription: "" });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({ vend_comp_desc: "" });
  const [deletingIssueId, setDeletingIssueId] = useState(null);
  const [updatingIssueId, setUpdatingIssueId] = useState(null);

  useEffect(() => {
    console.log("Initial Fetch Effect - activeTab:", activeTab);
    const token = localStorage.getItem('vendorToken');
    if (token && activeTab === "edit") {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const vendorId = payload.id;
        console.log("Fetching complaints for vendorId:", vendorId);
        dispatch(fetchComplaintsRequest(vendorId));
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    console.log("Insert Effect:", { insertComplaintSuccess, insertComplaintLoading, insertComplaintError });
    if (insertComplaintSuccess) {
      const token = localStorage.getItem('vendorToken');
      if (token) {
        try {
          console.log("Insert successful, resetting form");
          alert("Issue submitted successfully!");
          setInsertFormData({ issueDescription: "" });
          dispatch(clearInsertStatus());
        } catch (e) {
          console.error("Failed to decode token on insert success:", e);
        }
      }
    }
  }, [insertComplaintSuccess, dispatch]);

  useEffect(() => {
    console.log("Update Effect:", { updateComplaintSuccess, updateComplaintLoading, updateComplaintError });
    if (updateComplaintSuccess) {
      const token = localStorage.getItem('vendorToken');
      if (token) {
        try {
          console.log("Update successful, resetting form");
          alert("Issue updated successfully!");
          setSelectedIssue(null);
          setUpdateFormData({ vend_comp_desc: "" });
          setUpdatingIssueId(null);
          dispatch(clearUpdateComplaintStatus());
        } catch (e) {
          console.error("Failed to decode token on update success:", e);
        }
      }
    }
  }, [updateComplaintSuccess, dispatch]);

  useEffect(() => {
    console.log("Delete Effect:", { 
      deleteComplaintSuccess, 
      deleteComplaintLoading, 
      deleteComplaintError,
      currentComplaints: complaints 
    });
    if (deleteComplaintSuccess) {
      const token = localStorage.getItem('vendorToken');
      if (token) {
        try {
          console.log("Delete successful, Deleted ID:", deletingIssueId);
          alert("Issue deleted successfully!");
          setDeletingIssueId(null);
          dispatch(clearDeleteComplaintStatus());
          if (selectedIssue?.vend_comp_id === deletingIssueId) {
            setSelectedIssue(null);
            setUpdateFormData({ vend_comp_desc: "" });
            setUpdatingIssueId(null);
          }
        } catch (e) {
          console.error("Failed to decode token on delete success:", e);
        }
      }
    }
    if (deleteComplaintError) {
      console.error("Delete failed:", deleteComplaintError);
      setDeletingIssueId(null);
    }
  }, [deleteComplaintSuccess, deleteComplaintError, dispatch, deletingIssueId, selectedIssue]);

  const handleInsertChange = (e) => {
    const { name, value } = e.target;
    setInsertFormData({ ...insertFormData, [name]: value });
  };

  const handleInsertFormSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const vendorId = payload.id;
      const complaintData = {
        vendor_id: vendorId,
        vend_comp_desc: insertFormData.issueDescription,
      };
      console.log("Inserting complaint:", complaintData);
      dispatch(insertComplaintRequest(complaintData));
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({ ...updateFormData, [name]: value });
  };

  const handleUpdateFormSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('vendorToken');
    if (!token || !updatingIssueId) {
      alert("No issue selected or token not found.");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const vendorId = payload.id;
      const complaintData = {
        vendor_id: vendorId,
        vend_comp_id: updatingIssueId,
        vend_comp_desc: updateFormData.vend_comp_desc,
      };
      console.log("Updating complaint:", complaintData);
      dispatch(updateComplaintRequest(complaintData));
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  };

  const handleEditClick = (issue) => {
    console.log("Edit clicked for issue:", issue);
    if (issue && issue.vend_comp_id) {
      setSelectedIssue(issue);
      setUpdateFormData({ vend_comp_desc: issue.vend_comp_desc || "" });
      setUpdatingIssueId(issue.vend_comp_id);
    } else {
      console.error("Invalid issue selected:", issue);
    }
  };

  const handleDeleteClick = (issue) => {
    console.log("Delete clicked for issue:", issue);
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete issue ID ${issue.vend_comp_id}?`);
    if (confirmDelete) {
      setDeletingIssueId(issue.vend_comp_id);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const vendorId = payload.id;
        const complaintData = {
          vendor_id: vendorId,
          vend_comp_id: issue.vend_comp_id,
        };
        console.log("Deleting complaint:", complaintData);
        dispatch(deleteComplaintRequest(complaintData));
      } catch (e) {
        console.error("Failed to decode token:", e);
        setDeletingIssueId(null);
      }
    }
  };

  console.log('Current Complaints State:', {
    loading: complaintsLoading,
    error: complaintsError,
    data: complaints,
  });

  const complaintsArray = Array.isArray(complaints) ? complaints : [];
  console.log("Complaints Array:", complaintsArray);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6 text-[#4285F4]">Raise Issue</h2>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("insert")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "insert" ? "bg-[#4285F4] text-white" : "bg-gray-200"
          }`}
        >
          Insert Issue
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "edit" ? "bg-[#4285F4] text-white" : "bg-gray-200"
          }`}
        >
          Edit Issue
        </button>
      </div>

      {activeTab === "insert" && (
        <form onSubmit={handleInsertFormSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Describe Your Issue
            </label>
            <textarea
              name="issueDescription"
              value={insertFormData.issueDescription}
              onChange={handleInsertChange}
              placeholder="Describe Your Issue"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] h-48"
            />
          </div>
          {insertComplaintError && (
            <p className="text-red-500">{insertComplaintError}</p>
          )}
          <div className="pt-6">
            <button
              type="submit"
              disabled={insertComplaintLoading}
              className={`w-full text-white py-3 rounded-full transition duration-300 text-lg font-medium ${
                insertComplaintLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#4285F4] hover:bg-blue-600"
              }`}
            >
              {insertComplaintLoading ? "Submitting..." : "Send"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "edit" && (
        <div className="space-y-4">
          {complaintsLoading && <p className="text-gray-700">Loading issues...</p>}
          {complaintsError && <p className="text-red-500">Error: {complaintsError}</p>}
          {!complaintsLoading && !complaintsError && complaintsArray.length === 0 && (
            <p className="text-gray-700">No issues found for this vendor</p>
          )}
          {!complaintsLoading && !complaintsError && complaintsArray.length > 0 && (
            <>
              <div className="space-y-4 mb-6">
                {complaintsArray.map((issue, index) => (
                  <div 
                    key={issue?.vend_comp_id || index} 
                    className="border p-4 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold">
                        {issue?.vend_comp_date 
                          ? new Date(issue.vend_comp_date).toLocaleString() 
                          : "Date not available"}
                      </p>
                      <p>{issue?.vend_comp_desc || "Description not available"}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(issue)}
                        className="bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        disabled={updateComplaintLoading || deletingIssueId === issue?.vend_comp_id}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(issue)}
                        className={`px-4 py-2 rounded-lg text-white ${
                          deletingIssueId === issue?.vend_comp_id && deleteComplaintLoading 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                        disabled={updateComplaintLoading || (deletingIssueId === issue?.vend_comp_id && deleteComplaintLoading)}
                      >
                        {deletingIssueId === issue?.vend_comp_id && deleteComplaintLoading ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {updatingIssueId && (
                <form onSubmit={handleUpdateFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-4">
                      Edit Issue Description (ID: {updatingIssueId})
                    </label>
                    <textarea
                      name="vend_comp_desc"
                      value={updateFormData.vend_comp_desc}
                      onChange={handleUpdateChange}
                      placeholder="Update Your Issue"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] h-48"
                    />
                  </div>
                  {updateComplaintError && (
                    <p className="text-red-500">{updateComplaintError}</p>
                  )}
                  {deleteComplaintError && (
                    <p className="text-red-500">{deleteComplaintError}</p>
                  )}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={updateComplaintLoading || deleteComplaintLoading}
                      className={`w-full text-white py-3 rounded-full transition duration-300 text-lg font-medium ${
                        updateComplaintLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#4285F4] hover:bg-blue-600"
                      }`}
                    >
                      {updateComplaintLoading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default RaiseIssueSection;