import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
	document.documentElement.classList.toggle("dark", theme === "dark");
	document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const root = document.documentElement;
		const storedTheme = window.localStorage.getItem(STORAGE_KEY);
		const nextTheme =
			storedTheme === "dark" || root.classList.contains("dark")
				? "dark"
				: "light";

		applyTheme(nextTheme);
		setTheme(nextTheme);
	}, []);

	function toggleTheme() {
		const nextTheme = theme === "dark" ? "light" : "dark";
		applyTheme(nextTheme);
		window.localStorage.setItem(STORAGE_KEY, nextTheme);
		setTheme(nextTheme);
	}

	const isDark = theme === "dark";

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="h-10 w-10 rounded-full p-0 text-[var(--color-ink)] hover:text-[var(--color-accent-strong)] [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[2.25]"
			onClick={toggleTheme}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{isDark ? <Sun /> : <Moon />}
		</Button>
	);
}
