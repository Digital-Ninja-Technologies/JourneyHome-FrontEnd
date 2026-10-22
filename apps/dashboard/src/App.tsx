import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "./auth/AuthContext";
import { queryClient, router } from "./router";

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    router.invalidate();
  }, [user]);

  return <RouterProvider router={router} context={{ queryClient, auth: { user } }} />;
}
