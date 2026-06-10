import React, { useState, useEffect } from "react";
import NavbarMain from "../../../components/NevbarMain";
import SideNavbar from "../../../components/SideNevBar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getServiceCategoriesRequest,
  deleteServiceCategoryRequest,
  getSubServicesRequest,
  deleteSubServiceRequest,
  resetDeleteCategory,
  resetDeleteSubService,
} from "../../../saga/features/admin/adminSlice";

const ServiceCategory = () => {
  const [activeTab, setActiveTab] = useState("Service Category");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    serviceCategories,
    getCategoriesLoading,
    getCategoriesError,
    deleteCategoryLoading,
    deleteCategorySuccess,
    deleteCategoryError,
    subServices,
    getSubServicesLoading,
    getSubServicesError,
    deleteSubServiceLoading,
    deleteSubServiceSuccess,
    deleteSubServiceError,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    console.log("Dispatching getServiceCategoriesRequest");
    dispatch(getServiceCategoriesRequest());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategoryId) {
      console.log("Dispatching getSubServicesRequest for service_cat_id:", selectedCategoryId);
      dispatch(getSubServicesRequest(selectedCategoryId));
    }
  }, [dispatch, selectedCategoryId]);

  useEffect(() => {
    console.log("Current serviceCategories state:", serviceCategories);
    console.log("Current subServices state:", subServices);
  }, [serviceCategories, subServices]);

  useEffect(() => {
    if (deleteCategorySuccess) {
      alert("Service category deleted successfully!");
      dispatch(getServiceCategoriesRequest());
      dispatch(resetDeleteCategory());
    }
    if (deleteCategoryError) {
      alert(`Failed to delete service category: ${deleteCategoryError}`);
      dispatch(resetDeleteCategory());
    }
  }, [deleteCategorySuccess, deleteCategoryError, dispatch]);

  useEffect(() => {
    if (deleteSubServiceSuccess) {
      alert("Sub-service deleted successfully!");
      if (selectedCategoryId) {
        dispatch(getSubServicesRequest(selectedCategoryId));
      }
      dispatch(resetDeleteSubService());
    }
    if (deleteSubServiceError) {
      alert(`Failed to delete sub-service: ${deleteSubServiceError}`);
      dispatch(resetDeleteSubService());
    }
  }, [deleteSubServiceSuccess, deleteSubServiceError, dispatch, selectedCategoryId]);

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

  const handleAddServiceCategoryClick = () => {
    navigate("/addservicecategory");
  };

  const handleEditServiceCategoryClick = (category) => {
    console.log("Navigating to edit service category with data:", category);
    navigate("/addservicecategory", { state: { category, isEdit: true } });
  };

  const handleDeleteServiceCategoryClick = (serviceCatId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      console.log("Dispatching deleteServiceCategoryRequest for service_cat_id:", serviceCatId);
      dispatch(deleteServiceCategoryRequest(serviceCatId));
    }
  };

  const handleViewSubServices = (serviceCatId) => {
    console.log("Toggling sub-services for service_cat_id:", serviceCatId);
    setSelectedCategoryId((prevId) => (prevId === serviceCatId ? null : serviceCatId));
  };

  const handleAddSubServiceClick = (serviceCatId) => {
    navigate("/addsubservice", { state: { serviceCatId } });
  };

  const handleEditSubServiceClick = (subService) => {
    navigate("/addsubservice", { state: { subService, isEdit: true } });
  };

  const handleDeleteSubServiceClick = (subServiceId, serviceCatId) => {
    if (window.confirm("Are you sure you want to delete this sub-service?")) {
      console.log("Dispatching deleteSubServiceRequest for service_id:", subServiceId);
      dispatch(deleteSubServiceRequest({ subServiceId, serviceCatId }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = serviceCategories.filter((category) =>
    (category.service_name || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex space-x-4 mb-4 gap-[15px] h-[46px]">
          {["Vendor List", "Pending Approval", "Vendor Payments", "Service Category", "Booking Details","Blocked Vendors"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-3 rounded-lg ${
                  activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab}
              </button>
            )
          )}
          <div className="flex items-center gap-3 mb-0 mt-1">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by Name"
                className="w-full p-2 h-[50px] border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              onClick={handleAddServiceCategoryClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 h-[50px] w-[150px] flex items-center justify-center"
            >
              Add Service Category
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
          {getCategoriesLoading ? (
            <div className="p-4">Loading service categories...</div>
          ) : getCategoriesError ? (
            <div className="p-4 text-red-500">
              Error: {getCategoriesError}{" "}
              <button
                className="text-blue-500 hover:underline"
                onClick={() => dispatch(getServiceCategoriesRequest())}
              >
                Retry
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-4">
              {searchTerm ? "No matching categories found" : "No categories available"}
            </div>
          ) : (
            <div className="max-h-[550px] overflow-y-auto">
              <table className="w-full min-w-full text-left border-collapse">
                <thead className="bg-gray-200 text-gray-600">
                  <tr>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Service Icon</th>
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold">Sub-Services</th>
                    <th className="p-3 font-semibold">Edit</th>
                    <th className="p-3 font-semibold">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <React.Fragment key={category.service_cat_id}>
                      <tr className="border-b last:border-0 hover:bg-gray-100">
                        <td className="p-4">{category.service_name || "N/A"}</td>
                        <td className="p-4">
                          {category.service_image_url ? (
                            <img
                              src={category.service_image_url}
                              alt="icon"
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-4">{category.service_description || "N/A"}</td>
                        <td className="p-4">
                        <button
                    className="text-blue-500 hover:underline"
                    onClick={() => handleViewSubServices(category.service_cat_id)}
                  >
                    {selectedCategoryId === category.service_cat_id ? "Hide Sub-Services" : "View Sub-Services"}
                  </button>
                          <button
                            className="text-green-500 hover:underline ml-2"
                            onClick={() => handleAddSubServiceClick(category.service_cat_id)}
                          >
                            Add Sub-Service
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            className="text-blue-500 hover:underline"
                            onClick={() => handleEditServiceCategoryClick(category)}
                          >
                            Edit
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => handleDeleteServiceCategoryClick(category.service_cat_id)}
                            disabled={deleteCategoryLoading}
                          >
                            {deleteCategoryLoading ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                      {selectedCategoryId === category.service_cat_id && (
                        <tr>
                          <td colSpan="6" className="p-4 bg-gray-50">
                            {getSubServicesLoading ? (
                              <div>Loading sub-services...</div>
                            ) : getSubServicesError ? (
                              <div className="text-red-500">
                                Error: {getSubServicesError}{" "}
                                <button
                                  className="text-blue-500 hover:underline"
                                  onClick={() => dispatch(getSubServicesRequest(selectedCategoryId))}
                                >
                                  Retry
                                </button>
                              </div>
                            ) : subServices.length === 0 ? (
                              <div>
                                No sub-services available.{" "}
                                <button
                                  className="text-green-500 hover:underline"
                                  onClick={() => handleAddSubServiceClick(category.service_cat_id)}
                                >
                                  Add a sub-service
                                </button>
                              </div>
                            ) : (
                              <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-600">
                                  <tr>
                                    <th className="p-3 font-semibold">Sub-Service Name</th>
                                    <th className="p-3 font-semibold">Icon</th>
                                    <th className="p-3 font-semibold">Price</th>
                                    <th className="p-3 font-semibold">Description</th>
                                    <th className="p-3 font-semibold">Edit</th>
                                    <th className="p-3 font-semibold">Delete</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subServices.map((subService, index) => (
                                    <tr
                                      key={`${subService.service_id}-${index}`}
                                      className="border-b last:border-0 hover:bg-gray-100"
                                    >
                                      <td className="p-4">{subService.service_name || "N/A"}</td>
                                      <td className="p-4">
                                        {subService.service_image_url ? (
                                          <img
                                            src={subService.service_image_url}
                                            alt="icon"
                                            className="h-10 w-10 object-cover"
                                          />
                                        ) : (
                                          "N/A"
                                        )}
                                      </td>
                                      <td className="p-4">{subService.service_price || "N/A"}</td>
                                      <td className="p-4">{subService.service_description || "N/A"}</td>
                                      <td className="p-4">
                                        <button
                                          className="text-blue-500 hover:underline"
                                          onClick={() => handleEditSubServiceClick(subService)}
                                        >
                                          Edit
                                        </button>
                                      </td>
                                      <td className="p-4">
                                        <button
                                          className="text-red-500 hover:underline"
                                          onClick={() =>
                                            handleDeleteSubServiceClick(
                                              subService.service_id,
                                              category.service_cat_id
                                            )
                                          }
                                          disabled={deleteSubServiceLoading}
                                        >
                                          {deleteSubServiceLoading ? "Deleting..." : "Delete"}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ServiceCategory;