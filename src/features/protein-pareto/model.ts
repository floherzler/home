import dataset from "./data.json";

export type Family =
	| "dairy"
	| "eggs"
	| "soy"
	| "legumes"
	| "grains"
	| "meat"
	| "fish";

export interface RawFood {
	id: string;
	name: string;
	brand: string | null;
	retailer: string | null;
	family: Family;
	productGroup: string;
	kind: "snack" | "meal";
	organic: boolean;
	unit: "g" | "ml";
	packageSize: number | null;
	packagePrice: number | null;
	priceDate: string | null;
	url: string | null;
	nutritionSource: string | null;
	sourceImage?: string | null;
	energy: number | null;
	protein: number | null;
	carbs: number | null;
	sugars: number | null;
	fat: number | null;
	saturatedFat: number | null;
	salt: number | null;
	prep: string | null;
	note: string | null;
}

export interface Food extends RawFood {
	store: string;
	pricePer100: number | null;
	costPer25: number | null;
	proteinPerKcal: number | null;
}

export const OWN_PRICE = "Own price";

export function enrich(food: RawFood): Food {
	const price =
		food.packagePrice != null && food.packageSize
			? (food.packagePrice / food.packageSize) * 100
			: null;
	const protein = food.protein;
	return {
		...food,
		store: food.retailer ?? OWN_PRICE,
		pricePer100: price,
		costPer25: price != null && protein ? (price * 25) / protein : null,
		proteinPerKcal:
			protein != null && food.energy ? (protein / food.energy) * 100 : null,
	};
}

export const FOODS: Food[] = (dataset.foods as RawFood[]).map(enrich);

const GROUPS: Record<string, [string, string]> = {
	skyr: ["🥣", "Skyr"],
	magerquark: ["🥄", "Magerquark"],
	"quark-spread": ["🥄", "Quark spread"],
	"cottage-cheese": ["🧀", "Cottage cheese"],
	"natural-yogurt": ["🥛", "Yogurt"],
	"greek-yogurt": ["🫙", "Greek yogurt"],
	mozzarella: ["⚪", "Mozzarella"],
	harzer: ["🧀", "Harzer"],
	"protein-pudding": ["🍮", "Protein pudding"],
	"protein-drink": ["🥤", "Protein drink"],
	eggs: ["🥚", "Boiled eggs"],
	tofu: ["🥢", "Tofu"],
	"smoked-tofu": ["🔥", "Smoked tofu"],
	edamame: ["🫛", "Edamame"],
	hummus: ["🫓", "Hummus"],
	chickpeas: ["🧆", "Chickpeas"],
	"kidney-beans": ["🫘", "Kidney beans"],
	"white-beans": ["🫘", "White beans"],
	peas: ["🟢", "Peas"],
	"lentil-cakes": ["🍘", "Lentil waffles"],
	"chickpea-cakes": ["🍘", "Chickpea waffles"],
	"rice-cakes": ["🍘", "Rice cakes"],
	"corn-cakes": ["🌽", "Corn cakes"],
	"protein-bar": ["🍫", "Protein bar"],
	tuna: ["🐟", "Tuna"],
	"smoked-fish": ["🐠", "Smoked fish"],
	"chicken-deli": ["🍗", "Chicken deli"],
	"salami-sticks": ["🥓", "Salami sticks"],
	jerky: ["🥩", "Jerky"],
};
const FAMILY_EMOJI: Record<Family, string> = {
	dairy: "🥛",
	eggs: "🥚",
	soy: "🌱",
	legumes: "🫘",
	grains: "🌾",
	meat: "🍗",
	fish: "🐟",
};

export function groupName(group: string) {
	return (
		GROUPS[group]?.[1] ??
		group.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
	);
}
export function emojiFor(food: Pick<Food, "productGroup" | "family">) {
	return GROUPS[food.productGroup]?.[0] ?? FAMILY_EMOJI[food.family] ?? "🍽️";
}
/** Retailer data spells some brands in caps (MILSANI); soften them for display. */
export function brandOf(food: Pick<Food, "brand">) {
	return (food.brand ?? "").replace(
		/\b[A-ZÄÖÜ]{5,}\b/g,
		(w) => w[0] + w.slice(1).toLowerCase(),
	);
}

export const SECTIONS: Array<[string, Family[]]> = [
	["Dairy & eggs", ["dairy", "eggs"]],
	["Plants", ["soy", "legumes", "grains"]],
	["Meat & fish", ["meat", "fish"]],
];

export type Diet = "all" | "pesc" | "veggie" | "vegan";
export const DIET_FAMILIES: Record<Diet, Family[] | null> = {
	all: null,
	pesc: ["dairy", "eggs", "soy", "legumes", "grains", "fish"],
	veggie: ["dairy", "eggs", "soy", "legumes", "grains"],
	vegan: ["soy", "legumes", "grains"],
};

export type ViewKey = "price" | "kcal";
export interface View {
	title: string;
	sub: string;
	x: (f: Food) => number | null;
	y: (f: Food) => number | null;
	xTitle: (unit: string) => string;
	yTitle: (unit: string) => string;
}
export const VIEWS: Record<ViewKey, View> = {
	price: {
		title: "Price vs protein",
		sub: "Up and to the left is better: more protein for less money.",
		x: (f) => f.pricePer100,
		y: (f) => f.protein,
		xTitle: (u) => `Price per 100 ${u}`,
		yTitle: (u) => `Protein per 100 ${u}`,
	},
	kcal: {
		title: "Protein per kcal",
		sub: "Up and to the left is leaner and cheaper.",
		x: (f) => f.costPer25,
		y: (f) => f.proteinPerKcal,
		xTitle: () => "Price for 25 g protein",
		yTitle: () => "Protein per 100 kcal",
	},
};

/** Products not beaten on both axes by another product (lower x, higher y is better). */
export function paretoFrontier<T>(
	items: T[],
	x: (t: T) => number,
	y: (t: T) => number,
) {
	const sorted = [...items].sort((a, b) => x(a) - x(b) || y(b) - y(a));
	const out: T[] = [];
	let best = Number.NEGATIVE_INFINITY;
	for (const item of sorted) {
		if (y(item) > best) {
			out.push(item);
			best = y(item);
		}
	}
	return out;
}

export function niceLinear(min: number, max: number, count = 5) {
	const step0 = (max - min) / count;
	const mag = 10 ** Math.floor(Math.log10(step0));
	const step =
		[1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? 10 * mag;
	const end = Math.ceil(max / step - 1e-9) * step;
	const ticks: number[] = [];
	for (let t = Math.ceil(min / step) * step; t <= end + 1e-9; t += step)
		ticks.push(+t.toFixed(6));
	return ticks;
}

export function niceLog(min: number, max: number) {
	const out: number[] = [];
	for (
		let e = Math.floor(Math.log10(min));
		e <= Math.ceil(Math.log10(max));
		e++
	)
		for (const m of [1, 2, 3, 5]) {
			const t = m * 10 ** e;
			if (t >= min * 0.999 && t <= max * 1.001) out.push(+t.toFixed(6));
		}
	return out;
}

export const euro = (n: number | null | undefined) =>
	n != null && Number.isFinite(n) ? `€${n.toFixed(2)}` : "—";
export const num = (n: number | null | undefined, digits = 1) =>
	n != null && Number.isFinite(n)
		? n.toLocaleString("en", { maximumFractionDigits: digits })
		: "—";
export const safeUrl = (u: string | null | undefined) =>
	u && /^https?:\/\//i.test(u) ? u : null;
