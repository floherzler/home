import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";

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
	const editor = useCreateBlockNote({
		initialContent:
			blocks && blocks.length > 0
				? blocks
				: [{ id: "empty", type: "paragraph", content: [] }],
	});

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
				theme="light"
			/>
		</div>
	);
}
