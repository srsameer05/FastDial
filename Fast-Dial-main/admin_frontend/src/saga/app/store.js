import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import adminReducer from '../features/admin/adminSlice';
import adminSaga from '../features/admin/adminSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});
sagaMiddleware.run(adminSaga);

export default store;