import { createServerFn } from "@tanstack/react-start";
import { profile } from "../content/profile";

export interface ContributionDay {
	date: string;
	count: number;
}

export interface Contributions {
	total: number;
	days: ContributionDay[];
}

const USERNAME = profile.githubUrl.split("/").pop() ?? "floherzler";
const CACHE_MS = 6 * 60 * 60 * 1000;
const TIMEOUT_MS = 2500;

/** Public, token-free mirror of the GitHub contribution calendar. */
export async function fetchContributions(
	username: string,
	signal?: AbortSignal,
): Promise<Contributions> {
	const res = await fetch(
		`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
		{ signal },
	);
	if (!res.ok) throw new Error(`GitHub contributions ${res.status}`);
	const data = (await res.json()) as {
		total: { lastYear: number };
		contributions: ContributionDay[];
	};
	return {
		total: data.total.lastYear,
		days: data.contributions.map(({ date, count }) => ({ date, count })),
	};
}

let cache: { at: number; data: Contributions } | null = null;

/**
 * Server-side fetch so the chart arrives with the page. Cached in memory for 6 h;
 * if the API is slow or down it returns the last good copy, or null so the client can retry.
 */
export const getContributionsServerFn = createServerFn({
	method: "GET",
}).handler(async () => {
	if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
	try {
		const data = await fetchContributions(
			USERNAME,
			AbortSignal.timeout(TIMEOUT_MS),
		);
		cache = { at: Date.now(), data };
		return data;
	} catch (error) {
		console.warn("GitHub contributions unavailable on the server", error);
		return cache?.data ?? null;
	}
});
