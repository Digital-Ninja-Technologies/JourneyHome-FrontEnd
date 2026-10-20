import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "./components/AdminShell";
import { GuestOnly, RequireAuth } from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import PlanDetail from "./pages/PlanDetail";
import Plans from "./pages/Plans";
import ServiceRequestDetail from "./pages/ServiceRequestDetail";
import ServiceRequests from "./pages/ServiceRequests";
import Settings from "./pages/Settings";
import Unavailable from "./pages/Unavailable";
import UserDetail from "./pages/UserDetail";
import Users from "./pages/Users";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AdminShell />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/:id" element={<PlanDetail />} />
          <Route path="service-requests" element={<ServiceRequests />} />
          <Route path="service-requests/:id" element={<ServiceRequestDetail />} />
          <Route path="payments" element={<Unavailable title="Payments" needs="an admin payments endpoint (for example GET /payments/admin returning every payment)" />} />
          <Route path="audit-log" element={<Unavailable title="Audit log" needs="an endpoint that reads the audit log (the backend records audit events but has no route to list them)" />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
