const getEnv = (key: string) => {
	const value = import.meta.env[key];

	if (typeof value !== "string") {
		return "";
	}

	return value.trim();
};

export const env = {
	endpoint: getEnv("VITE_APPWRITE_ENDPOINT"),
	projectId: getEnv("VITE_APPWRITE_PROJECT_ID"),
	projectName: getEnv("VITE_APPWRITE_PROJECT_NAME"),
	databaseId: getEnv("VITE_APPWRITE_DATABASE_ID"),
	postsTableId:
		getEnv("VITE_APPWRITE_TABLE_ID") ||
		getEnv("VITE_APPWRITE_POSTS_COLLECTION_ID"),
	contentBucketId: getEnv("VITE_APPWRITE_CONTENT_BUCKET_ID"),
	resumeFileId: getEnv("VITE_APPWRITE_RESUME_FILE_ID"),
};

export const hasPublicAppwriteConfig =
	Boolean(env.endpoint) &&
	Boolean(env.projectId) &&
	Boolean(env.databaseId) &&
	Boolean(env.postsTableId);
