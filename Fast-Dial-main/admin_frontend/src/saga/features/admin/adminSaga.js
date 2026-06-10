import { call, put, takeLatest } from "redux-saga/effects";
import {
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
  getChatRoomAPI,
  getChatMessagesAPI,
  getCustomerServiceDetailsAPI,
  updateServiceBookingAPI,
  getVendorPaymentDetailsAPI,
} from "../../services/adminAPI";
import {
  adminLoginRequest,
  adminLoginSuccess,
  adminLoginFailure,
  forgetPasswordRequest,
  forgetPasswordSuccess,
  forgetPasswordFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  updatePasswordRequest,
  updatePasswordSuccess,
  updatePasswordFailure,
  addServiceCategoryRequest,
  addServiceCategorySuccess,
  addServiceCategoryFailure,
  getServiceCategoriesRequest,
  getServiceCategoriesSuccess,
  getServiceCategoriesFailure,
  updateServiceCategoryRequest,
  updateServiceCategorySuccess,
  updateServiceCategoryFailure,
  deleteServiceCategoryRequest,
  deleteServiceCategorySuccess,
  deleteServiceCategoryFailure,
  addSubServiceRequest,
  addSubServiceSuccess,
  addSubServiceFailure,
  getSubServicesRequest,
  getSubServicesSuccess,
  getSubServicesFailure,
  updateSubServiceRequest,
  updateSubServiceSuccess,
  updateSubServiceFailure,
  deleteSubServiceRequest,
  deleteSubServiceSuccess,
  deleteSubServiceFailure,
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
  addSubscriptionRequest,
  addSubscriptionSuccess,
  addSubscriptionFailure,
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
  getAllPaymentDetailsRequest,
  getAllPaymentDetailsSuccess,
  getAllPaymentDetailsFailure,
  getVendorComplaintsRequest,
  getVendorComplaintsSuccess,
  getVendorComplaintsFailure,
  getCustomerComplaintsRequest,
  getCustomerComplaintsSuccess,
  getCustomerComplaintsFailure,
  getChatRoomRequest,
  getChatRoomSuccess,
  getChatRoomFailure,
  fetchChatHistoryRequest,
  fetchChatHistorySuccess,
  fetchChatHistoryFailure,
  getCustomerServiceDetailsRequest,
  getCustomerServiceDetailsSuccess,
  getCustomerServiceDetailsFailure,
  updateServiceBookingRequest,
  updateServiceBookingSuccess,
  updateServiceBookingFailure,
  getVendorPaymentDetailsRequest,
  getVendorPaymentDetailsSuccess,
  getVendorPaymentDetailsFailure,
} from "./adminSlice";

function* loginSaga(action) {
  try {
    const response = yield call(loginAPI, action.payload);
    const loginData = {
      user: response.data.admin,
      token: response.data.token,
    };
    localStorage.setItem("adminName", response.data.admin.name);
    localStorage.setItem("adminId", response.data.admin.id.toString());
    yield put(adminLoginSuccess(loginData));
  } catch (error) {
    yield put(adminLoginFailure(error.message));
  }
}

function* forgetPasswordSaga(action) {
  try {
    const response = yield call(forgetPasswordAPI, action.payload);
    yield put(forgetPasswordSuccess());
  } catch (error) {
    yield put(forgetPasswordFailure(error.message));
  }
}

function* verifyOtpSaga(action) {
  try {
    const response = yield call(verifyOtpAPI, action.payload);
    yield put(verifyOtpSuccess());
  } catch (error) {
    yield put(verifyOtpFailure(error.message));
  }
}

function* updatePasswordSaga(action) {
  try {
    const response = yield call(updatePasswordAPI, action.payload);
    yield put(updatePasswordSuccess());
  } catch (error) {
    yield put(updatePasswordFailure(error.message));
  }
}

function* addServiceCategorySaga(action) {
  try {
    const response = yield call(addServiceCategoryAPI, action.payload);
    const categoryData = {
      service_cat_id: response.data.service_cat_id,
      service_name: response.data.service_category_name,
      service_description: response.data.service_desc,
      service_image_url: response.data.service_category_url,
    };
    yield put(addServiceCategorySuccess(categoryData));
  } catch (error) {
    yield put(addServiceCategoryFailure(error.response?.data?.message || error.message));
  }
}

function* getServiceCategoriesSaga() {
  try {
    const response = yield call(getServiceCategoriesAPI);
    let categories = Array.isArray(response.data)
      ? response.data
      : response.data.data
        ? response.data.data
        : [response.data];
    yield put(getServiceCategoriesSuccess(categories));
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("getServiceCategoriesSaga error:", errorMessage);
    yield put(getServiceCategoriesFailure(errorMessage));
  }
}

function* updateServiceCategorySaga(action) {
  try {
    console.log("updateServiceCategorySaga: Payload:", action.payload);
    const response = yield call(updateServiceCategoryAPI, action.payload);
    console.log("updateServiceCategorySaga: Response:", response.data);
    yield put(updateServiceCategorySuccess(response.data));
    yield put(getServiceCategoriesRequest());
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("updateServiceCategorySaga error:", errorMessage);
    yield put(updateServiceCategoryFailure(errorMessage));
  }
}

function* deleteServiceCategorySaga(action) {
  try {
    yield call(deleteServiceCategoryAPI, action.payload);
    yield put(deleteServiceCategorySuccess(action.payload));
    yield put(getServiceCategoriesRequest());
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("deleteServiceCategorySaga error:", errorMessage);
    yield put(deleteServiceCategoryFailure(errorMessage));
  }
}

function* addSubServiceSaga(action) {
  try {
    const response = yield call(addSubServiceAPI, action.payload);
    yield put(addSubServiceSuccess(response.data));
  } catch (error) {
    yield put(addSubServiceFailure(error.message));
  }
}

function* getSubServicesSaga(action) {
  try {
    console.log("getSubServicesSaga: Fetching sub-services for service_cat_id:", action.payload);
    const response = yield call(getSubServicesAPI, action.payload);
    const subServices = Array.isArray(response.data)
      ? response.data.filter(sub => sub.service_cat_id === action.payload)
      : (response.data.data || []).filter(sub => sub.service_cat_id === action.payload);
    console.log("getSubServicesSaga: Filtered sub-services:", subServices);
    yield put(getSubServicesSuccess(subServices));
  } catch (error) {
    console.error("getSubServicesSaga: Error:", error.message);
    yield put(getSubServicesFailure(error.message));
  }
}

function* updateSubServiceSaga(action) {
  try {
    const response = yield call(updateSubServiceAPI, action.payload);
    yield put(updateSubServiceSuccess(response.data));
    yield put(getSubServicesRequest(action.payload.service_cat_id));
  } catch (error) {
    yield put(updateSubServiceFailure(error.message));
  }
}

function* deleteSubServiceSaga(action) {
  try {
    yield call(deleteSubServiceAPI, action.payload.subServiceId);
    yield put(deleteSubServiceSuccess(action.payload));
    yield put(getSubServicesRequest(action.payload.serviceCatId));
  } catch (error) {
    yield put(deleteSubServiceFailure(error.message));
  }
}

function* getVendorsSaga() {
  try {
    const response = yield call(getVendorsAPI);
    const vendors = response.data.vendors || [];
    yield put(getVendorsSuccess(vendors));
  } catch (error) {
    yield put(getVendorsFailure(error.message));
  }
}

function* blockVendorSaga(action) {
  try {
    const { vendor_id, blocked_reason, is_blocked, blocked_date } = action.payload;
    console.log("blockVendorSaga: Sending payload to updateVendorBlockStatusAPI:", {
      vendor_id,
      is_blocked: is_blocked || 1,
      blocked_reason,
      blocked_date,
    });
    const response = yield call(updateVendorBlockStatusAPI, {
      vendor_id,
      is_blocked: is_blocked || 1,
      blocked_reason,
      blocked_date,
    });
    console.log("blockVendorSaga response:", response.data);
    yield put(blockVendorSuccess({ vendor_id, blocked_reason }));
    yield put(getVendorsRequest());
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("blockVendorSaga error:", errorMessage);
    yield put(blockVendorFailure(errorMessage));
  }
}

function* unblockVendorSaga(action) {
  try {
    const { vendor_id } = action.payload;
    const response = yield call(updateVendorBlockStatusAPI, {
      vendor_id,
      is_blocked: 0,
    });
    console.log("unblockVendorSaga response:", response.data);
    yield put(unblockVendorSuccess({ vendor_id }));
    yield put(getVendorsRequest());
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("unblockVendorSaga error:", errorMessage);
    yield put(unblockVendorFailure(errorMessage));
  }
}

function* getCustomersSaga() {
  try {
    const response = yield call(getCustomersAPI);
    const customers = Array.isArray(response.data) ? response.data : response.data.data;
    yield put(getCustomersSuccess(customers));
  } catch (error) {
    yield put(getCustomersFailure(error.message));
  }
}

function* getCustomerServiceDetailsSaga() {
  try {
    const response = yield call(getCustomerServiceDetailsAPI);
    // ✅ Handle both { success: true, data: [...] } and plain array
    const customerServiceDetails = Array.isArray(response.data) 
      ? response.data 
      : response.data.data || [];
    yield put(getCustomerServiceDetailsSuccess(customerServiceDetails));
  } catch (error) {
    yield put(getCustomerServiceDetailsFailure(error.message));
  }
}

function* addSubscriptionSaga(action) {
  try {
    const response = yield call(insertSubscriptionAPI, action.payload);
    yield put(addSubscriptionSuccess(response.data));
  } catch (error) {
    yield put(addSubscriptionFailure(error.message));
  }
}

function* getPendingVendorsSaga() {
  try {
    const response = yield call(getPendingVendorsAPI);
    let vendors;
    if (Array.isArray(response.data)) {
      vendors = response.data;
    } else if (response.data.vendors) {
      vendors = response.data.vendors;
    } else {
      vendors = [response.data];
    }
    yield put(getPendingVendorsSuccess(vendors));
  } catch (error) {
    yield put(getPendingVendorsFailure(error.message));
  }
}

function* getApprovedVendorsSaga() {
  try {
    const response = yield call(getApprovedVendorsAPI);
    const vendors = Array.isArray(response.data) ? response.data : [response.data];
    yield put(getApprovedVendorsSuccess(vendors));
  } catch (error) {
    yield put(getApprovedVendorsFailure(error.message));
  }
}

function* getRejectedVendorsSaga() {
  try {
    const response = yield call(getRejectedVendorsAPI);
    const vendors = Array.isArray(response.data) ? response.data : response.data.vendors || [];
    yield put(getRejectedVendorsSuccess(vendors));
  } catch (error) {
    yield put(getRejectedVendorsFailure(error.message));
  }
}

function* updateVendorStatusSaga(action) {
  try {
    const response = yield call(updateVendorStatusAPI, action.payload);
    yield put(updateVendorStatusSuccess(response.data));
    yield put(getPendingVendorsRequest());
  } catch (error) {
    yield put(updateVendorStatusFailure(error.message));
  }
}

function* getUserPaymentDetailsSaga(action) {
  try {
    const response = yield call(getUserPaymentDetailsAPI, action.payload);
    const paymentDetails = Array.isArray(response.data) ? response.data : [response.data];
    yield put(getUserPaymentDetailsSuccess(paymentDetails));
  } catch (error) {
    yield put(getUserPaymentDetailsFailure(error.message));
  }
}

function* getSubscriptionsSaga() {
  try {
    const response = yield call(getSubscriptionsAPI);
    const subscriptions = Array.isArray(response.data) ? response.data : response.data.data || [];
    yield put(getSubscriptionsSuccess(subscriptions));
  } catch (error) {
    yield put(getSubscriptionsFailure(error.response?.data?.message || error.message));
  }
}

function* updateSubscriptionSaga(action) {
  try {
    const response = yield call(updateSubscriptionAPI, action.payload);
    yield put(updateSubscriptionSuccess(response.data));
    yield put(getSubscriptionsRequest());
  } catch (error) {
    yield put(updateSubscriptionFailure(error.response?.data?.message || error.message));
  }
}

function* deleteSubscriptionSaga(action) {
  try {
    yield call(deleteSubscriptionAPI, action.payload);
    yield put(deleteSubscriptionSuccess(action.payload));
    yield put(getSubscriptionsRequest());
  } catch (error) {
    yield put(deleteSubscriptionFailure(error.response?.data?.message || error.message));
  }
}

function* getAllPaymentDetailsSaga() {
  try {
    console.log("getAllPaymentDetailsSaga: Calling API");
    const response = yield call(getAllPaymentDetailsAPI);
    console.log("getAllPaymentDetailsSaga: API response:", response.data);
    const paymentDetails = response.data.data;
    if (!Array.isArray(paymentDetails)) {
      console.error("getAllPaymentDetailsSaga: Expected an array, got:", paymentDetails);
      throw new Error("Invalid response format: Expected an array of payment details");
    }
    yield put(getAllPaymentDetailsSuccess(paymentDetails));
  } catch (error) {
    console.error("getAllPaymentDetailsSaga: Error:", error.message);
    yield put(getAllPaymentDetailsFailure(error.message));
  }
}

function* getVendorComplaintsSaga() {
  try {
    const response = yield call(getVendorComplaintsAPI);
    const complaints = Array.isArray(response.data) ? response.data : [];
    yield put(getVendorComplaintsSuccess(complaints));
  } catch (error) {
    yield put(getVendorComplaintsFailure(error.message));
  }
}

function* getCustomerComplaintsSaga() {
  try {
    const response = yield call(getCustomerComplaintsAPI);
    const complaints = Array.isArray(response.data) ? response.data : [];
    yield put(getCustomerComplaintsSuccess(complaints));
  } catch (error) {
    yield put(getCustomerComplaintsFailure(error.message));
  }
}

function* getChatRoomSaga(action) {
  try {
    const response = yield call(getChatRoomAPI, action.payload);
    yield put(getChatRoomSuccess({ roomId: response.data.roomId, vendorId: action.payload.vendorId }));
  } catch (error) {
    yield put(getChatRoomFailure(error.message));
  }
}

function* fetchChatHistorySaga(action) {
  try {
    const { roomId } = action.payload;
    console.log("Fetching chat history for roomId:", roomId);
    const response = yield call(getChatMessagesAPI, roomId);
    console.log("Chat history response:", response.data);
    const messages = Array.isArray(response.data.messages) ? response.data.messages : [];
    yield put(fetchChatHistorySuccess(messages));
  } catch (error) {
    console.error("Fetch chat history error:", error);
    yield put(
      fetchChatHistoryFailure(
        error.response?.data?.message || "Failed to fetch chat history"
      )
    );
  }
}

function* updateServiceBookingSaga(action) {
  console.log("Saga triggered for updateServiceBooking with payload:", action.payload);
  try {
    const response = yield call(updateServiceBookingAPI, action.payload);
    console.log("API response:", response);
    yield put(updateServiceBookingSuccess());
    yield put(getCustomerServiceDetailsRequest());
  } catch (error) {
    console.error("updateServiceBookingSaga error:", error.message);
    yield put(updateServiceBookingFailure(error.message));
  }
}

function* getVendorPaymentDetailsSaga() {
  try {
    const response = yield call(getVendorPaymentDetailsAPI);
    console.log("API response:", response.data);
    const paymentDetails = Array.isArray(response.data.data)
      ? response.data.data
      : [response.data.data];
    yield put(getVendorPaymentDetailsSuccess(paymentDetails));
  } catch (error) {
    console.error("API error:", error);
    yield put(getVendorPaymentDetailsFailure(error.message));
  }
}

export default function* adminSaga() {
  console.log("adminSaga initialized");
  console.log("Listening for getCustomerServiceDetailsRequest:", getCustomerServiceDetailsRequest.type);
  yield takeLatest(adminLoginRequest.type, loginSaga);
  yield takeLatest(forgetPasswordRequest.type, forgetPasswordSaga);
  yield takeLatest(verifyOtpRequest.type, verifyOtpSaga);
  yield takeLatest(updatePasswordRequest.type, updatePasswordSaga);
  yield takeLatest(addServiceCategoryRequest.type, addServiceCategorySaga);
  yield takeLatest(getServiceCategoriesRequest.type, getServiceCategoriesSaga);
  yield takeLatest(updateServiceCategoryRequest.type, updateServiceCategorySaga);
  yield takeLatest(deleteServiceCategoryRequest.type, deleteServiceCategorySaga);
  yield takeLatest(addSubServiceRequest.type, addSubServiceSaga);
  yield takeLatest(getSubServicesRequest.type, getSubServicesSaga);
  yield takeLatest(updateSubServiceRequest.type, updateSubServiceSaga);
  yield takeLatest(deleteSubServiceRequest.type, deleteSubServiceSaga);
  yield takeLatest(getVendorsRequest.type, getVendorsSaga);
  yield takeLatest(blockVendorRequest.type, blockVendorSaga);
  yield takeLatest(unblockVendorRequest.type, unblockVendorSaga);
  yield takeLatest(getCustomersRequest.type, getCustomersSaga);
  yield takeLatest(getCustomerServiceDetailsRequest.type, getCustomerServiceDetailsSaga);
  yield takeLatest(addSubscriptionRequest.type, addSubscriptionSaga);
  yield takeLatest(getPendingVendorsRequest.type, getPendingVendorsSaga);
  yield takeLatest(getApprovedVendorsRequest.type, getApprovedVendorsSaga);
  yield takeLatest(getRejectedVendorsRequest.type, getRejectedVendorsSaga);
  yield takeLatest(updateVendorStatusRequest.type, updateVendorStatusSaga);
  yield takeLatest(getUserPaymentDetailsRequest.type, getUserPaymentDetailsSaga);
  yield takeLatest(getSubscriptionsRequest.type, getSubscriptionsSaga);
  yield takeLatest(updateSubscriptionRequest.type, updateSubscriptionSaga);
  yield takeLatest(deleteSubscriptionRequest.type, deleteSubscriptionSaga);
  yield takeLatest(getAllPaymentDetailsRequest.type, getAllPaymentDetailsSaga);
  yield takeLatest(getVendorComplaintsRequest.type, getVendorComplaintsSaga);
  yield takeLatest(getCustomerComplaintsRequest.type, getCustomerComplaintsSaga);
  yield takeLatest(getVendorPaymentDetailsRequest.type, getVendorPaymentDetailsSaga);
  yield takeLatest(getChatRoomRequest.type, getChatRoomSaga);
  yield takeLatest(fetchChatHistoryRequest.type, fetchChatHistorySaga);
  yield takeLatest(updateServiceBookingRequest.type, updateServiceBookingSaga);
}