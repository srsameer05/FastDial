import { call, put, takeLatest, select } from 'redux-saga/effects';
import { jwtDecode } from 'jwt-decode';
import hold from '../../../assets/profile.png'
import {
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
  fetchChatHistoryRequest, fetchChatHistorySuccess, fetchChatHistoryFailure,
  initiatePaymentRequest, initiatePaymentSuccess, initiatePaymentFailure,
  verifyPaymentRequest, verifyPaymentSuccess, verifyPaymentFailure,
  initiatePaymentBookNowRequest,
  initiatePaymentBookNowSuccess,
  initiatePaymentBookNowFailure,
  verifyPaymentBookNowRequest,
  verifyPaymentBookNowSuccess,
  verifyPaymentBookNowFailure,


// Booking and Service Insertion
insertServiceBookingRequest,
insertServiceBookingSuccess,
insertServiceBookingFailure,
insertServiceBookingLaterRequest,
insertServiceBookingLaterSuccess,
insertServiceBookingLaterFailure,

// Vendors and Services
getVendorsWithServicesRequest,
getVendorsWithServicesSuccess,
getVendorsWithServicesFailure,
getService_CategoriesRequest,
getService_CategoriesSuccess,
getService_CategoriesFailure,
getServicesByCategoryRequest,
getServicesByCategorySuccess,
getServicesByCategoryFailure,

// Customer Service Details
getCustomerServiceDetailsRequest,
getCustomerServiceDetailsSuccess,
getCustomerServiceDetailsFailure,

// Reviews
insertReviewRequest,
insertReviewSuccess,
insertReviewFailure,
getReviewsRequest,
getReviewsSuccess,
getReviewsFailure,
updateReviewRequest,
updateReviewSuccess,
updateReviewFailure,
deleteReviewRequest,
deleteReviewSuccess,
deleteReviewFailure,

// Bookings
getCompletedBookingsRequest,
getCompletedBookingsSuccess,
getCompletedBookingsFailure,
getCancelledBookingsRequest,
getCancelledBookingsSuccess,
getCancelledBookingsFailure,
getUpcomingBookingsRequest,
getUpcomingBookingsSuccess,
getUpcomingBookingsFailure,
// New actions for chat vendors
getVendorsForChatRequest, getVendorsForChatSuccess, getVendorsForChatFailure,
  bookingDetailsRequest,
  bookingDetailsSuccess,
  bookingDetailsFailure,

  insertAddressRequest,
  insertAddressSuccess,
  insertAddressFailure,
  getCustomerAddressRequest,
  getCustomerAddressSuccess,
  getCustomerAddressFailure,

} from './customerSlice';

import {
  loginCustomerAPI,
  signupCustomerAPI,
  getServiceCategoriesAPI,
  getServicesAPI,
  getSliderImagesAPI,
  registerCustomerAPI,
  getCustomerDataAPI,
  updateCustomerAPI,
  insertCustomerComplaintAPI,
  getCustomerComplaintsAPI,
  updateCustomerComplaintAPI,
  deleteCustomerComplaintAPI,
  getSingleServiceAPI,
  getVendorsAPI,
  getChatMessagesAPI,
  insertServiceBookingAPI,
  getVendorsWithServicesAPI,
  bookingLaterAPI,
  getCustomerServiceDetailsAPI,
  getService_CategoriesAPI,
  getServicesByCategoryAPI,
  insertReviewsAPI,
  getReviewsAPI,
  updateReviewsAPI,
  deleteReviewsAPI,
  getCustomerBookingsAPI,
  getCustomerCancelledBookingsAPI,
  getCustomerUpcomingBookingsAPI,
  initiatePaymentAPI, 
  verifyPaymentAPI ,
  getVendorsForCustomerAPI,
  getBookingDetailsAPI,
  initiatePaymentForBookNowAPI,
  verifyPaymentForBookNowAPI,
  insertAddressAPI, getCustomerAddressAPI
} from '../../services/customerAPI';

function* loginCustomerSaga(action) {
  try {
    const { mobile, otp } = action.payload;
    console.log('loginCustomerSaga: Attempting login with:', { mobile, otp });
    const response = yield call(loginCustomerAPI, mobile, otp);
    console.log('loginCustomerSaga: API Response:', response.data);

    const token = response.data.token;
    let customerId = response.data.id;

    if (!customerId) {
      console.warn('loginCustomerSaga: No id in API response, decoding token');
      const decoded = jwtDecode(token);
      customerId = decoded.customer_id;
      if (!customerId) {
        throw new Error('Customer ID missing in both API response and token');
      }
    }

    const user = {
      mobile,
      customer_id: customerId,
    };
    console.log('loginCustomerSaga: User data:', user);

    localStorage.setItem('token', token);
    localStorage.setItem('customer_id', String(user.customer_id));
    yield put(loginSuccess({
      user,
      token,
      new_user: response.data.new_user,
    }));
    console.log('loginCustomerSaga: loginSuccess dispatched with:', { user, token });
  } catch (error) {
    console.error('loginCustomerSaga: Error:', error.response?.data || error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('customer_id');
    yield put(loginFailure(error.response?.data?.message || error.message));
  }
}

function* restoreUserSaga() {
  try {
    const token = localStorage.getItem('token');
    console.log('restoreUserSaga: Token from localStorage:', token);
    if (token) {
      const decoded = jwtDecode(token);
      console.log('restoreUserSaga: Decoded token:', decoded);
      if (!decoded.customer_id) {
        throw new Error('Customer ID missing in token');
      }
      const user = {
        customer_id: decoded.customer_id,
        mobile: decoded.mobile,
      };
      yield put(restoreUser({ user, token }));
      console.log('restoreUserSaga: restoreUser dispatched with:', { user, token });
    } else {
      console.warn('restoreUserSaga: No token found, skipping restore');
    }
  } catch (error) {
    console.error('restoreUserSaga: Error:', error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('customer_id');
  }
}

function* signupCustomerSaga(action) {
  try {
    const { mobile } = action.payload;
    console.log('signupCustomerSaga: Attempting signup with:', { mobile });
    const response = yield call(signupCustomerAPI, mobile);
    console.log('signupCustomerSaga: API Response:', response.data);
    yield put(signupSuccess());
    console.log('signupCustomerSaga: signupSuccess dispatched');
  } catch (error) {
    console.error('signupCustomerSaga: Error:', error.response?.data || error.message);
    yield put(signupFailure(error.response?.data?.message || error.message));
  }
}

function* getService_CategoriesSaga() {
  console.log('getService_CategoriesSaga: Triggered');
  try {
    const response = yield call(getService_CategoriesAPI);
    console.log('getService_CategoriesSaga: API Response:', response.data);
    const categories = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
    yield put(getService_CategoriesSuccess(categories));
    console.log('getService_CategoriesSaga: getService_CategoriesSuccess dispatched');
  } catch (error) {
    console.error('getService_CategoriesSaga: Error:', error.response?.data || error.message);
    yield put(getService_CategoriesFailure(error.response?.data?.message || error.message));
  }
}

 function* getServiceCategoriesSaga() {
  console.log('getServiceCategoriesSaga: Triggered');
  try {
    const response = yield call(getServiceCategoriesAPI);
    console.log('getServiceCategoriesSaga: API Response:', response.data);
    yield put(getServiceCategoriesSuccess(response.data));
    console.log('getServiceCategoriesSaga: getServiceCategoriesSuccess dispatched');
  } catch (error) {
    console.error('getServiceCategoriesSaga: Error:', error.response?.data || error.message);
    yield put(getServiceCategoriesFailure(error.response?.data?.message || error.message));
  }
}

function* getServicesSaga() {
  console.log('getServicesSaga: Triggered');
  try {
    const response = yield call(getServicesAPI);
    console.log('getServicesSaga: API Response:', response.data);
    yield put(getServicesSuccess(response.data));
    console.log('getServicesSaga: getServicesSuccess dispatched');
  } catch (error) {
    console.error('getServicesSaga: Error:', error.response?.data || error.message);
    yield put(getServicesFailure(error.response?.data?.message || error.message));
  }
}

function* getSingleServiceSaga(action) {
  console.log('getSingleServiceSaga: Triggered with serviceId:', action.payload);
  try {
    const response = yield call(getSingleServiceAPI, action.payload);
    console.log('getSingleServiceSaga: API Response:', response.data);
    yield put(getSingleServiceSuccess(response.data[0]));
    console.log('getSingleServiceSaga: getSingleServiceSuccess dispatched');
  } catch (error) {
    console.error('getSingleServiceSaga: Error:', error.response?.data || error.message);
    yield put(getSingleServiceFailure(error.response?.data?.message || error.message));
  }
}

function* getSliderImagesSaga() {
  console.log('getSliderImagesSaga: Triggered');
  try {
    const response = yield call(getSliderImagesAPI);
    console.log('getSliderImagesSaga: API Response:', response.data);
    yield put(getSliderImagesSuccess(response.data));
    console.log('getSliderImagesSaga: getSliderImagesSuccess dispatched');
  } catch (error) {
    console.error('getSliderImagesSaga: Error:', error.response?.data || error.message);
    yield put(getSliderImagesFailure(error.response?.data?.message || error.message));
  }
}

function* registerCustomerSaga(action) {
  console.log('registerCustomerSaga: Triggered with payload:', action.payload);
  try {
    const customerData = action.payload;
    const token = localStorage.getItem('token');
    console.log('registerCustomerSaga: Token from localStorage:', token);
    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('Authentication token is missing. Please login to continue.');
    }
    const response = yield call(registerCustomerAPI, customerData);
    console.log('registerCustomerSaga: API Response:', response.data);
    localStorage.removeItem('pending_customer_registration');
    yield put(registerCustomerSuccess({ id: response.data.id }));
    console.log('registerCustomerSaga: registerCustomerSuccess dispatched');
  } catch (error) {
    console.error('registerCustomerSaga: Error:', error.response?.data || error.message);
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;
    const isAuthFailure = status === 401 || (typeof message === 'string' && message.toLowerCase().includes('authentication token is missing'));

    if (isAuthFailure) {
      if (action?.payload) {
        localStorage.setItem('pending_customer_registration', JSON.stringify(action.payload));
      }
      localStorage.removeItem('token');
      localStorage.removeItem('customer_id');
      yield put(registerCustomerFailure('Session expired. Please login again.'));
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return;
    }

    yield put(registerCustomerFailure(message));
  }
}

function* getCustomerDataSaga(action) {
  console.log('getCustomerDataSaga: Triggered with action:', action);
  try {
    const { customer_id } = action.payload || {};
    const user = yield select((state) => state.customer.user);
    console.log('getCustomerDataSaga: User:', user);
    const token = localStorage.getItem('token');
    const customerId = customer_id || user?.customer_id || localStorage.getItem('customer_id');
    if (!customerId) {
      throw new Error('Customer ID is missing');
    }
    console.log('getCustomerDataSaga: Using customerId:', customerId);
    const response = yield call(getCustomerDataAPI, customerId);
    console.log('getCustomerDataSaga: API Response:', response.data);
    yield put(getCustomerDataSuccess(response.data));
    console.log('getCustomerDataSaga: getCustomerDataSuccess dispatched');
  } catch (error) {
    console.error('getCustomerDataSaga: Error:', error.response?.data || error.message);
    yield put(getCustomerDataFailure(error.response?.data?.message || error.message));
  }
}

function* updateCustomerSaga(action) {
  console.log('updateCustomerSaga: Triggered with payload:', action.payload);
  try {
    const response = yield call(updateCustomerAPI, action.payload);
    console.log('updateCustomerSaga: API Response:', response.data);
    yield put(updateCustomerSuccess(response.data));
    console.log('updateCustomerSaga: updateCustomerSuccess dispatched');
  } catch (error) {
    console.error('updateCustomerSaga: Error:', error.response?.data || error.message);
    yield put(updateCustomerFailure(error.response?.data?.message || error.message));
  }
}

function* insertCustomerComplaintSaga(action) {
  console.log('insertCustomerComplaintSaga: Triggered with payload:', action.payload);
  try {
    const response = yield call(insertCustomerComplaintAPI, action.payload);
    console.log('insertCustomerComplaintSaga: API Response:', response.data);
    yield put(insertComplaintSuccess());
    yield put(getComplaintsRequest());
    console.log('insertCustomerComplaintSaga: insertComplaintSuccess dispatched');
  } catch (error) {
    console.error('insertCustomerComplaintSaga: Error:', error.response?.data || error.message);
    yield put(insertComplaintFailure(error.response?.data?.message || error.message));
  }
}

function* getCustomerComplaintsSaga() {
  console.log('getCustomerComplaintsSaga: Triggered');
  try {
    const response = yield call(getCustomerComplaintsAPI);
    console.log('getCustomerComplaintsSaga: API Response:', response.data);
    yield put(getComplaintsSuccess(response.data));
    console.log('getCustomerComplaintsSaga: getComplaintsSuccess dispatched');
  } catch (error) {
    console.error('getCustomerComplaintsSaga: Error:', error.response?.data || error.message);
    yield put(getComplaintsFailure(error.response?.data?.message || error.message));
  }
}

function* updateCustomerComplaintSaga(action) {
  console.log('updateCustomerComplaintSaga: Triggered with payload:', action.payload);
  try {
    const response = yield call(updateCustomerComplaintAPI, action.payload);
    console.log('updateCustomerComplaintSaga: API Response:', response.data);
    yield put(updateComplaintSuccess(response.data));
    console.log('updateCustomerComplaintSaga: updateComplaintSuccess dispatched');
  } catch (error) {
    console.error('updateCustomerComplaintSaga: Error:', error.response?.data || error.message);
    yield put(updateComplaintFailure(error.response?.data?.message || error.message));
  }
}

function* deleteCustomerComplaintSaga(action) {
  console.log('deleteCustomerComplaintSaga: Triggered with complaintId:', action.payload);
  try {
    const response = yield call(deleteCustomerComplaintAPI, action.payload);
    console.log('deleteCustomerComplaintSaga: API Response:', response.data);
    yield put(deleteComplaintSuccess(action.payload));
    console.log('deleteCustomerComplaintSaga: deleteComplaintSuccess dispatched');
  } catch (error) {
    console.error('deleteCustomerComplaintSaga: Error:', error.response?.data || error.message);
    yield put(deleteComplaintFailure(error.response?.data?.message || error.message));
  }
}

function* getVendorsSaga() {
  console.log('getVendorsSaga: Triggered');
  try {
    const token = localStorage.getItem('token');
    console.log('getVendorsSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(getVendorsAPI);
    console.log('getVendorsSaga: API Response:', response.data);
    yield put(getVendorsSuccess(response.data));
    console.log('getVendorsSaga: getVendorsSuccess dispatched');
  } catch (error) {
    console.error('getVendorsSaga: Error:', error.response?.data || error.message);
    yield put(getVendorsFailure(error.response?.data?.message || error.message));
  }
}

function* fetchChatHistorySaga(action) {
  try {
    const { roomId } = action.payload;
    console.log('fetchChatHistorySaga: Fetching chat history for roomId:', roomId);
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('customer_id');
    console.log('fetchChatHistorySaga: Token:', token, 'Customer ID:', customerId);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(getChatMessagesAPI, roomId);
    console.log('fetchChatHistorySaga: Raw API Response:', JSON.stringify(response, null, 2));
    console.log('fetchChatHistorySaga: API Response Data:', response.data);
    const messages = Array.isArray(response.data) ? response.data : [];
    console.log('fetchChatHistorySaga: Extracted messages:', messages);
    yield put(fetchChatHistorySuccess({ roomId, messages }));
    console.log('fetchChatHistorySaga: fetchChatHistorySuccess dispatched with:', { roomId, messages });
  } catch (error) {
    console.error('fetchChatHistorySaga: Error:', error.response?.data || error.message);
    yield put(fetchChatHistoryFailure(error.response?.data?.message || 'Failed to fetch chat history'));
  }
}

function* insertServiceBookingSaga(action) {
  console.log('insertServiceBookingSaga: Triggered with payload:', action.payload);
  try {
    const token = localStorage.getItem('token');
    console.log('insertServiceBookingSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const bookingData = action.payload;
    const response = yield call(insertServiceBookingAPI, bookingData);
    console.log('insertServiceBookingSaga: insertServiceBookingAPI Response:', response.data);
    yield put(insertServiceBookingSuccess(response.data));
    console.log('insertServiceBookingSaga: insertServiceBookingSuccess dispatched with:', response.data);
  } catch (error) {
    console.error('insertServiceBookingSaga: Error:', error.response?.data || error.message);
    yield put(insertServiceBookingFailure(error.response?.data?.message || error.message));
  }
}

function* insertServiceBookingLaterSaga(action) {
  console.log('insertServiceBookingLaterSaga: Triggered with payload:', action.payload);
  try {
    const token = localStorage.getItem('token');
    console.log('insertServiceBookingLaterSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const bookingData = action.payload;
    const response = yield call(bookingLaterAPI, bookingData);
    console.log('insertServiceBookingLaterSaga: bookingLaterAPI Response:', response.data);
    if (!response.data.data || !response.data.data.booking_id) {
      console.warn('insertServiceBookingLaterSaga: booking_id missing in response:', response.data);
      throw new Error('Booking ID not returned from API');
    }
    yield put(insertServiceBookingLaterSuccess({ booking_id: response.data.data.booking_id }));
    console.log('insertServiceBookingLaterSaga: insertServiceBookingLaterSuccess dispatched with:', { booking_id: response.data.data.booking_id });
  } catch (error) {
    console.error('insertServiceBookingLaterSaga: Error:', error.response?.data?.message || error.message);
    yield put(insertServiceBookingLaterFailure(error.response?.data?.message || error.message));
  }
}

function* getVendorsWithServicesSaga() {
  console.log('getVendorsWithServicesSaga: Triggered');
  try {
    const token = localStorage.getItem('token');
    console.log('getVendorsWithServicesSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(getVendorsWithServicesAPI);
    console.log('getVendorsWithServicesSaga: API Response:', response.data);
    yield put(getVendorsWithServicesSuccess(response.data.data));
    console.log('getVendorsWithServicesSaga: getVendorsWithServicesSuccess dispatched');
  } catch (error) {
    console.error('getVendorsWithServicesSaga: Error:', error.response?.data || error.message);
    yield put(getVendorsWithServicesFailure(error.response?.data?.message || error.message));
  }
}
function* getCustomerServiceDetailsSaga() {
  console.log('getCustomerServiceDetailsSaga: Triggered');
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(getCustomerServiceDetailsAPI);
    console.log('getCustomerServiceDetailsSaga: API Response:', response.data);
    
    // ✅ Handle both { success: true, data: [...] } and plain array
    const customerServiceDetails = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
      
    console.log('getCustomerServiceDetailsSaga: Bookings with scheduled_date:', 
      customerServiceDetails.filter(b => b.scheduled_date));
    yield put(getCustomerServiceDetailsSuccess(customerServiceDetails));
  } catch (error) {
    console.error('getCustomerServiceDetailsSaga: Error:', error.response?.data || error.message);
    yield put(getCustomerServiceDetailsFailure(error.response?.data?.message || error.message));
  }
}
 function* getServicesByCategorySaga(action) {
  console.log('getServicesByCategorySaga: Triggered with serviceCatId:', action.payload);
  try {
    const response = yield call(getServicesByCategoryAPI, action.payload);
    console.log('getServicesByCategorySaga: API Response:', response.data);
    yield put(getServicesByCategorySuccess(response.data));
    console.log('getServicesByCategorySaga: getServicesByCategorySuccess dispatched');
  } catch (error) {
    console.error('getServicesByCategorySaga: Error:', error.response?.data || error.message);
    yield put(getServicesByCategoryFailure(error.response?.data?.message || error.message));
  }
}

function* insertReviewSaga(action) {
  console.log('insertReviewSaga: Triggered with payload:', action.payload);
  try {
    const response = yield call(insertReviewsAPI, action.payload);
    console.log('insertReviewSaga: API Response:', response.data);
    yield put(insertReviewSuccess());
    yield put(getReviewsRequest());
    console.log('insertReviewSaga: insertReviewSuccess dispatched');
  } catch (error) {
    console.error('insertReviewSaga: Error:', error.response?.data || error.message);
    yield put(insertReviewFailure(error.response?.data?.message || error.message));
  }
}

function* getReviewsSaga() {
  console.log('getReviewsSaga: Triggered');
  try {
    const response = yield call(getReviewsAPI);
    console.log('getReviewsSaga: API Response:', response.data);
    // Ensure the payload is an array
    const reviews = Array.isArray(response.data) ? response.data : response.data.data || [];
    yield put(getReviewsSuccess(reviews));
    console.log('getReviewsSaga: getReviewsSuccess dispatched with:', reviews);
  } catch (error) {
    console.error('getReviewsSaga: Error:', error.response?.data || error.message);
    yield put(getReviewsFailure(error.response?.data?.message || error.message));
  }
}

function* updateReviewSaga(action) {
  console.log('updateReviewSaga: Triggered with payload:', action.payload);
  try {
    const response = yield call(updateReviewsAPI, action.payload);
    console.log('updateReviewSaga: API Response:', response.data);
    yield put(updateReviewSuccess(response.data));
    console.log('updateReviewSaga: updateReviewSuccess dispatched');
  } catch (error) {
    console.error('updateReviewSaga: Error:', error.response?.data || error.message);
    yield put(updateReviewFailure(error.response?.data?.message || error.message));
  }
}

function* deleteReviewSaga(action) {
  console.log('deleteReviewSaga: Triggered with reviewId:', action.payload);
  try {
    const response = yield call(deleteReviewsAPI, action.payload);
    console.log('deleteReviewSaga: API Response:', response.data);
    yield put(deleteReviewSuccess(action.payload));
    console.log('deleteReviewSaga: deleteReviewSuccess dispatched');
  } catch (error) {
    console.error('deleteReviewSaga: Error:', error.response?.data || error.message);
    yield put(deleteReviewFailure(error.response?.data?.message || error.message));
  }
}

function* getCompletedBookingsSaga(action) {
  console.log('getCompletedBookingsSaga: Triggered with action:', action);
  try {
    const { customer_id } = action.payload || {};
    const user = yield select((state) => state.customer.user);
    console.log('getCompletedBookingsSaga: User:', user);
    const token = localStorage.getItem('token');
    const customerId = customer_id || user?.customer_id || localStorage.getItem('customer_id');
    if (!customerId) {
      throw new Error('Customer ID is missing');
    }
    console.log('getCompletedBookingsSaga: Using customerId:', customerId);
    const response = yield call(getCustomerBookingsAPI, customerId);
    console.log('getCompletedBookingsSaga: API Response:', response.data);
    yield put(getCompletedBookingsSuccess(response.data.data || []));
    console.log('getCompletedBookingsSaga: getCompletedBookingsSuccess dispatched');
  } catch (error) {
    console.error('getCompletedBookingsSaga: Error:', error.response?.data || error.message);
    yield put(getCompletedBookingsFailure(error.response?.data?.message || error.message));
  }
}

function* getCancelledBookingsSaga(action) {
  console.log('getCancelledBookingsSaga: Triggered with action:', action);
  try {
    const { customer_id } = action.payload || {};
    const user = yield select((state) => state.customer.user);
    console.log('getCancelledBookingsSaga: User:', user);
    const token = localStorage.getItem('token');
    const customerId = customer_id || user?.customer_id || localStorage.getItem('customer_id');
    if (!customerId) {
      throw new Error('Customer ID is missing');
    }
    console.log('getCancelledBookingsSaga: Using customerId:', customerId);
    const response = yield call(getCustomerCancelledBookingsAPI, customerId);
    console.log('getCancelledBookingsSaga: API Response:', response.data);
    yield put(getCancelledBookingsSuccess(response.data.data || []));
    console.log('getCancelledBookingsSaga: getCancelledBookingsSuccess dispatched');
  } catch (error) {
    console.error('getCancelledBookingsSaga: Error:', error.response?.data || error.message);
    yield put(getCancelledBookingsFailure(error.response?.data?.message || error.message));
  }
}

function* getUpcomingBookingsSaga(action) {
  console.log('getUpcomingBookingsSaga: Triggered with action:', action);
  try {
    const { customer_id } = action.payload || {};
    const user = yield select((state) => state.customer.user);
    console.log('getUpcomingBookingsSaga: User:', user);
    const token = localStorage.getItem('token');
    const customerId = customer_id || user?.customer_id || localStorage.getItem('customer_id');
    if (!customerId) {
      throw new Error('Customer ID is missing');
    }
    console.log('getUpcomingBookingsSaga: Using customerId:', customerId);
    const response = yield call(getCustomerUpcomingBookingsAPI, customerId);
    console.log('getUpcomingBookingsSaga: API Response:', response.data);
    yield put(getUpcomingBookingsSuccess(response.data.data || []));
    console.log('getUpcomingBookingsSaga: getUpcomingBookingsSuccess dispatched');
  } catch (error) {
    console.error('getUpcomingBookingsSaga: Error:', error.response?.data || error.message);
    yield put(getUpcomingBookingsFailure(error.response?.data?.message || error.message));
  }
}

function* initiatePaymentSaga(action) {
  console.log('initiatePaymentSaga: Triggered with payload:', action.payload);
  try {
    const token = localStorage.getItem('token');
    console.log('initiatePaymentSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(initiatePaymentAPI, action.payload);
    console.log('initiatePaymentSaga: API Response:', response.data);
    yield put(initiatePaymentSuccess(response.data));
    console.log('initiatePaymentSaga: initiatePaymentSuccess dispatched with:', response.data);
  } catch (error) {
    console.error('initiatePaymentSaga: Error:', error.response?.data || error.message);
    yield put(initiatePaymentFailure(error.response?.data?.message || error.message));
  }
}

function* verifyPaymentSaga(action) {
  console.log('verifyPaymentSaga: Triggered with payload:', action.payload);
  try {
    const token = localStorage.getItem('token');
    console.log('verifyPaymentSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(verifyPaymentAPI, action.payload);
    console.log('verifyPaymentSaga: API Response:', response.data);
    yield put(verifyPaymentSuccess(response.data));
    console.log('verifyPaymentSaga: verifyPaymentSuccess dispatched with:', response.data);
  } catch (error) {
    console.error('verifyPaymentSaga: Error:', error.response?.data || error.message);
    yield put(verifyPaymentFailure(error.response?.data?.message || error.message));
  }
}

function* getVendorsForChatSaga() {
  console.log('getVendorsForChatSaga: Triggered');
  try {
    const token = localStorage.getItem('token');
    console.log('getVendorsForChatSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(getVendorsForCustomerAPI);
    console.log('getVendorsForChatSaga: API Response:', response.data);
    const vendors = Array.isArray(response.data.data)
      ? response.data.data.map((vendor) => ({
          vendor_id: vendor.vendor_id,
          vendor_name: vendor.vendor_name,
          avatar: vendor.image_url?.[0] || hold,
          service_category: vendor.bussiness_category || 'Vendor',
        }))
      : [];
    yield put(getVendorsForChatSuccess(vendors));
    console.log('getVendorsForChatSaga: getVendorsForChatSuccess dispatched with:', vendors);
  } catch (error) {
    console.error('getVendorsForChatSaga: Error:', error.response?.data || error.message);
    yield put(getVendorsForChatFailure(error.response?.data?.message || error.message));
  }
}

function* getBookingDetailsSaga() {
  console.log('getBookingDetailsSaga: Triggered');
  try {
    const response = yield call(getBookingDetailsAPI);
    console.log('getBookingDetailsSaga: API Response:', response.data);
    yield put(bookingDetailsSuccess(response.data));
    console.log('getBookingDetailsSaga: bookingDetailsSuccess dispatched');
  } catch (error) {
    console.error('getBookingDetailsSaga: Error:', error.response?.data || error.message);
    yield put(bookingDetailsFailure(error.response?.data?.message || error.message));
  }
}

function* initiatePaymentBookNowSaga(action) {
  console.log('initiatePaymentBookNowSaga: Triggered with payload:', action.payload);
  try {
    const token = localStorage.getItem('token');
    console.log('initiatePaymentBookNowSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(initiatePaymentForBookNowAPI, action.payload);
    console.log('initiatePaymentBookNowSaga: API Response:', response.data);
    yield put(initiatePaymentBookNowSuccess(response.data));
    console.log('initiatePaymentBookNowSaga: initiatePaymentBookNowSuccess dispatched with:', response.data);
  } catch (error) {
    console.error('initiatePaymentBookNowSaga: Error:', error.response?.data || error.message);
    yield put(initiatePaymentBookNowFailure(error.response?.data?.message || error.message));
  }
}


function* verifyPaymentBookNowSaga(action) {
  console.log('verifyPaymentBookNowSaga: Triggered with payload:', action.payload);
  try {
    const token = localStorage.getItem('token');
    console.log('verifyPaymentBookNowSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(verifyPaymentForBookNowAPI, action.payload);
    console.log('verifyPaymentBookNowSaga: API Response:', response.data);
    yield put(verifyPaymentBookNowSuccess(response.data));
    console.log('verifyPaymentBookNowSaga: verifyPaymentBookNowSuccess dispatched with:', response.data);
  } catch (error) {
    console.error('verifyPaymentBookNowSaga: Error:', error.response?.data || error.message);
    yield put(verifyPaymentBookNowFailure(error.response?.data?.message || error.message));
  }
}
function* insertAddressSaga(action) {
  console.log('insertAddressSaga: Triggered with payload:', action.payload);
  try {
    const token = localStorage.getItem('token');
    console.log('insertAddressSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(insertAddressAPI, action.payload);
    console.log('insertAddressSaga: API Response:', response.data);
    // Extract address_id directly from response.data
    const address = {
      address_id: response.data.address_id,
      latitude: action.payload.address.latitude,
      longitude: action.payload.address.longitude,
      full_addres: action.payload.address.full_addres,
    };
    yield put(insertAddressSuccess(address));
    console.log('insertAddressSaga: insertAddressSuccess dispatched with:', address);
  } catch (error) {
    console.error('insertAddressSaga: Error:', error.response?.data || error.message);
    yield put(insertAddressFailure(error.response?.data?.message || error.message));
  }
} 

function* getCustomerAddressSaga() {
  console.log('getCustomerAddressSaga: Triggered');
  try {
    const token = localStorage.getItem('token');
    console.log('getCustomerAddressSaga: Token from localStorage:', token);
    if (!token) {
      throw new Error('Please Login to continue');
    }
    const response = yield call(getCustomerAddressAPI);
    console.log('getCustomerAddressSaga: API Response:', response.data);
    yield put(getCustomerAddressSuccess(response.data));
    console.log('getCustomerAddressSaga: getCustomerAddressSuccess dispatched');
  } catch (error) {
    console.error('getCustomerAddressSaga: Error:', error.response?.data || error.message);
    yield put(getCustomerAddressFailure(error.response?.data?.message || error.message));
  }
}
export function* customerSaga() {
  console.log('customerSaga: Initialized');
  yield takeLatest(loginRequest.type, loginCustomerSaga);
  yield takeLatest('RESTORE_USER', restoreUserSaga);
  yield takeLatest(signupRequest.type, signupCustomerSaga);
  yield takeLatest(getServiceCategoriesRequest.type, getServiceCategoriesSaga);
  yield takeLatest(getServicesRequest.type, getServicesSaga);
  yield takeLatest(getSliderImagesRequest.type, getSliderImagesSaga);
  yield takeLatest(registerCustomerRequest.type, registerCustomerSaga);
  yield takeLatest(getCustomerDataRequest.type, getCustomerDataSaga);
  yield takeLatest(updateCustomerRequest.type, updateCustomerSaga);
  yield takeLatest(insertComplaintRequest.type, insertCustomerComplaintSaga);
  yield takeLatest(getComplaintsRequest.type, getCustomerComplaintsSaga);
  yield takeLatest(updateComplaintRequest.type, updateCustomerComplaintSaga);
  yield takeLatest(deleteComplaintRequest.type, deleteCustomerComplaintSaga);
  yield takeLatest(getSingleServiceRequest.type, getSingleServiceSaga);
  yield takeLatest(getVendorsRequest.type, getVendorsSaga);
  yield takeLatest(fetchChatHistoryRequest.type, fetchChatHistorySaga);
  yield takeLatest(insertServiceBookingRequest.type, insertServiceBookingSaga);
  yield takeLatest(insertServiceBookingLaterRequest.type, insertServiceBookingLaterSaga);
  yield takeLatest(getVendorsWithServicesRequest.type, getVendorsWithServicesSaga);
  yield takeLatest(getCustomerServiceDetailsRequest.type, getCustomerServiceDetailsSaga);
  yield takeLatest(getService_CategoriesRequest.type, getService_CategoriesSaga);
  yield takeLatest(getServicesByCategoryRequest.type, getServicesByCategorySaga);
  yield takeLatest(insertReviewRequest.type, insertReviewSaga);
  yield takeLatest(getReviewsRequest.type, getReviewsSaga);
  yield takeLatest(updateReviewRequest.type, updateReviewSaga);
  yield takeLatest(deleteReviewRequest.type, deleteReviewSaga);
  yield takeLatest(getCompletedBookingsRequest.type, getCompletedBookingsSaga);
  yield takeLatest(getCancelledBookingsRequest.type, getCancelledBookingsSaga);
  yield takeLatest(getUpcomingBookingsRequest.type, getUpcomingBookingsSaga);
  yield takeLatest(initiatePaymentRequest.type, initiatePaymentSaga);
  yield takeLatest(verifyPaymentRequest.type, verifyPaymentSaga);
  yield takeLatest(getVendorsForChatRequest.type, getVendorsForChatSaga);
  yield takeLatest(bookingDetailsRequest.type, getBookingDetailsSaga);
  yield takeLatest(initiatePaymentBookNowRequest.type, initiatePaymentBookNowSaga);
  yield takeLatest(verifyPaymentBookNowRequest.type, verifyPaymentBookNowSaga);
  yield takeLatest(insertAddressRequest.type, insertAddressSaga);
  yield takeLatest(getCustomerAddressRequest.type, getCustomerAddressSaga);
}
