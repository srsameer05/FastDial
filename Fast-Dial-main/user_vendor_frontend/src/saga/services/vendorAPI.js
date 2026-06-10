import api from './api';

export const vendorLoginAPI = async (credentials) => {
  const response = await api.post('/vendors/login', credentials);
  console.log("Login API response:", response.data);
  return response.data;
};

export const vendorLogoutAPI = async () => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.post('/vendors/logout', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Logout API response:", response.data);
  return response.data;
};

export const fetchSubscriptionsAPI = async () => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get('/vendors/data/getSUBSCRIPTIONS', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Subscriptions API response:", response.data);
  return response.data;
};

export const fetchVendorProfileAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getvendors?vendor_id=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Vendor Profile API response:", response.data);
  return response.data;
};
//localhost:3000/api/v1/vendors/data/getvendors

export const updateVendorAPI = async (vendorData) => {
  const token = localStorage.getItem('vendorToken');
  const filteredData = Object.fromEntries(
    Object.entries(vendorData).filter(([_, value]) => value !== undefined && value !== "")
  );
  console.log("Sending JSON to updateVendorAPI:", filteredData);
  try {
    const response = await api.put('/vendors/data/updatevendors', filteredData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log("Update Vendor API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("updateVendorAPI error:", error.response?.data || error.message);
    throw error;
  }
};

export const vendorSignupAPI = async (signupData) => {
  const response = await api.post('/vendors/signup', signupData);
  console.log("Signup API response:", response.data);
  return response.data;
};

export const fetchVendorComplaintsAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getvendorscomplaints?vendor_id=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Vendor Complaints API response:", response.data);
  return response.data;
};

export const insertVendorComplaintAPI = async (complaintData) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.post('/vendors/data/insertvendorscomplaints', complaintData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log("Insert Vendor Complaint API response:", response.data);
  return response.data;
};

export const updateVendorComplaintAPI = async (complaintData) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.put('/vendors/data/updatevendorscomplaints', complaintData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log("Update Vendor Complaint API response:", response.data);
  return response.data;
};

export const deleteVendorComplaintAPI = async ({ vendor_id, vend_comp_id }) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.delete(`/vendors/data/deletevendorscomplaints/${vend_comp_id}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { vendor_id },
  });
  console.log("Delete Vendor Complaint API response:", response.data);
  return response.data;
};

export const forgotPasswordAPI = async (data) => {
  const response = await api.post('/vendors/login/forgetPassword', data);
  console.log("Forgot Password API response:", response.data);
  return response.data;
};

export const verifyOtpAPI = async (data) => {
  const response = await api.post('/vendors/login/verifyOtp', {
    mobile: data.vendor_mobile,
    otp_code: data.otp,
  });
  console.log("Verify OTP API response:", response.data);
  return response.data;
};

export const updatePasswordAPI = async (data) => {
  const response = await api.put('/vendors/login/updatePassword', {
    vendor_mobile: data.vendor_mobile,
    vendor_password: data.new_password,
  });
  console.log("Update Password API response:", response.data);
  return response.data;
};

export const fetchServiceRequestsAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getcustomerservices/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Service Requests API response:", response.data);
  return response.data;
};

export const updateServiceBookingAPI = async (bookingData) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.put('/vendors/data/updateservicebooking', bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log("Update Service Booking API response:", response.data);
  return response.data;
};

export const fetchCancelledBookingsAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getCancelledBookings/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Cancelled Bookings API response:", response.data);
  return response.data;
};

export const fetchCancelledBookingsCountAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getCancelledBookingsCount/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Cancelled Bookings Count API response:", response.data);
  return response.data;
};

export const fetchCompletedBookingsCountAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getCompletedBookingsCount/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Completed Bookings Count API response:", response.data);
  return response.data;
};

export const fetchTotalServiceRequestsPerMonthAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getTotalServiceRequestsPerMonthCount/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Total Service Requests Per Month API response:", response.data);
  return response.data;
};

export const createOrderAPI = async (subscriptionData) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.post('/vendors/create-order', subscriptionData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log("Create Order API response:", response.data);
  return response.data;
};

export const verifyPaymentAPI = async (paymentData) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.post('/vendors/verifypayment', paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log("Verify Payment API response:", response.data);
  return response.data;
};

export const fetchVendorEarningsAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getVendorEarnings/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Vendor Earnings API response:", response.data);
  return response.data;
};

export const fetchVendorPaymentDetailsAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/getvendorpaymentdetails/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Vendor Payment Details API response:", response.data);
  return response.data;
};

export const fetchAdminsAPI = async () => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get('/vendors/getadmin', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Admins API response:", response.data);
  return response.data;
};

 export const fetchCustomersAPI = async () => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get('/vendors/data/getbookedcustomers', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Customers API response:", response.data);
  return response.data;
};

export const getChatRoomAPI = async ({ vendorId, adminId }) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.post('/chat/get-or-create-room', { vendorId, adminId }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log("Get Chat Room API response:", response.data);
  return response.data;
};

export const getCustomerChatRoomAPI = async ({ vendor_id, customer_id }) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.post('/chats/get-room', { vendor_id, customer_id }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log("Get Customer Chat Room API response:", response.data);
  return response.data;
};

export const fetchChatHistoryAPI = async (roomId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/chat/messages/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Chat History API response:", response.data);
  return response.data;
};

export const fetchCustomerChatHistoryAPI = async (roomId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/chats/messages/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Customer Chat History API response:", response.data);
  return response.data;
}; 

export const fetchServicesAPI = async () => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get('/vendors/data/service_with_category', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Services API response:", response.data);
  return response.data;
};

export const fetchVendorServicesAPI = async (vendorId) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/getvendor_services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Vendor Services API response:", response.data);
  return response.data;
};

export const updateVendorServiceAPI = async (serviceData) => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.put(`/vendors/data/updatevendor_services`, serviceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Update Vendor Service API response:", response.data);
  return response.data;
};

export const getVendorFreeTrialDetailsAPI = async () => {
  const token = localStorage.getItem('vendorToken');
  const response = await api.get(`/vendors/data/vendorsubscription`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Fetch Vendor Free Trail Details API:", response.data);
  return response.data;
};

export const startTrackingAPI = async (locationData) => {
  const token = localStorage.getItem('vendorToken') || localStorage.getItem('token');
  const response = await api.put(`/vendors/tracking/start`, locationData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("vendor startTrackingAPI response:", response.data);
  return response.data;
};