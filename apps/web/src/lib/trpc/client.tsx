"use client";

import type { AppRouter } from "@server/routers";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query"; // Changed import
// import { createTRPCClient } from "@trpc/client"; // createTRPCReact handles client creation implicitly for hooks
import { useState } from "react";
import { makeQueryClient } from "./query-client";

// Correctly create and export the tRPC client for React Query hooks
export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient();
	}
	if (!browserQueryClient) {
		// Browser: make a new query client if we don't already have one
		// This is very important, so we don't re-make a new client if React
		// suspends during the initial render. This may not be needed if we
		// have a suspense boundary BELOW the creation of the query client
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
	// NOTE: Avoid useState when initializing the query client if you don't
	//       have a suspense boundary between this and the code that may
	//       suspend because React will throw away the client on the initial
	//       render if it suspends and there is no boundary
	const queryClient = getQueryClient();

	const [trpcClientInstance] = useState(() => // Renamed to avoid conflict with the exported 'trpc' object
		trpc.createClient({ // Use the createClient method from the exported trpc object
			links: [
				httpBatchLink({
					url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
				}),
			],
		}),
	);

	return (
		// Use the Provider from the exported trpc object
		<trpc.Provider client={trpcClientInstance} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</trpc.Provider>
	);
}
