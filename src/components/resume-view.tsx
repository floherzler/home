import type { ResumeSchema } from "../lib/types";

export function ResumeView({ resume }: { resume: ResumeSchema }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Basics</p>
        <h1 className="mt-3 font-[var(--font-serif)] text-4xl text-[var(--color-ink)]">
          {resume.basics?.name ?? "Resume"}
        </h1>
        <p className="mt-2 text-lg text-[var(--color-accent)]">{resume.basics?.label}</p>
        <p className="mt-4 leading-7 text-[var(--color-muted)]">{resume.basics?.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
          {resume.basics?.email ? <span>{resume.basics.email}</span> : null}
          {resume.basics?.location?.city ? <span>{resume.basics.location.city}</span> : null}
          {resume.basics?.url ? (
            <a href={resume.basics.url} className="text-[var(--color-accent)]">
              {resume.basics.url}
            </a>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="font-[var(--font-serif)] text-3xl">Work</h2>
          <div className="mt-6 space-y-6">
            {resume.work?.map((role) => (
              <article key={`${role.name}-${role.position}`}>
                <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-[var(--color-ink)]">{role.position}</h3>
                    <p className="text-[var(--color-accent)]">{role.name}</p>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    {role.startDate} {role.endDate ? `- ${role.endDate}` : "- Present"}
                  </p>
                </div>
                <p className="mt-3 leading-7 text-[var(--color-muted)]">{role.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="font-[var(--font-serif)] text-3xl">Education & skills</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">Education</h3>
              <div className="mt-4 space-y-4">
                {resume.education?.map((entry) => (
                  <article key={`${entry.institution}-${entry.area}`}>
                    <p className="font-medium text-[var(--color-ink)]">{entry.institution}</p>
                    <p className="text-[var(--color-muted)]">{entry.studyType} in {entry.area}</p>
                  </article>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">Skills</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {resume.skills?.flatMap((skill) => skill.keywords ?? []).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-[var(--color-line)] bg-[var(--color-card)] px-3 py-1 text-sm text-[var(--color-ink)]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
