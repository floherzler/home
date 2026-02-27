import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";

type BlogEditorProps = {
	initialContentJson: string;
	onChange: (value: { contentJson: string; contentHtml: string }) => void;
};

const parseInitialContent = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
};

export function BlogEditor({ initialContentJson, onChange }: BlogEditorProps) {
	const editor = useCreateBlockNote({
		initialContent: parseInitialContent(initialContentJson),
	});

	return (
		<div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
			<BlockNoteViewRaw
				editor={editor}
				formattingToolbar={false}
				linkToolbar={false}
				slashMenu={false}
				emojiPicker={false}
				sideMenu={false}
				filePanel={false}
				tableHandles={false}
				onChange={async () => {
					const contentJson = JSON.stringify(editor.document);
					const html =
						typeof editor.blocksToHTMLLossy === "function"
							? await editor.blocksToHTMLLossy(editor.document)
							: editor.document
									.map(
										(block: { content?: Array<{ text?: string }> }) =>
											block.content?.map((item) => item.text ?? "").join(" ") ??
											"",
									)
									.filter(Boolean)
									.map((paragraph) => `<p>${paragraph}</p>`)
									.join("");

					onChange({ contentJson, contentHtml: html });
				}}
				theme="light"
			/>
		</div>
	);
}
