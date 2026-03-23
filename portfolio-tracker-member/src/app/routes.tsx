import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { MemberDashboard } from "./pages/member/Dashboard";
import { MemberTransactions } from "./pages/member/Transactions";
import { MemberSellTrade } from "./pages/member/SellTrade";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/terms",
    Component: TermsOfService,
  },
  {
    path: "/privacy",
    Component: PrivacyPolicy,
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
