import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { GithubActivity } from "@/components/github-activity";
import {
	DotGridArt,
	NeuralNetArt,
	ParetoFlex,
	PlateArt,
	PlateProgress,
} from "@/components/project-art";
import { Badge } from "@/components/ui/badge";
import { WorkingStatus } from "@/components/working-status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
	component: HomePage,
});

const TILE =
	"relative isolate flex overflow-hidden rounded-xl border bg-card p-5";

function HomePage() {
	return (
		<main className="pt-4 pb-10 sm:pt-6 sm:pb-16">
			<GithubActivity username="floherzler" />

			<h2 className="mt-12 mb-3 text-sm font-medium text-muted-foreground">
				Projects
			</h2>
			<div className="grid gap-2 sm:grid-cols-2">
				<Link
					to="/protein-pareto"
					className={cn(
						TILE,
						"group flex-col items-start gap-5 transition-colors hover:border-foreground/30 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between",
					)}
				>
					<DotGridArt />
					<ParetoFlex />
					<div className="sm:order-first sm:max-w-xs">
						<p className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
							Protein Pareto
							<ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
						</p>
						<p className="mt-1.5 text-sm text-muted-foreground">
							Ready-to-eat protein snacks from German supermarkets, plotted by
							price and protein.
						</p>
					</div>
				</Link>

				<SmallTile
					art={<PlateArt />}
					status={<PlateProgress />}
					name="3P Meals"
					description="Plants, protein, portion: rating a meal against real nutrition data."
				/>
				<SmallTile
					art={<NeuralNetArt />}
					status={<WorkingStatus />}
					name="Mystery ML Project"
					description={
						<>
							Demystifying machine and deep learning -{" "}
							<span className="whitespace-nowrap">
								my work<em className="text-foreground/80">flo</em>
							</span>
						</>
					}
				/>
			</div>
		</main>
	);
}

function SmallTile({
	art,
	status,
	name,
	description,
}: {
	art: ReactNode;
	status: ReactNode;
	name: string;
	description?: ReactNode;
}) {
	return (
		<div className={cn(TILE, "min-h-36 flex-col")}>
			{art}
			{status}
			<div className="mt-auto pt-6">
				<p className="flex items-center gap-2 font-medium text-foreground/85">
					<Badge variant="outline">soon</Badge>
					{name}
				</p>
				{description ? (
					<p className="mt-1 max-w-[16rem] text-xs text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
		</div>
	);
}
