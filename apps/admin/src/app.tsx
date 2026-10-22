import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "@/components/admin-shell";
import { GuestOnly, RequireAuth } from "@/components/require-auth";
import AuditLog from "@/pages/audit-log";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Payments from "@/pages/payments";
import PlanDetail from "@/pages/plan-detail";
import Plans from "@/pages/plans";
import ServiceRequestDetail from "@/pages/service-request-detail";
import ServiceRequests from "@/pages/service-requests";
import Settings from "@/pages/settings";
import UserDetail from "@/pages/user-detail";
import Users from "@/pages/users";

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
          <Route
            path="service-requests/:id"
            element={<ServiceRequestDetail />}
          />
          <Route path="payments" element={<Payments />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
