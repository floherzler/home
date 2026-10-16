import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { profile } from "../content/profile";

const WIDE_ROUTES = ["/protein-pareto"];
const PAGE_TITLES: Record<string, string> = {
	"/protein-pareto": "Protein Pareto",
};

export function SiteShell() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const wide = WIDE_ROUTES.some((route) => pathname.startsWith(route));
	const isHome = pathname === "/";
	const pageTitle = PAGE_TITLES[pathname];

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div
				className={cn(
					"mx-auto flex min-h-screen w-full flex-col px-5 sm:px-8",
					wide ? "max-w-[100rem]" : "max-w-3xl",
				)}
			>
				<header className="flex h-16 items-center justify-between gap-3 sm:h-20">
					<nav
						aria-label="Breadcrumb"
						className="flex min-w-0 items-center gap-2 text-sm"
					>
						<Link
							to="/"
							className="group inline-flex shrink-0 items-center gap-2.5 font-medium text-foreground transition-colors hover:text-muted-foreground"
						>
							{isHome ? null : (
								<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
							)}
							<img
								src={`${profile.githubUrl}.png?size=96`}
								alt=""
								className="size-8 rounded-lg object-cover sm:size-9"
							/>
							{isHome ? (
								<h1 className="text-base font-medium tracking-tight">
									{profile.name}
								</h1>
							) : (
								profile.name
							)}
						</Link>
						{pageTitle ? (
							<>
								<span className="text-muted-foreground/60">/</span>
								<span
									className="truncate text-muted-foreground"
									aria-current="page"
								>
									{pageTitle}
								</span>
							</>
						) : null}
						<a
							href={profile.githubUrl}
							target="_blank"
							rel="noreferrer"
							aria-label="GitHub profile"
							className="ml-2 inline-flex shrink-0 items-center gap-1.5 text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
						>
							<Github className="size-3.5" />
							<span className={cn(!isHome && "hidden sm:inline")}>
								github.com/floherzler
							</span>
						</a>
					</nav>
					<ThemeToggle />
				</header>

				<div className="flex-1">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
