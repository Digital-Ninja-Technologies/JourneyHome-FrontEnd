import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: React.ReactNode;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
