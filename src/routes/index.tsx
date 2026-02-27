import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<main className="py-6 sm:py-10">
			<section className="mx-auto max-w-4xl">
				<div className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[0_20px_60px_rgba(77,57,110,0.08)] sm:p-8">
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
								A quieter place to document a year of building.
							</h1>
							<p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
								Blog posts will live here as a running record of coding in 2026:
								things built, things learned, and attempts to keep the work
								simple.
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							<Link
								to="/blog"
								className="inline-flex items-center rounded-full bg-[var(--color-accent-strong)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_rgba(114,89,181,0.24)] transition hover:bg-[var(--color-accent)]"
							>
								Read the blog
							</Link>
							<a
								href="https://github.com/floherzler"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center rounded-full border border-[var(--color-line)] bg-white/70 px-5 py-2.5 text-sm text-[var(--color-accent-ink)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
							>
								GitHub
							</a>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-[1.5rem] bg-white/72 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
									Focus
								</p>
								<p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
									Small software, notes, and visible progress over the year.
								</p>
							</div>
							<div className="rounded-[1.5rem] bg-white/72 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
									Format
								</p>
								<p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
									Short entries, occasional deeper writeups, no forced theme.
								</p>
							</div>
							<div className="rounded-[1.5rem] bg-white/72 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
									Status
								</p>
								<p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
									Still sparse by design. The archive will fill in over time.
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
										className="rounded-full border border-[var(--color-line)] bg-white/65 px-3 py-1.5 text-sm text-[var(--color-accent-ink)]"
									>
										{item}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
