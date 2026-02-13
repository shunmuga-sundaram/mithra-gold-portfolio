import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { MemberDashboard } from "./pages/member/Dashboard";
import { MemberTransactions } from "./pages/member/Transactions";
import { MemberSellTrade } from "./pages/member/SellTrade";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/member",
    children: [
      { index: true, Component: MemberDashboard },
      { path: "transactions", Component: MemberTransactions },
      { path: "sell-trade", Component: MemberSellTrade },
    ],
  },
]);
