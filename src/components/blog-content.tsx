import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import { useEffect, useState } from "react";

type BlogContentProps = {
	contentJson: string;
	contentHtml?: string;
};

const htmlToPlainText = (value: string) =>
	value
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const parseContentJson = (value: string) => {
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : undefined;
	} catch {
		return undefined;
	}
};

export function BlogContent({ contentJson, contentHtml }: BlogContentProps) {
	const blocks = parseContentJson(contentJson);
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const editor = useCreateBlockNote({
		initialContent:
			blocks && blocks.length > 0
				? blocks
				: [{ id: "empty", type: "paragraph", content: [] }],
	});

	useEffect(() => {
		const syncTheme = () => {
			setTheme(
				document.documentElement.classList.contains("dark") ? "dark" : "light",
			);
		};

		syncTheme();

		const observer = new MutationObserver(syncTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	if (!blocks || blocks.length === 0) {
		return contentHtml ? (
			<div className="article-body">
				<p>{htmlToPlainText(contentHtml)}</p>
			</div>
		) : null;
	}

	return (
		<div className="blog-content">
			<BlockNoteViewRaw
				editor={editor}
				editable={false}
				formattingToolbar={false}
				linkToolbar={false}
				slashMenu={false}
				emojiPicker={false}
				sideMenu={false}
				filePanel={false}
				tableHandles={false}
				theme={theme}
			/>
		</div>
	);
}
