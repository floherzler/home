import { createFileRoute } from "@tanstack/react-router";
import { ResumeView } from "../components/resume-view";
import { getResumeServerFn } from "../lib/repositories/resume";

export const Route = createFileRoute("/resume")({
  loader: () => getResumeServerFn(),
  component: ResumePage,
});

function ResumePage() {
  const resume = Route.useLoaderData();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">Resume</p>
          <h1 className="mt-3 font-[var(--font-serif)] text-5xl text-[var(--color-ink)]">Structured from hosted JSON</h1>
        </div>
        <a
          href="/resume.json"
          className="rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-ink)]"
        >
          View raw JSON
        </a>
      </div>
      <ResumeView resume={resume} />
    </section>
  );
}
