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
