import { z } from "zod";
import { db } from "../db";
import { productStats, products } from "../db/schema/products";
import { publicProcedure, router } from "../lib/trpc";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	getAllProducts: publicProcedure
		.input(
			z
				.object({
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const limit = input?.limit || 50;
			const offset = input?.offset || 0;
			const allProducts = await db
				.select()
				.from(products)
				.limit(limit)
				.offset(offset);
			// await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulating network latency

			return {
				products: allProducts,
			};
		}),
	getLatestProductStats: publicProcedure.query(async () => {
		const latestStats = await db
			.select()
			.from(productStats)
			.orderBy(productStats.created_at)
			.limit(1);

		return {
			stats: latestStats[0] || null,
		};
	}),
});
export type AppRouter = typeof appRouter;
