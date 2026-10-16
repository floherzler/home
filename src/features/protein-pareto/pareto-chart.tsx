import { ExternalLink } from "lucide-react";
import {
	type MouseEvent,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
	brandOf,
	emojiFor,
	euro,
	type Food,
	groupName,
	niceLinear,
	niceLog,
	num,
	paretoFrontier,
	safeUrl,
	type View,
} from "./model";

export interface Active {
	id: string;
	sticky: boolean;
}

interface Props {
	foods: Food[];
	view: View;
	scale: "linear" | "log";
	showPareto: boolean;
	colorOf: (group: string) => string | null;
	pinned: string[];
	hoverGroup: string | null;
	active: Active | null;
	onActive: (next: Active | null) => void;
}

interface Label {
	key: string;
	group: string;
	id?: string;
	anchor: [number, number];
	text: string;
	emoji: string;
	pinned: boolean;
	color: string | null;
	y: number;
}

function useSize<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [size, setSize] = useState({ w: 0, h: 0 });
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) =>
			setSize({ w: entry.contentRect.width, h: entry.contentRect.height }),
		);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	return [ref, size] as const;
}

function shortName(f: Food) {
	return `${f.brand ? `${brandOf(f)} ` : ""}${groupName(f.productGroup)}`;
}

function placeLabels(
	labels: Label[],
	top: number,
	bottom: number,
	gap: number,
) {
	for (const l of labels) l.y = l.anchor[1];
	labels.sort((a, b) => a.y - b.y);
	for (let i = 0; i < labels.length; i++)
		labels[i].y = Math.max(labels[i].y, i ? labels[i - 1].y + gap : top);
	for (let i = labels.length - 1; i >= 0; i--)
		labels[i].y = Math.min(
			labels[i].y,
			i < labels.length - 1 ? labels[i + 1].y - gap : bottom,
		);
}

export function ParetoChart({
	foods,
	view,
	scale,
	showPareto,
	colorOf,
	pinned,
	hoverGroup,
	active,
	onActive,
}: Props) {
	const [wrapRef, { w: W, h: H }] = useSize<HTMLDivElement>();
	const svgRef = useRef<SVGSVGElement>(null);

	const geo = useMemo(() => {
		const plotted = foods.filter((f) => {
			const x = view.x(f);
			const y = view.y(f);
			return x != null && y != null && x > 0;
		});
		const narrow = W < 640;
		const pad = { l: narrow ? 36 : 52, t: 40, b: 50, r: narrow ? 118 : 210 };
		const pw = W - pad.l - pad.r;
		const ph = H - pad.t - pad.b;
		if (!plotted.length || pw < 80 || ph < 80) return null;

		const xOf = (f: Food) => view.x(f) as number;
		const yOf = (f: Food) => view.y(f) as number;
		const log = scale === "log";
		const xs = plotted.map(xOf);
		let x0 = Math.min(...xs);
		let x1 = Math.max(...xs);
		if (log) {
			x0 /= 1.25;
			x1 *= 1.15;
		} else {
			x0 = 0;
			x1 = niceLinear(0, x1 * 1.03, narrow ? 4 : 6).at(-1) ?? x1;
		}
		const yTicks = niceLinear(0, Math.max(...plotted.map(yOf)) * 1.08, 5);
		const y1 = yTicks.at(-1) ?? 1;
		const sx = log
			? (v: number) =>
					pad.l +
					((Math.log(v) - Math.log(x0)) / (Math.log(x1) - Math.log(x0))) * pw
			: (v: number) => pad.l + ((v - x0) / (x1 - x0)) * pw;
		const sy = (v: number) => pad.t + ph - (v / y1) * ph;
		const xTicks = log
			? niceLog(x0, x1).filter(
					(t) => !narrow || /^[15]/.test(String(t).replace(/^0\.0*/, "")),
				)
			: niceLinear(x0, x1, narrow ? 4 : 6).filter((t) => t <= x1 + 1e-9);

		const pos = new Map<string, [number, number]>(
			plotted.map((f) => [f.id, [sx(xOf(f)), sy(yOf(f))]]),
		);
		const front = showPareto ? paretoFrontier(plotted, xOf, yOf) : [];
		const frontIds = new Set(front.map((f) => f.id));

		const byGroup = new Map<string, Food[]>();
		for (const f of plotted) {
			const list = byGroup.get(f.productGroup) ?? [];
			list.push(f);
			byGroup.set(f.productGroup, list);
		}

		const labels: Label[] = [];
		for (const g of pinned) {
			const members = byGroup.get(g);
			if (!members) continue;
			const top = members.reduce((a, b) => (yOf(b) > yOf(a) ? b : a));
			labels.push({
				key: `g:${g}`,
				group: g,
				anchor: pos.get(top.id) as [number, number],
				text: groupName(g),
				emoji: emojiFor(top),
				pinned: true,
				color: colorOf(g),
				y: 0,
			});
		}
		for (const f of front) {
			let text = shortName(f);
			if (labels.some((l) => l.text === text))
				text = `${groupName(f.productGroup)} · ${f.store}`;
			labels.push({
				key: `f:${f.id}`,
				group: f.productGroup,
				id: f.id,
				anchor: pos.get(f.id) as [number, number],
				text,
				emoji: emojiFor(f),
				pinned: false,
				color: null,
				y: 0,
			});
		}
		placeLabels(labels, pad.t + 6, pad.t + ph, narrow ? 17 : 21);

		const units = new Set(plotted.map((f) => f.unit));
		const unit = units.size > 1 ? "g / ml" : [...units][0];
		return {
			plotted,
			narrow,
			pad,
			pw,
			ph,
			xOf,
			yOf,
			sx,
			sy,
			xTicks,
			yTicks,
			pos,
			front,
			frontIds,
			byGroup,
			labels,
			unit,
		};
	}, [foods, view, scale, showPareto, pinned, colorOf, W, H]);

	const activeFood =
		active && geo ? geo.plotted.find((f) => f.id === active.id) : undefined;
	const hotGroup = activeFood?.productGroup ?? hoverGroup;

	function nearest(e: MouseEvent<SVGSVGElement>) {
		if (!geo || !svgRef.current) return null;
		const r = svgRef.current.getBoundingClientRect();
		const px = e.clientX - r.left;
		const py = e.clientY - r.top;
		const label = (e.target as Element).closest?.("[data-label-group]");
		if (label) {
			const id =
				label.getAttribute("data-label-id") ??
				[
					...(geo.byGroup.get(label.getAttribute("data-label-group") ?? "") ??
						[]),
				].sort((a, b) => geo.yOf(b) - geo.yOf(a))[0]?.id;
			return id ?? null;
		}
		let best: string | null = null;
		let bestD = 30 * 30;
		for (const [id, [x, y]] of geo.pos) {
			const d = (x - px) ** 2 + (y - py) ** 2;
			if (d < bestD) {
				bestD = d;
				best = id;
			}
		}
		return best;
	}

	useEffect(() => {
		if (active && geo && !geo.pos.has(active.id)) onActive(null);
	}, [active, geo, onActive]);

	return (
		<div ref={wrapRef} className="relative h-full w-full">
			{geo ? (
				// biome-ignore lint/a11y/useKeyWithClickEvents: every point is also reachable from the product table, which pins it
				<svg
					ref={svgRef}
					width={W}
					height={H}
					className={cn(
						"block touch-pan-y overflow-visible",
						hotGroup && "pp-dim",
					)}
					role="img"
					aria-label={`${view.title}: ${geo.plotted.length} products. Hover or tap a dot for price, nutrition and the shop link.`}
					onPointerMove={(e) => {
						if (active?.sticky) return;
						const id = nearest(e);
						if (id !== (active?.id ?? null))
							onActive(id ? { id, sticky: false } : null);
					}}
					onPointerLeave={() => {
						if (!active?.sticky) onActive(null);
					}}
					onClick={(e) => {
						const id = nearest(e);
						onActive(
							id && !(active?.sticky && active.id === id)
								? { id, sticky: true }
								: null,
						);
					}}
				>
					<text x={geo.pad.l} y={16} className="pp-axis-title">
						{view.yTitle(geo.unit)}
					</text>
					{geo.yTicks.map((t) => (
						<g key={`y${t}`}>
							<line
								x1={geo.pad.l}
								x2={geo.pad.l + geo.pw}
								y1={geo.sy(t)}
								y2={geo.sy(t)}
								className="pp-grid"
							/>
							<text
								x={geo.pad.l - 12}
								y={geo.sy(t) + 4}
								textAnchor="end"
								className="pp-tick"
							>
								{num(t, 0)}
							</text>
						</g>
					))}
					{geo.xTicks.map((t) => (
						<g key={`x${t}`}>
							<line
								x1={geo.sx(t)}
								x2={geo.sx(t)}
								y1={geo.pad.t}
								y2={geo.pad.t + geo.ph}
								className="pp-grid"
							/>
							<text
								x={geo.sx(t)}
								y={geo.pad.t + geo.ph + 22}
								textAnchor="middle"
								className="pp-tick"
							>
								{euro(t).replace(".00", "")}
							</text>
						</g>
					))}
					<text
						x={geo.pad.l + geo.pw}
						y={H - 4}
						textAnchor="end"
						className="pp-axis-title"
					>
						{view.xTitle(geo.unit)} →
					</text>

					{[...geo.byGroup].map(([g, members]) => {
						if (members.length < 2) return null;
						const c = colorOf(g);
						const points = [...members]
							.sort((a, b) => geo.xOf(a) - geo.xOf(b))
							.map((f) => geo.pos.get(f.id)?.join(","))
							.join(" ");
						return (
							<polyline
								key={g}
								points={points}
								className={cn(
									"pp-link",
									c && "pinned",
									hotGroup === g && "hot",
								)}
								style={c ? ({ "--c": c } as React.CSSProperties) : undefined}
							/>
						);
					})}
					{geo.front.length > 1 ? (
						<path
							className="pp-pareto"
							d={geo.front
								.map(
									(f, i) => `${i ? "L" : "M"}${geo.pos.get(f.id)?.join(" ")}`,
								)
								.join("")}
						/>
					) : null}

					{[...geo.plotted]
						.sort((a, b) => rank(a) - rank(b))
						.map((f) => {
							const [cx, cy] = geo.pos.get(f.id) as [number, number];
							const c = colorOf(f.productGroup);
							const fr = geo.frontIds.has(f.id);
							return (
								<circle
									key={f.id}
									cx={cx}
									cy={cy}
									r={fr || c ? 6.5 : 5}
									className={cn(
										"pp-pt",
										c && "pinned",
										fr && "front",
										hotGroup === f.productGroup && "hot",
									)}
									style={c ? ({ "--c": c } as React.CSSProperties) : undefined}
								/>
							);
						})}

					{geo.labels.map((l) => {
						const lx = geo.pad.l + geo.pw + (geo.narrow ? 14 : 30);
						const max = geo.narrow ? 11 : 22;
						const text =
							l.text.length > max ? `${l.text.slice(0, max - 1)}…` : l.text;
						const style = l.color
							? ({ "--c": l.color } as React.CSSProperties)
							: undefined;
						return (
							<g key={l.key}>
								<path
									d={`M${l.anchor[0] + 8} ${l.anchor[1]} L${lx - 8} ${l.y}`}
									className={cn("pp-leader", l.pinned && "pinned")}
									style={style}
								/>
								<text
									x={lx}
									y={l.y + 5}
									data-label-group={l.group}
									data-label-id={l.id}
									className={cn(
										"pp-label",
										l.pinned ? "pinned" : "front",
										hotGroup === l.group && "hot",
										geo.narrow && "narrow",
									)}
									style={style}
								>
									{l.emoji} {text}
								</text>
							</g>
						);
					})}

					{activeFood ? (
						<Crosshair food={activeFood} geo={geo} view={view} />
					) : null}
				</svg>
			) : null}
			{activeFood && geo ? (
				<FoodCard
					food={activeFood}
					anchor={geo.pos.get(activeFood.id) as [number, number]}
					box={{ w: W, h: H }}
					sticky={!!active?.sticky}
					siblings={geo.byGroup.get(activeFood.productGroup) ?? []}
				/>
			) : null}
		</div>
	);

	function rank(f: Food) {
		return (
			(colorOf(f.productGroup) ? 1 : 0) + (geo?.frontIds.has(f.id) ? 2 : 0)
		);
	}
}

function Crosshair({
	food,
	geo,
	view,
}: {
	food: Food;
	geo: NonNullable<{
		pos: Map<string, [number, number]>;
		pad: { l: number; t: number };
		ph: number;
	}>;
	view: View;
}) {
	const [cx, cy] = geo.pos.get(food.id) as [number, number];
	const bottom = geo.pad.t + geo.ph;
	const yText = `${num(view.y(food))} g`;
	const xText = euro(view.x(food));
	return (
		<g className="pointer-events-none">
			<line x1={geo.pad.l} x2={cx} y1={cy} y2={cy} className="pp-cross" />
			<line x1={cx} x2={cx} y1={cy} y2={bottom} className="pp-cross" />
			<Chip x={geo.pad.l - 6} y={cy} text={yText} anchor="end" />
			<Chip x={cx} y={bottom + 18} text={xText} anchor="middle" />
			<circle cx={cx} cy={cy} r={9} className="pp-ring" />
		</g>
	);
}

function Chip({
	x,
	y,
	text,
	anchor,
}: {
	x: number;
	y: number;
	text: string;
	anchor: "end" | "middle";
}) {
	const w = text.length * 7 + 12;
	const left = anchor === "end" ? x - w + 6 : x - w / 2;
	return (
		<g>
			<rect
				x={left}
				y={y - 10}
				width={w}
				height={20}
				rx={6}
				className="pp-chip"
			/>
			<text
				x={left + w / 2}
				y={y + 4}
				textAnchor="middle"
				className="pp-chip-text"
			>
				{text}
			</text>
		</g>
	);
}

function FoodCard({
	food,
	anchor,
	box,
	sticky,
	siblings,
}: {
	food: Food;
	anchor: [number, number];
	box: { w: number; h: number };
	sticky: boolean;
	siblings: Food[];
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState({ left: -9999, top: 0 });
	const unit = food.unit;
	const url = safeUrl(food.url);
	const photo =
		!url && food.sourceImage ? `/protein-pareto-labels/${food.sourceImage}` : null;

	const all = [...siblings].sort(
		(a, b) => (a.pricePer100 ?? 0) - (b.pricePer100 ?? 0),
	);
	const at = all.indexOf(food);
	const from = Math.max(0, Math.min(at - 2, all.length - 5));
	const shown = all.slice(from, from + 5);

	// biome-ignore lint/correctness/useExhaustiveDependencies: the card is re-measured when it switches to another food
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const tw = el.offsetWidth;
		const th = el.offsetHeight;
		const [cx, cy] = anchor;
		let left = cx + 18;
		if (left + tw > box.w - 4) left = cx - tw - 18;
		if (left < 0) left = Math.max(0, Math.min(box.w - tw, cx - tw / 2));
		const top = Math.max(0, Math.min(box.h - th, cy - 40));
		setPos({ left, top });
	}, [anchor, box.w, box.h, food.id]);

	const nutrients: Array<[keyof Food, string, string]> = [
		["protein", "Protein", "g"],
		["energy", "kcal", ""],
		["carbs", "Carbs", "g"],
		["sugars", "Sugar", "g"],
		["fat", "Fat", "g"],
		["salt", "Salt", "g"],
	];

	return (
		<Card
			ref={ref}
			className={cn(
				"absolute z-10 w-[17rem] gap-0 p-4 text-sm shadow-xl",
				sticky ? "pointer-events-auto" : "pointer-events-none",
			)}
			style={{ left: pos.left, top: pos.top }}
			role="status"
		>
			<div className="flex items-start gap-2.5">
				<span className="text-2xl leading-none" aria-hidden="true">
					{emojiFor(food)}
				</span>
				<div className="min-w-0">
					<p className="font-semibold leading-tight">{food.name}</p>
					<p className="mt-0.5 text-muted-foreground">
						{[brandOf(food), food.retailer ?? "your price"]
							.filter(Boolean)
							.join(" · ")}
					</p>
				</div>
			</div>
			<div className="mt-3 flex items-baseline gap-2">
				<span className="text-2xl font-semibold tracking-tight">
					{euro(food.pricePer100)}
				</span>
				<span className="text-muted-foreground">per 100 {unit}</span>
				{food.organic ? <Badge variant="secondary">Bio</Badge> : null}
			</div>
			<p className="text-muted-foreground">
				{euro(food.packagePrice)} for {num(food.packageSize, 0)} {unit}
				{food.priceDate ? ` · seen ${food.priceDate}` : ""}
			</p>
			<Separator className="my-3" />
			<p className="mb-1.5 text-xs text-muted-foreground">per 100 {unit}</p>
			<dl className="grid grid-cols-3 gap-x-2 gap-y-2">
				{nutrients.map(([key, label, u]) => {
					const value = food[key] as number | null;
					return (
						<div key={key}>
							<dd
								className={cn(
									"font-semibold",
									key === "protein" && "text-[var(--pp-1)]",
								)}
							>
								{num(value)}
								{value != null ? u : ""}
							</dd>
							<dt className="text-xs text-muted-foreground">{label}</dt>
						</div>
					);
				})}
			</dl>
			<Separator className="my-3" />
			<div className="flex items-center justify-between gap-2">
				{url ? (
					<Button
						size="sm"
						nativeButton={false}
						render={
							// biome-ignore lint/a11y/useAnchorContent: Button renders its children inside the anchor
							<a href={url} target="_blank" rel="noreferrer" />
						}
					>
						Open at {food.retailer ?? "shop"}
						<ExternalLink />
					</Button>
				) : photo ? (
					<Button
						size="sm"
						variant="outline"
						nativeButton={false}
						render={
							// biome-ignore lint/a11y/useAnchorContent: Button renders its children inside the anchor
							<a href={photo} target="_blank" rel="noreferrer" />
						}
					>
						Label photo
						<ExternalLink />
					</Button>
				) : (
					<span className="text-muted-foreground italic">No product link</span>
				)}
				<span className="text-xs text-muted-foreground">
					{sticky ? "Esc to close" : "Click to pin"}
				</span>
			</div>
			{all.length > 1 ? (
				<ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
					<li className="flex justify-between font-medium text-foreground/80">
						<span>Same thing elsewhere</span>
						<span>{all.length}</span>
					</li>
					{shown.map((s) => (
						<li
							key={s.id}
							className={cn(
								"flex justify-between gap-2",
								s.id === food.id && "text-foreground",
							)}
						>
							<span className="truncate">
								{brandOf(s) || s.name} · {s.retailer ?? "own price"}
							</span>
							<span>{euro(s.pricePer100)}</span>
						</li>
					))}
				</ul>
			) : null}
		</Card>
	);
}
