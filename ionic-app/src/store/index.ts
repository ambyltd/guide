/**
 * Configuration du store Redux Toolkit expert - Version simplifiée
 * Architecture immutable avec middleware et dev tools
 */

import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { attractionsSlice } from './slices/attractionsSlice';

// ===== MIDDLEWARE PERSONNALISÉ =====
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    if (typeof action === 'object' && action !== null && 'type' in action) {
      console.group(`Action: ${(action as { type: string }).type}`);
      console.log('Previous state:', store.getState());
      console.log('Action:', action);
    }
  }

  const result = next(action);

  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log('Next state:', store.getState());
    console.groupEnd();
  }

  return result;
};

// ===== CONFIGURATION DU STORE =====
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    attractions: attractionsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
        ignoredActionsPaths: ['payload.createdAt', 'payload.updatedAt'],
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
      },
    }).concat(loggerMiddleware),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

// ===== TYPES =====
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;