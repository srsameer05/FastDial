import { combineReducers } from '@reduxjs/toolkit';
import vendorReducer from '../features/vendor/vendorSlice';
import customerReducer from '../features/customer/customerSlice';

const rootReducer = combineReducers({
  vendor: vendorReducer,
  customer: customerReducer,
});

export default rootReducer;