import { createFileRoute } from "@tanstack/react-router";
import { fetchResumeJsonText } from "../lib/repositories/resume";

export const Route = createFileRoute("/resume.json")({
  server: {
    handlers: {
      GET: async () => {
        const jsonText = await fetchResumeJsonText();

        return new Response(jsonText, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
