import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { profile } from "../content/profile";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Blog", to: "/blog" },
  { label: "Resume", to: "/resume" },
  { label: "Admin", to: "/admin/blog" },
] as const;

export function SiteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.12),_transparent_28%),linear-gradient(to_bottom,_rgba(255,255,255,0.94),_rgba(238,245,244,0.98))]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(circle_at_top,black_30%,transparent_80%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-4 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-20 mb-10 rounded-full border border-white/70 bg-white/75 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-card)] text-sm font-semibold text-[var(--color-accent)]">
                BA
              </div>
              <div>
                <p className="font-[var(--font-sans)] text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Research Atlas
                </p>
                <p className="font-[var(--font-serif)] text-lg">{profile.name}</p>
              </div>
            </Link>
            <nav className="flex flex-wrap gap-2 text-sm">
              {navItems.map((item) => {
                const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`rounded-full px-4 py-2 transition ${
                      isActive
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>

        <footer className="mt-16 border-t border-[var(--color-line)] pt-6 text-sm text-[var(--color-muted)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-[var(--font-serif)] text-lg text-[var(--color-ink)]">{profile.name}</p>
              <p>{profile.role}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em]">
                Built with TanStack Start and Appwrite
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {profile.contactLinks.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-[var(--color-accent)]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
