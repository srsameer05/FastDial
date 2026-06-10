import { all } from 'redux-saga/effects';
import { adminSaga } from '../features/admin/adminSaga';
import { customerSaga } from '../features/customer/customerSaga';
import { vendorSaga } from '../features/vendor/vendorSaga';

export default function* rootSaga() {
  yield all([adminSaga()]);
}