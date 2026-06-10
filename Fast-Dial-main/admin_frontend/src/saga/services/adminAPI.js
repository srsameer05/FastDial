import api from "./api";

export const loginAPI = (credentials) => {
  return api.post("/admin/login", credentials);
};

export const forgetPasswordAPI = (phoneData) => {
  return api.post("/admin/login/forgetPassword", phoneData);
};

export const verifyOtpAPI = (otpData) => {
  return api.post("/admin/login/verifyOtp", otpData);
};

export const updatePasswordAPI = (passwordData) => {
  const token = localStorage.getItem("adminToken");
  return api.put("/admin/login/updatePassword", passwordData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addServiceCategoryAPI = (categoryData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  const payload = {
    service_category_name: categoryData.service_name,
    service_desc: categoryData.service_description,
    service_category_url: categoryData.service_image_url,
    ...(categoryData.service_id && { service_cat_id: categoryData.service_id }),
  };
  return api.post("/admin/data/insertSERVICE_CATEGORIES", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getServiceCategoriesAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api
    .get("/admin/data/getSERVICE_CATEGORIES", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .catch((error) => {
      console.error("getServiceCategoriesAPI error:", error.response?.data || error.message);
      throw error;
    });
};

export const updateServiceCategoryAPI = (categoryData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  const payload = {
    service_cat_id: categoryData.service_cat_id || categoryData.service_id,
    service_category_name: categoryData.service_name,
    service_desc: categoryData.service_description || null,
    service_category_url: categoryData.service_image_url || null,
  };
  return api
    .put("/admin/data/updateSERVICE_CATEGORIES", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .catch((error) => {
      console.error("updateServiceCategoryAPI error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(error.response?.data?.message || "Failed to update service category");
    });
};

export const deleteServiceCategoryAPI = (serviceCatId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api
    .delete(`/admin/data/deleteSERVICE_CATEGORIES/${serviceCatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .catch((error) => {
      console.error("deleteServiceCategoryAPI error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(error.response?.data?.message || "Failed to delete service category");
    });
};

export const addSubServiceAPI = (subServiceData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.post("/admin/data/insertSERVICES", subServiceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSubServicesAPI = (serviceCatId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get(`/admin/data/getSERVICES`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(response => {
    console.log(`getSubServicesAPI response for service_cat_id ${serviceCatId}:`, response.data);
    return response;
  }).catch(error => {
    console.error(`getSubServicesAPI error for service_cat_id ${serviceCatId}:`, error.response?.data || error.message);
    throw error;
  });
};

export const updateSubServiceAPI = (subServiceData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.put("/admin/data/updateSERVICES", subServiceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteSubServiceAPI = (subServiceId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.delete(`/admin/data/deleteSERVICES/${subServiceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getVendorsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getVendorsToAssign", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCustomersAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getcustomers", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCustomerServiceDetailsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getcustomerservicedetails", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const insertSubscriptionAPI = (subscriptionData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.post("/admin/data/insertSUBSCRIPTIONS", subscriptionData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPendingVendorsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getvendors_pending", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getApprovedVendorsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getvendors_approve", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getRejectedVendorsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getvendors_reject", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateVendorStatusAPI = (vendorData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.put("/admin/data/updatevendors", vendorData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateVendorBlockStatusAPI = (vendorData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.put("/admin/data/updatevendors", vendorData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserPaymentDetailsAPI = (customerId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get(`/admin/data/paymentdetails/${customerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSubscriptionsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getSUBSCRIPTIONS", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateSubscriptionAPI = (subscriptionData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.put("/admin/data/updateSUBSCRIPTIONS", subscriptionData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteSubscriptionAPI = (subscriptionId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.delete(`/admin/data/deleteSUBSCRIPTIONS/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllPaymentDetailsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/allpaymentdetails", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getVendorComplaintsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getvendorscomplaints", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCustomerComplaintsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getCUSTOMERCOMPLAINTS", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getVendorPaymentDetailsAPI = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get("/admin/data/getvendorpaymentdetails", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getChatRoomAPI = (data) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.post("/chat/get-or-create-room", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getChatMessagesAPI = (roomId) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.get(`/chat/messages/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateServiceBookingAPI = (bookingData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No authentication token found");
  return api.put("/admin/data/updateservicebooking", bookingData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default {
  loginAPI,
  forgetPasswordAPI,
  verifyOtpAPI,
  updatePasswordAPI,
  addServiceCategoryAPI,
  getServiceCategoriesAPI,
  updateServiceCategoryAPI,
  deleteServiceCategoryAPI,
  addSubServiceAPI,
  getSubServicesAPI,
  updateSubServiceAPI,
  deleteSubServiceAPI,
  getVendorsAPI,
  getCustomersAPI,
  getCustomerServiceDetailsAPI,
  insertSubscriptionAPI,
  getPendingVendorsAPI,
  getApprovedVendorsAPI,
  getRejectedVendorsAPI,
  updateVendorStatusAPI,
  updateVendorBlockStatusAPI,
  getUserPaymentDetailsAPI,
  getSubscriptionsAPI,
  updateSubscriptionAPI,
  deleteSubscriptionAPI,
  getAllPaymentDetailsAPI,
  getVendorComplaintsAPI,
  getCustomerComplaintsAPI,
  getVendorPaymentDetailsAPI,
  getChatRoomAPI,
  getChatMessagesAPI,
  updateServiceBookingAPI,
};