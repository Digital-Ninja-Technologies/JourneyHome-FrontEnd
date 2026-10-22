import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/auth/auth-context";
import { queryClient, router } from "@/router";

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    router.invalidate();
  }, []);

  return (
    <RouterProvider router={router} context={{ queryClient, auth: { user } }} />
  );
}
