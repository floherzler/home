import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SiteShell } from "../components/site-shell";
import appCss from "../styles.css?url";

const themeInitScript = `
(() => {
  const storedTheme = window.localStorage.getItem("theme");
  const theme = storedTheme === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
})();
`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{
				title: "Flo Herzler",
			},
			{
				name: "description",
				content:
					"Minimal homepage with a link to the GitHub profile of Flo Herzler.",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
	component: SiteShell,
	notFoundComponent: NotFoundPage,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				<script>{themeInitScript}</script>
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function NotFoundPage() {
	return (
		<section className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)]">
			<p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
				404
			</p>
			<h1 className="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">
				Page not found
			</h1>
			<p className="mt-4 max-w-xl leading-7 text-[var(--color-muted)]">
				This route does not exist, or the content has moved.
			</p>
		</section>
	);
}
