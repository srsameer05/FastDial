import { combineReducers } from '@reduxjs/toolkit';
import adminReducer from '../features/admin/adminSlice'; 

const rootReducer = combineReducers({
  admin: adminReducer,
});

export default rootReducer;