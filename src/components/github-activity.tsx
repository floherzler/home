import { type PointerEvent, useEffect, useMemo, useState } from "react";
import { ColormapPicker, PICKER_ITEM } from "@/components/colormap-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	type ContributionDay,
	type Contributions,
	fetchContributions,
} from "@/lib/github-contributions";

const CELL = 10;
const GAP = 3;
const STEP = CELL + GAP;
const LEVEL_CLASS = [
	"fill-muted",
	"fill-[var(--cm-1)]",
	"fill-[var(--cm-2)]",
	"fill-[var(--cm-3)]",
	"fill-[var(--cm-4)]",
];

type Scale = "log" | "linear";

/** Four colour steps between 1 contribution and the busiest day, on a log or linear scale. */
function levelOf(count: number, max: number, scale: Scale) {
	if (count <= 0 || max <= 0) return 0;
	const t = scale === "log" ? Math.log1p(count) / Math.log1p(max) : count / max;
	return Math.min(4, Math.max(1, Math.ceil(t * 4)));
}

const formatDate = (iso: string) =>
	new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});

/**
 * Last year of GitHub contributions in the selected colour map (log or linear steps), scaled to fit the column (no scrolling).
 * Hover, tap or drag along the strip to read a day's count. `initial` comes from the server
 * (cached); without it the browser fetches the public API itself and hides the block on failure.
 */
export function GithubActivity({
	username,
	initial,
}: {
	username: string;
	initial?: Contributions | null;
}) {
	const [days, setDays] = useState<ContributionDay[] | null>(
		initial?.days ?? null,
	);
	const [total, setTotal] = useState<number | null>(initial?.total ?? null);
	const [failed, setFailed] = useState(false);
	const [active, setActive] = useState<number | null>(null);
	const [scale, setScale] = useState<Scale>("log");

	useEffect(() => {
		if (initial) return;
		const controller = new AbortController();
		fetchContributions(username, controller.signal)
			.then((data) => {
				setDays(data.days);
				setTotal(data.total);
			})
			.catch((error) => {
				if (!controller.signal.aborted) {
					console.warn("GitHub activity unavailable", error);
					setFailed(true);
				}
			});
		return () => controller.abort();
	}, [username, initial]);

	const max = useMemo(
		() => (days ? Math.max(0, ...days.map((d) => d.count)) : 0),
		[days],
	);

	if (failed) return null;

	const firstWeekday = days?.length
		? new Date(`${days[0].date}T00:00:00`).getDay()
		: 0;
	const weeks = days ? Math.ceil((days.length + firstWeekday) / 7) : 53;
	const width = weeks * STEP - GAP;
	const height = 7 * STEP - GAP;
	const pos = (slot: number) => ({
		x: Math.floor(slot / 7) * STEP,
		y: (slot % 7) * STEP,
	});

	function pick(e: PointerEvent<SVGSVGElement>) {
		if (!days) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const col = Math.floor(
			(((e.clientX - rect.left) / rect.width) * (width + GAP)) / STEP,
		);
		const row = Math.floor(
			(((e.clientY - rect.top) / rect.height) * (height + GAP)) / STEP,
		);
		const index = col * 7 + Math.min(6, Math.max(0, row)) - firstWeekday;
		setActive(index >= 0 && index < days.length ? index : null);
	}

	const activeDay = active != null && days ? days[active] : null;
	const activePos = active != null ? pos(active + firstWeekday) : null;

	return (
		<section aria-label="GitHub activity">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="block h-auto w-full touch-pan-y select-none"
				role="img"
				aria-label={
					total != null
						? `${total} GitHub contributions in the last year`
						: "Loading GitHub contributions"
				}
				onPointerMove={pick}
				onPointerDown={pick}
				onPointerLeave={(e) => {
					if (e.pointerType === "mouse") setActive(null);
				}}
			>
				{days
					? days.map((day, i) => {
							const { x, y } = pos(i + firstWeekday);
							return (
								<rect
									key={day.date}
									x={x}
									y={y}
									width={CELL}
									height={CELL}
									rx={2}
									className={LEVEL_CLASS[levelOf(day.count, max, scale)]}
								/>
							);
						})
					: Array.from({ length: weeks * 7 }, (_, i) => (
							<rect
								// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder grid
								key={i}
								{...pos(i)}
								width={CELL}
								height={CELL}
								rx={2}
								className="animate-pulse fill-muted"
							/>
						))}
				{activePos ? (
					<rect
						x={activePos.x - 1.5}
						y={activePos.y - 1.5}
						width={CELL + 3}
						height={CELL + 3}
						rx={3}
						className="pointer-events-none fill-none stroke-foreground"
						strokeWidth={1.5}
					/>
				) : null}
			</svg>
			<div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
				<p className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
					{activeDay ? (
						<>
							<span className="font-medium text-foreground tabular-nums">
								{activeDay.count} contribution{activeDay.count === 1 ? "" : "s"}
							</span>
							<span>{formatDate(activeDay.date)}</span>
						</>
					) : total != null ? (
						`${total.toLocaleString("en")} contributions in the last year`
					) : (
						" "
					)}
				</p>
				<div className="flex items-center gap-2">
					<ToggleGroup
						size="sm"
						spacing={0}
						value={[scale]}
						onValueChange={(v) => v[0] && setScale(v[0] as Scale)}
						aria-label="Colour scale"
						className="font-mono"
					>
						<ToggleGroupItem value="log" className={PICKER_ITEM}>
							log
						</ToggleGroupItem>
						<ToggleGroupItem value="linear" className={PICKER_ITEM}>
							linear
						</ToggleGroupItem>
					</ToggleGroup>
					<span className="h-3 w-px bg-border" aria-hidden="true" />
					<ColormapPicker />
				</div>
			</div>
		</section>
	);
}
