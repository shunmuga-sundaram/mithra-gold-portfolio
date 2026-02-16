import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/App.tsx";
import { store } from "./store";
import "./styles/index.css";

/**
 * REDUX PROVIDER
 *
 * What is Provider?
 * - A React component from react-redux
 * - Makes Redux store available to all components
 * - Must wrap your entire app
 *
 * How it works:
 * <Provider store={store}>
 *   <App />  ← All components inside can access Redux
 * </Provider>
 *
 * Without Provider:
 * - useSelector() won't work
 * - useDispatch() won't work
 * - Components can't access Redux store
 *
 * With Provider:
 * - Any component can: useAppSelector(state => state.auth.admin)
 * - Any component can: dispatch(loginAdmin())
 */
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
  