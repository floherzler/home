import { ChevronRight, ExternalLink, Search } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
	brandOf,
	DIET_FAMILIES,
	type Diet,
	emojiFor,
	euro,
	FOODS,
	type Food,
	groupName,
	num,
	OWN_PRICE,
	SECTIONS,
	safeUrl,
	VIEWS,
	type ViewKey,
} from "./model";
import { type Active, ParetoChart } from "./pareto-chart";

const SLOTS = ["var(--pp-1)", "var(--pp-2)", "var(--pp-3)"];
const PIN_KEY = "protein-pareto-pins";
const STORES = [...new Set(FOODS.map((f) => f.store))].sort((a, b) =>
	a === OWN_PRICE ? 1 : b === OWN_PRICE ? -1 : a.localeCompare(b),
);
/** Selected segment reads as filled; unselected stays quiet. */
const SEG =
	"text-muted-foreground data-[pressed]:bg-foreground data-[pressed]:text-background";
const DEFAULT_PINS = ["skyr", "tofu", "tuna"];

type Kind = "all" | "snack" | "meal";
type SortKey =
	| "name"
	| "store"
	| "pricePer100"
	| "protein"
	| "energy"
	| "costPer25";

export function ProteinParetoPage() {
	const [viewKey, setViewKey] = useState<ViewKey>("price");
	const [scale, setScale] = useState<"linear" | "log">("log");
	const [showPareto, setShowPareto] = useState(true);
	const [diet, setDiet] = useState<Diet>("all");
	const [kind, setKind] = useState<Kind>("all");
	const [bioOnly, setBioOnly] = useState(false);
	const [stores, setStores] = useState<string[]>(STORES);
	const [search, setSearch] = useState("");
	const [pinned, setPinned] = useState<string[]>(DEFAULT_PINS);
	const [hoverGroup, setHoverGroup] = useState<string | null>(null);
	const [active, setActive] = useState<Active | null>(null);
	const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
		key: "costPer25",
		dir: 1,
	});
	const view = VIEWS[viewKey];
	const titleId = useId();
	const paretoId = useId();

	useEffect(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(PIN_KEY) ?? "null");
			if (Array.isArray(saved)) setPinned(saved.slice(0, 3));
		} catch {}
	}, []);
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setActive(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const togglePin = (group: string) => {
		setPinned((current) => {
			const next = current.includes(group)
				? current.filter((g) => g !== group)
				: [...current, group].slice(-3);
			try {
				localStorage.setItem(PIN_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	};
	const colorOf = useCallback(
		(group: string) => {
			const i = pinned.indexOf(group);
			return i >= 0 ? SLOTS[i] : null;
		},
		[pinned],
	);

	const pool = useMemo(() => {
		const families = DIET_FAMILIES[diet];
		return FOODS.filter(
			(f) =>
				(!families || families.includes(f.family)) &&
				(kind === "all" || f.kind === kind) &&
				(!bioOnly || f.organic) &&
				stores.includes(f.store),
		);
	}, [diet, kind, bioOnly, stores]);
	const shown = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return pool;
		return pool.filter((f) =>
			`${f.name} ${f.brand} ${f.store} ${groupName(f.productGroup)}`
				.toLowerCase()
				.includes(q),
		);
	}, [pool, search]);
	const missing = shown.filter((f) => view.x(f) == null || view.y(f) == null);

	return (
		<div className="theme-pp -mx-5 sm:-mx-8">
			<div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1fr)_18rem]">
				<section
					className="min-w-0 px-4 pb-6 sm:px-6"
					aria-labelledby={titleId}
				>
					<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
						<Tabs
							value={viewKey}
							onValueChange={(v) => {
								setViewKey(v as ViewKey);
								setActive(null);
							}}
						>
							<TabsList variant="line" className="h-10">
								<TabsTrigger value="price" className="text-base">
									Price vs protein
								</TabsTrigger>
								<TabsTrigger value="kcal" className="text-base">
									Protein per kcal
								</TabsTrigger>
							</TabsList>
						</Tabs>
						<div className="flex items-center gap-5">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Checkbox
									id={paretoId}
									checked={showPareto}
									onCheckedChange={(c) => setShowPareto(!!c)}
								/>
								<label htmlFor={paretoId} className="cursor-pointer">
									Pareto line
								</label>
							</div>
							<ToggleGroup
								size="sm"
								variant="outline"
								spacing={0}
								value={[scale]}
								onValueChange={(v) =>
									v[0] && setScale(v[0] as "linear" | "log")
								}
								aria-label="Price axis scale"
							>
								<ToggleGroupItem value="linear" className={SEG}>
									Linear
								</ToggleGroupItem>
								<ToggleGroupItem value="log" className={SEG}>
									Log
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
					</div>
					<h1 id={titleId} className="mt-6 text-2xl font-medium tracking-tight">
						{view.title}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">{view.sub}</p>

					<div className="mt-3 h-[clamp(26rem,calc(100vh-17rem),54rem)]">
						<ParetoChart
							foods={shown}
							view={view}
							scale={scale}
							showPareto={showPareto}
							colorOf={colorOf}
							pinned={pinned}
							hoverGroup={hoverGroup}
							active={active}
							onActive={setActive}
						/>
					</div>
					{missing.length ? (
						<p className="mt-3 text-sm text-muted-foreground">
							<span className="font-medium text-foreground/80">
								{missing.length} not plotted yet
							</span>{" "}
							· no price or nutrition:{" "}
							{missing
								.slice(0, 6)
								.map((f) => `${groupName(f.productGroup)} · ${f.store}`)
								.join(", ")}
							{missing.length > 6 ? " …" : ""}
						</p>
					) : null}
				</section>

				<aside
					className="border-t px-4 py-6 sm:px-6 lg:border-t-0 lg:border-l"
					aria-label="Filters and product groups"
				>
					<div className="flex items-baseline gap-2">
						<h2 className="text-xl font-medium tracking-tight">Snacks</h2>
						<span className="text-sm text-muted-foreground">
							{shown.length}
						</span>
					</div>
					<div className="relative mt-4">
						<Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Find snacks"
							className="pl-8"
						/>
					</div>

					<FilterRow label="Diet">
						<ChoiceGroup
							value={diet}
							onChange={setDiet}
							options={[
								["all", "all"],
								["pesc", "pesc"],
								["veggie", "veggie"],
								["vegan", "vegan"],
							]}
						/>
					</FilterRow>
					<FilterRow label="Type">
						<ChoiceGroup
							value={kind}
							onChange={setKind}
							options={[
								["all", "all"],
								["snack", "snack"],
								["meal", "meal add-on"],
							]}
						/>
					</FilterRow>
					<FilterRow label="Bio">
						<Toggle
							size="sm"
							variant="outline"
							pressed={bioOnly}
							onPressedChange={setBioOnly}
							className={SEG}
						>
							only Bio
						</Toggle>
					</FilterRow>
					<FilterRow label="Stores">
						<ToggleGroup
							multiple
							size="sm"
							spacing={1}
							className="flex-wrap"
							value={stores}
							onValueChange={(v) =>
								setStores(v.length ? (v as string[]) : STORES)
							}
						>
							{STORES.map((s) => (
								<ToggleGroupItem
									key={s}
									value={s}
									className="text-muted-foreground data-[pressed]:bg-secondary data-[pressed]:text-foreground"
								>
									{s}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</FilterRow>

					<Separator className="my-6" />
					<p className="text-sm text-muted-foreground">
						Pick up to three groups to colour them in.
					</p>
					<GroupList
						pool={pool}
						shown={shown}
						pinned={pinned}
						colorOf={colorOf}
						onToggle={togglePin}
						onHover={setHoverGroup}
					/>
				</aside>
			</div>

			<section className="border-t px-4 py-5 sm:px-6">
				<Collapsible>
					<CollapsibleTrigger className="group flex items-center gap-2 text-left text-muted-foreground hover:text-foreground">
						<ChevronRight className="size-4 transition-transform group-data-[panel-open]:rotate-90" />
						<span className="text-base font-medium text-foreground">
							All products
						</span>
						<span className="text-sm">({shown.length}) as a table</span>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<ProductTable
							foods={shown}
							sort={sort}
							onSort={(key) =>
								setSort((s) => ({
									key,
									dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1,
								}))
							}
							onPick={(id) => {
								setActive({ id, sticky: true });
								window.scrollTo({ top: 0, behavior: "smooth" });
							}}
						/>
					</CollapsibleContent>
				</Collapsible>
				<p className="mt-4 max-w-prose text-xs text-muted-foreground">
					Prices are dated snapshots from single product pages, or added by
					hand. Nutrition per 100 g (100 ml for drinks) as sold, drained weight
					for tins and jars. Check the pack before trusting a number.
				</p>
			</section>
		</div>
	);
}

function FilterRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mt-5">
			<h3 className="mb-2 text-sm font-medium">{label}</h3>
			{children}
		</div>
	);
}

function ChoiceGroup<T extends string>({
	value,
	onChange,
	options,
}: {
	value: T;
	onChange: (v: T) => void;
	options: Array<[T, string]>;
}) {
	return (
		<ToggleGroup
			size="sm"
			variant="outline"
			spacing={0}
			value={[value]}
			onValueChange={(v) => v[0] && onChange(v[0] as T)}
		>
			{options.map(([key, label]) => (
				<ToggleGroupItem key={key} value={key} className={SEG}>
					{label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

function GroupList({
	pool,
	shown,
	pinned,
	colorOf,
	onToggle,
	onHover,
}: {
	pool: Food[];
	shown: Food[];
	pinned: string[];
	colorOf: (g: string) => string | null;
	onToggle: (g: string) => void;
	onHover: (g: string | null) => void;
}) {
	const counts = new Map<string, number>();
	for (const f of shown)
		counts.set(f.productGroup, (counts.get(f.productGroup) ?? 0) + 1);
	return (
		<div onPointerLeave={() => onHover(null)}>
			{SECTIONS.map(([title, families]) => {
				const members = pool.filter((f) => families.includes(f.family));
				const groups = [...new Set(members.map((f) => f.productGroup))].sort(
					(a, b) =>
						(counts.get(b) ?? 0) - (counts.get(a) ?? 0) ||
						groupName(a).localeCompare(groupName(b)),
				);
				if (!groups.length) return null;
				return (
					<div key={title} className="mt-5">
						<h3 className="mb-1 text-sm font-medium">{title}</h3>
						{groups.map((g) => {
							const color = colorOf(g);
							const n = counts.get(g) ?? 0;
							const sample = members.find((f) => f.productGroup === g) as Food;
							return (
								<Toggle
									key={g}
									pressed={pinned.includes(g)}
									onPressedChange={() => onToggle(g)}
									onPointerEnter={() => onHover(g)}
									className={cn(
										"h-9 w-full justify-start gap-3 px-2 font-normal text-muted-foreground data-[pressed]:bg-transparent data-[pressed]:font-medium",
										n === 0 && "opacity-40",
									)}
									style={color ? { color } : undefined}
								>
									<span
										className={cn(
											"w-5 text-center text-base",
											!color && "opacity-70 grayscale-[.6]",
										)}
										aria-hidden="true"
									>
										{emojiFor(sample)}
									</span>
									<span className="flex-1 text-left">{groupName(g)}</span>
									<span className="text-xs tabular-nums opacity-60">{n}</span>
								</Toggle>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}

function ProductTable({
	foods,
	sort,
	onSort,
	onPick,
}: {
	foods: Food[];
	sort: { key: SortKey; dir: 1 | -1 };
	onSort: (key: SortKey) => void;
	onPick: (id: string) => void;
}) {
	const value = (f: Food) => (sort.key === "store" ? f.store : f[sort.key]);
	const rows = [...foods].sort((a, b) => {
		const av = value(a);
		const bv = value(b);
		if (av == null) return bv == null ? 0 : 1;
		if (bv == null) return -1;
		return typeof av === "string"
			? av.localeCompare(String(bv)) * sort.dir
			: ((av as number) - (bv as number)) * sort.dir;
	});
	const head = (key: SortKey, label: string, right = false) => (
		<TableHead className={right ? "text-right" : undefined}>
			<button
				type="button"
				onClick={() => onSort(key)}
				className="hover:text-foreground"
			>
				{label}
				{sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
			</button>
		</TableHead>
	);
	return (
		<Table className="mt-4">
			<TableHeader>
				<TableRow>
					{head("name", "Product")}
					{head("store", "Store")}
					{head("pricePer100", "€ / 100", true)}
					{head("protein", "Protein", true)}
					{head("energy", "kcal", true)}
					{head("costPer25", "€ / 25 g protein", true)}
					<TableHead>Link</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map((f) => {
					const url = safeUrl(f.url);
					return (
						<TableRow
							key={f.id}
							className="cursor-pointer"
							onClick={() => onPick(f.id)}
						>
							<TableCell>
								<div className="flex items-center gap-2">
									<span aria-hidden="true">{emojiFor(f)}</span>
									<div>
										<div>{f.name}</div>
										<div className="text-xs text-muted-foreground">
											{brandOf(f)}
										</div>
									</div>
									{f.organic ? <Badge variant="secondary">Bio</Badge> : null}
								</div>
							</TableCell>
							<TableCell>{f.store}</TableCell>
							<TableCell className="text-right tabular-nums">
								{euro(f.pricePer100)}
								<div className="text-xs text-muted-foreground">
									{f.packagePrice != null
										? `${euro(f.packagePrice)} / ${num(f.packageSize, 0)} ${f.unit}`
										: "no price yet"}
								</div>
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{num(f.protein)} g
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{num(f.energy, 0)}
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{euro(f.costPer25)}
							</TableCell>
							<TableCell>
								{url ? (
									<a
										href={url}
										target="_blank"
										rel="noreferrer"
										onClick={(e) => e.stopPropagation()}
										className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
									>
										shop <ExternalLink className="size-3" />
									</a>
								) : (
									"—"
								)}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
