import { AppwriteException } from "appwrite";
import { account } from "./appwrite";

type UserLike = {
	labels?: string[];
};

export const isAdminUser = (user?: UserLike | null) =>
	Boolean(user?.labels?.includes("admin"));

export const getReadableAuthError = (cause: unknown) => {
	if (
		cause instanceof AppwriteException &&
		cause.code === 401 &&
		cause.message.includes('missing scopes (["account"])')
	) {
		return "Appwrite does not see a browser session for this origin. This is usually a localhost cookie/platform issue, not an admin-ID issue.";
	}

	if (cause instanceof Error) {
		return cause.message;
	}

	return "Unauthorized";
};

export const getCurrentAdmin = async () => {
	const user = await account.get();

	if (!isAdminUser(user)) {
		throw new Error("This account is not allowed to manage the site.");
	}

	return user;
};
