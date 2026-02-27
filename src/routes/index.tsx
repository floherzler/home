import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogPostCard } from "../components/blog-post-card";
import { profile } from "../content/profile";
import { projects } from "../content/projects";
import { getLatestPostsServerFn } from "../lib/repositories/posts";

export const Route = createFileRoute("/")({
  loader: () => getLatestPostsServerFn({ data: { limit: 3 } }),
  component: HomePage,
});

function HomePage() {
  const latestPosts = Route.useLoaderData();

  return (
    <main className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
        <div className="rounded-[2.5rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.86)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent)]">Bioinformatics portfolio</p>
          <h1 className="mt-4 max-w-4xl font-[var(--font-serif)] text-5xl leading-[1.02] text-[var(--color-ink)] sm:text-6xl">
            Clean interfaces for complex biological data and clearer research workflows.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
            {profile.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)]"
            >
              View GitHub
            </a>
            <Link
              to="/blog"
              className="rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Read the blog
            </Link>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-card)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Profile</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl">{profile.name}</h2>
            <p className="mt-2 text-[var(--color-accent)]">{profile.role}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{profile.degree}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{profile.location}</p>
          </div>
          <div className="rounded-[2rem] border border-[var(--color-line)] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Resume</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl">Host JSON Resume without bloating the repo</h2>
            <p className="mt-3 leading-7 text-[var(--color-muted)]">
              The resume page reads from your hosted resume file and exposes the raw JSON at <code>/resume.json</code>.
            </p>
            <Link to="/resume" className="mt-5 inline-flex text-sm font-medium text-[var(--color-accent)]">
              Open resume
            </Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {profile.currentFocus.map((item, index) => (
          <article
            key={item.title}
            className="rounded-[2rem] border border-[var(--color-line)] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Current focus</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-[var(--color-ink)]">{item.title}</h2>
            <p className="mt-4 leading-7 text-[var(--color-muted)]">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_20px_55px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">Selected projects</p>
          <h2 className="mt-3 font-[var(--font-serif)] text-4xl">Manual, curated side projects</h2>
          <div className="mt-6 space-y-5">
            {projects.map((project) => (
              <article key={project.name} className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-card)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">{project.topic}</p>
                    <h3 className="mt-2 text-2xl font-medium text-[var(--color-ink)]">{project.name}</h3>
                  </div>
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-sm text-[var(--color-accent)]">
                    GitHub
                  </a>
                </div>
                <p className="mt-3 leading-7 text-[var(--color-muted)]">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span key={tech} className="rounded-full bg-white px-3 py-1 text-sm text-[var(--color-muted)]">
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_20px_55px_rgba(15,23,42,0.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">Latest writing</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-4xl">Notes from the workbench</h2>
            </div>
            <Link to="/blog" className="text-sm font-medium text-[var(--color-accent)]">
              All posts
            </Link>
          </div>
          <div className="mt-6 space-y-5">
            {latestPosts.length > 0 ? (
              latestPosts.map((post) => <BlogPostCard key={post.id} post={post} />)
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-[var(--color-line)] bg-[var(--color-card)] p-6 text-[var(--color-muted)]">
                No published posts yet. Use the admin area to create the first one.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
