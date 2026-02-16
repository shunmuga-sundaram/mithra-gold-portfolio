import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

/**
 * REDUX STORE CONFIGURATION
 *
 * This file creates and exports the Redux store.
 *
 * What is configureStore?
 * - Combines all reducers (slices) into one store
 * - Sets up Redux DevTools automatically
 * - Includes middleware (redux-thunk for async actions)
 * - Simplifies store setup (old Redux required 10+ lines of boilerplate)
 *
 * How it works:
 * 1. Import reducers from slices
 * 2. Pass them to configureStore
 * 3. Export the store
 * 4. Wrap app with <Provider store={store}> in main.tsx
 */

/**
 * CREATE STORE
 *
 * reducer: {} - Map of slice name to reducer function
 *   - Key: 'auth' → state.auth
 *   - Value: authReducer → handles auth slice updates
 *
 * Redux DevTools:
 * - Automatically enabled in development
 * - View state, actions, time-travel debugging
 * - Install browser extension: Redux DevTools
 *
 * Middleware:
 * - Redux Thunk included by default (handles async actions)
 * - Can add custom middleware if needed
 */
export const store = configureStore({
  reducer: {
    /**
     * AUTH SLICE
     *
     * Maps to: state.auth
     * Managed by: authReducer (from authSlice.ts)
     *
     * Structure:
     * {
     *   auth: {
     *     admin: { ... },
     *     accessToken: "eyJ...",
     *     isAuthenticated: true,
     *     loading: false,
     *     error: null
     *   }
     * }
     */
    auth: authReducer,

    /**
     * FUTURE SLICES
     *
     * Add more slices here as you build features:
     */
    // goldRate: goldRateReducer,
    // members: membersReducer,
    // trades: tradesReducer,
  },

  /**
   * MIDDLEWARE
   *
   * Middleware runs between dispatching an action and reaching the reducer
   *
   * Flow:
   * dispatch(action) → middleware → reducer → new state
   *
   * Default middleware includes:
   * - redux-thunk (async actions)
   * - serializableCheck (warns if non-serializable values in state)
   * - immutableCheck (warns if you mutate state directly)
   */
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      /**
       * SERIALIZABLE CHECK
       *
       * Redux state should be serializable (can convert to JSON)
       * - ✅ Strings, numbers, booleans, arrays, plain objects
       * - ❌ Functions, Promises, Dates, class instances
       *
       * Why? Redux DevTools, persistence, time-travel debugging
       *
       * We keep it enabled for development safety
       */
      serializableCheck: true,
    }),

  /**
   * DEVTOOLS
   *
   * Enable Redux DevTools in development
   * Disabled in production automatically
   *
   * Features:
   * - View current state
   * - See all dispatched actions
   * - Time-travel debugging (undo/redo actions)
   * - Export/import state
   */
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * TYPESCRIPT TYPES
 *
 * These types help TypeScript understand your Redux store
 */

/**
 * RootState - The type of the entire Redux state
 *
 * Usage:
 * const admin = useSelector((state: RootState) => state.auth.admin);
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch - The type of the dispatch function
 *
 * Usage:
 * const dispatch = useDispatch<AppDispatch>();
 * dispatch(loginAdmin({ email, password }));
 */
export type AppDispatch = typeof store.dispatch;

/**
 * TYPED HOOKS
 *
 * Pre-typed versions of useDispatch and useSelector
 * Use these instead of the plain hooks for type safety
 */

/**
 * We'll create these in a separate hooks file for reusability
 * See: src/store/hooks.ts
 */
