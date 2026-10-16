import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const COLORMAPS = ["viridis", "magma", "inferno", "plasma"] as const;
type Colormap = (typeof COLORMAPS)[number];
export const COLORMAP_KEY = "cmap";
/** Text-style toggle item: the selected one is underlined in the current colour map. */
export const PICKER_ITEM =
	"h-6 px-1.5 text-xs text-muted-foreground data-[pressed]:bg-transparent data-[pressed]:text-foreground data-[pressed]:underline data-[pressed]:decoration-[var(--cm-3)] data-[pressed]:decoration-2 data-[pressed]:underline-offset-4";

/** Switches the site's accent colour map; stored per visitor and applied as data-cmap on <html>. */
export function ColormapPicker() {
	const [cmap, setCmap] = useState<Colormap>("viridis");

	useEffect(() => {
		const current = document.documentElement.dataset.cmap;
		if (COLORMAPS.includes(current as Colormap)) setCmap(current as Colormap);
	}, []);

	function choose(next: Colormap) {
		setCmap(next);
		document.documentElement.dataset.cmap = next;
		try {
			localStorage.setItem(COLORMAP_KEY, next);
		} catch {}
	}

	return (
		<>
			{/* Narrow screens: only the selected map, the rest behind a chevron. */}
			<DropdownMenu>
				<DropdownMenuTrigger
					className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 font-mono text-xs text-foreground underline decoration-[var(--cm-3)] decoration-2 underline-offset-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 sm:hidden"
					aria-label={`Colour map: ${cmap}`}
				>
					{cmap}
					<ChevronDown className="size-3 text-muted-foreground" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-auto font-mono">
					<DropdownMenuRadioGroup
						value={cmap}
						onValueChange={(v) => choose(v as Colormap)}
					>
						{COLORMAPS.map((name) => (
							<DropdownMenuRadioItem
								key={name}
								value={name}
								className="text-xs"
							>
								{name}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<ToggleGroup
				size="sm"
				spacing={0}
				value={[cmap]}
				onValueChange={(v) => v[0] && choose(v[0] as Colormap)}
				aria-label="Colour map"
				className="hidden font-mono sm:flex"
			>
				{COLORMAPS.map((name) => (
					<ToggleGroupItem key={name} value={name} className={PICKER_ITEM}>
						{name}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</>
	);
}
