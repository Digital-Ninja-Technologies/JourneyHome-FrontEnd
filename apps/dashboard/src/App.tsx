import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { GuestOnly, RequireAuth } from "./components/RequireAuth";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MakePayment from "./pages/MakePayment";
import PaymentCallback from "./pages/PaymentCallback";
import Payments from "./pages/Payments";
import PlanDetail from "./pages/PlanDetail";
import Plans from "./pages/Plans";
import Signup from "./pages/Signup";

const COMING_SOON: [path: string, title: string][] = [
  ["service-requests", "Service requests"],
  ["service-requests/new", "Request service"],
  ["notifications", "Notifications"],
  ["profile", "Profile & settings"],
];

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/:id" element={<PlanDetail />} />
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
