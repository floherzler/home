import * as sdk from "node-appwrite";

const { Client, TablesDB } = sdk;

const endpoint = process.env.VITE_APPWRITE_ENDPOINT ?? "";
const projectId = process.env.VITE_APPWRITE_PROJECT_ID ?? "";
const apiKey = process.env.APPWRITE_API_KEY ?? "";

export const hasServerAppwriteConfig =
  Boolean(endpoint) && Boolean(projectId) && Boolean(apiKey);

export const createServerClient = () => {
  if (!hasServerAppwriteConfig) {
    throw new Error(
      "Missing Appwrite server credentials. Set VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY.",
    );
  }

  return new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
};

export const createServerTablesDB = () => new TablesDB(createServerClient());
