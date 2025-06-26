"use client";

import type { AppRouter } from "@server/routers";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query"; // QueryClient type
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query"; // For TRPCProvider
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "./query-client";

// Context for provider setup
const TRPCContext = createTRPCContext<AppRouter>();

// Base tRPC client for manual calls (e.g., in queryFns)
export const trpcVanillaClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
		}),
	],
});

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}
	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
}

export function TRPCReactProvider(props: { children: ReactNode }) {
	const queryClient = getQueryClient();

	// Note: The `trpcClientInstance` passed to TRPCContext.TRPCProvider
	// is the same one we are exporting as trpcVanillaClient.
	// This ensures consistency if the provider itself uses this client.
	const [clientForProvider] = useState(() => trpcVanillaClient);

	return (
		<TRPCContext.TRPCProvider client={clientForProvider} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</TRPCContext.TRPCProvider>
	);
}
