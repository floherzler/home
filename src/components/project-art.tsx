import { useId } from "react";

/**
 * Small decorative pieces for the homepage project tiles.
 * Animations live in styles.css ("Homepage project tiles") and stop under prefers-reduced-motion.
 */

// Mini Pareto chart: frontier from cheap/low protein (bottom left) to pricey/high protein (top right).
const FRONTIER: Array<[number, number]> = [
	[22, 112],
	[46, 84],
	[74, 64],
	[114, 47],
	[164, 34],
	[210, 26],
];
const OTHERS: Array<[number, number]> = [
	[40, 124],
	[62, 106],
	[88, 96],
	[104, 78],
	[122, 112],
	[134, 88],
	[152, 62],
	[176, 72],
	[184, 112],
	[198, 50],
	[220, 96],
	[226, 62],
];
const FRONTIER_PATH = FRONTIER.map(
	([x, y], i) => `${i ? "L" : "M"}${x} ${y}`,
).join(" ");

/** 💪🏼 climbs the Pareto frontier while it draws itself, then flexes at the top. */
export function ParetoFlex() {
	const maskId = useId();
	return (
		<div className="relative h-[140px] w-[240px] shrink-0" aria-hidden="true">
			<svg
				width="240"
				height="140"
				viewBox="0 0 240 140"
				className="block"
				aria-hidden="true"
			>
				<defs>
					<mask id={maskId}>
						<path
							d={FRONTIER_PATH}
							pathLength={1}
							className="pf-mask-path"
							fill="none"
							stroke="white"
							strokeWidth="10"
						/>
					</mask>
				</defs>
				<path
					d="M8 4 V132 H236"
					fill="none"
					className="stroke-muted-foreground/40"
					strokeWidth="1"
				/>
				{OTHERS.map(([x, y]) => (
					<circle
						key={`${x}-${y}`}
						cx={x}
						cy={y}
						r="3"
						className="fill-muted-foreground/35"
					/>
				))}
				<path
					d={FRONTIER_PATH}
					mask={`url(#${maskId})`}
					fill="none"
					className="stroke-foreground"
					strokeWidth="1.75"
					strokeDasharray="4 5"
					strokeLinecap="round"
				/>
				{FRONTIER.map(([x, y]) => (
					<circle
						key={`${x}-${y}`}
						cx={x}
						cy={y}
						r="3.5"
						className="fill-foreground"
					/>
				))}
			</svg>
			<span
				className="pf-rider text-xl leading-none"
				style={{ offsetPath: `path("${FRONTIER_PATH}")` }}
			>
				<span className="pf-flex inline-block">💪🏼</span>
			</span>
		</div>
	);
}

const COURSES = [
	["🥦", "plants"],
	["🫘", "protein"],
	["🍽️", "portion"],
] as const;

/** Plants, protein, portion fill up one after another, like a plate being served. */
export function PlateProgress() {
	return (
		<output
			className="cmap-text inline-flex items-center gap-3 font-mono text-xs"
			aria-label="Coming soon"
		>
			{COURSES.map(([emoji, label], i) => (
				<span
					key={label}
					className="inline-flex items-center gap-1.5"
					title={label}
					aria-hidden="true"
				>
					<span className="text-sm leading-none">{emoji}</span>
					<span className="h-1.5 w-6 overflow-hidden rounded-full bg-muted">
						<span
							className={`plate-fill plate-fill-${i + 1} block h-full rounded-full`}
							style={{ background: `var(--cm-${i + 2})` }}
						/>
					</span>
				</span>
			))}
			<span aria-hidden="true">plating…</span>
		</output>
	);
}

const ART =
	"pointer-events-none absolute inset-0 -z-10 h-full w-full text-foreground";

/** Faint dot grid, fading out towards the text on the left. */
export function DotGridArt() {
	const patternId = useId();
	return (
		<svg
			className={`${ART} opacity-[0.12] [mask-image:linear-gradient(to_right,transparent_10%,black_70%)]`}
			aria-hidden="true"
		>
			<defs>
				<pattern
					id={patternId}
					width="16"
					height="16"
					patternUnits="userSpaceOnUse"
				>
					<circle cx="2" cy="2" r="1" fill="currentColor" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${patternId})`} />
		</svg>
	);
}

/** Plate rings and a leaf in the bottom-right corner. */
export function PlateArt() {
	return (
		<svg
			className={`${ART} opacity-[0.09]`}
			viewBox="0 0 300 160"
			preserveAspectRatio="xMaxYMax slice"
			aria-hidden="true"
		>
			<g fill="none" stroke="currentColor" strokeWidth="1.5">
				<circle cx="262" cy="150" r="34" />
				<circle cx="262" cy="150" r="52" />
				<circle cx="262" cy="150" r="70" />
				<path d="M196 62 C 214 34, 248 36, 256 44 C 250 64, 222 80, 196 62 Z" />
				<path d="M196 62 C 214 56, 234 50, 256 44" />
			</g>
		</svg>
	);
}

const LAYERS = [
	[40, 80, 120],
	[24, 64, 104, 136],
	[52, 108],
];

/** A tiny fully connected network on the right. */
export function NeuralNetArt() {
	const xs = [200, 240, 280];
	const nodes = LAYERS.map((ys, l) => ys.map((y) => [xs[l], y] as const));
	return (
		<svg
			className={`${ART} opacity-[0.1]`}
			viewBox="0 0 300 160"
			preserveAspectRatio="xMaxYMid slice"
			aria-hidden="true"
		>
			<g stroke="currentColor" strokeWidth="1">
				{nodes
					.slice(0, -1)
					.flatMap((layer, l) =>
						layer.flatMap(([x1, y1]) =>
							nodes[l + 1].map(([x2, y2]) => (
								<line
									key={`${x1}${y1}-${x2}${y2}`}
									x1={x1}
									y1={y1}
									x2={x2}
									y2={y2}
								/>
							)),
						),
					)}
			</g>
			<g fill="currentColor">
				{nodes.flat().map(([x, y]) => (
					<circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
				))}
			</g>
		</svg>
	);
}
