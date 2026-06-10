import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    user: null,
    token: localStorage.getItem("adminToken") || null,
    isAuthenticated: !!localStorage.getItem("adminToken"),
    loading: false,
    error: null,
    forgotPasswordLoading: false,
    forgotPasswordError: null,
    forgotPasswordSuccess: false,
    otpLoading: false,
    otpError: null,
    otpSuccess: false,
    otpToken: null,
    updatePasswordLoading: false,
    updatePasswordError: null,
    updatePasswordSuccess: false,
    serviceCategories: [],
    addCategoryLoading: false,
    addCategoryError: null,
    addCategorySuccess: false,
    getCategoriesLoading: false,
    getCategoriesError: null,
    updateCategoryLoading: false,
    updateCategoryError: null,
    updateCategorySuccess: false,
    deleteCategoryLoading: false,
    deleteCategoryError: null,
    deleteCategorySuccess: false,
    subServices: [],
    addSubServiceLoading: false,
    addSubServiceError: null,
    addSubServiceSuccess: false,
    getSubServicesLoading: false,
    getSubServicesError: null,
    updateSubServiceLoading: false,
    updateSubServiceError: null,
    updateSubServiceSuccess: false,
    deleteSubServiceLoading: false,
    deleteSubServiceError: null,
    deleteSubServiceSuccess: false,
    vendors: [],
    getVendorsLoading: false,
    getVendorsError: null,
    blockVendorLoading: false,
    blockVendorError: null,
    unblockVendorLoading: false,
    unblockVendorError: null,
    customers: [],
    getCustomersLoading: false,
    getCustomersError: null,
    subscriptions: [],
    addSubscriptionLoading: false,
    addSubscriptionError: null,
    addSubscriptionSuccess: false,
    pendingVendors: [],
    getPendingVendorsLoading: false,
    getPendingVendorsError: null,
    approvedVendors: [],
    getApprovedVendorsLoading: false,
    getApprovedVendorsError: null,
    rejectedVendors: [],
    getRejectedVendorsLoading: false,
    getRejectedVendorsError: null,
    updateVendorStatusLoading: false,
    updateVendorStatusError: null,
    updateVendorStatusSuccess: false,
    userPaymentDetails: [],
    getUserPaymentDetailsLoading: false,
    getUserPaymentDetailsError: null,
    getSubscriptionsLoading: false,
    getSubscriptionsError: null,
    updateSubscriptionLoading: false,
    updateSubscriptionError: null,
    updateSubscriptionSuccess: false,
    deleteSubscriptionLoading: false,
    deleteSubscriptionError: null,
    deleteSubscriptionSuccess: false,
    allPaymentDetails: [],
    getAllPaymentDetailsLoading: false,
    getAllPaymentDetailsError: null,
    vendorComplaints: [],
    getVendorComplaintsLoading: false,
    getVendorComplaintsError: null,
    customerComplaints: [],
    getCustomerComplaintsLoading: false,
    getCustomerComplaintsError: null,
    customerServiceDetails: [],
    getCustomerServiceDetailsLoading: false,
    getCustomerServiceDetailsError: null,
    updateServiceBookingLoading: false,
    updateServiceBookingError: null,
    updateServiceBookingSuccess: false,
    vendorPaymentDetails: [],
    getVendorPaymentDetailsLoading: false,
    getVendorPaymentDetailsError: null,
    chat: {
      roomId: null,
      vendorId: null,
      messages: [],
      loading: false,
      error: null,
      chatHistoryLoading: false,
      chatHistoryError: null,
    },
  },
  reducers: {
    adminLoginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    adminLoginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("adminToken", action.payload.token);
      localStorage.setItem("adminId", action.payload.user.id.toString());
    },
    adminLoginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminId");
    },
    adminLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminId");
    },
    forgetPasswordRequest: (state) => {
      state.forgotPasswordLoading = true;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    forgetPasswordSuccess: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = true;
    },
    forgetPasswordFailure: (state, action) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = action.payload;
    },
    verifyOtpRequest: (state) => {
      state.otpLoading = true;
      state.otpError = null;
      state.otpSuccess = false;
    },
    verifyOtpSuccess: (state, action) => {
      state.otpLoading = false;
      state.otpSuccess = true;
      state.otpToken = action.payload?.token || null;
    },
    verifyOtpFailure: (state, action) => {
      state.otpLoading = false;
      state.otpError = action.payload;
    },
    updatePasswordRequest: (state) => {
      state.updatePasswordLoading = true;
      state.updatePasswordError = null;
      state.updatePasswordSuccess = false;
    },
    updatePasswordSuccess: (state) => {
      state.updatePasswordLoading = false;
      state.updatePasswordSuccess = true;
      state.otpToken = null;
    },
    updatePasswordFailure: (state, action) => {
      state.updatePasswordLoading = false;
      state.updatePasswordError = action.payload;
    },
    resetForgotPassword: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
      state.otpLoading = false;
      state.otpError = null;
      state.otpSuccess = false;
      state.otpToken = null;
      state.updatePasswordLoading = false;
      state.updatePasswordError = null;
      state.updatePasswordSuccess = false;
    },
    addServiceCategoryRequest: (state) => {
      state.addCategoryLoading = true;
      state.addCategoryError = null;
      state.addCategorySuccess = false;
    },
    addServiceCategorySuccess: (state, action) => {
      state.addCategoryLoading = false;
      state.serviceCategories.push(action.payload);
      state.addCategorySuccess = true;
      state.addCategoryError = null;
    },
    addServiceCategoryFailure: (state, action) => {
      state.addCategoryLoading = false;
      state.addCategoryError = action.payload;
      state.addCategorySuccess = false;
    },
    resetAddCategory: (state) => {
      state.addCategoryLoading = false;
      state.addCategoryError = null;
      state.addCategorySuccess = false;
    },
    getServiceCategoriesRequest: (state) => {
      state.getCategoriesLoading = true;
      state.getCategoriesError = null;
    },
    getServiceCategoriesSuccess: (state, action) => {
      state.getCategoriesLoading = false;
      state.serviceCategories = action.payload.map((cat) => ({
        service_cat_id: cat.service_cat_id,
        service_name: cat.service_category_name,
        service_description: cat.service_desc,
        service_image_url: cat.service_category_url,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
      }));
    },
    getServiceCategoriesFailure: (state, action) => {
      state.getCategoriesLoading = false;
      state.getCategoriesError = action.payload;
    },
    updateServiceCategoryRequest: (state) => {
      state.updateCategoryLoading = true;
      state.updateCategoryError = null;
      state.updateCategorySuccess = false;
    },
    updateServiceCategorySuccess: (state, action) => {
      state.updateCategoryLoading = false;
      state.updateCategorySuccess = true;
      state.updateCategoryError = null;
      const updatedCategory = {
        service_cat_id: action.payload.service_cat_id,
        service_name: action.payload.service_category_name,
        service_description: action.payload.service_desc || null,
        service_image_url: action.payload.service_category_url || null,
        created_at: action.payload.created_at,
        updated_at: action.payload.updated_at,
      };
      const index = state.serviceCategories.findIndex(
        (cat) => cat.service_cat_id === updatedCategory.service_cat_id
      );
      if (index !== -1) {
        state.serviceCategories[index] = updatedCategory;
      } else {
        state.serviceCategories.push(updatedCategory);
      }
    },
    updateServiceCategoryFailure: (state, action) => {
      state.updateCategoryLoading = false;
      state.updateCategoryError = action.payload;
      state.updateCategorySuccess = false;
    },
    resetUpdateCategory: (state) => {
      state.updateCategoryLoading = false;
      state.updateCategoryError = null;
      state.updateCategorySuccess = false;
    },
    deleteServiceCategoryRequest: (state) => {
      state.deleteCategoryLoading = true;
      state.deleteCategoryError = null;
      state.deleteCategorySuccess = false;
    },
    deleteServiceCategorySuccess: (state, action) => {
      state.deleteCategoryLoading = false;
      state.deleteCategorySuccess = true;
      state.deleteCategoryError = null;
      state.serviceCategories = state.serviceCategories.filter(
        (cat) => cat.service_cat_id !== action.payload
      );
    },
    deleteServiceCategoryFailure: (state, action) => {
      state.deleteCategoryLoading = false;
      state.deleteCategoryError = action.payload;
      state.deleteCategorySuccess = false;
    },
    resetDeleteCategory: (state) => {
      state.deleteCategoryLoading = false;
      state.deleteCategoryError = null;
      state.deleteCategorySuccess = false;
    },
    addSubServiceRequest: (state) => {
      state.addSubServiceLoading = true;
      state.addSubServiceError = null;
      state.addSubServiceSuccess = false;
    },
    addSubServiceSuccess: (state, action) => {
      state.addSubServiceLoading = false;
      state.subServices.push(action.payload);
      state.addSubServiceSuccess = true;
      state.addSubServiceError = null;
    },
    addSubServiceFailure: (state, action) => {
      state.addSubServiceLoading = false;
      state.addSubServiceError = action.payload;
      state.addSubServiceSuccess = false;
    },
    resetAddSubService: (state) => {
      state.addSubServiceLoading = false;
      state.addSubServiceError = null;
      state.addSubServiceSuccess = false;
    },
    getSubServicesRequest: (state) => {
      state.getSubServicesLoading = true;
      state.getSubServicesError = null;
    },
    getSubServicesSuccess: (state, action) => {
      state.getSubServicesLoading = false;
      state.subServices = action.payload;
    },
    getSubServicesFailure: (state, action) => {
      state.getSubServicesLoading = false;
      state.getSubServicesError = action.payload;
    },
    updateSubServiceRequest: (state) => {
      state.updateSubServiceLoading = true;
      state.updateSubServiceError = null;
      state.updateSubServiceSuccess = false;
    },
    updateSubServiceSuccess: (state, action) => {
      state.updateSubServiceLoading = false;
      state.updateSubServiceSuccess = true;
      state.updateSubServiceError = null;
      const updatedSubService = action.payload;
      const index = state.subServices.findIndex(
        (sub) => sub.sub_service_id === updatedSubService.sub_service_id
      );
      if (index !== -1) {
        state.subServices[index] = updatedSubService;
      }
    },
    updateSubServiceFailure: (state, action) => {
      state.updateSubServiceLoading = false;
      state.updateSubServiceError = action.payload;
      state.updateSubServiceSuccess = false;
    },
    resetUpdateSubService: (state) => {
      state.updateSubServiceLoading = false;
      state.updateSubServiceError = null;
      state.updateSubServiceSuccess = false;
    },
    deleteSubServiceRequest: (state) => {
      state.deleteSubServiceLoading = true;
      state.deleteSubServiceError = null;
      state.deleteSubServiceSuccess = false;
    },
    deleteSubServiceSuccess: (state, action) => {
      state.deleteSubServiceLoading = false;
      state.deleteSubServiceSuccess = true;
      state.deleteSubServiceError = null;
      state.subServices = state.subServices.filter(
        (sub) => sub.sub_service_id !== action.payload.subServiceId
      );
    },
    deleteSubServiceFailure: (state, action) => {
      state.deleteSubServiceLoading = false;
      state.deleteSubServiceError = action.payload;
      state.deleteSubServiceSuccess = false;
    },
    resetDeleteSubService: (state) => {
      state.deleteSubServiceLoading = false;
      state.deleteSubServiceError = null;
      state.deleteSubServiceSuccess = false;
    },
    getVendorsRequest: (state) => {
      state.getVendorsLoading = true;
      state.getVendorsError = null;
    },
    getVendorsSuccess: (state, action) => {
      state.getVendorsLoading = false;
      state.vendors = action.payload;
    },
    getVendorsFailure: (state, action) => {
      state.getVendorsLoading = false;
      state.getVendorsError = action.payload;
    },
    blockVendorRequest: (state) => {
      state.blockVendorLoading = true;
      state.blockVendorError = null;
    },
     blockVendorSuccess: (state, action) => {
      state.blockVendorLoading = false;
      const { vendor_id, blocked_reason } = action.payload;
      state.vendors = state.vendors.map((vendor) =>
        vendor.vendor_id === vendor_id
          ? {
              ...vendor,
              is_blocked: 1,
              blocked_reason: blocked_reason || vendor.blocked_reason,
              blocked_date: new Date().toISOString(),
            }
          : vendor
      );
    },
    blockVendorFailure: (state, action) => {
      state.blockVendorLoading = false;
      state.blockVendorError = action.payload;
    },
    unblockVendorRequest: (state) => {
      state.unblockVendorLoading = true;
      state.unblockVendorError = null;
    },
    unblockVendorSuccess: (state, action) => {
      state.unblockVendorLoading = false;
      const { vendor_id } = action.payload;
      state.vendors = state.vendors.map((vendor) =>
        vendor.vendor_id === vendor_id
          ? { ...vendor, is_blocked: 0, blocked_date: null }
          : vendor
      );
    },
    unblockVendorFailure: (state, action) => {
      state.unblockVendorLoading = false;
      state.unblockVendorError = action.payload;
    },
    getCustomersRequest: (state) => {
      state.getCustomersLoading = true;
      state.getCustomersError = null;
      state.userPaymentDetails = [];
    },
    getCustomersSuccess: (state, action) => {
      state.getCustomersLoading = false;
      state.customers = action.payload;
    },
    getCustomersFailure: (state, action) => {
      state.getCustomersLoading = false;
      state.getCustomersError = action.payload;
    },
    getCustomerServiceDetailsRequest: (state) => {
      state.getCustomerServiceDetailsLoading = true;
      state.getCustomerServiceDetailsError = null;
    },
    getCustomerServiceDetailsSuccess: (state, action) => {
      state.getCustomerServiceDetailsLoading = false;
      state.customerServiceDetails = action.payload;
    },
    getCustomerServiceDetailsFailure: (state, action) => {
      state.getCustomerServiceDetailsLoading = false;
      state.getCustomerServiceDetailsError = action.payload;
    },
    addSubscriptionRequest: (state) => {
      state.addSubscriptionLoading = true;
      state.addSubscriptionError = null;
      state.addSubscriptionSuccess = false;
    },
    addSubscriptionSuccess: (state, action) => {
      state.addSubscriptionLoading = false;
      state.subscriptions.push(action.payload);
      state.addSubscriptionSuccess = true;
      state.addSubscriptionError = null;
    },
    addSubscriptionFailure: (state, action) => {
      state.addSubscriptionLoading = false;
      state.addSubscriptionError = action.payload;
      state.addSubscriptionSuccess = false;
    },
    resetAddSubscription: (state) => {
      state.addSubscriptionLoading = false;
      state.addSubscriptionError = null;
      state.addSubscriptionSuccess = false;
    },
    getPendingVendorsRequest: (state) => {
      state.getPendingVendorsLoading = true;
      state.getPendingVendorsError = null;
    },
    getPendingVendorsSuccess: (state, action) => {
      state.getPendingVendorsLoading = false;
      state.pendingVendors = action.payload;
    },
    getPendingVendorsFailure: (state, action) => {
      state.getPendingVendorsLoading = false;
      state.getPendingVendorsError = action.payload;
    },
    getApprovedVendorsRequest: (state) => {
      state.getApprovedVendorsLoading = true;
      state.getApprovedVendorsError = null;
    },
    getApprovedVendorsSuccess: (state, action) => {
      state.getApprovedVendorsLoading = false;
      state.approvedVendors = action.payload;
    },
    getApprovedVendorsFailure: (state, action) => {
      state.getApprovedVendorsLoading = false;
      state.getApprovedVendorsError = action.payload;
    },
    getRejectedVendorsRequest: (state) => {
      state.getRejectedVendorsLoading = true;
      state.getRejectedVendorsError = null;
    },
    getRejectedVendorsSuccess: (state, action) => {
      state.getRejectedVendorsLoading = false;
      state.rejectedVendors = action.payload;
    },
    getRejectedVendorsFailure: (state, action) => {
      state.getRejectedVendorsLoading = false;
      state.getRejectedVendorsError = action.payload;
    },
    updateVendorStatusRequest: (state) => {
      state.updateVendorStatusLoading = true;
      state.updateVendorStatusError = null;
      state.updateVendorStatusSuccess = false;
    },
    updateVendorStatusSuccess: (state, action) => {
      state.updateVendorStatusLoading = false;
      state.updateVendorStatusSuccess = true;
      state.pendingVendors = state.pendingVendors.filter(
        (vendor) => vendor.vendor_id !== action.payload.vendor_id
      );
    },
    updateVendorStatusFailure: (state, action) => {
      state.updateVendorStatusLoading = false;
      state.updateVendorStatusError = action.payload;
    },
    resetUpdateVendorStatus: (state) => {
      state.updateVendorStatusLoading = false;
      state.updateVendorStatusError = null;
      state.updateVendorStatusSuccess = false;
    },
    getUserPaymentDetailsRequest: (state) => {
      state.getUserPaymentDetailsLoading = true;
      state.getUserPaymentDetailsError = null;
    },
    getUserPaymentDetailsSuccess: (state, action) => {
      state.getUserPaymentDetailsLoading = false;
      state.userPaymentDetails = action.payload;
    },
    getUserPaymentDetailsFailure: (state, action) => {
      state.getUserPaymentDetailsLoading = false;
      state.getUserPaymentDetailsError = action.payload;
    },
    getSubscriptionsRequest: (state) => {
      state.getSubscriptionsLoading = true;
      state.getSubscriptionsError = null;
    },
    getSubscriptionsSuccess: (state, action) => {
      state.getSubscriptionsLoading = false;
      state.subscriptions = action.payload;
    },
    getSubscriptionsFailure: (state, action) => {
      state.getSubscriptionsLoading = false;
      state.getSubscriptionsError = action.payload;
    },
    updateSubscriptionRequest: (state) => {
      state.updateSubscriptionLoading = true;
      state.updateSubscriptionError = null;
      state.updateSubscriptionSuccess = false;
    },
    updateSubscriptionSuccess: (state, action) => {
      state.updateSubscriptionLoading = false;
      state.updateSubscriptionSuccess = true;
      const updatedSubscription = action.payload;
      const index = state.subscriptions.findIndex(
        (sub) => sub.subscription_id === updatedSubscription.subscription_id
      );
      if (index !== -1) {
        state.subscriptions[index] = updatedSubscription;
      }
    },
    updateSubscriptionFailure: (state, action) => {
      state.updateSubscriptionLoading = false;
      state.updateSubscriptionError = action.payload;
      state.updateSubscriptionSuccess = false;
    },
    deleteSubscriptionRequest: (state) => {
      state.deleteSubscriptionLoading = true;
      state.deleteSubscriptionError = null;
      state.deleteSubscriptionSuccess = false;
    },
    deleteSubscriptionSuccess: (state, action) => {
      state.deleteSubscriptionLoading = false;
      state.deleteSubscriptionSuccess = true;
      state.subscriptions = state.subscriptions.filter(
        (sub) => sub.subscription_id !== action.payload
      );
    },
    deleteSubscriptionFailure: (state, action) => {
      state.deleteSubscriptionLoading = false;
      state.deleteSubscriptionError = action.payload;
      state.deleteSubscriptionSuccess = false;
    },
    resetSubscriptionActions: (state) => {
      state.updateSubscriptionLoading = false;
      state.updateSubscriptionError = null;
      state.updateSubscriptionSuccess = false;
      state.deleteSubscriptionLoading = false;
      state.deleteSubscriptionError = null;
      state.deleteSubscriptionSuccess = false;
    },
    getAllPaymentDetailsRequest: (state) => {
      state.getAllPaymentDetailsLoading = true;
      state.getAllPaymentDetailsError = null;
    },
    getAllPaymentDetailsSuccess: (state, action) => {
      state.getAllPaymentDetailsLoading = false;
      state.allPaymentDetails = action.payload;
    },
    getAllPaymentDetailsFailure: (state, action) => {
      state.getAllPaymentDetailsLoading = false;
      state.getAllPaymentDetailsError = action.payload;
    },
    getVendorComplaintsRequest: (state) => {
      state.getVendorComplaintsLoading = true;
      state.getVendorComplaintsError = null;
    },
    getVendorComplaintsSuccess: (state, action) => {
      state.getVendorComplaintsLoading = false;
      state.vendorComplaints = action.payload;
    },
    getVendorComplaintsFailure: (state, action) => {
      state.getVendorComplaintsLoading = false;
      state.getVendorComplaintsError = action.payload;
    },
    getCustomerComplaintsRequest: (state) => {
      state.getCustomerComplaintsLoading = true;
      state.getCustomerComplaintsError = null;
    },
    getCustomerComplaintsSuccess: (state, action) => {
      state.getCustomerComplaintsLoading = false;
      state.customerComplaints = action.payload;
    },
    getCustomerComplaintsFailure: (state, action) => {
      state.getCustomerComplaintsLoading = false;
      state.getCustomerComplaintsError = action.payload;
    },
    getVendorPaymentDetailsRequest: (state) => {
      state.getVendorPaymentDetailsLoading = true;
      state.getVendorPaymentDetailsError = null;
      state.vendorPaymentDetails = [];
    },
    getVendorPaymentDetailsSuccess: (state, action) => {
      state.getVendorPaymentDetailsLoading = false;
      state.vendorPaymentDetails = action.payload;
    },
    getVendorPaymentDetailsFailure: (state, action) => {
      state.getVendorPaymentDetailsLoading = false;
      state.getVendorPaymentDetailsError = action.payload;
    },
    selectVendor: (state, action) => {
      state.chat.vendorId = action.payload;
      state.chat.roomId = null;
      state.chat.messages = [];
      state.chat.chatHistoryLoading = false;
      state.chat.chatHistoryError = null;
    },
    getChatRoomRequest: (state) => {
      state.chat.loading = true;
      state.chat.error = null;
    },
    getChatRoomSuccess: (state, action) => {
      state.chat.loading = false;
      state.chat.roomId = action.payload.roomId;
      state.chat.vendorId = action.payload.vendorId;
      state.chat.messages = [];
      state.chat.chatHistoryLoading = false;
      state.chat.chatHistoryError = null;
    },
    getChatRoomFailure: (state, action) => {
      state.chat.loading = false;
      state.chat.error = action.payload;
    },
    receiveMessage: (state, action) => {
      console.log("receiveMessage payload:", action.payload);
      state.chat.messages = [
        ...state.chat.messages,
        {
          room_id: action.payload.room_id,
          sender_id: action.payload.sender_id,
          sender_type: action.payload.sender_type,
          message: action.payload.message,
          sent_at: action.payload.sent_at,
        },
      ];
    },
    fetchChatHistoryRequest: (state) => {
      console.log("fetchChatHistoryRequest triggered");
      state.chat.chatHistoryLoading = true;
      state.chat.chatHistoryError = null;
    },
    fetchChatHistorySuccess: (state, action) => {
      console.log("fetchChatHistorySuccess payload:", action.payload);
      state.chat.chatHistoryLoading = false;
      state.chat.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    fetchChatHistoryFailure: (state, action) => {
      console.log("fetchChatHistoryFailure:", action.payload);
      state.chat.chatHistoryLoading = false;
      state.chat.chatHistoryError = action.payload;
    },
    updateServiceBookingRequest: (state) => {
      state.updateServiceBookingLoading = true;
      state.updateServiceBookingError = null;
      state.updateServiceBookingSuccess = false;
    },
    updateServiceBookingSuccess: (state) => {
      state.updateServiceBookingLoading = false;
      state.updateServiceBookingSuccess = true;
    },
    updateServiceBookingFailure: (state, action) => {
      state.updateServiceBookingLoading = false;
      state.updateServiceBookingError = action.payload;
    },
    resetUpdateServiceBooking: (state) => {
      state.updateServiceBookingLoading = false;
      state.updateServiceBookingError = null;
      state.updateServiceBookingSuccess = false;
    },
  },
});

export const {
  adminLoginRequest,
  adminLoginSuccess,
  adminLoginFailure,
  adminLogout,
  forgetPasswordRequest,
  forgetPasswordSuccess,
  forgetPasswordFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  updatePasswordRequest,
  updatePasswordSuccess,
  updatePasswordFailure,
  resetForgotPassword,
  addServiceCategoryRequest,
  addServiceCategorySuccess,
  addServiceCategoryFailure,
  resetAddCategory,
  getServiceCategoriesRequest,
  getServiceCategoriesSuccess,
  getServiceCategoriesFailure,
  updateServiceCategoryRequest,
  updateServiceCategorySuccess,
  updateServiceCategoryFailure,
  resetUpdateCategory,
  deleteServiceCategoryRequest,
  deleteServiceCategorySuccess,
  deleteServiceCategoryFailure,
  resetDeleteCategory,
  addSubServiceRequest,
  addSubServiceSuccess,
  addSubServiceFailure,
  resetAddSubService,
  getSubServicesRequest,
  getSubServicesSuccess,
  getSubServicesFailure,
  updateSubServiceRequest,
  updateSubServiceSuccess,
  updateSubServiceFailure,
  resetUpdateSubService,
  deleteSubServiceRequest,
  deleteSubServiceSuccess,
  deleteSubServiceFailure,
  resetDeleteSubService,
  getVendorsRequest,
  getVendorsSuccess,
  getVendorsFailure,
  blockVendorRequest,
  blockVendorSuccess,
  blockVendorFailure,
  unblockVendorRequest,
  unblockVendorSuccess,
  unblockVendorFailure,
  getCustomersRequest,
  getCustomersSuccess,
  getCustomersFailure,
  getCustomerServiceDetailsRequest,
  getCustomerServiceDetailsSuccess,
  getCustomerServiceDetailsFailure,
  addSubscriptionRequest,
  addSubscriptionSuccess,
  addSubscriptionFailure,
  resetAddSubscription,
  getPendingVendorsRequest,
  getPendingVendorsSuccess,
  getPendingVendorsFailure,
  getApprovedVendorsRequest,
  getApprovedVendorsSuccess,
  getApprovedVendorsFailure,
  getRejectedVendorsRequest,
  getRejectedVendorsSuccess,
  getRejectedVendorsFailure,
  updateVendorStatusRequest,
  updateVendorStatusSuccess,
  updateVendorStatusFailure,
  resetUpdateVendorStatus,
  getUserPaymentDetailsRequest,
  getUserPaymentDetailsSuccess,
  getUserPaymentDetailsFailure,
  getSubscriptionsRequest,
  getSubscriptionsSuccess,
  getSubscriptionsFailure,
  updateSubscriptionRequest,
  updateSubscriptionSuccess,
  updateSubscriptionFailure,
  deleteSubscriptionRequest,
  deleteSubscriptionSuccess,
  deleteSubscriptionFailure,
  resetSubscriptionActions,
  getAllPaymentDetailsRequest,
  getAllPaymentDetailsSuccess,
  getAllPaymentDetailsFailure,
  getVendorComplaintsRequest,
  getVendorComplaintsSuccess,
  getVendorComplaintsFailure,
  getCustomerComplaintsRequest,
  getCustomerComplaintsSuccess,
  getCustomerComplaintsFailure,
  getVendorPaymentDetailsRequest,
  getVendorPaymentDetailsSuccess,
  getVendorPaymentDetailsFailure,
  selectVendor,
  getChatRoomRequest,
  getChatRoomSuccess,
  getChatRoomFailure,
  receiveMessage,
  fetchChatHistoryRequest,
  fetchChatHistorySuccess,
  fetchChatHistoryFailure,
  updateServiceBookingRequest,
  updateServiceBookingSuccess,
  updateServiceBookingFailure,
  resetUpdateServiceBooking,
} = adminSlice.actions;

export default adminSlice.reducer;