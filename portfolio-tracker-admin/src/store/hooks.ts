import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * TYPED REDUX HOOKS
 *
 * Why do we need these?
 * - TypeScript doesn't know the shape of your Redux state by default
 * - These hooks are pre-typed with your actual state shape
 * - Better autocomplete, type checking, and error prevention
 *
 * Instead of:
 * const dispatch = useDispatch(); // TypeScript doesn't know what actions exist
 * const admin = useSelector(state => state.auth.admin); // No autocomplete for 'state'
 *
 * Use:
 * const dispatch = useAppDispatch(); // TypeScript knows all your actions
 * const admin = useAppSelector(state => state.auth.admin); // Full autocomplete!
 */

/**
 * useAppDispatch
 *
 * Typed version of useDispatch
 *
 * Usage in components:
 * const dispatch = useAppDispatch();
 * dispatch(loginAdmin({ email, password })); // TypeScript validates this!
 *
 * Benefits:
 * - Autocomplete for all actions
 * - TypeScript error if you pass wrong payload
 * - Better IDE support
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * useAppSelector
 *
 * Typed version of useSelector
 *
 * Usage in components:
 * const admin = useAppSelector(state => state.auth.admin);
 * const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
 *
 * Benefits:
 * - Autocomplete for state shape (state.auth.admin, etc.)
 * - TypeScript knows return type
 * - Catches typos at compile-time
 *
 * Example:
 * // ✅ TypeScript knows admin can be Admin | null
 * const admin = useAppSelector(state => state.auth.admin);
 * if (admin) {
 *   console.log(admin.email); // TypeScript knows admin has email
 * }
 *
 * // ❌ TypeScript error - typo caught!
 * const admin = useAppSelector(state => state.auth.adminn);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * HOW TO USE THESE HOOKS
 *
 * Example component:
 *
 * import { useAppDispatch, useAppSelector } from '@/store/hooks';
 * import { loginAdmin, selectAdmin, selectAuthLoading } from '@/store/slices/authSlice';
 *
 * function LoginPage() {
 *   const dispatch = useAppDispatch();
 *   const admin = useAppSelector(selectAdmin);
 *   const loading = useAppSelector(selectAuthLoading);
 *
 *   const handleLogin = async () => {
 *     try {
 *       await dispatch(loginAdmin({ email, password })).unwrap();
 *       // Login success!
 *     } catch (error) {
 *       // Login failed
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {loading && <Spinner />}
 *       <button onClick={handleLogin}>Login</button>
 *     </div>
 *   );
 * }
 */
