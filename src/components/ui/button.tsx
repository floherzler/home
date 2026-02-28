import type * as React from "react";
import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
	default:
		"bg-[var(--color-accent-button)] text-[var(--color-accent-contrast)] shadow-[var(--shadow-soft)] hover:bg-[var(--color-accent-button-hover)]",
	outline:
		"border border-[var(--color-line)] bg-[var(--color-elevated)] text-[var(--color-accent-ink)] shadow-[var(--shadow-soft)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]",
	ghost:
		"text-[var(--color-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-ink)]",
};

const sizeClasses: Record<ButtonSize, string> = {
	default: "h-11 rounded-full px-5 py-2.5",
	sm: "h-9 rounded-full px-4 text-sm",
	lg: "h-12 rounded-full px-6",
	icon: "h-10 w-10 rounded-full",
};

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
	variant?: ButtonVariant;
	size?: ButtonSize;
}

export function Button({
	asChild = false,
	className,
	size = "default",
	variant = "default",
	children,
	...props
}: ButtonProps) {
	const classes = cn(
		"inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] disabled:pointer-events-none disabled:opacity-50",
		variantClasses[variant],
		sizeClasses[size],
		className,
	);

	if (asChild && isValidElement(children)) {
		return cloneElement(children, {
			...props,
			...children.props,
			className: cn(classes, children.props.className),
		});
	}

	return (
		<button className={classes} {...props}>
			{children}
		</button>
	);
}
