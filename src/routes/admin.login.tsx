import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppwriteException, ID, type Models } from "appwrite";
import { type FormEvent, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import {
	getCurrentAdmin,
	getReadableAuthError,
	isAdminUser,
} from "../lib/auth";

export const Route = createFileRoute("/admin/login")({
	component: AdminLoginPage,
});

function AdminLoginPage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingSession, setIsLoadingSession] = useState(true);
	const [currentUser, setCurrentUser] =
		useState<Models.User<Models.Preferences> | null>(null);
	const [error, setError] = useState<string | null>(null);
	const isApprovedUser = isAdminUser(currentUser);

	useEffect(() => {
		let mounted = true;

		const loadSession = async () => {
			try {
				const user = await account.get();

				if (!mounted) {
					return;
				}

				setCurrentUser(user);

				try {
					await getCurrentAdmin();

					if (mounted) {
						void navigate({ to: "/admin/blog" });
					}
				} catch (cause) {
					if (mounted) {
						setError(getReadableAuthError(cause));
					}
				}
			} catch (cause) {
				if (!mounted) {
					return;
				}

				if (cause instanceof AppwriteException && cause.code !== 401) {
					setError(getReadableAuthError(cause));
				}
			} finally {
				if (mounted) {
					setIsLoadingSession(false);
				}
			}
		};

		void loadSession();

		return () => {
			mounted = false;
		};
	}, [navigate]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void handleSignIn();
	};

	const handleSignIn = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await account.createEmailPasswordSession(email, password);
			const user = await getCurrentAdmin();
			setCurrentUser(user);
			void navigate({ to: "/admin/blog" });
		} catch (cause) {
			if (cause instanceof AppwriteException) {
				if (cause.code === 401) {
					try {
						const user = await account.get();
						setCurrentUser(user);
					} catch {
						setCurrentUser(null);
					}
				}

				setError(cause.message);
			} else if (cause instanceof Error) {
				setError(getReadableAuthError(cause));
			} else {
				setError("Unable to sign in.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSignUp = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await account.create({
				userId: ID.unique(),
				email,
				password,
				name: name.trim() || undefined,
			});
			await account.createEmailPasswordSession(email, password);
			const user = await account.get();
			setCurrentUser(user);

			if (isAdminUser(user)) {
				void navigate({ to: "/admin/blog" });
				return;
			}

			setError(
				"Account created. Add the Appwrite user label admin if this account should access the admin area.",
			);
		} catch (cause) {
			if (cause instanceof AppwriteException) {
				setError(cause.message);
			} else if (cause instanceof Error) {
				setError(getReadableAuthError(cause));
			} else {
				setError("Unable to create account.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSignOut = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await account.deleteSession("current");
			setCurrentUser(null);
			setName("");
			setEmail("");
			setPassword("");
		} catch (cause) {
			if (cause instanceof AppwriteException) {
				setError(cause.message);
			} else if (cause instanceof Error) {
				setError(cause.message);
			} else {
				setError("Unable to sign out.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResetSession = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await account.deleteSession("current");
		} catch (cause) {
			if (!(cause instanceof AppwriteException && cause.code === 401)) {
				if (cause instanceof Error) {
					setError(cause.message);
				} else {
					setError("Unable to reset the current session.");
				}
			}
		} finally {
			setCurrentUser(null);
			setName("");
			setEmail("");
			setPassword("");
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (currentUser && isApprovedUser) {
			void navigate({ to: "/admin/blog" });
		}
	}, [currentUser, isApprovedUser, navigate]);

	return (
		<section className="mx-auto max-w-xl rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
			<p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
				Admin
			</p>
			<h1 className="mt-3 font-[var(--font-serif)] text-4xl">Sign in</h1>
			<p className="mt-3 leading-7 text-[var(--color-muted)]">
				Sign in or create an Appwrite email/password account here. Access to the
				admin area requires the Appwrite user label <code>admin</code>.
			</p>

			{currentUser ? (
				<div
					className={`mt-6 rounded-[1.5rem] px-5 py-4 text-sm ${
						isApprovedUser
							? "border border-emerald-200 bg-emerald-50 text-emerald-900"
							: "border border-amber-200 bg-amber-50 text-amber-900"
					}`}
				>
					<p className="font-medium">
						Signed in as{" "}
						{currentUser.name || currentUser.email || "Appwrite user"}.
					</p>
					<p className="mt-2">
						Appwrite user ID: <code>{currentUser.$id}</code>
					</p>
					{isApprovedUser ? (
						<>
							<p className="mt-2 text-emerald-800">
								This account is approved. If the redirect does not happen
								automatically, continue to the admin area below.
							</p>
							<div className="mt-4 flex flex-wrap gap-3">
								<Link
									to="/admin/blog"
									className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
								>
									Continue to admin
								</Link>
								<button
									type="button"
									onClick={() => void handleSignOut()}
									disabled={isSubmitting}
									className="rounded-full border border-emerald-300 px-4 py-2 font-medium text-emerald-900 transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Sign out
								</button>
							</div>
						</>
					) : (
						<>
							<p className="mt-2 text-amber-800">
								Add the Appwrite user label <code>admin</code> if this account
								should be allowed into the admin area.
							</p>
							<button
								type="button"
								onClick={() => void handleSignOut()}
								disabled={isSubmitting}
								className="mt-4 rounded-full border border-amber-300 px-4 py-2 font-medium text-amber-900 transition hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Sign out
							</button>
						</>
					)}
				</div>
			) : null}

			<form onSubmit={handleSubmit} className="mt-8 space-y-4">
				<label className="block text-sm">
					<span className="mb-2 block text-[var(--color-muted)]">Name</span>
					<input
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-accent)]"
					/>
				</label>
				<label className="block text-sm">
					<span className="mb-2 block text-[var(--color-muted)]">Email</span>
					<input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-accent)]"
					/>
				</label>
				<label className="block text-sm">
					<span className="mb-2 block text-[var(--color-muted)]">Password</span>
					<input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-accent)]"
					/>
				</label>

				{error ? (
					<p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
					</p>
				) : null}

				<div className="flex flex-col gap-3 sm:flex-row">
					<button
						type="submit"
						disabled={isSubmitting || isLoadingSession}
						className="flex-1 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Working..." : "Sign in"}
					</button>
					<button
						type="button"
						onClick={() => void handleSignUp()}
						disabled={isSubmitting || isLoadingSession}
						className="flex-1 rounded-full border border-[var(--color-line)] bg-[var(--color-card)] px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Working..." : "Create account"}
					</button>
				</div>
			</form>

			<div className="mt-6 border-t border-[var(--color-line)] pt-6">
				<p className="text-sm text-[var(--color-muted)]">
					This page calls <code>account.get()</code> on load so it can detect an
					existing Appwrite browser session and skip the login form when
					possible.
				</p>
				<button
					type="button"
					onClick={() => void handleResetSession()}
					disabled={isSubmitting}
					className="mt-4 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
				>
					Reset current session
				</button>
			</div>
		</section>
	);
}
