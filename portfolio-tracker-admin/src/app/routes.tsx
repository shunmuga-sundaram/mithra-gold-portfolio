import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminGoldRate } from "./pages/admin/GoldRate";
import { AdminMembers } from "./pages/admin/Members";
import { AdminTrades } from "./pages/admin/Trades";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/admin",
    children: [
      { index: true, Component: AdminDashboard },
      { path: "gold-rate", Component: AdminGoldRate },
      { path: "members", Component: AdminMembers },
      { path: "trades", Component: AdminTrades },
    ],
  },
]);
