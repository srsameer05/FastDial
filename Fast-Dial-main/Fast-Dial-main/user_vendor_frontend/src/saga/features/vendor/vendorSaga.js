import { takeLatest, call, put, all } from 'redux-saga/effects';
import {
  vendorLoginAPI,
  fetchServiceRequestsAPI,
  fetchCancelledBookingsCountAPI,
  fetchCompletedBookingsCountAPI,
  fetchTotalServiceRequestsPerMonthAPI,
  fetchSubscriptionsAPI,
  fetchVendorProfileAPI,
  updateVendorAPI,
  vendorSignupAPI,
  fetchVendorComplaintsAPI,
  insertVendorComplaintAPI,
  updateVendorComplaintAPI,
  deleteVendorComplaintAPI,
  forgotPasswordAPI,
  verifyOtpAPI,
  updatePasswordAPI,
  updateServiceBookingAPI,
  fetchCancelledBookingsAPI,
  createOrderAPI,
  verifyPaymentAPI,
  fetchVendorEarningsAPI,
  fetchVendorPaymentDetailsAPI,
  fetchAdminsAPI,
  fetchCustomersAPI,
  getChatRoomAPI,
  getCustomerChatRoomAPI,
  fetchChatHistoryAPI,
  fetchCustomerChatHistoryAPI,
  fetchServicesAPI,
  fetchVendorServicesAPI,
  updateVendorServiceAPI,
  getVendorFreeTrialDetailsAPI,
} from '../../services/vendorAPI';
import {
  vendorLoginRequest,
  vendorLoginSuccess,
  vendorLoginFailure,
  fetchServiceRequestsRequest,
  fetchServiceRequestsSuccess,
  fetchServiceRequestsFailure,
  fetchCancelledBookingsCountRequest,
  fetchCancelledBookingsCountSuccess,
  fetchCancelledBookingsCountFailure,
  fetchCompletedBookingsCountRequest,
  fetchCompletedBookingsCountSuccess,
  fetchCompletedBookingsCountFailure,
  fetchTotalServiceRequestsPerMonthRequest,
  fetchTotalServiceRequestsPerMonthSuccess,
  fetchTotalServiceRequestsPerMonthFailure,
  fetchSubscriptionsRequest,
  fetchSubscriptionsSuccess,
  fetchSubscriptionsFailure,
  fetchVendorProfileRequest,
  fetchVendorProfileSuccess,
  fetchVendorProfileFailure,
  updateVendorRequest,
  updateVendorSuccess,
  updateVendorFailure,
  vendorSignupRequest,
  vendorSignupSuccess,
  vendorSignupFailure,
  fetchComplaintsRequest,
  fetchComplaintsSuccess,
  fetchComplaintsFailure,
  insertComplaintRequest,
  insertComplaintSuccess,
  insertComplaintFailure,
  updateComplaintRequest,
  updateComplaintSuccess,
  updateComplaintFailure,
  deleteComplaintRequest,
  deleteComplaintSuccess,
  deleteComplaintFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  fetchCompletedRequestsRequest,
  fetchCompletedRequestsSuccess,
  fetchCompletedRequestsFailure,
  fetchFailedRequestsRequest,
  fetchFailedRequestsSuccess,
  fetchFailedRequestsFailure,
  updateServiceBookingRequest,
  updateServiceBookingSuccess,
  updateServiceBookingFailure,
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  verifyPaymentRequest,
  verifyPaymentSuccess,
  verifyPaymentFailure,
  fetchVendorEarningsRequest,
  fetchVendorEarningsSuccess,
  fetchVendorEarningsFailure,
  fetchVendorPaymentDetailsRequest,
  fetchVendorPaymentDetailsSuccess,
  fetchVendorPaymentDetailsFailure,
  fetchAdminsRequest,
  fetchAdminsSuccess,
  fetchAdminsFailure,
  fetchCustomersRequest,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  getChatRoomRequest,
  getChatRoomSuccess,
  getChatRoomFailure,
  getCustomerChatRoomRequest,
  getCustomerChatRoomSuccess,
  getCustomerChatRoomFailure,
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
  getVendorFreeTrialDetailsSuccess,
  getVendorFreeTrialDetailsFailure,
  getVendorFreeTrialDetailsRequest,
} from './vendorSlice';

function* vendorLoginSaga(action) {
  try {
    const response = yield call(vendorLoginAPI, action.payload);
    //console.log("vendorLoginSaga - API login response:", response);
    if (response.token && response.vendor?.id) {
      yield put(vendorLoginSuccess(response));
      localStorage.setItem('vendorToken', response.token);
      localStorage.setItem('vendorId', response.vendor.id);
      const vendorId = response.vendor.id;
      yield all([
        put(fetchVendorProfileRequest(vendorId)),
        put(fetchServiceRequestsRequest(vendorId)),
        put(fetchCancelledBookingsCountRequest(vendorId)),
        put(fetchCompletedBookingsCountRequest(vendorId)),
        put(fetchTotalServiceRequestsPerMonthRequest(vendorId)),
        put(fetchVendorEarningsRequest(vendorId)),
        put(fetchVendorPaymentDetailsRequest(vendorId)),
        put(fetchAdminsRequest()),
        put(fetchCustomersRequest()),
        put(fetchVendorServicesRequest(vendorId)),
      ]);
      //console.log("vendorLoginSaga - Login successful, data fetched for vendor:", vendorId);
    } else {
      throw new Error('Invalid login response: missing token or vendor ID');
    }
  } catch (error) {
    console.error("vendorLoginSaga - Error:", error.stack || error);
    yield put(vendorLoginFailure(error.response?.data?.message || error.message));
  }
}

function* fetchVendorProfileSaga(action) {
  try {
    const response = yield call(fetchVendorProfileAPI, action.payload);
    //console.log("fetchVendorProfileSaga - API response:", response);
    const payload = response.vendor || response.data?.vendor || response;
    yield put(fetchVendorProfileSuccess(payload));
  } catch (error) {
    console.error("fetchVendorProfileSaga - Error:", error.stack || error);
    yield put(fetchVendorProfileFailure(error.response?.data?.message || error.message));
  }
}

function* fetchAdminsSaga() {
  try {
    const response = yield call(fetchAdminsAPI);
    //console.log("fetchAdminsSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchAdminsSuccess(payload));
  } catch (error) {
    console.error("fetchAdminsSaga - Error:", error.stack || error);
    yield put(fetchAdminsFailure(error.response?.data?.message || error.message));
  }
}

function* fetchCustomersSaga() {
  try {
    const response = yield call(fetchCustomersAPI);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    console.log("fetchCustomersSaga - API response:", payload);
    yield put(fetchCustomersSuccess(payload));
  } catch (error) {
    console.error("fetchCustomersSaga - Error:", error.stack || error);
    yield put(fetchCustomersFailure(error.response?.data?.message || error.message));
  }
}

function* fetchServiceRequestsSaga(action) {
  try {
    const response = yield call(fetchServiceRequestsAPI, action.payload);
    //console.log("fetchServiceRequestsSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchServiceRequestsSuccess(payload));
  } catch (error) {
    console.error("fetchServiceRequestsSaga - Error:", error.stack || error);
    yield put(fetchServiceRequestsFailure(error.response?.data?.message || error.message));
  }
}

function* fetchCancelledBookingsCountSaga(action) {
  try {
    const response = yield call(fetchCancelledBookingsCountAPI, action.payload);
    //console.log("fetchCancelledBookingsCountSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchCancelledBookingsCountSuccess(payload));
  } catch (error) {
    console.error("fetchCancelledBookingsCountSaga - Error:", error.stack || error);
    yield put(fetchCancelledBookingsCountFailure(error.response?.data?.message || error.message));
  }
}

function* fetchCompletedBookingsCountSaga(action) {
  try {
    const response = yield call(fetchCompletedBookingsCountAPI, action.payload);
    //console.log("fetchCompletedBookingsCountSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchCompletedBookingsCountSuccess(payload));
  } catch (error) {
    console.error("fetchCompletedBookingsCountSaga - Error:", error.stack || error);
    yield put(fetchCompletedBookingsCountFailure(error.response?.data?.message || error.message));
  }
}

function* fetchTotalServiceRequestsPerMonthSaga(action) {
  try {
    const response = yield call(fetchTotalServiceRequestsPerMonthAPI, action.payload);
    //console.log("fetchTotalServiceRequestsPerMonthSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchTotalServiceRequestsPerMonthSuccess(payload));
  } catch (error) {
    console.error("fetchTotalServiceRequestsPerMonthSaga - Error:", error.stack || error);
    yield put(fetchTotalServiceRequestsPerMonthFailure(error.response?.data?.message || error.message));
  }
}

function* fetchSubscriptionsSaga() {
  try {
    const response = yield call(fetchSubscriptionsAPI);
    //console.log("fetchSubscriptionsSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchSubscriptionsSuccess(payload));
  } catch (error) {
    console.error("fetchSubscriptionsSaga - Error:", error.stack || error);
    yield put(fetchSubscriptionsFailure(error.response?.data?.message || error.message));
  }
}

function* updateVendorSaga(action) {
  try {
    const response = yield call(updateVendorAPI, action.payload);
    //console.log("updateVendorSaga - API response:", response);
    yield put(updateVendorSuccess(action.payload));
  } catch (error) {
    console.error("updateVendorSaga - Error:", error.stack || error);
    yield put(updateVendorFailure(error.response?.data?.message || error.message));
  }
}

function* vendorSignupSaga(action) {
  try {
    const response = yield call(vendorSignupAPI, action.payload);
    //console.log("vendorSignupSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(vendorSignupSuccess(payload));
  } catch (error) {
    console.error("vendorSignupSaga - Error:", error.stack || error);
    yield put(vendorSignupFailure(error.response?.data?.message || error.message));
  }
}

function* fetchComplaintsSaga(action) {
  try {
    const response = yield call(fetchVendorComplaintsAPI, action.payload);
    //console.log("fetchComplaintsSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchComplaintsSuccess(payload));
  } catch (error) {
    console.error("fetchComplaintsSaga - Error:", error.stack || error);
    yield put(fetchComplaintsFailure(error.response?.data?.message || error.message));
  }
}

function* insertComplaintSaga(action) {
  try {
    const response = yield call(insertVendorComplaintAPI, action.payload);
    //console.log("insertComplaintSaga - API response:", response);
    yield put(insertComplaintSuccess(response.data));
  } catch (error) {
    console.error("insertComplaintSaga - Error:", error.stack || error);
    yield put(insertComplaintFailure(error.response?.data?.message || error.message));
  }
}

function* updateComplaintSaga(action) {
  try {
    const response = yield call(updateVendorComplaintAPI, action.payload);
    //console.log("updateComplaintSaga - API response:", response);
    const updatedComplaint = {
      vend_comp_id: action.payload.vend_comp_id,
      vend_comp_desc: action.payload.vend_comp_desc,
      vendor_id: action.payload.vendor_id,
    };
    yield put(updateComplaintSuccess(updatedComplaint));
  } catch (error) {
    console.error("updateComplaintSaga - Error:", error.stack || error);
    yield put(updateComplaintFailure(error.response?.data?.message || error.message));
  }
}

function* deleteComplaintSaga(action) {
  try {
    const response = yield call(deleteVendorComplaintAPI, action.payload);
    //console.log("deleteComplaintSaga - API response:", response);
    yield put(deleteComplaintSuccess({
      vend_comp_id: action.payload.vend_comp_id,
      ...response.data,
    }));
  } catch (error) {
    console.error("deleteComplaintSaga - Error:", error.stack || error);
    yield put(deleteComplaintFailure(error.response?.data?.message || error.message));
  }
}

function* forgotPasswordSaga(action) {
  try {
    const response = yield call(forgotPasswordAPI, action.payload);
    //console.log("forgotPasswordSaga - Raw API response:", JSON.stringify(response, null, 2));
    if (!response) {
      throw new Error("No response received from forgotPasswordAPI");
    }
    const payload = response.data ? (response.data.data || response.data) : response;
    //console.log("forgotPasswordSaga - Processed payload:", payload);
    yield put(forgotPasswordSuccess(payload));
  } catch (error) {
    console.error("forgotPasswordSaga - Error:", error.stack || error);
    console.error("forgotPasswordSaga - Error Response:", error.response);
    yield put(forgotPasswordFailure(error.response?.data?.message || error.message || "Failed to send OTP"));
  }
}

function* verifyOtpSaga(action) {
  try {
    const response = yield call(verifyOtpAPI, action.payload);
    //console.log("verifyOtpSaga - Raw API response:", JSON.stringify(response, null, 2));
    if (!response) {
      throw new Error("No response received from verifyOtpAPI");
    }
    const payload = response.data ? (response.data.data || response.data) : response;
    //console.log("verifyOtpSaga - Processed payload:", payload);
    yield put(verifyOtpSuccess(payload));
  } catch (error) {
    console.error("verifyOtpSaga - Error:", error.stack || error);
    console.error("verifyOtpSaga - Error Response:", error.response);
    yield put(verifyOtpFailure(error.response?.data?.message || error.message || "Failed to verify OTP"));
  }
}

function* updatePasswordSaga(action) {
  try {
    const response = yield call(updatePasswordAPI, action.payload);
    //console.log("updatePasswordSaga - Raw API response:", JSON.stringify(response, null, 2));
    if (!response) {
      throw new Error("No response received from updatePasswordAPI");
    }
    const payload = response.data ? (response.data.data || response.data) : response;
    //console.log("updatePasswordSaga - Processed payload:", payload);
    yield put(resetPasswordSuccess(payload));
  } catch (error) {
    console.error("updatePasswordSaga - Error:", error.stack || error);
    console.error("updatePasswordSaga - Error Response:", error.response);
    yield put(resetPasswordFailure(error.response?.data?.message || error.message || "Failed to update password"));
  }
}

function* fetchCompletedRequestsSaga(action) {
  try {
    const response = yield call(fetchServiceRequestsAPI, action.payload);
    //console.log("fetchCompletedRequestsSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchCompletedRequestsSuccess(payload));
  } catch (error) {
    console.error("fetchCompletedRequestsSaga - Error:", error.stack || error);
    yield put(fetchCompletedRequestsFailure(error.response?.data?.message || error.message));
  }
}

function* fetchFailedRequestsSaga(action) {
  try {
    const response = yield call(fetchCancelledBookingsAPI, action.payload);
    //console.log("fetchFailedRequestsSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchFailedRequestsSuccess(payload));
  } catch (error) {
    console.error("fetchFailedRequestsSaga - Error:", error.stack || error);
    yield put(fetchFailedRequestsFailure(error.response?.data?.message || error.message));
  }
}

function* updateServiceBookingSaga(action) {
  try {
    const response = yield call(updateServiceBookingAPI, action.payload);
    //console.log("updateServiceBookingSaga - API response:", response);
    yield put(updateServiceBookingSuccess(action.payload));
    yield all([
      put(fetchServiceRequestsRequest(action.payload.vendor_id)),
      put(fetchCompletedRequestsRequest(action.payload.vendor_id)),
      put(fetchFailedRequestsRequest(action.payload.vendor_id)),
    ]);
  } catch (error) {
    console.error("updateServiceBookingSaga - Error:", error.stack || error);
    yield put(updateServiceBookingFailure(error.response?.data?.message || error.message));
  }
}

function* createOrderSaga(action) {
  try {
    const response = yield call(createOrderAPI, action.payload);
    //console.log("createOrderSaga - API response:", response);
    const payloadWithSubscription = {
      ...response,
      subscription_id: action.payload.subscription_id,
    };
    yield put(createOrderSuccess(payloadWithSubscription));
  } catch (error) {
    console.error("createOrderSaga - Error:", error.stack || error);
    yield put(createOrderFailure(error.response?.data?.message || error.message));
  }
}

function* verifyPaymentSaga(action) {
  try {
    const response = yield call(verifyPaymentAPI, action.payload);
    //console.log("verifyPaymentSaga - API response:", response);
    const payloadWithSubscription = {
      ...response,
      subscription_id: action.payload.subscription_id,
    };
    yield put(verifyPaymentSuccess(payloadWithSubscription));
  } catch (error) {
    console.error("verifyPaymentSaga - Error:", error.stack || error);
    yield put(verifyPaymentFailure(error.response?.data?.message || error.message));
  }
}

function* fetchVendorEarningsSaga(action) {
  try {
    const response = yield call(fetchVendorEarningsAPI, action.payload);
    //console.log("fetchVendorEarningsSaga - API response:", response);
    yield put(fetchVendorEarningsSuccess(response));
  } catch (error) {
    console.error("fetchVendorEarningsSaga - Error:", error.stack || error);
    yield put(fetchVendorEarningsFailure(error.response?.data?.message || error.message));
  }
}

function* fetchVendorPaymentDetailsSaga(action) {
  try {
    const response = yield call(fetchVendorPaymentDetailsAPI, action.payload);
    //console.log("fetchVendorPaymentDetailsSaga - API response:", response);
    const purchasedSubscriptionIds = response.data.map(item => item.subscription_id);
    yield put(fetchVendorPaymentDetailsSuccess(purchasedSubscriptionIds));
  } catch (error) {
    console.error("fetchVendorPaymentDetailsSaga - Error:", error.stack || error);
    yield put(fetchVendorPaymentDetailsFailure(error.response?.data?.message || error.message));
  }
}

function* getChatRoomSaga(action) {
  try {
    const { vendorId, adminId } = action.payload;
    const response = yield call(getChatRoomAPI, { vendorId, adminId });
    //console.log("getChatRoomSaga - API response:", response);
    yield put(getChatRoomSuccess({ roomId: response.roomId }));
  } catch (error) {
    console.error("getChatRoomSaga - Error:", error.stack || error);
    yield put(getChatRoomFailure(error.response?.data?.message || error.message));
  }
}

function* getCustomerChatRoomSaga(action) {
  try {
    const { vendor_id, customer_id } = action.payload;
    const response = yield call(getCustomerChatRoomAPI, { vendor_id, customer_id });
    //console.log("getCustomerChatRoomSaga - API response:", response);
    yield put(getCustomerChatRoomSuccess({ roomId: response.chat_room_id }));
  } catch (error) {
    console.error("getCustomerChatRoomSaga - Error:", error.stack || error);
    yield put(getCustomerChatRoomFailure(error.response?.data?.message || error.message));
  }
}

function* fetchChatHistorySaga(action) {
  try {
    const { roomId } = action.payload;
    const response = yield call(fetchChatHistoryAPI, roomId);
    //console.log("fetchChatHistorySaga - API response:", response);
    const messages = Array.isArray(response.messages) ? response.messages : [];
    const payload = messages.map(msg => ({
      ...msg,
      chat_room_id: msg.room_id || roomId,
      sent_at: msg.sent_at,
    }));
    //console.log("fetchChatHistorySaga - Mapped payload:", payload);
    yield put(fetchChatHistorySuccess(payload));
  } catch (error) {
    console.error("fetchChatHistorySaga - Error:", error.stack || error);
    yield put(fetchChatHistoryFailure(error.response?.data?.message || error.message));
  }
}

function* fetchCustomerChatHistorySaga(action) {
  try {
    const { roomId } = action.payload;
    const response = yield call(fetchCustomerChatHistoryAPI, roomId);
    //console.log("fetchCustomerChatHistorySaga - API response:", response);
    const messages = Array.isArray(response) ? response : [];
    const payload = messages.map(msg => ({
      ...msg,
      chat_room_id: msg.room_id || roomId,
      sent_at: msg.sent_at,
    }));
    //console.log("fetchCustomerChatHistorySaga - Mapped payload:", payload);
    yield put(fetchCustomerChatHistorySuccess(payload));
  } catch (error) {
    console.error("fetchCustomerChatHistorySaga - Error:", error.stack || error);
    yield put(fetchCustomerChatHistoryFailure(error.response?.data?.message || error.message));
  }
}

function* fetchServicesSaga() {
  try {
    const response = yield call(fetchServicesAPI);
    //console.log("fetchServicesSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchServicesSuccess(payload));
  } catch (error) {
    console.error("fetchServicesSaga - Error:", error.stack || error);
    yield put(fetchServicesFailure(error.response?.data?.message || error.message));
  }
}

function* fetchVendorServicesSaga(action) {
  try {
    const response = yield call(fetchVendorServicesAPI, action.payload);
    //console.log("fetchVendorServicesSaga - API response:", response);
    const payload = Array.isArray(response) ? response : response.data.data || response.data;
    yield put(fetchVendorServicesSuccess(payload));
  } catch (error) {
    console.error("fetchVendorServicesSaga - Error:", error.stack || error);
    yield put(fetchVendorServicesFailure(error.response?.data?.message || error.message));
  }
}

function* getVendorFreeTrialDetailsSaga() {
  try {
    const response = yield call(getVendorFreeTrialDetailsAPI);
    const payload = response?.data?.data ?? response?.data ?? response;
    yield put(getVendorFreeTrialDetailsSuccess(payload));
    console.log("getVendorFreeTrialDetailsSaga - API response:", payload);
  } catch (error) {
    console.error("fetchVendorServicesSaga - Error:", error.stack || error);
    yield put(getVendorFreeTrialDetailsFailure(error.response?.data?.message || error.message));
  }
}

function* updateVendorServiceSaga(action) {
  try {
    const response = yield call(updateVendorServiceAPI, action.payload);
    //console.log("updateVendorServiceSaga - API response:", response);
    yield put(updateVendorServiceSuccess(action.payload));
    const vendorId = action.payload.vendor_id;
    yield put(fetchVendorServicesRequest(vendorId));
  } catch (error) {
    console.error("updateVendorServiceSaga - Error:", error.stack || error);
    yield put(updateVendorServiceFailure(error.response?.data?.message || error.message));
  }
}

export default function* vendorSaga() {
  yield takeLatest(vendorLoginRequest.type, vendorLoginSaga);
  yield takeLatest(fetchVendorProfileRequest.type, fetchVendorProfileSaga);
  yield takeLatest(fetchAdminsRequest.type, fetchAdminsSaga);
  yield takeLatest(fetchCustomersRequest.type, fetchCustomersSaga);
  yield takeLatest(fetchServiceRequestsRequest.type, fetchServiceRequestsSaga);
  yield takeLatest(fetchCancelledBookingsCountRequest.type, fetchCancelledBookingsCountSaga);
  yield takeLatest(fetchCompletedBookingsCountRequest.type, fetchCompletedBookingsCountSaga);
  yield takeLatest(fetchTotalServiceRequestsPerMonthRequest.type, fetchTotalServiceRequestsPerMonthSaga);
  yield takeLatest(fetchSubscriptionsRequest.type, fetchSubscriptionsSaga);
  yield takeLatest(updateVendorRequest.type, updateVendorSaga);
  yield takeLatest(vendorSignupRequest.type, vendorSignupSaga);
  yield takeLatest(fetchComplaintsRequest.type, fetchComplaintsSaga);
  yield takeLatest(insertComplaintRequest.type, insertComplaintSaga);
  yield takeLatest(updateComplaintRequest.type, updateComplaintSaga);
  yield takeLatest(deleteComplaintRequest.type, deleteComplaintSaga);
  yield takeLatest(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeLatest(verifyOtpRequest.type, verifyOtpSaga);
  yield takeLatest(resetPasswordRequest.type, updatePasswordSaga);
  yield takeLatest(fetchCompletedRequestsRequest.type, fetchCompletedRequestsSaga);
  yield takeLatest(fetchFailedRequestsRequest.type, fetchFailedRequestsSaga);
  yield takeLatest(updateServiceBookingRequest.type, updateServiceBookingSaga);
  yield takeLatest(createOrderRequest.type, createOrderSaga);
  yield takeLatest(verifyPaymentRequest.type, verifyPaymentSaga);
  yield takeLatest(fetchVendorEarningsRequest.type, fetchVendorEarningsSaga);
  yield takeLatest(fetchVendorPaymentDetailsRequest.type, fetchVendorPaymentDetailsSaga);
  yield takeLatest(getChatRoomRequest.type, getChatRoomSaga);
  yield takeLatest(getCustomerChatRoomRequest.type, getCustomerChatRoomSaga);
  yield takeLatest(fetchChatHistoryRequest.type, fetchChatHistorySaga);
  yield takeLatest(fetchCustomerChatHistoryRequest.type, fetchCustomerChatHistorySaga);
  yield takeLatest(fetchServicesRequest.type, fetchServicesSaga);
  yield takeLatest(fetchVendorServicesRequest.type, fetchVendorServicesSaga);
  yield takeLatest(updateVendorServiceRequest.type, updateVendorServiceSaga);
  yield takeLatest(getVendorFreeTrialDetailsRequest.type, getVendorFreeTrialDetailsSaga);
}