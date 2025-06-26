import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Product } from "@server/db/schema/products";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { FetchNextPageOptions, InfiniteQueryObserverResult } from "@tanstack/react-query";

interface ProductsTableProps {
	products: Product[];
	parentRef: React.RefObject<HTMLDivElement>;
	fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult>;
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
}

// Estimate row height - adjust this based on your actual row content and styling
const ESTIMATED_ROW_HEIGHT = 60; // px

export function ProductsTable({
	products,
	parentRef,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
}: ProductsTableProps) {
	const rowVirtualizer = useVirtualizer({
		count: hasNextPage ? products.length + 1 : products.length, // Add one for loader
		getScrollElement: () => parentRef.current,
		estimateSize: () => ESTIMATED_ROW_HEIGHT,
		overscan: 5, // Render a few extra items for smoother scrolling
	});

	React.useEffect(() => {
		const virtualItems = rowVirtualizer.getVirtualItems();
		if (virtualItems.length === 0) return;

		const lastItem = virtualItems[virtualItems.length - 1];
		if (!lastItem) return;

		if (
			lastItem.index >= products.length - 1 &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			fetchNextPage();
		}
	}, [
		hasNextPage,
		fetchNextPage,
		products.length,
		isFetchingNextPage,
		rowVirtualizer, // Ensure effect runs when virtualizer state changes
	]);

	const tableHeaderContent = (
		<TableRow>
			<TableHead className="w-[50px]">ID</TableHead>
			<TableHead className="w-[150px]">SKU</TableHead>
			<TableHead className="w-[250px]">Name</TableHead>
			<TableHead className="w-[300px]">Description</TableHead>
			<TableHead className="w-[100px]">Brand</TableHead>
			<TableHead className="w-[100px]">Category</TableHead>
			<TableHead className="w-[100px]">Subcategory</TableHead>
			<TableHead className="w-[100px] text-right">Price</TableHead>
			<TableHead className="w-[100px] text-right">Cost</TableHead>
			<TableHead className="w-[80px]">Weight</TableHead>
			<TableHead className="w-[80px]">Length</TableHead>
			<TableHead className="w-[80px]">Width</TableHead>
			<TableHead className="w-[80px]">Height</TableHead>
			<TableHead className="w-[100px]">Color</TableHead>
			<TableHead className="w-[80px]">Size</TableHead>
			<TableHead className="w-[120px]">Material</TableHead>
			<TableHead className="w-[150px]">Manufacturer</TableHead>
			<TableHead className="w-[150px]">Country of Origin</TableHead>
			<TableHead className="w-[150px]">Barcode</TableHead>
			<TableHead className="w-[100px] text-right">Stock</TableHead>
			<TableHead className="w-[100px] text-right">Min Stock</TableHead>
			<TableHead className="w-[100px] text-right">Max Stock</TableHead>
			<TableHead className="w-[80px]">Active</TableHead>
			<TableHead className="w-[80px]">Featured</TableHead>
			<TableHead className="w-[80px]">Digital</TableHead>
			<TableHead className="w-[100px]">Shipping</TableHead>
			<TableHead className="w-[100px] text-right">Tax</TableHead>
			<TableHead className="w-[120px]">Warranty</TableHead>
			<TableHead className="w-[150px]">Supplier</TableHead>
			<TableHead className="w-[120px]">Supplier Code</TableHead>
			<TableHead className="w-[100px]">Season</TableHead>
			<TableHead className="w-[120px]">Collection</TableHead>
			<TableHead className="w-[100px]">Style</TableHead>
			<TableHead className="w-[100px]">Pattern</TableHead>
			<TableHead className="w-[150px]">Fabric</TableHead>
			<TableHead className="w-[200px]">Care</TableHead>
			<TableHead className="w-[150px]">Tags</TableHead>
			<TableHead className="w-[200px]">Meta Title</TableHead>
			<TableHead className="w-[300px]">Meta Desc</TableHead>
			<TableHead className="w-[150px]">Slug</TableHead>
			<TableHead className="w-[100px] text-right">Rating</TableHead>
			<TableHead className="w-[100px] text-right">Rating #</TableHead>
			<TableHead className="w-[100px] text-right">Views</TableHead>
			<TableHead className="w-[100px] text-right">Purchases</TableHead>
			<TableHead className="w-[120px]">Created</TableHead>
			<TableHead className="w-[120px]">Updated</TableHead>
			<TableHead className="w-[120px]">Restocked</TableHead>
			<TableHead className="w-[120px]">Discontinued</TableHead>
		</TableRow>
	);

	return (
		<Table style={{ width: '100%', tableLayout: 'fixed' /* Important for virtualization with tables */ }}>
			<TableHeader style={{ position: 'sticky', top: 0, zIndex: 1, background: 'hsl(var(--background))' /* Ensure header is visible */ }}>
				{tableHeaderContent}
			</TableHeader>
			<TableBody
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					position: "relative",
					width: "100%",
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const isLoaderRow = virtualRow.index > products.length - 1;
					const product = products[virtualRow.index];

					if (isLoaderRow) {
						return (
							<TableRow
								key="loader"
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<TableCell colSpan={48} className="text-center"> {/* Corrected colSpan to 48 */}
									{hasNextPage ? "Loading more..." : ""}
								</TableCell>
							</TableRow>
						);
					}

					if (!product) {
						// Should ideally not happen if count is correct
						return null;
					}

					return (
						<TableRow
							key={product.id}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: `${virtualRow.size}px`,
								transform: `translateY(${virtualRow.start}px)`,
							}}
							data-index={virtualRow.index} // For debugging
							ref={rowVirtualizer.measureElement} // For dynamic height
						>
							<TableCell className="truncate w-[50px]">{product.id}</TableCell>
							<TableCell className="font-medium truncate w-[150px]">{product.sku}</TableCell>
							<TableCell className="font-medium truncate w-[250px]">{product.name}</TableCell>
							<TableCell className="truncate w-[300px]">{product.description || "N/A"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.brand || "N/A"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.category || "N/A"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.subcategory || "N/A"}</TableCell>
							<TableCell className="text-right truncate w-[100px]">
								${product.price || "N/A"}
							</TableCell>
							<TableCell className="text-right truncate w-[100px]">
								${product.cost || "N/A"}
							</TableCell>
							<TableCell className="truncate w-[80px]">{product.weight || "N/A"}</TableCell>
							<TableCell className="truncate w-[80px]">{product.length || "N/A"}</TableCell>
							<TableCell className="truncate w-[80px]">{product.width || "N/A"}</TableCell>
							<TableCell className="truncate w-[80px]">{product.height || "N/A"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.color || "N/A"}</TableCell>
							<TableCell className="truncate w-[80px]">{product.size || "N/A"}</TableCell>
							<TableCell className="truncate w-[120px]">{product.material || "N/A"}</TableCell>
							<TableCell className="truncate w-[150px]">{product.manufacturer || "N/A"}</TableCell>
							<TableCell className="truncate w-[150px]">{product.country_of_origin || "N/A"}</TableCell>
							<TableCell className="truncate w-[150px]">{product.barcode || "N/A"}</TableCell>
							<TableCell className="text-right truncate w-[100px]">{product.stock_quantity}</TableCell>
							<TableCell className="text-right truncate w-[100px]">{product.min_stock_level}</TableCell>
							<TableCell className="text-right truncate w-[100px]">{product.max_stock_level}</TableCell>
							<TableCell className="truncate w-[80px]">{product.is_active ? "Yes" : "No"}</TableCell>
							<TableCell className="truncate w-[80px]">{product.is_featured ? "Yes" : "No"}</TableCell>
							<TableCell className="truncate w-[80px]">{product.is_digital ? "Yes" : "No"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.requires_shipping ? "Yes" : "No"}</TableCell>
							<TableCell className="text-right truncate w-[100px]">
								{product.tax_rate
									? `${(product.tax_rate * 100).toFixed(1)}%`
									: "N/A"}
							</TableCell>
							<TableCell className="truncate w-[120px]">{product.warranty_months || "N/A"}</TableCell>
							<TableCell className="truncate w-[150px]">{product.supplier_name || "N/A"}</TableCell>
							<TableCell className="truncate w-[120px]">{product.supplier_code || "N/A"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.season || "N/A"}</TableCell>
							<TableCell className="truncate w-[120px]">{product.collection || "N/A"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.style || "N/A"}</TableCell>
							<TableCell className="truncate w-[100px]">{product.pattern || "N/A"}</TableCell>
							<TableCell className="truncate w-[150px]">{product.fabric_composition || "N/A"}</TableCell>
							<TableCell className="truncate w-[200px]">{product.care_instructions || "N/A"}</TableCell>
							<TableCell className="truncate w-[150px]">{product.tags || "N/A"}</TableCell>
							<TableCell className="truncate w-[200px]">{product.meta_title || "N/A"}</TableCell>
							<TableCell className="truncate w-[300px]">{product.meta_description || "N/A"}</TableCell>
							<TableCell className="truncate w-[150px]">{product.slug || "N/A"}</TableCell>
							<TableCell className="text-right truncate w-[100px]">
								{product.rating_average
									? product.rating_average.toFixed(1)
									: "N/A"}
							</TableCell>
							<TableCell className="text-right truncate w-[100px]">{product.rating_count}</TableCell>
							<TableCell className="text-right truncate w-[100px]">{product.view_count}</TableCell>
							<TableCell className="text-right truncate w-[100px]">{product.purchase_count}</TableCell>
							<TableCell className="truncate w-[120px]">
								{product.created_at?.toLocaleDateString() || "N/A"}
							</TableCell>
							<TableCell className="truncate w-[120px]">
								{product.updated_at?.toLocaleDateString() || "N/A"}
							</TableCell>
							<TableCell className="truncate w-[120px]">
								{product.last_restocked_at?.toLocaleDateString() || "N/A"}
							</TableCell>
							<TableCell className="truncate w-[120px]">
								{product.discontinued_at?.toLocaleDateString() || "N/A"}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
