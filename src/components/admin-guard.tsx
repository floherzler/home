import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentAdmin, getReadableAuthError } from "../lib/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const [status, setStatus] = useState<"checking" | "ready">("checking");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		getCurrentAdmin()
			.then(() => {
				if (mounted) {
					setStatus("ready");
				}
			})
			.catch((cause) => {
				if (mounted) {
					setError(getReadableAuthError(cause));
					void navigate({ to: "/admin/login" });
				}
			});

		return () => {
			mounted = false;
		};
	}, [navigate]);

	if (status === "checking") {
		return (
			<section className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
				<p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
					Admin
				</p>
				<h1 className="mt-3 font-[var(--font-serif)] text-3xl">
					Checking session
				</h1>
				<p className="mt-3 max-w-2xl text-[var(--color-muted)]">
					{error ??
						"Verifying that this browser session belongs to an approved account."}
				</p>
			</section>
		);
	}

	return <>{children}</>;
}
