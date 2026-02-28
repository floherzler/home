import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<main className="flex min-h-[calc(100vh-7.5rem)] items-center py-2 sm:min-h-[calc(100vh-8.5rem)] sm:py-4">
			<section className="mx-auto w-full max-w-4xl">
				<Card className="overflow-hidden">
					<CardContent className="p-6 sm:p-10">
						<div className="flex flex-col gap-8">
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<img
										src="https://github.com/floherzler.png?size=160"
										alt="GitHub avatar for floherzler"
										className="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16"
									/>
									<div>
										<p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
											Flo Herzler
										</p>
										<p className="text-sm text-[var(--color-muted)]">
											2026 coding notes
										</p>
									</div>
								</div>
								<p className="font-[var(--font-display)] text-2xl italic text-[var(--color-accent-strong)] sm:text-3xl">
									simple.
								</p>
							</div>

							<div className="max-w-2xl">
								<p className="text-xs uppercase tracking-[0.28em] text-[var(--color-accent-strong)]">
									Personal log
								</p>
								<h1 className="mt-3 font-[var(--font-display)] text-5xl leading-[0.94] tracking-[-0.06em] text-[var(--color-ink)] sm:text-7xl">
									A quiet place to document a year of{" "}
									<span className="text-[var(--color-accent-strong)] italic tracking-[-0.04em]">
										building.
									</span>
								</h1>
								<p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
									Posts live here as a running record of coding, experiments,
									and things worth keeping.
								</p>
							</div>

							<div className="flex flex-wrap gap-3">
								<Button asChild>
									<Link to="/blog">
										Read the blog
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button asChild variant="outline">
									<a
										href="https://github.com/floherzler"
										target="_blank"
										rel="noreferrer"
									>
										<Github className="h-4 w-4" />
										GitHub
									</a>
								</Button>
							</div>

							<div className="grid gap-3 sm:grid-cols-3">
								<div className="rounded-[1.5rem] bg-[var(--color-elevated)] px-4 py-4">
									<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
										Focus
									</p>
									<p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
										Small software, notes, and visible progress.
									</p>
								</div>
								<div className="rounded-[1.5rem] bg-[var(--color-elevated)] px-4 py-4">
									<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
										Format
									</p>
									<p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
										Short entries, deeper writeups when needed, no forced theme.
									</p>
								</div>
								<div className="rounded-[1.5rem] bg-[var(--color-elevated)] px-4 py-4">
									<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
										Status
									</p>
									<p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
										Still sparse by design. The archive fills in over time.
									</p>
								</div>
							</div>

							<div className="border-t border-[var(--color-line)] pt-5">
								<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
									Planned here
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{[
										"Build logs",
										"Experiments",
										"Tooling notes",
										"Weekly reviews",
									].map((item) => (
										<span
											key={item}
											className="rounded-full border border-[var(--color-line)] bg-[var(--color-elevated)] px-3 py-1.5 text-sm text-[var(--color-accent-ink)]"
										>
											{item}
										</span>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
