 import api from './api';

export const loginCustomerAPI = (mobile, otp) => {
  console.log('loginCustomerAPI: Request:', { mobile, otp });
  return api.post('/customers/login', { mobile, otp }).then((response) => {
    console.log('loginCustomerAPI: Response:', response.data);
    return response;
  }).catch((error) => {
    console.error('loginCustomerAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const signupCustomerAPI = (mobile) => {
  console.log('signupCustomerAPI: Request:', { mobile });
  return api.post('/customers/signup', { mobile });
};

export const getServiceCategoriesAPI = () => {
  return api.get('/customers/data/getSERVICES');
};

export const getSliderImagesAPI = () => {
  console.log('getSliderImagesAPI: Fetching slider images');
  return api.get('/customer/data/getsliderimages').catch((error) => {
    console.error('getSliderImagesAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const registerCustomerAPI = (customerData) => {
  const token = localStorage.getItem('token');
  console.log('registerCustomerAPI: Request:', customerData, 'Token:', token);
  if (!token || token === 'null' || token === 'undefined') {
    throw new Error('Authentication token is missing. Please login again.');
  }
  return api.post('/customers/registercustomer', customerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSingleServiceAPI = (serviceId) => {
  const token = localStorage.getItem('token');
  console.log('getSingleServiceAPI: Fetching with serviceId:', serviceId, 'Token:', token);
  return api.get(`/customers/data/getSERVICES?service_id=${serviceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getSingleServiceAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getCustomerDataAPI = (customerId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('getCustomerDataAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get(`/customers/data/getcustomers?customer_id=${customerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getCustomerDataAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const updateCustomerAPI = (data) => {
  const token = localStorage.getItem('token');
  console.log('updateCustomerAPI: Updating with data:', data, 'Token:', token);
  if (!token) {
    console.error('updateCustomerAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.put('/customers/data/updatecustomer', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('updateCustomerAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getVendorsAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getVendorsAPI: Fetching vendors, Token:', token);
  if (!token) {
    console.error('getVendorsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getvendors', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getVendorsAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getVendorsForCustomerAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getVendorsForCustomerAPI: Fetching vendors, Token:', token);
  if (!token) {
    console.error('getVendorsForCustomerAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getVendorsForCustomer', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getVendorsForCustomerAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const insertCustomerComplaintAPI = (complaintData) => {
  const token = localStorage.getItem('token');
  console.log('insertCustomerComplaintAPI: Request:', complaintData, 'Token:', token);
  return api.post('/customers/data/insertCUSTOMERCOMPLAINTS', complaintData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('insertCustomerComplaintAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getCustomerComplaintsAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getCustomerComplaintsAPI: Token:', token);
  if (!token) {
    console.error('getCustomerComplaintsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getCUSTOMERCOMPLAINTS', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getCustomerComplaintsAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const updateCustomerComplaintAPI = (complaintData) => {
  const token = localStorage.getItem('token');
  console.log('updateCustomerComplaintAPI: Request:', complaintData, 'Token:', token);
  if (!token) {
    console.error('updateCustomerComplaintAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.put('/customers/data/updateCUSTOMERCOMPLAINTS', complaintData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('updateCustomerComplaintAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const deleteCustomerComplaintAPI = (complaintId) => {
  const token = localStorage.getItem('token');
  console.log('deleteCustomerComplaintAPI: Complaint ID:', complaintId, 'Token:', token);
  if (!token) {
    console.error('deleteCustomerComplaintAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.delete(`/customers/data/deleteCUSTOMERCOMPLAINTS/${complaintId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('deleteCustomerComplaintAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getChatMessagesAPI = (roomId) => {
  const token = localStorage.getItem('token');
  console.log('getChatMessagesAPI: Fetching messages for roomId:', roomId, 'Token:', token);
  if (!token) {
    console.error('getChatMessagesAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get(`/chats/messages/${roomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getChatMessagesAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getServicesAPI = () => {
  console.log('getServicesAPI: Fetching services');
  return api.get('/customers/data/getSERVICES').catch((error) => {
    console.error('getServicesAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getService_CategoriesAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getService_CategoriesAPI: Fetching service categories');
  return api.get('/customers/data/getSERVICE_CATEGORIES', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getService_CategoriesAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getServicesByCategoryAPI = (serviceCatId) => {
  const token = localStorage.getItem('token');
  console.log('getServicesByCategoryAPI: Fetching with serviceCatId:', serviceCatId, 'Token:', token);
  return api.get(`/customers/data/getSERVICES?service_cat_id=${serviceCatId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getServicesByCategoryAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const insertReviewsAPI = (reviewData) => {
  const token = localStorage.getItem('token');
  console.log('insertReviewsAPI: Request:', reviewData, 'Token:', token);
  if (!token) {
    console.error('insertReviewsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/data/insertREVIEWS', reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getServicesAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const insertServiceBookingAPI = (bookingData) => {
  const token = localStorage.getItem('token');
  console.log('insertServiceBookingAPI: Request:', bookingData, 'Token:', token);
  if (!token) {
    console.error('insertServiceBookingAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/data/insertservicebooking', bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('insertServiceBookingAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getReviewsAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getReviewsAPI: Token:', token);
  if (!token) {
    console.error('getReviewsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getREVIEWS', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('insertServiceBookingAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getVendorsWithServicesAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getVendorsWithServicesAPI: Fetching vendors with services, Token:', token);
  if (!token) {
    console.error('getVendorsWithServicesAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getallvendorwithservices', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getVendorsWithServicesAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const updateReviewsAPI = (reviewData) => {
  const token = localStorage.getItem("token");
  console.log("updateReviewsAPI: Request:", reviewData, "Token:", token);
  if (!token) {
    console.error("updateReviewsAPI: No token found");
    throw new Error("Authentication token is missing");
  }
  return api
    .put("/customers/data/updateREVIEWS", reviewData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.error(
        "updateReviewsAPI: Error:",
        error.response?.data || error.message
      );
      throw error;
    });
};

export const deleteReviewsAPI = (reviewId) => {
  const token = localStorage.getItem("token");
  console.log("deleteReviewsAPI: Review ID:", reviewId, "Token:", token);
  if (!token) {
    console.error("deleteReviewsAPI: No token found");
    throw new Error("Authentication token is missing");
  }
  return api
    .delete(`/customers/data/deleteREVIEWS/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.error(
        "deleteReviewsAPI: Error:",
        error.response?.data || error.message
      );
      throw error;
    });
};

export const getCustomerBookingsAPI = (customerId) => {
  const token = localStorage.getItem('token');
  console.log('getCustomerBookingsAPI: Fetching completed bookings with customerId:', customerId, 'Token:', token);
  if (!token) {
    console.error('getCustomerBookingsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get(`/customers/data/getcompletedbookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getVendorsWithServicesAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const bookingLaterAPI = (bookingData) => {
  const token = localStorage.getItem('token');
  console.log('bookingLaterAPI: Request:', bookingData, 'Token:', token);
  if (!token) {
    console.error('bookingLaterAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/data/bookinglater', bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('bookingLaterAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getCustomerCancelledBookingsAPI = (customerId) => {
  const token = localStorage.getItem('token');
  console.log('getCustomerCancelledBookingsAPI: Fetching canceled bookings with customerId:', customerId, 'Token:', token);
  if (!token) {
    console.error('getCustomerCancelledBookingsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get(`/customers/data/getcancelledbookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getCustomerCancelledBookingsAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getCustomerServiceDetailsAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getCustomerServiceDetailsAPI: Fetching customer service details, Token:', token);
  if (!token) {
    console.error('getCustomerServiceDetailsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getcustomerservicedetails', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getCustomerServiceDetailsAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getCustomerUpcomingBookingsAPI = (customerId) => {
  const token = localStorage.getItem('token');
  console.log('getCustomerUpcomingBookingsAPI: Fetching upcoming bookings with customerId:', customerId, 'Token:', token);
  if (!token) {
    console.error('getCustomerUpcomingBookingsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get(`/customers/data/getUpcomingServiceBooking`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getCustomerUpcomingBookingsAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const initiatePaymentAPI = (bookingData) => {
  const token = localStorage.getItem('token');
  console.log('initiatePaymentAPI: Request:', bookingData, 'Token:', token);
  if (!token) {
    console.error('initiatePaymentAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/initiate', bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('initiatePaymentAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const verifyPaymentAPI = (paymentData) => {
  const token = localStorage.getItem('token');
  console.log('verifyPaymentAPI: Request:', paymentData, 'Token:', token);
  if (!token) {
    console.error('verifyPaymentAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/verify', paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('verifyPaymentAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

// customerAPI.js
export const initiatePaymentForBookNowAPI = (paymentData) => {
  const token = localStorage.getItem('token');
  console.log('initiatePaymentForBookNowAPI: Request:', paymentData, 'Token:', token);
  if (!token) {
    console.error('initiatePaymentForBookNowAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/initiatepayment', paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('initiatePaymentForBookNowAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const verifyPaymentForBookNowAPI = (paymentData) => {
  const token = localStorage.getItem('token');
  console.log('verifyPaymentForBookNowAPI: Request:', paymentData, 'Token:', token);
  if (!token) {
    console.error('verifyPaymentForBookNowAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/verifypayment', paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('verifyPaymentForBookNowAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getBookingDetailsAPI = () => {
  console.log('getBookingDetailsAPI: Fetching services');
  const token = localStorage.getItem('token');
  console.log('getBookingDetailsAPI: Token:', token);
  if (!token) {
    console.error('getBookingDetailsAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getservicebooking', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getBookingDetailsAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

// customerAPI.js
export const insertAddressAPI = (addressData) => {
  const token = localStorage.getItem('token');
  console.log('insertAddressAPI: Request:', addressData, 'Token:', token);
  if (!token) {
    console.error('insertAddressAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.post('/customers/data/insertaddress', addressData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('insertAddressAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};

export const getCustomerAddressAPI = () => {
  const token = localStorage.getItem('token');
  console.log('getCustomerAddressAPI: Token:', token);
  if (!token) {
    console.error('getCustomerAddressAPI: No token found');
    throw new Error('Authentication token is missing');
  }
  return api.get('/customers/data/getcustomeraddress', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    console.error('getCustomerAddressAPI: Error:', error.response?.data || error.message);
    throw error;
  });
};