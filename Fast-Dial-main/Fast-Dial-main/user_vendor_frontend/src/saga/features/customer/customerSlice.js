 import { createSlice } from '@reduxjs/toolkit';

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    user: null,
    token: null,
    newUser: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    signupLoading: false,
    signupError: null,
    serviceCategories: [],
    categoriesLoading: false,
    categoriesError: null,
    services: [],
    servicesLoading: false,
    servicesError: null,
    sliderImages: [],
    sliderLoading: false,
    sliderError: null,
    registerLoading: false,
    registerError: null,
    registeredCustomerId: null,
    customerData: null,
    customerLoading: false,
    customerError: null,
    updateCustomerLoading: false,
    updateCustomerError: null,
    complaints: [],
    complaintsLoading: false,
    complaintsError: null,
    insertComplaintLoading: false,
    insertComplaintError: null,
    updateComplaintLoading: false,
    updateComplaintError: null,
    deleteComplaintLoading: false,
    deleteComplaintError: null,
    singleService: null,
    singleServiceLoading: false,
    singleServiceError: null,
    vendors: [],
    vendorsLoading: false,
    vendorsError: null,
    vendorsForChat: [],
    vendorsForChatLoading: false,
    vendorsForChatError: null,
    servicecategoriesLoading: false,
    serviceCategoriesget: [],
    servicecategoriesError: null,
    selectedCategory: null,
    servicesByCategory: [],
    servicesByCategoryLoading: false,
    servicesByCategoryError: null,
    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
    insertReviewLoading: false,
    insertReviewError: null,
    updateReviewLoading: false,
    updateReviewError: null,
    deleteReviewLoading: false,
    deleteReviewError: null,
    chat: {
      roomId: null,
      vendorId: null,
      messages: [],
      chatHistoryLoading: false,
      chatHistoryError: null,
    },
    bookingLoading: false,
    bookingError: null,
    lastBookingId: null,
    vendorsWithServices: [],
    vendorsWithServicesLoading: false,
    vendorsWithServicesError: null,
    customerServiceDetails: [],
    customerServiceDetailsLoading: false,
    customerServiceDetailsError: null,
    bookings: {
      upcoming: [],
      completed: [],
      cancelled: [],
      bookingsLoading: false,
      bookingsError: null,
    },
    paymentInitiateLoading: false,
    paymentInitiateError: null,
    paymentInitiateSuccess: false,
    paymentOrderData: null,
    paymentVerificationLoading: false,
    paymentVerificationError: null,
    paymentVerificationSuccess: false,
    paymentVerificationResponse: null,
    bookingDetailsLoading: false,
    bookingDetailsError: null,
    bookingDetailsSuccess: false,
    bookingDetailsResponse: null,
    paymentInitiateBookNowLoading: false,
    paymentInitiateBookNowError: null,
    paymentInitiateBookNowSuccess: false,
    paymentVerifyBookNowLoading: false,
    paymentVerifyBookNowError: null,
    paymentVerifyBookNowSuccess: false,
    paymentVerifyBookNowResponse: null,
    selectedPaymentMethod: null,
    customerAddresses: [],
    insertAddressLoading: false,
    insertAddressError: null,
    getCustomerAddressLoading: false,
    getCustomerAddressError: null,
    selectedAddressId: null,
    selectedAddress: null,
  },
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      console.log('loginSuccess reducer called with:', action.payload);
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.newUser = action.payload.new_user;
      state.isAuthenticated = true;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    restoreUser: (state, action) => {
      console.log('restoreUser reducer called with:', action.payload);
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      console.log('logout: State cleared');
      state.user = null;
      state.token = null;
      state.newUser = null;
      state.isAuthenticated = false;
      state.customerData = null;
      state.vendors = [];
      state.vendorsError = null;
      state.vendorsForChat = [];
      state.vendorsForChatError = null;
      state.vendorsWithServices = [];
      state.vendorsWithServicesError = null;
      state.reviews = [];
      state.reviewsError = null;
      state.chat = {
        roomId: null,
        vendorId: null,
        messages: [],
        chatHistoryLoading: false,
        chatHistoryError: null,
      };
      localStorage.removeItem('token');
      localStorage.removeItem('customer_id');
    },
    signupRequest: (state) => {
      state.signupLoading = true;
      state.signupError = null;
    },
    signupSuccess: (state) => {
      state.signupLoading = false;
    },
    signupFailure: (state, action) => {
      state.signupLoading = false;
      state.signupError = action.payload;
    },
    getServiceCategoriesRequest: (state) => {
      state.categoriesLoading = true;
      state.categoriesError = null;
    },
    getServiceCategoriesSuccess: (state, action) => {
      state.categoriesLoading = false;
      state.serviceCategories = action.payload;
    },
    getServiceCategoriesFailure: (state, action) => {
      state.categoriesLoading = false;
      state.categoriesError = action.payload;
    },
    getServicesRequest: (state) => {
      state.servicesLoading = true;
      state.servicesError = null;
    },
    getServicesSuccess: (state, action) => {
      state.servicesLoading = false;
      state.services = action.payload;
    },
    getServicesFailure: (state, action) => {
      state.servicesLoading = false;
      state.servicesError = action.payload;
    },
    getSliderImagesRequest: (state) => {
      state.sliderLoading = true;
      state.sliderError = null;
    },
    getSliderImagesSuccess: (state, action) => {
      state.sliderLoading = false;
      state.sliderImages = action.payload;
    },
    getSliderImagesFailure: (state, action) => {
      state.sliderLoading = false;
      state.sliderError = action.payload;
    },
    registerCustomerRequest: (state) => {
      state.registerLoading = true;
      state.registerError = null;
    },
    registerCustomerSuccess: (state, action) => {
      state.registerLoading = false;
      state.registerError = null;
      state.registeredCustomerId = action.payload.id;
    },
    registerCustomerFailure: (state, action) => {
      state.registerLoading = false;
      state.registerError = action.payload;
    },
    getCustomerDataRequest: (state, action) => {
      console.log('getCustomerDataRequest: Action dispatched with payload:', action.payload);
      state.customerLoading = true;
      state.customerError = null;
    },
    getSingleServiceRequest: (state) => {
      state.singleServiceLoading = true;
      state.singleServiceError = null;
    },
    getSingleServiceSuccess: (state, action) => {
      state.singleServiceLoading = false;
      state.singleService = action.payload;
    },
    getSingleServiceFailure: (state, action) => {
      state.singleServiceLoading = false;
      state.singleServiceError = action.payload;
    },
    getCustomerDataSuccess: (state, action) => {
      state.customerLoading = false;
      state.customerData = Array.isArray(action.payload) ? action.payload[0] : action.payload;
    },
    getCustomerDataFailure: (state, action) => {
      state.customerLoading = false;
      state.customerError = action.payload;
    },
    updateCustomerRequest: (state) => {
      state.updateCustomerLoading = true;
      state.updateCustomerError = null;
    },
    updateCustomerSuccess: (state, action) => {
      state.updateCustomerLoading = false;
      const updatedData = Array.isArray(action.payload) ? action.payload[0] : action.payload;
      state.customerData = {
        ...state.customerData,
        ...updatedData,
        customer_name: updatedData.customer_name || state.customerData?.customer_name,
        mobile: updatedData.mobile || state.customerData?.mobile,
        gender: updatedData.gender || state.customerData?.gender,
        customer_country: updatedData.customer_country || state.customerData?.customer_country,
        customer_email: updatedData.customer_email || state.customerData?.customer_email,
        customer_address: updatedData.customer_address || state.customerData?.customer_address,
        customer_image: updatedData.customer_image || state.customerData?.customer_image,
      };
    },
    updateCustomerFailure: (state, action) => {
      state.updateCustomerLoading = false;
      state.updateCustomerError = action.payload;
    },
    insertComplaintRequest: (state) => {
      state.insertComplaintLoading = true;
      state.insertComplaintError = null;
    },
    insertComplaintSuccess: (state) => {
      state.insertComplaintLoading = false;
    },
    insertComplaintFailure: (state, action) => {
      state.insertComplaintLoading = false;
      state.insertComplaintError = action.payload;
    },
    getComplaintsRequest: (state) => {
      state.complaintsLoading = true;
      state.complaintsError = null;
    },
    getComplaintsSuccess: (state, action) => {
      state.complaintsLoading = false;
      state.complaints = action.payload;
    },
    getComplaintsFailure: (state, action) => {
      state.complaintsLoading = false;
      state.complaintsError = action.payload;
    },
    updateComplaintRequest: (state) => {
      state.updateComplaintLoading = true;
      state.updateComplaintError = null;
    },
    updateComplaintSuccess: (state, action) => {
      state.updateComplaintLoading = false;
      state.complaints = state.complaints.map((complaint) =>
        complaint.cust_comp_id === action.payload.cust_comp_id
          ? { ...complaint, ...action.payload }
          : complaint
      );
    },
    updateComplaintFailure: (state, action) => {
      state.updateComplaintLoading = false;
      state.updateComplaintError = action.payload;
    },
    deleteComplaintRequest: (state) => {
      state.deleteComplaintLoading = true;
      state.deleteComplaintError = null;
    },
    deleteComplaintSuccess: (state, action) => {
      state.deleteComplaintLoading = false;
      state.complaints = state.complaints.filter(
        (complaint) => complaint.cust_comp_id !== action.payload
      );
    },
    deleteComplaintFailure: (state, action) => {
      state.deleteComplaintLoading = false;
      state.deleteComplaintError = action.payload;
    },
    getVendorsRequest: (state) => {
      state.vendorsLoading = true;
      state.vendorsError = null;
    },
    getVendorsSuccess: (state, action) => {
      state.vendorsLoading = false;
      state.vendors = action.payload;
    },
    getVendorsFailure: (state, action) => {
      state.vendorsLoading = false;
      state.vendorsError = action.payload;
    },
    getVendorsForChatRequest: (state) => {
      state.vendorsForChatLoading = true;
      state.vendorsForChatError = null;
    },
    getVendorsForChatSuccess: (state, action) => {
      state.vendorsForChatLoading = false;
      state.vendorsForChat = action.payload;
    },
    getVendorsForChatFailure: (state, action) => {
      state.vendorsForChatLoading = false;
      state.vendorsForChatError = action.payload;
    },
    insertReviewRequest: (state) => {
      state.insertReviewLoading = true;
      state.insertReviewError = null;
    },
    insertReviewSuccess: (state) => {
      state.insertReviewLoading = false;
    },
    insertReviewFailure: (state, action) => {
      state.insertReviewLoading = false;
      state.insertReviewError = action.payload;
    },
    getReviewsRequest: (state) => {
      state.reviewsLoading = true;
      state.reviewsError = null;
    },
    getReviewsSuccess: (state, action) => {
      state.reviewsLoading = false;
      state.reviews = action.payload;
    },
    getReviewsFailure: (state, action) => {
      state.reviewsLoading = false;
      state.reviewsError = action.payload;
    },
    updateReviewRequest: (state) => {
      state.updateReviewLoading = true;
      state.updateReviewError = null;
    },
    updateReviewSuccess: (state, action) => {
      state.updateReviewLoading = false;
      state.reviews = state.reviews.map((review) =>
        review.review_id === action.payload.review_id
          ? { ...review, ...action.payload }
          : review
      );
    },
    updateReviewFailure: (state, action) => {
      state.updateReviewLoading = false;
      state.updateReviewError = action.payload;
    },
    deleteReviewRequest: (state) => {
      state.deleteReviewLoading = true;
      state.deleteReviewError = null;
    },
    deleteReviewSuccess: (state, action) => {
      state.deleteReviewLoading = false;
      state.reviews = state.reviews.filter(
        (review) => review.review_id !== action.payload
      );
    },
    deleteReviewFailure: (state, action) => {
      state.deleteReviewLoading = false;
      state.deleteReviewError = action.payload;
    },
    getCompletedBookingsRequest: (state) => {
      state.bookings.bookingsLoading = true;
      state.bookings.bookingsError = null;
    },
    getCompletedBookingsSuccess: (state, action) => {
      state.bookings.bookingsLoading = false;
      state.bookings.completed = Array.isArray(action.payload) ? action.payload : [];
    },
    getCompletedBookingsFailure: (state, action) => {
      state.bookings.bookingsLoading = false;
      state.bookings.bookingsError = action.payload;
    },
    getCancelledBookingsRequest: (state) => {
      state.bookings.bookingsLoading = true;
      state.bookings.bookingsError = null;
    },
    getCancelledBookingsSuccess: (state, action) => {
      state.bookings.bookingsLoading = false;
      state.bookings.cancelled = Array.isArray(action.payload) ? action.payload : [];
    },
    getCancelledBookingsFailure: (state, action) => {
      state.bookings.bookingsLoading = false;
      state.bookings.bookingsError = action.payload;
    },
    getUpcomingBookingsRequest: (state) => {
      state.bookings.bookingsLoading = true;
      state.bookings.bookingsError = null;
    },
    getUpcomingBookingsSuccess: (state, action) => {
      state.bookings.bookingsLoading = false;
      state.bookings.upcoming = Array.isArray(action.payload) ? action.payload : [];
    },
    getUpcomingBookingsFailure: (state, action) => {
      state.bookings.bookingsLoading = false;
      state.bookings.bookingsError = action.payload;
    },
    selectVendor: (state, action) => {
      console.log('selectVendor reducer called with:', action.payload);
      state.chat.vendorId = action.payload;
      state.chat.roomId = null;
      state.chat.messages = [];
      state.chat.chatHistoryLoading = false;
      state.chat.chatHistoryError = null;
    },
    receiveMessage: (state, action) => {
      console.log('receiveMessage reducer called with:', action.payload);
      state.chat.messages = [
        ...state.chat.messages.filter(
          (msg) => !msg.message_id.toString().startsWith('temp-')
        ),
        {
          message_id: action.payload.message_id || Date.now(),
          room_id: action.payload.room_id,
          sender_id: action.payload.sender_id,
          sender_type: action.payload.sender_type,
          message: action.payload.message,
          sent_at: action.payload.sent_at,
        },
      ];
    },
    fetchChatHistoryRequest: (state) => {
      console.log('fetchChatHistoryRequest triggered');
      state.chat.chatHistoryLoading = true;
      state.chat.chatHistoryError = null;
    },
    fetchChatHistorySuccess: (state, action) => {
      console.log('fetchChatHistorySuccess payload:', action.payload);
      const { roomId, messages } = action.payload;
      state.chat.chatHistoryLoading = false;
      state.chat.roomId = roomId;
      state.chat.messages = Array.isArray(messages)
        ? messages.map((msg) => ({
            message_id: msg.message_id,
            room_id: msg.chat_room_id || msg.room_id || roomId,
            sender_id: msg.sender_id,
            sender_type: msg.sender_type,
            message: msg.message,
            sent_at: msg.sent_at,
          }))
        : [];
      console.log('fetchChatHistorySuccess: Updated state.chat:', {
        roomId: state.chat.roomId,
        messages: state.chat.messages,
      });
    },
    fetchChatHistoryFailure: (state, action) => {
      console.log('fetchChatHistoryFailure:', action.payload);
      state.chat.chatHistoryLoading = false;
      state.chat.chatHistoryError = action.payload;
    },
    insertServiceBookingRequest: (state) => {
      state.bookingLoading = true;
      state.bookingError = null;
    },
    insertServiceBookingSuccess: (state, action) => {
      state.bookingLoading = false;
      state.bookingError = null;
      if (action.payload?.booking_id) {
        state.lastBookingId = action.payload.booking_id;
      }
    },
    insertServiceBookingFailure: (state, action) => {
      state.bookingLoading = false;
      state.bookingError = action.payload;
    },
    insertServiceBookingLaterRequest: (state) => {
      state.bookingLoading = true;
      state.bookingError = null;
    },
    insertServiceBookingLaterSuccess: (state, action) => {
      state.bookingLoading = false;
      state.bookingError = null;
      if (action.payload?.booking_id) {
        state.lastBookingId = action.payload.booking_id;
      }
    },
    insertServiceBookingLaterFailure: (state, action) => {
      state.bookingLoading = false;
      state.bookingError = action.payload;
    },
    getVendorsWithServicesRequest: (state) => {
      state.vendorsWithServicesLoading = true;
      state.vendorsWithServicesError = null;
    },
    getVendorsWithServicesSuccess: (state, action) => {
      state.vendorsWithServicesLoading = false;
      state.vendorsWithServices = action.payload;
    },
    getVendorsWithServicesFailure: (state, action) => {
      state.vendorsWithServicesLoading = false;
      state.vendorsWithServicesError = action.payload;
    },
    getCustomerServiceDetailsRequest: (state) => {
      state.customerServiceDetailsLoading = true;
      state.customerServiceDetailsError = null;
    },
    getCustomerServiceDetailsSuccess: (state, action) => {
      state.customerServiceDetailsLoading = false;
      state.customerServiceDetails = action.payload;
    },
    getCustomerServiceDetailsFailure: (state, action) => {
      state.customerServiceDetailsLoading = false;
      state.customerServiceDetailsError = action.payload;
    },
    getService_CategoriesRequest: (state) => {
      state.servicecategoriesLoading = true;
      state.servicecategoriesError = null;
    },
    getService_CategoriesSuccess: (state, action) => {
      state.servicecategoriesLoading = false;
      state.serviceCategoriesget = Array.isArray(action.payload) ? action.payload : [];
    },
    getService_CategoriesFailure: (state, action) => {
      state.servicecategoriesLoading = false;
      state.servicecategoriesError = action.payload;
    },
    selectCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.servicesByCategory = [];
      state.servicesByCategoryError = null;
    },
    getServicesByCategoryRequest: (state) => {
      state.servicesByCategoryLoading = true;
      state.servicesByCategoryError = null;
    },
    getServicesByCategorySuccess: (state, action) => {
      state.servicesByCategoryLoading = false;
      state.servicesByCategory = Array.isArray(action.payload) ? action.payload : [];
    },
    getServicesByCategoryFailure: (state, action) => {
      state.servicesByCategoryLoading = false;
      state.servicesByCategoryError = action.payload;
    },
    initiatePaymentRequest: (state) => {
      state.paymentInitiateLoading = true;
      state.paymentInitiateError = null;
      state.paymentInitiateSuccess = false;
    },
    initiatePaymentSuccess: (state, action) => {
      state.paymentInitiateLoading = false;
      state.paymentInitiateSuccess = true;
      state.paymentOrderData = action.payload;
    },
    initiatePaymentFailure: (state, action) => {
      state.paymentInitiateLoading = false;
      state.paymentInitiateError = action.payload;
      state.paymentInitiateSuccess = false;
    },
    verifyPaymentRequest: (state) => {
      state.paymentVerificationLoading = true;
      state.paymentVerificationError = null;
      state.paymentVerificationSuccess = false;
    },
    verifyPaymentSuccess: (state, action) => {
      state.paymentVerificationLoading = false;
      state.paymentVerificationSuccess = true;
      state.paymentVerificationResponse = action.payload;
    },
    verifyPaymentFailure: (state, action) => {
      state.paymentVerificationLoading = false;
      state.paymentVerificationError = action.payload;
      state.paymentVerificationSuccess = false;
    },
    clearPaymentStatus: (state) => {
      state.paymentInitiateLoading = false;
      state.paymentInitiateError = null;
      state.paymentInitiateSuccess = false;
      state.paymentOrderData = null;
      state.paymentVerificationLoading = false;
      state.paymentVerificationError = null;
      state.paymentVerificationSuccess = false;
      state.paymentVerificationResponse = null;
    },
    bookingDetailsRequest: (state) => {
      state.bookingDetailsLoading = true;
      state.bookingDetailsError = null;
      state.bookingDetailsSuccess = false;
    },
    bookingDetailsSuccess: (state, action) => {
      state.bookingDetailsLoading = false;
      state.bookingDetailsSuccess = true;
      state.bookingDetailsResponse = action.payload;
    },
    bookingDetailsFailure: (state, action) => {
      state.bookingDetailsLoading = false;
      state.bookingDetailsError = action.payload;
      state.bookingDetailsSuccess = false;
    },

    initiatePaymentBookNowRequest: (state) => {
      state.paymentInitiateBookNowLoading = true;
      state.paymentInitiateBookNowError = null;
      state.paymentInitiateBookNowSuccess = false;
    },
    initiatePaymentBookNowSuccess: (state, action) => {
      state.paymentInitiateBookNowLoading = false;
      state.paymentInitiateBookNowSuccess = true;
      state.paymentOrderData = action.payload;
    },
    initiatePaymentBookNowFailure: (state, action) => {
      state.paymentInitiateBookNowLoading = false;
      state.paymentInitiateBookNowError = action.payload;
      state.paymentInitiateBookNowSuccess = false;
    },
    verifyPaymentBookNowRequest: (state) => {
      state.paymentVerifyBookNowLoading = true;
      state.paymentVerifyBookNowError = null;
      state.paymentVerifyBookNowSuccess = false;
    },
    verifyPaymentBookNowSuccess: (state, action) => {
      state.paymentVerifyBookNowLoading = false;
      state.paymentVerifyBookNowSuccess = true;
      state.paymentVerifyBookNowResponse = action.payload;
    },
    verifyPaymentBookNowFailure: (state, action) => {
      state.paymentVerifyBookNowLoading = false;
      state.paymentVerifyBookNowError = action.payload;
      state.paymentVerifyBookNowSuccess = false;
    },
    setPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
    clearPaymentBookNowStatus: (state) => {
      state.paymentInitiateBookNowLoading = false;
      state.paymentInitiateBookNowError = null;
      state.paymentInitiateBookNowSuccess = false;
      state.paymentVerifyBookNowLoading = false;
      state.paymentVerifyBookNowError = null;
      state.paymentVerifyBookNowSuccess = false;
      state.paymentVerifyBookNowResponse = null;
      state.selectedPaymentMethod = null;
    },
    
    insertAddressRequest: (state) => {
      state.insertAddressLoading = true;
      state.insertAddressError = null;
    },
   insertAddressSuccess(state, action) {
      state.customerAddresses.push(action.payload);
      state.selectedAddressId = action.payload.address_id;
      state.selectedAddress = action.payload; // Set selectedAddress
      state.insertAddressLoading = false;
    },
    insertAddressFailure: (state, action) => {
      state.insertAddressLoading = false;
      state.insertAddressError = action.payload;
    },
    getCustomerAddressRequest: (state) => {
      state.getCustomerAddressLoading = true;
      state.getCustomerAddressError = null;
    },
    getCustomerAddressSuccess: (state, action) => {
      state.getCustomerAddressLoading = false;
      state.customerAddresses = action.payload.addresses || [];
    },
    getCustomerAddressFailure: (state, action) => {
      state.getCustomerAddressLoading = false;
      state.getCustomerAddressError = action.payload;
    },
     setSelectedAddressId(state, action) {
      state.selectedAddressId = action.payload;
    },
    setSelectedAddress(state, action) {
      state.selectedAddress = action.payload;
    },
  },
});

export const {
  loginRequest, loginSuccess, loginFailure, restoreUser, logout,
  signupRequest, signupSuccess, signupFailure,
  getServiceCategoriesRequest, getServiceCategoriesSuccess, getServiceCategoriesFailure,
  getServicesRequest, getServicesSuccess, getServicesFailure,
  getSliderImagesRequest, getSliderImagesSuccess, getSliderImagesFailure,
  registerCustomerRequest, registerCustomerSuccess, registerCustomerFailure,
  getCustomerDataRequest, getCustomerDataSuccess, getCustomerDataFailure,
  updateCustomerRequest, updateCustomerSuccess, updateCustomerFailure,
  insertComplaintRequest, insertComplaintSuccess, insertComplaintFailure,
  getComplaintsRequest, getComplaintsSuccess, getComplaintsFailure,
  updateComplaintRequest, updateComplaintSuccess, updateComplaintFailure,
  deleteComplaintRequest, deleteComplaintSuccess, deleteComplaintFailure,
  getSingleServiceRequest, getSingleServiceSuccess, getSingleServiceFailure,
  getVendorsRequest, getVendorsSuccess, getVendorsFailure,
  getVendorsForChatRequest, getVendorsForChatSuccess, getVendorsForChatFailure,
  insertReviewRequest, insertReviewSuccess, insertReviewFailure,
  getReviewsRequest, getReviewsSuccess, getReviewsFailure,
  updateReviewRequest, updateReviewSuccess, updateReviewFailure,
  deleteReviewRequest, deleteReviewSuccess, deleteReviewFailure,
  selectVendor, receiveMessage,
  fetchChatHistoryRequest, fetchChatHistorySuccess, fetchChatHistoryFailure,
  insertServiceBookingRequest, insertServiceBookingSuccess, insertServiceBookingFailure,
  insertServiceBookingLaterRequest, insertServiceBookingLaterSuccess, insertServiceBookingLaterFailure,
  getVendorsWithServicesRequest, getVendorsWithServicesSuccess, getVendorsWithServicesFailure,
  getCustomerServiceDetailsRequest, getCustomerServiceDetailsSuccess, getCustomerServiceDetailsFailure,
  getService_CategoriesRequest, getService_CategoriesSuccess, getService_CategoriesFailure,
  selectCategory, getServicesByCategoryRequest, getServicesByCategorySuccess, getServicesByCategoryFailure,
  getCompletedBookingsRequest, getCompletedBookingsSuccess, getCompletedBookingsFailure,
  getCancelledBookingsRequest, getCancelledBookingsSuccess, getCancelledBookingsFailure,
  getUpcomingBookingsRequest, getUpcomingBookingsSuccess, getUpcomingBookingsFailure,
  initiatePaymentRequest, initiatePaymentSuccess, initiatePaymentFailure,
  verifyPaymentRequest, verifyPaymentSuccess, verifyPaymentFailure,
  clearPaymentStatus, bookingDetailsRequest, bookingDetailsSuccess, bookingDetailsFailure,
  initiatePaymentBookNowRequest,
  initiatePaymentBookNowSuccess,
  initiatePaymentBookNowFailure,
  verifyPaymentBookNowRequest,
  verifyPaymentBookNowSuccess,
  verifyPaymentBookNowFailure,
  setPaymentMethod,
  clearPaymentBookNowStatus,
  insertAddressRequest,
  insertAddressSuccess,
  insertAddressFailure,
  getCustomerAddressRequest,
  getCustomerAddressSuccess,
  getCustomerAddressFailure,
  setSelectedAddressId,
  setSelectedAddress,
} = customerSlice.actions;

export default customerSlice.reducer;