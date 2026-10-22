import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import type { User } from "../auth/AuthContext";

export interface RouterContext {
	queryClient: QueryClient;
	auth: {
		user: User | null;
	};
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<Outlet />
		</>
	);
}
