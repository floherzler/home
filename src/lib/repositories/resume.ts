import { createServerFn } from "@tanstack/react-start";
import { env } from "../env";
import type { ResumeSchema } from "../types";

const getServerResumeConfig = () => ({
  endpoint: process.env.VITE_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.VITE_APPWRITE_PROJECT_ID ?? "",
  bucketId: process.env.VITE_APPWRITE_CONTENT_BUCKET_ID ?? "",
  fileId: process.env.VITE_APPWRITE_RESUME_FILE_ID ?? "",
  apiKey: process.env.APPWRITE_API_KEY ?? "",
});

export const fetchResumeJsonText = async () => {
  const config = getServerResumeConfig();

  if (!config.endpoint || !config.projectId || !config.bucketId || !config.fileId || !config.apiKey) {
    throw new Error(
      "Missing resume configuration. Set VITE_APPWRITE_CONTENT_BUCKET_ID, VITE_APPWRITE_RESUME_FILE_ID, and APPWRITE_API_KEY.",
    );
  }

  const response = await fetch(
    `${config.endpoint}/storage/buckets/${config.bucketId}/files/${config.fileId}/download`,
    {
      headers: {
        "X-Appwrite-Key": config.apiKey,
        "X-Appwrite-Project": config.projectId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load resume JSON (${response.status}).`);
  }

  return response.text();
};

export const parseResume = (jsonText: string): ResumeSchema => {
  const parsed = JSON.parse(jsonText) as ResumeSchema;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Resume payload is not a JSON object.");
  }

  return parsed;
};

export const getResumeServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const jsonText = await fetchResumeJsonText();
  return parseResume(jsonText);
});

export const getResumeJsonTextServerFn = createServerFn({ method: "GET" }).handler(
  async () => fetchResumeJsonText(),
);

export const hasResumeClientConfig = Boolean(env.contentBucketId) && Boolean(env.resumeFileId);
