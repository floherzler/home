import { BlockNoteViewRaw, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import { useEffect, useState } from "react";

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
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const editor = useCreateBlockNote({
		initialContent: parseInitialContent(initialContentJson),
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
		<div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-elevated)] p-3 shadow-[var(--shadow-soft)]">
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
				theme={theme}
			/>
		</div>
	);
}
