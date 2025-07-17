import { configureStore } from '@reduxjs/toolkit';
import customersReducer from './slices/customersSlice';
import projectsReducer from './slices/projectsSlice';
import paymentsReducer from './slices/paymentsSlice';
import servicesReducer from './slices/servicesSlice';
import quotationsReducer from './slices/quotationsSlice';
import componentsReducer from './slices/componentsSlice';
import packagesReducer from './slices/packagesSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    customers: customersReducer,
    projects: projectsReducer,
    payments: paymentsReducer,
    services: servicesReducer,
    quotations: quotationsReducer,
    components: componentsReducer,
    packages: packagesReducer,
    users: usersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;