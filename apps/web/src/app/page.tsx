import { ProductStats } from "@/app/_components/stat";
import { caller } from "@/lib/trpc/server";
import { Suspense } from "react";
import { ProductList } from "./_components/product-list";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Home() {
	// Fetch stats outside of suspense boundary as it's separate data
	const { stats } = await caller.getLatestProductStats();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid gap-6">
				<ProductStats stats={stats} />
				<Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
					{/* @ts-expect-error Server Component */}
					<ProductList />
				</Suspense>
			</div>
		</div>
	);
}
