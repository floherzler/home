import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useEffect, useState } from "react";
import { blockNoteSchema, normalizeBlockNoteContent } from "../lib/blocknote";

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
		return normalizeBlockNoteContent(JSON.parse(value));
	} catch {
		return undefined;
	}
};

export function BlogContent({ contentJson, contentHtml }: BlogContentProps) {
	const blocks = parseContentJson(contentJson);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!blocks || blocks.length === 0) {
		return contentHtml ? (
			<div className="article-body">
				<p>{htmlToPlainText(contentHtml)}</p>
			</div>
		) : null;
	}

	if (!isClient) {
		return contentHtml ? (
			<div
				className="article-body"
				dangerouslySetInnerHTML={{ __html: contentHtml }}
			/>
		) : (
			<div className="article-body">
				<p>{htmlToPlainText(contentJson)}</p>
			</div>
		);
	}

	return <ClientBlogContent blocks={blocks} />;
}

function ClientBlogContent({
	blocks,
}: {
	blocks: NonNullable<ReturnType<typeof parseContentJson>>;
}) {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const editor = useCreateBlockNote({
		schema: blockNoteSchema,
		initialContent:
			blocks.length > 0
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

	return (
		<div className="blog-content">
			<BlockNoteView
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
