export const getYouTubeEmbedUrl = (value?: string) => {
	if (!value) {
		return null;
	}

	try {
		const url = new URL(value);
		const host = url.hostname.replace(/^www\./, "").toLowerCase();

		if (host === "youtu.be") {
			const id = url.pathname.split("/").filter(Boolean)[0];
			return id ? `https://www.youtube.com/embed/${id}` : null;
		}

		if (host === "youtube.com" || host === "m.youtube.com") {
			if (url.pathname === "/watch") {
				const id = url.searchParams.get("v");
				return id ? `https://www.youtube.com/embed/${id}` : null;
			}

			if (url.pathname.startsWith("/shorts/")) {
				const id = url.pathname.split("/")[2];
				return id ? `https://www.youtube.com/embed/${id}` : null;
			}

			if (url.pathname.startsWith("/embed/")) {
				const id = url.pathname.split("/")[2];
				return id ? `https://www.youtube.com/embed/${id}` : null;
			}
		}
	} catch {
		return null;
	}

	return null;
};
