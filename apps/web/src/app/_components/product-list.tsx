"use client";

import { trpc } from "@/lib/trpc/client"; // Import the trpc context object
import { ProductsTable } from "./table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const LIMIT = 50;

export function ProductList() {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
	} = trpc.useInfiniteQuery( // Use as a method of the imported trpc object
		['getAllProducts', { limit: LIMIT }], // pathAndInput: [path, inputForFirstPage]
		{
			// getNextPageParam's first argument `lastPage` is the result of the tRPC call.
			// `pageParam` from the previous call is the second argument (optional).
			// What this function returns will be passed as input to the next tRPC call,
			// merged with the initial input.
			getNextPageParam: (lastPage, allPages) => {
				// lastPage is { products: Product[] }
				if (lastPage.products && lastPage.products.length === LIMIT) {
					const currentTotalFetched = allPages.reduce(
						(acc, page) => acc + (page.products ? page.products.length : 0),
						0,
					);
					// This object will be the 'input' for the next fetch,
					// specifically, it becomes the `pageParam` which tRPC merges.
					// The hook automatically uses this as part of the input for the next query.
					return { offset: currentTotalFetched, limit: LIMIT };
				}
				return undefined; // No more pages
			},
		},
	);

	if (isLoading && !data) {
		return <Skeleton className="h-[700px] w-full" />; // Adjusted height for table
	}

	const allProducts = data?.pages.flatMap((page) => page.products) || [];

	// Virtualization requires a parent ref for measuring scroll position
	const parentRef = React.useRef<HTMLDivElement>(null);

	return (
		<div ref={parentRef} className="h-[700px] overflow-auto"> {/* Container for virtualization */}
			<ProductsTable
				products={allProducts}
				parentRef={parentRef} // Pass ref to table
				fetchNextPage={fetchNextPage}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
			/>
			{/* Button is kept as a fallback or for users with JS disabled, though virtualizer handles scroll loading */}
			{hasNextPage && (
				<div className="mt-4 flex justify-center">
					<Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
						{isFetchingNextPage ? "Loading more..." : "Load More"}
					</Button>
				</div>
			)}
			{!hasNextPage && allProducts.length > 0 && !isFetchingNextPage && (
				<p className="mt-4 py-4 text-center text-sm text-gray-500">
					You've reached the end!
				</p>
			)}
			{allProducts.length === 0 && !isLoading && !isFetchingNextPage && (
				<p className="mt-4 text-center text-gray-500">No products found.</p>
			)}
		</div>
	);
}
