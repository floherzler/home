import { Link, Outlet } from "@tanstack/react-router";
import { profile } from "../content/profile";

export function SiteShell() {
	return (
		<div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
			<div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_32%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_100%)]" />
			<div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-8 pt-5 sm:px-8 sm:pt-8">
				<header className="mb-6 sm:mb-10">
					<div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] pb-4">
						<Link
							to="/"
							className="text-sm tracking-[0.12em] text-[var(--color-ink)] uppercase"
						>
							{profile.name}
						</Link>
						<a
							href={profile.githubUrl}
							target="_blank"
							rel="noreferrer"
							className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
						>
							GitHub
						</a>
					</div>
				</header>

				<div className="flex-1">
					<Outlet />
				</div>

				<footer className="mt-10 border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-muted)]">
					<div className="flex items-center justify-between gap-4">
						<p>@floherzler</p>
						<a
							href={profile.githubUrl}
							target="_blank"
							rel="noreferrer"
							className="transition hover:text-[var(--color-ink)]"
						>
							github.com/floherzler
						</a>
					</div>
				</footer>
			</div>
		</div>
	);
}
