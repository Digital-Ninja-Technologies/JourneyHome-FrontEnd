import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { GuestOnly, RequireAuth } from "./components/RequireAuth";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import MakePayment from "./pages/MakePayment";
import PaymentCallback from "./pages/PaymentCallback";
import Payments from "./pages/Payments";
import OnboardingPayment from "./pages/OnboardingPayment";
import OnboardingPlan from "./pages/OnboardingPlan";
import PlanDetail from "./pages/PlanDetail";
import RequestService from "./pages/RequestService";
import ServiceRequests from "./pages/ServiceRequests";
import Welcome from "./pages/Welcome";
import Plans from "./pages/Plans";
import Signup from "./pages/Signup";

const COMING_SOON: [path: string, title: string][] = [
  ["profile", "Profile & settings"],
];

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
      </Route>
      {/* Signup guards itself so it can carry on to onboarding right after the account is created. */}
      <Route path="/signup" element={<Signup />} />
      <Route element={<RequireAuth />}>
        <Route path="/signup/plan" element={<OnboardingPlan />} />
        <Route path="/signup/payment" element={<OnboardingPayment />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/:id" element={<PlanDetail />} />
          <Route path="service-requests" element={<ServiceRequests />} />
          <Route path="service-requests/new" element={<RequestService />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payments" element={<Payments />} />
          <Route path="payments/new" element={<MakePayment />} />
          <Route path="payments/callback" element={<PaymentCallback />} />
          {COMING_SOON.map(([path, title]) => (
            <Route key={path} path={path} element={<ComingSoon title={title} />} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
