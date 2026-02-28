import {
	Account,
	AppwriteException,
	Client,
	ID,
	Storage,
	TablesDB,
} from "appwrite";
import { env } from "./env";

const client = new Client();

if (env.endpoint) {
	client.setEndpoint(env.endpoint);
}

if (env.projectId) {
	client.setProject(env.projectId);
}

const account = new Account(client);
const tablesDB = new TablesDB(client);
const storage = new Storage(client);

export const uploadBlogImage = async (file: File) => {
	if (!env.contentBucketId) {
		throw new Error(
			"Missing Appwrite content bucket configuration. Set VITE_APPWRITE_CONTENT_BUCKET_ID to enable image uploads.",
		);
	}

	try {
		const uploadedFile = await storage.createFile(
			env.contentBucketId,
			ID.unique(),
			file,
		);

		return storage.getFileView(env.contentBucketId, uploadedFile.$id);
	} catch (error) {
		if (error instanceof AppwriteException) {
			throw new Error(error.message);
		}

		throw error;
	}
};

export { account, client, storage, tablesDB };
