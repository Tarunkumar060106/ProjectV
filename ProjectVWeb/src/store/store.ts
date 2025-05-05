// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;