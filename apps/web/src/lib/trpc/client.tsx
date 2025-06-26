"use client";

import type { AppRouter } from "@server/routers";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "./query-client";

// Create and export the entire tRPC context utilities object with a new name
export const trpcClientHooks = createTRPCContext<AppRouter>();

// Provider component remains the same, but will use trpcClientHooks.TRPCProvider
// (which is the same as the TRPCProvider from the context object)

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

	const [trpcClientInstance] = useState(() =>
		createTRPCClient<AppRouter>({ // Base client for the provider
			links: [
				httpBatchLink({
					url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
				}),
			],
		}),
	);

	return (
		// Use the TRPCProvider from the renamed exported object
		<trpcClientHooks.TRPCProvider client={trpcClientInstance} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</trpcClientHooks.TRPCProvider>
	);
}
