import type * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)] backdrop-blur-sm",
				className,
			)}
			{...props}
		/>
	);
}

export function CardContent({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("p-5 sm:p-8", className)} {...props} />;
}
