import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/__root";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,

        // biome-ignore lint/suspicious/noExplicitAny: generic error shape
        retry: (failureCount, error: any) => {
          const status =
            error?.status ?? error?.statusCode ?? error?.data?.status;
          const message =
            typeof error?.message === "string"
              ? error.message.toLowerCase()
              : "";
          if (
            status === 401 ||
            status === 403 ||
            status === 404 ||
            message.includes("unauthorized") ||
            message.includes("forbidden") ||
            message.includes("not found")
          ) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });

  return {
    queryClient,
  };
}

export default function TanstackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
