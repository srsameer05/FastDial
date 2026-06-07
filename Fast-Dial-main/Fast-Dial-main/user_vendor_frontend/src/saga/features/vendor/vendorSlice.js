import { createSlice } from '@reduxjs/toolkit';

const normalizeSentAt = (sentAt) => {
  if (!sentAt) {
    console.warn("normalizeSentAt: sent_at is null, using current time");
    return new Date().toISOString();
  }
  
  console.log("normalizeSentAt: Raw sent_at:", sentAt);
  
  if (sentAt.includes('+') || sentAt.endsWith('Z') || /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([Z|+|-])/.test(sentAt)) {
    return sentAt;
  }
  
  const date = new Date(sentAt);
  
  if (isNaN(date.getTime())) {
    console.warn("normalizeSentAt: Invalid sent_at:", sentAt, "using current time");
    return new Date().toISOString();
  }
  
  const offset = '+05:30';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState: {
    vendor: null,
    token: localStorage.getItem('vendorToken') || null,
    isAuthenticated: !!localStorage.getItem('vendorToken'),
    loading: false,
    error: null,
    basicSignupDetails: null,
    subscriptions: [],
    subscriptionsLoading: false,
    subscriptionsError: null,
    profileLoading: false,
    profileError: null,
    profile: null,
    updateLoading: false,
    updateError: null,
    updateSuccess: false,
    signupLoading: false,
    signupError: null,
    complaints: [],
    complaintsLoading: false,
    complaintsError: null,
    insertComplaintLoading: false,
    insertComplaintError: null,
    insertComplaintSuccess: false,
    updateComplaintLoading: false,
    updateComplaintError: null,
    updateComplaintSuccess: false,
    deleteComplaintLoading: false,
    deleteComplaintError: null,
    deleteComplaintSuccess: false,
    forgotPasswordLoading: false,
    forgotPasswordError: null,
    forgotPasswordSuccess: false,
    verifyOtpLoading: false,
    verifyOtpError: null,
    verifyOtpSuccess: false,
    resetPasswordLoading: false,
    resetPasswordError: null,
    resetPasswordSuccess: false,
    serviceRequests: [],
    serviceRequestsLoading: false,
    serviceRequestsError: null,
    completedRequests: [],
    completedRequestsLoading: false,
    completedRequestsError: null,
    failedRequests: [],
    failedRequestsLoading: false,
    failedRequestsError: null,
    updateServiceBookingLoading: false,
    updateServiceBookingError: null,
    updateServiceBookingSuccess: false,
    cancelledBookingsCount: [],
    cancelledBookingsCountLoading: false,
    cancelledBookingsCountError: null,
    completedBookingsCount: [],
    completedBookingsCountLoading: false,
    completedBookingsCountError: null,
    totalServiceRequestsPerMonth: [],
    totalServiceRequestsPerMonthLoading: false,
    totalServiceRequestsPerMonthError: null,
    orderLoading: false,
    orderError: null,
    orderSuccess: false,
    orderData: null,
    paymentVerificationLoading: false,
    paymentVerificationError: null,
    paymentVerificationSuccess: false,
    paymentVerificationResponse: null,
    purchasedSubscriptions: [],
    vendorEarnings: null,
    vendorEarningsLoading: false,
    vendorEarningsError: null,
    vendorPaymentDetailsLoading: false,
    vendorPaymentDetailsError: null,
    chat: {
      roomId: null,
      adminId: null,
      messages: [],
      error: null,
      chatHistoryLoading: false,
      chatHistoryError: null,
    },
    customerChat: {
      roomId: null,
      customerId: null,
      messages: [],
      error: null,
      chatHistoryLoading: false,
      chatHistoryError: null,
    },
    admins: [],
    adminsLoading: false,
    adminsError: null,
    customers: [],
    customersLoading: false,
    customersError: null,
    services: [],
    servicesLoading: false,
    servicesError: null,
    vendorServices: [],
    vendorServicesLoading: false,
    vendorServicesError: null,
    updateServiceLoading: false,
    updateServiceError: null,
    updateServiceSuccess: false,
    getVendorFreeTrialDetailsLoading: false,
    getVendorFreeTrialDetailsError: null,
    getVendorFreeTrialDetailsSuccess: null,

  },
  reducers: {
    vendorLoginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    vendorLoginSuccess: (state, action) => {
      state.loading = false;
      state.vendor = action.payload.vendor;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('vendorToken', action.payload.token);
      localStorage.setItem('vendorId', action.payload.vendor.id);
      console.log("vendorLoginSuccess - Vendor ID:", action.payload.vendor.id);
    },
    vendorLoginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    vendorLogout: (state) => {
      state.vendor = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.basicSignupDetails = null;
      state.subscriptions = [];
      state.profile = null;
      state.complaints = [];
      state.serviceRequests = [];
      state.completedRequests = [];
      state.failedRequests = [];
      state.cancelledBookingsCount = [];
      state.completedBookingsCount = [];
      state.totalServiceRequestsPerMonth = [];
      state.orderData = null;
      state.purchasedSubscriptions = [];
      state.chat = { roomId: null, adminId: null, messages: [], error: null, chatHistoryLoading: false, chatHistoryError: null };
      state.customerChat = { roomId: null, customerId: null, messages: [], error: null, chatHistoryLoading: false, chatHistoryError: null };
      state.admins = [];
      state.adminsError = null;
      state.customers = [];
      state.customersError = null;
      state.vendorServices = [];
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorId');
    },
    fetchVendorProfileRequest: (state) => {
      state.profileLoading = true;
      state.profileError = null;
    },
     fetchVendorProfileSuccess: (state, action) => {
  state.profileLoading = false;
  console.log("fetchVendorProfileSuccess - Payload:", action.payload);
  state.profile = {
    ...action.payload,
    id: action.payload.vendor_id, // Map vendor_id to id for consistency
  };
  state.vendor = state.vendor || { id: action.payload.vendor_id };
},
    fetchVendorProfileFailure: (state, action) => {
      state.profileLoading = false;
      state.profileError = action.payload;
    },
    fetchAdminsRequest: (state) => {
      state.adminsLoading = true;
      state.adminsError = null;
    },
    fetchAdminsSuccess: (state, action) => {
      state.adminsLoading = false;
      console.log("fetchAdminsSuccess - Payload:", action.payload);
      state.admins = action.payload;
    },
    fetchAdminsFailure: (state, action) => {
      state.adminsLoading = false;
      state.adminsError = action.payload;
    },
    fetchCustomersRequest: (state) => {
      state.customersLoading = true;
      state.customersError = null;
    },
    fetchCustomersSuccess: (state, action) => {
      state.customersLoading = false;
      console.log("fetchCustomersSuccess - Payload:", action.payload);
      state.customers = action.payload;
    },
    fetchCustomersFailure: (state, action) => {
      state.customersLoading = false;
      state.customersError = action.payload;
    },
    fetchSubscriptionsRequest: (state) => {
      state.subscriptionsLoading = true;
      state.subscriptionsError = null;
    },
    fetchSubscriptionsSuccess: (state, action) => {
      state.subscriptionsLoading = false;
      console.log("fetchSubscriptionsSuccess - Payload:", action.payload);
      state.subscriptions = action.payload;
    },
    fetchSubscriptionsFailure: (state, action) => {
      state.subscriptionsLoading = false;
      state.subscriptionsError = action.payload;
    },
    updateVendorRequest: (state) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    },
    updateVendorSuccess: (state, action) => {
      state.updateLoading = false;
      console.log("updateVendorSuccess - Payload:", action.payload);
      state.updateSuccess = true;
      state.profile = { ...state.profile, ...action.payload };
    },
    updateVendorFailure: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    },
    clearUpdateStatus: (state) => {
      state.updateSuccess = false;
      state.updateError = null;
    },
    vendorSignupRequest: (state) => {
      state.signupLoading = true;
      state.signupError = null;
    },
    vendorSignupSuccess: (state) => {
      state.signupLoading = false;
    },
    vendorSignupFailure: (state, action) => {
      state.signupLoading = false;
      state.signupError = action.payload;
    },
    fetchComplaintsRequest: (state) => {
      state.complaintsLoading = true;
      state.complaintsError = null;
    },
    fetchComplaintsSuccess: (state, action) => {
      state.complaintsLoading = false;
      console.log("fetchComplaintsSuccess - Payload:", action.payload);
      state.complaints = action.payload;
    },
    fetchComplaintsFailure: (state, action) => {
      state.complaintsLoading = false;
      state.complaintsError = action.payload;
    },
    insertComplaintRequest: (state) => {
      state.insertComplaintLoading = true;
      state.insertComplaintError = null;
      state.insertComplaintSuccess = false;
    },
    insertComplaintSuccess: (state, action) => {
      state.insertComplaintLoading = false;
      console.log("insertComplaintSuccess - Payload:", action.payload);
      state.insertComplaintSuccess = true;
      state.complaints = [...state.complaints, action.payload];
    },
    insertComplaintFailure: (state, action) => {
      state.insertComplaintLoading = false;
      state.insertComplaintError = action.payload;
    },
    clearInsertStatus: (state) => {
      state.insertComplaintSuccess = false;
      state.insertComplaintError = null;
    },
    updateComplaintRequest: (state) => {
      state.updateComplaintLoading = true;
      state.updateComplaintError = null;
      state.updateComplaintSuccess = false;
    },
    updateComplaintSuccess: (state, action) => {
      state.updateComplaintLoading = false;
      console.log("updateComplaintSuccess - Payload:", action.payload);
      state.updateComplaintSuccess = true;
      state.complaints = state.complaints.map(complaint =>
        complaint.vend_comp_id === action.payload.vend_comp_id ? action.payload : complaint
      );
    },
    updateComplaintFailure: (state, action) => {
      state.updateComplaintLoading = false;
      state.updateComplaintError = action.payload;
    },
    clearUpdateComplaintStatus: (state) => {
      state.updateComplaintSuccess = false;
      state.updateComplaintError = null;
    },
    deleteComplaintRequest: (state) => {
      state.deleteComplaintLoading = true;
      state.deleteComplaintError = null;
      state.deleteComplaintSuccess = false;
    },
    deleteComplaintSuccess: (state, action) => {
      state.deleteComplaintLoading = false;
      console.log("deleteComplaintSuccess - Payload:", action.payload);
      state.deleteComplaintSuccess = true;
      state.complaints = state.complaints.filter(
        complaint => complaint.vend_comp_id !== action.payload.vend_comp_id
      );
    },
    deleteComplaintFailure: (state, action) => {
      state.deleteComplaintLoading = false;
      state.deleteComplaintError = action.payload;
    },
    clearDeleteComplaintStatus: (state) => {
      state.deleteComplaintSuccess = false;
      state.deleteComplaintError = null;
    },
    forgotPasswordRequest: (state) => {
      state.forgotPasswordLoading = true;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    forgotPasswordSuccess: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = true;
    },
    forgotPasswordFailure: (state, action) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = action.payload;
    },
    verifyOtpRequest: (state) => {
      state.verifyOtpLoading = true;
      state.verifyOtpError = null;
      state.verifyOtpSuccess = false;
    },
    verifyOtpSuccess: (state) => {
      state.verifyOtpLoading = false;
      state.verifyOtpSuccess = true;
    },
    verifyOtpFailure: (state, action) => {
      state.verifyOtpLoading = false;
      state.verifyOtpError = action.payload;
    },
    resetPasswordRequest: (state) => {
      state.resetPasswordLoading = true;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = false;
    },
    resetPasswordSuccess: (state) => {
      state.resetPasswordLoading = false;
      state.resetPasswordSuccess = true;
    },
    resetPasswordFailure: (state, action) => {
      state.resetPasswordLoading = false;
      state.resetPasswordError = action.payload;
    },
    clearForgotPasswordStatus: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
      state.verifyOtpLoading = false;
      state.verifyOtpError = null;
      state.verifyOtpSuccess = false;
      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = false;
    },
    fetchServiceRequestsRequest: (state) => {
      state.serviceRequestsLoading = true;
      state.serviceRequestsError = null;
    },
    fetchServiceRequestsSuccess: (state, action) => {
      state.serviceRequestsLoading = false;
      console.log("fetchServiceRequestsSuccess - Payload:", action.payload);
      state.serviceRequests = action.payload;
    },
    fetchServiceRequestsFailure: (state, action) => {
      state.serviceRequestsLoading = false;
      state.serviceRequestsError = action.payload;
    },
    fetchCompletedRequestsRequest: (state) => {
      state.completedRequestsLoading = true;
      state.completedRequestsError = null;
    },
    fetchCompletedRequestsSuccess: (state, action) => {
      state.completedRequestsLoading = false;
      console.log("fetchCompletedRequestsSuccess - Payload:", action.payload);
      state.completedRequests = action.payload;
    },
    fetchCompletedRequestsFailure: (state, action) => {
      state.completedRequestsLoading = false;
      state.completedRequestsError = action.payload;
    },
    fetchFailedRequestsRequest: (state) => {
      state.failedRequestsLoading = true;
      state.failedRequestsError = null;
    },
    fetchFailedRequestsSuccess: (state, action) => {
      state.failedRequestsLoading = false;
      console.log("fetchFailedRequestsSuccess - Payload:", action.payload);
      state.failedRequests = action.payload;
    },
    fetchFailedRequestsFailure: (state, action) => {
      state.failedRequestsLoading = false;
      state.failedRequestsError = action.payload;
    },
    updateServiceBookingRequest: (state) => {
      state.updateServiceBookingLoading = true;
      state.updateServiceBookingError = null;
      state.updateServiceBookingSuccess = false;
    },
    updateServiceBookingSuccess: (state, action) => {
      state.updateServiceBookingLoading = false;
      console.log("updateServiceBookingSuccess - Payload:", action.payload);
      state.updateServiceBookingSuccess = true;
      state.serviceRequests = state.serviceRequests.map((request) =>
        request.booking_id === action.payload.booking_id
          ? { ...request, ...action.payload }
          : request
      );
      state.completedRequests = state.completedRequests.map((request) =>
        request.booking_id === action.payload.booking_id
          ? { ...request, ...action.payload }
          : request
      );
      state.failedRequests = state.failedRequests.map((request) =>
        request.booking_id === action.payload.booking_id
          ? { ...request, ...action.payload }
          : request
      );
    },
    updateServiceBookingFailure: (state, action) => {
      state.updateServiceBookingLoading = false;
      state.updateServiceBookingError = action.payload;
    },
    clearUpdateServiceBookingStatus: (state) => {
      state.updateServiceBookingSuccess = false;
      state.updateServiceBookingError = null;
    },
    fetchCancelledBookingsCountRequest: (state) => {
      state.cancelledBookingsCountLoading = true;
      state.cancelledBookingsCountError = null;
    },
    fetchCancelledBookingsCountSuccess: (state, action) => {
      state.cancelledBookingsCountLoading = false;
      console.log("fetchCancelledBookingsCountSuccess - Payload:", action.payload);
      state.cancelledBookingsCount = action.payload;
    },
    fetchCancelledBookingsCountFailure: (state, action) => {
      state.cancelledBookingsCountLoading = false;
      state.cancelledBookingsCountError = action.payload;
    },
    fetchCompletedBookingsCountRequest: (state) => {
      state.completedBookingsCountLoading = true;
      state.completedBookingsCountError = null;
    },
    fetchCompletedBookingsCountSuccess: (state, action) => {
      state.completedBookingsCountLoading = false;
      console.log("fetchCompletedBookingsCountSuccess - Payload:", action.payload);
      state.completedBookingsCount = action.payload;
    },
    fetchCompletedBookingsCountFailure: (state, action) => {
      state.completedBookingsCountLoading = false;
      state.completedBookingsCountError = action.payload;
    },
    fetchTotalServiceRequestsPerMonthRequest: (state) => {
      state.totalServiceRequestsPerMonthLoading = true;
      state.totalServiceRequestsPerMonthError = null;
    },
    fetchTotalServiceRequestsPerMonthSuccess: (state, action) => {
      state.totalServiceRequestsPerMonthLoading = false;
      console.log("fetchTotalServiceRequestsPerMonthSuccess - Payload:", action.payload);
      state.totalServiceRequestsPerMonth = action.payload;
    },
    fetchTotalServiceRequestsPerMonthFailure: (state, action) => {
      state.totalServiceRequestsPerMonthLoading = false;
      state.totalServiceRequestsPerMonthError = action.payload;
    },
    createOrderRequest: (state) => {
      state.orderLoading = true;
      state.orderError = null;
      state.orderSuccess = false;
      state.orderData = null;
    },
    createOrderSuccess: (state, action) => {
      state.orderLoading = false;
      state.orderSuccess = true;
      state.orderData = action.payload;
      console.log("createOrderSuccess - Payload:", action.payload);
    },
    createOrderFailure: (state, action) => {
      state.orderLoading = false;
      state.orderError = action.payload;
    },
    clearOrderStatus: (state) => {
      state.orderLoading = false;
      state.orderError = null;
      state.orderSuccess = false;
      state.orderData = null;
    },
    verifyPaymentRequest: (state) => {
      state.paymentVerificationLoading = true;
      state.paymentVerificationError = null;
      state.paymentVerificationSuccess = false;
      state.paymentVerificationResponse = null;
    },
    verifyPaymentSuccess: (state, action) => {
      state.paymentVerificationLoading = false;
      state.paymentVerificationSuccess = true;
      state.paymentVerificationResponse = action.payload;
      if (action.payload.success && action.payload.subscription_id) {
        state.purchasedSubscriptions = [...new Set([...state.purchasedSubscriptions, action.payload.subscription_id])];
      }
      console.log("verifyPaymentSuccess - Payload:", action.payload);
    },
    verifyPaymentFailure: (state, action) => {
      state.paymentVerificationLoading = false;
      state.paymentVerificationError = action.payload;
    },
    clearPaymentVerificationStatus: (state) => {
      state.paymentVerificationLoading = false;
      state.paymentVerificationError = null;
      state.paymentVerificationSuccess = false;
      state.paymentVerificationResponse = null;
    },
    fetchVendorEarningsRequest: (state) => {
      state.vendorEarningsLoading = true;
      state.vendorEarningsError = null;
    },
    fetchVendorEarningsSuccess: (state, action) => {
      console.log("fetchVendorEarningsSuccess - Payload:", action.payload);
      state.vendorEarningsLoading = false;
      state.vendorEarnings = action.payload;
      state.vendorEarningsError = null;
    },
    fetchVendorEarningsFailure: (state, action) => {
      console.log("fetchVendorEarningsFailure - Error:", action.payload);
      state.vendorEarningsLoading = false;
      state.vendorEarningsError = action.payload;
    },
    fetchVendorPaymentDetailsRequest: (state) => {
      state.vendorPaymentDetailsLoading = true;
      state.vendorPaymentDetailsError = null;
    },
    fetchVendorPaymentDetailsSuccess: (state, action) => {
      state.vendorPaymentDetailsLoading = false;
      console.log("fetchVendorPaymentDetailsSuccess - Payload:", action.payload);
      state.purchasedSubscriptions = [...new Set(action.payload)];
    },
    fetchVendorPaymentDetailsFailure: (state, action) => {
      state.vendorPaymentDetailsLoading = false;
      state.vendorPaymentDetailsError = action.payload;
    },
    selectAdmin: (state, action) => {
      state.chat.adminId = action.payload;
      state.customerChat.customerId = null;
    },
    selectCustomer: (state, action) => {
      state.customerChat.customerId = action.payload;
      state.chat.adminId = null;
    },
    getChatRoomRequest: (state) => {
      state.chat.error = null;
    },
    getChatRoomSuccess: (state, action) => {
      state.chat.roomId = action.payload.roomId;
      state.chat.messages = [];
    },
    getChatRoomFailure: (state, action) => {
      state.chat.error = action.payload;
    },
    getCustomerChatRoomRequest: (state) => {
      state.customerChat.error = null;
    },
    getCustomerChatRoomSuccess: (state, action) => {
      state.customerChat.roomId = action.payload.roomId;
      state.customerChat.messages = [];
    },
    getCustomerChatRoomFailure: (state, action) => {
      state.customerChat.error = action.payload;
    },
  receiveMessage: (state, action) => {
  console.log("receiveMessage: Processing message with sent_at:", action.payload.sent_at);
  const { chat_room_id, sender_id, sender_type, message, sent_at, message_id } = action.payload;

  // Check if a message with the same message_id or identical content already exists
  const exists = state.chat.messages.some(
    (msg) =>
      msg.message_id === message_id ||
      (msg.chat_room_id === chat_room_id &&
        msg.sender_id === sender_id &&
        msg.sender_type === sender_type &&
        msg.message === message &&
        Math.abs(new Date(msg.sent_at).getTime() - new Date(sent_at).getTime()) < 1000) // Within 1 second
  );

  if (!exists) {
    state.chat.messages = [
      ...state.chat.messages,
      {
        chat_room_id,
        sender_id,
        sender_type,
        message,
        sent_at: normalizeSentAt(sent_at),
        message_id,
      },
    ];
  } else {
    console.log("receiveMessage: Skipping duplicate message:", action.payload);
  }
},

    
receiveCustomerMessage: (state, action) => {
  console.log("receiveCustomerMessage: Processing message with sent_at:", action.payload.sent_at);
  const { chat_room_id, sender_id, sender_type, message, sent_at, message_id } = action.payload;

  // Skip deduplication for customer-sent messages
  if (sender_type === "customer") {
    state.customerChat.messages = [
      ...state.customerChat.messages,
      {
        chat_room_id,
        sender_id,
        sender_type,
        message,
        sent_at: normalizeSentAt(sent_at),
        message_id: message_id || `temp-${Date.now()}`,
      },
    ];
    return;
  }

  // Deduplicate vendor-sent messages
  const exists = state.customerChat.messages.some(
    (msg) =>
      (msg.message_id === message_id && !message_id.startsWith("temp-")) ||
      (msg.chat_room_id === chat_room_id &&
        msg.sender_id === sender_id &&
        msg.sender_type === sender_type &&
        msg.message === message &&
        Math.abs(new Date(msg.sent_at).getTime() - new Date(sent_at).getTime()) < 6 * 60 * 60 * 1000) // 6-hour window
  );

  if (!exists) {
    state.customerChat.messages = [
      ...state.customerChat.messages,
      {
        chat_room_id,
        sender_id,
        sender_type,
        message,
        sent_at: normalizeSentAt(sent_at),
        message_id: message_id || `temp-${Date.now()}`,
      },
    ];
  } else {
    console.log("receiveCustomerMessage: Skipping duplicate message:", action.payload);
  }
},

    fetchChatHistoryRequest: (state) => {
      console.log("fetchChatHistoryRequest triggered");
      state.chat.chatHistoryLoading = true;
      state.chat.chatHistoryError = null;
    },
    fetchChatHistorySuccess: (state, action) => {
      console.log("fetchChatHistorySuccess payload:", action.payload);
      state.chat.chatHistoryLoading = false;
      state.chat.messages = Array.isArray(action.payload) ? action.payload.map(msg => ({
        message_id: msg.message_id,
        chat_room_id: msg.room_id || msg.chat_room_id,
        sender_type: msg.sender_type,
        sender_id: msg.sender_id,
        message: msg.message,
        sent_at: normalizeSentAt(msg.sent_at),
      })) : [];
      console.log("fetchChatHistorySuccess: Normalized messages:", state.chat.messages);
    },
    fetchChatHistoryFailure: (state, action) => {
      console.log("fetchChatHistoryFailure:", action.payload);
      state.chat.chatHistoryLoading = false;
      state.chat.chatHistoryError = action.payload;
    },
    fetchCustomerChatHistoryRequest: (state) => {
      console.log("fetchCustomerChatHistoryRequest triggered");
      state.customerChat.chatHistoryLoading = true;
      state.customerChat.chatHistoryError = null;
    },
    fetchCustomerChatHistorySuccess: (state, action) => {
      console.log("fetchCustomerChatHistorySuccess payload:", action.payload);
      state.customerChat.chatHistoryLoading = false;
      state.customerChat.messages = Array.isArray(action.payload) ? action.payload.map(msg => ({
        message_id: msg.message_id,
        chat_room_id: msg.room_id || msg.chat_room_id,
        sender_type: msg.sender_type,
        sender_id: msg.sender_id,
        message: msg.message,
        sent_at: normalizeSentAt(msg.sent_at),
      })) : [];
      console.log("fetchCustomerChatHistorySuccess: Normalized messages:", state.customerChat.messages);
    },
    fetchCustomerChatHistoryFailure: (state, action) => {
      console.log("fetchCustomerChatHistoryFailure:", action.payload);
      state.customerChat.chatHistoryLoading = false;
      state.customerChat.chatHistoryError = action.payload;
    },
    fetchServicesRequest: (state) => {
      state.servicesLoading = true;
      state.servicesError = null;
    },
    fetchServicesSuccess: (state, action) => {
      state.servicesLoading = false;
      console.log("fetchServicesSuccess - Payload:", action.payload);
      state.services = action.payload;
      state.servicesError = null;
    },
    fetchServicesFailure: (state, action) => {
      state.servicesLoading = false;
      state.servicesError = action.payload;
    },
    fetchVendorServicesRequest: (state) => {
      state.vendorServicesLoading = true;
      state.vendorServicesError = null;
    },
    fetchVendorServicesSuccess: (state, action) => {
      state.vendorServicesLoading = false;
      console.log("fetchVendorServicesSuccess - Payload:", action.payload);
      state.vendorServices = Array.isArray(action.payload) ? action.payload : [];
      state.vendorServicesError = null;
    },
    fetchVendorServicesFailure: (state, action) => {
      state.vendorServicesLoading = false;
      state.vendorServicesError = action.payload;
      state.vendorServices = [];
    },
    getVendorFreeTrialDetailsRequest: (state) => {
      state.getVendorFreeTrialDetailsLoading = true;
      state.getVendorFreeTrialDetailsError = null;
    },
    getVendorFreeTrialDetailsSuccess: (state, action) => {
      state.getVendorFreeTrialDetailsLoading = false;
      console.log("getVendorFreeTrialDetailsSuccess - Payload:", action.payload);
      state.getVendorFreeTrialDetailsSuccess = action.payload;
      state.getVendorFreeTrialDetailsError = null;
    },
    getVendorFreeTrialDetailsFailure: (state, action) => {
      state.getVendorFreeTrialDetailsLoading = false;
      state.getVendorFreeTrialDetailsError = action.payload;
    },
    updateVendorServiceRequest: (state) => {
      state.updateServiceLoading = true;
      state.updateServiceError = null;
      state.updateServiceSuccess = false;
    },
    updateVendorServiceSuccess: (state, action) => {
      state.updateServiceLoading = false;
      console.log("updateVendorServiceSuccess - Payload:", action.payload);
      state.updateServiceSuccess = true;
      state.vendorServices = state.vendorServices.map((service) =>
        service.id === action.payload.id ? { ...service, ...action.payload } : service
      );
    },
    updateVendorServiceFailure: (state, action) => {
      state.updateServiceLoading = false;
      state.updateServiceError = action.payload;
    },
    clearUpdateServiceStatus: (state) => {
      state.updateServiceSuccess = false;
      state.updateServiceError = null;
    },
  },
});

export const {
  vendorLoginRequest,
  vendorLoginSuccess,
  vendorLoginFailure,
  vendorLogout,
  fetchVendorProfileRequest,
  fetchVendorProfileSuccess,
  fetchVendorProfileFailure,
  fetchAdminsRequest,
  fetchAdminsSuccess,
  fetchAdminsFailure,
  fetchCustomersRequest,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  fetchSubscriptionsRequest,
  fetchSubscriptionsSuccess,
  fetchSubscriptionsFailure,
  updateVendorRequest,
  updateVendorSuccess,
  updateVendorFailure,
  clearUpdateStatus,
  vendorSignupRequest,
  vendorSignupSuccess,
  vendorSignupFailure,
  fetchComplaintsRequest,
  fetchComplaintsSuccess,
  fetchComplaintsFailure,
  insertComplaintRequest,
  insertComplaintSuccess,
  insertComplaintFailure,
  clearInsertStatus,
  updateComplaintRequest,
  updateComplaintSuccess,
  updateComplaintFailure,
  clearUpdateComplaintStatus,
  deleteComplaintRequest,
  deleteComplaintSuccess,
  deleteComplaintFailure,
  clearDeleteComplaintStatus,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  clearForgotPasswordStatus,
  fetchServiceRequestsRequest,
  fetchServiceRequestsSuccess,
  fetchServiceRequestsFailure,
  fetchCompletedRequestsRequest,
  fetchCompletedRequestsSuccess,
  fetchCompletedRequestsFailure,
  fetchFailedRequestsRequest,
  fetchFailedRequestsSuccess,
  fetchFailedRequestsFailure,
  updateServiceBookingRequest,
  updateServiceBookingSuccess,
  updateServiceBookingFailure,
  clearUpdateServiceBookingStatus,
  fetchCancelledBookingsCountRequest,
  fetchCancelledBookingsCountSuccess,
  fetchCancelledBookingsCountFailure,
  fetchCompletedBookingsCountRequest,
  fetchCompletedBookingsCountSuccess,
  fetchCompletedBookingsCountFailure,
  fetchTotalServiceRequestsPerMonthRequest,
  fetchTotalServiceRequestsPerMonthSuccess,
  fetchTotalServiceRequestsPerMonthFailure,
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  clearOrderStatus,
  verifyPaymentRequest,
  verifyPaymentSuccess,
  verifyPaymentFailure,
  clearPaymentVerificationStatus,
  fetchVendorEarningsRequest,
  fetchVendorEarningsSuccess,
  fetchVendorEarningsFailure,
  fetchVendorPaymentDetailsRequest,
  fetchVendorPaymentDetailsSuccess,
  fetchVendorPaymentDetailsFailure,
  selectAdmin,
  selectCustomer,
  getChatRoomRequest,
  getChatRoomSuccess,
  getChatRoomFailure,
  getCustomerChatRoomRequest,
  getCustomerChatRoomSuccess,
  getCustomerChatRoomFailure,
  receiveMessage,
  receiveCustomerMessage,
  fetchChatHistoryRequest,
  fetchChatHistorySuccess,
  fetchChatHistoryFailure,
  fetchCustomerChatHistoryRequest,
  fetchCustomerChatHistorySuccess,
  fetchCustomerChatHistoryFailure,
  fetchServicesRequest,
  fetchServicesSuccess,
  fetchServicesFailure,
  fetchVendorServicesRequest,
  fetchVendorServicesSuccess,
  fetchVendorServicesFailure,
  updateVendorServiceRequest,
  updateVendorServiceSuccess,
  updateVendorServiceFailure,
  clearUpdateServiceStatus,
  getVendorFreeTrialDetailsRequest,
  getVendorFreeTrialDetailsSuccess,
  getVendorFreeTrialDetailsFailure,
} = vendorSlice.actions;

export default vendorSlice.reducer;