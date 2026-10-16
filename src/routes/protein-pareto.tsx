import { createFileRoute } from "@tanstack/react-router";
import { ProteinParetoPage } from "@/features/protein-pareto/protein-pareto-page";

export const Route = createFileRoute("/protein-pareto")({
	head: () => ({
		meta: [
			{ title: "Protein Pareto · Flo Herzler" },
			{
				name: "description",
				content:
					"Ready-to-eat protein snacks from German supermarkets, plotted by price and protein.",
			},
		],
	}),
	component: ProteinParetoPage,
});
