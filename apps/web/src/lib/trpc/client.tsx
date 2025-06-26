"use client";

import type { AppRouter } from "@server/routers";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "./query-client";

// Initialize tRPC context and export all its utilities, including hooks
const tRPCHooks = createTRPCContext<AppRouter>();

export const TRPCProvider = tRPCHooks.TRPCProvider;
export const useQuery = tRPCHooks.useQuery;
export const useMutation = tRPCHooks.useMutation;
export const useSubscription = tRPCHooks.useSubscription;
export const useInfiniteQuery = tRPCHooks.useInfiniteQuery;
export const useDehydratedState = tRPCHooks.useDehydratedState;
export const trpcContext = tRPCHooks.useContext; // Renamed useTRPC to avoid confusion

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
		createTRPCClient<AppRouter>({ // This is the base client for the provider
			links: [
				httpBatchLink({
					url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
				}),
			],
		}),
	);

	return (
		<TRPCProvider client={trpcClientInstance} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</TRPCProvider>
	);
}
