import type { ProjectPin } from "../lib/types";

export const projects: ProjectPin[] = [
  {
    name: "Signal Atlas",
    description:
      "A concept for exploring bio-signal experiments, focusing on legible preprocessing, annotations, and model comparison.",
    githubUrl: "https://github.com/your-github-handle/signal-atlas",
    topic: "Bio-signal tooling",
    tech: ["TypeScript", "React", "Visualization"],
  },
  {
    name: "Lab Notes Index",
    description:
      "A lightweight PKM companion for turning daily research notes into searchable project and method summaries.",
    githubUrl: "https://github.com/your-github-handle/lab-notes-index",
    topic: "PKM systems",
    tech: ["Obsidian", "Markdown", "Automation"],
  },
  {
    name: "Genome Utility Kit",
    description:
      "Small utilities for cleaning, validating, and packaging genomics-oriented data artifacts for downstream analysis.",
    githubUrl: "https://github.com/your-github-handle/genome-utility-kit",
    topic: "Bioinformatics workflows",
    tech: ["Python", "CLI", "Data engineering"],
  },
];
