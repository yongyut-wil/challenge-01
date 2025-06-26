"use client";

import { trpc } from "@/lib/trpc/client";
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
	} = trpc.getAllProducts.useInfiniteQuery(
		{
			limit: LIMIT,
		},
		{
			getNextPageParam: (lastPage, allPages) => {
				if (lastPage.products.length === LIMIT) {
					const currentOffset = allPages.reduce(
						(acc, page) => acc + page.products.length,
						0,
					);
					return { offset: currentOffset, limit: LIMIT };
				}
				return undefined;
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
