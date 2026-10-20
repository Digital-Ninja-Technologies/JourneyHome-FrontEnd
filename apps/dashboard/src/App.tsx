import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { GuestOnly, RequireAuth } from "./components/RequireAuth";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const COMING_SOON: [path: string, title: string][] = [
  ["plans", "My plans"],
  ["plans/:id", "Plan details"],
  ["payments", "Payments"],
  ["payments/new", "Make a payment"],
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
          {COMING_SOON.map(([path, title]) => (
            <Route key={path} path={path} element={<ComingSoon title={title} />} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
