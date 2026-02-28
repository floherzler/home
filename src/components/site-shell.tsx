import { Link, Outlet } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { profile } from "../content/profile";

export function SiteShell() {
	return (
		<div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
			<div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--color-glow),_transparent_34%),linear-gradient(180deg,_var(--color-paper)_0%,_var(--color-paper-end)_100%)]" />
			<div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-5 pt-4 sm:px-8 sm:pt-6">
				<header className="mb-4 sm:mb-6">
					<div className="flex items-center justify-between gap-3">
						<Link
							to="/"
							className="text-[11px] tracking-[0.24em] text-[var(--color-muted)] uppercase"
						>
							FH
						</Link>
						<div className="flex items-center gap-2">
							<Link
								to="/blog"
								className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
							>
								Blog
							</Link>
							<ThemeToggle />
							<Button asChild variant="ghost" size="sm" className="h-8 px-3">
								<a href={profile.githubUrl} target="_blank" rel="noreferrer">
									<Github className="h-3.5 w-3.5" />
									GitHub
								</a>
							</Button>
						</div>
					</div>
				</header>

				<div className="flex-1">
					<Outlet />
				</div>

				<footer className="mt-4 pt-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
					<div className="flex items-center justify-center">
						<p>Notes and builds</p>
					</div>
				</footer>
			</div>
		</div>
	);
}
