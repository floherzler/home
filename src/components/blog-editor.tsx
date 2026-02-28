import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import {
	filterSuggestionItems,
	type PartialBlock,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
	SuggestionMenuController,
	getDefaultReactSlashMenuItems,
	type DefaultReactSuggestionItem,
} from "@blocknote/react";
import { useEffect, useMemo, useState } from "react";
import * as Button from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { uploadBlogImage } from "../lib/appwrite";
import { blockNoteSchema, normalizeBlockNoteContent } from "../lib/blocknote";
import { env } from "../lib/env";
import { getYouTubeEmbedUrl } from "../lib/utils/embeds";
import { RiYoutubeFill } from "react-icons/ri";

type BlogEditorProps = {
	initialContentJson: string;
	onChange: (value: { contentJson: string; contentHtml: string }) => void;
};

const emptyDocument = [{ id: "empty", type: "paragraph", content: [] }];

const parseInitialContent = (value: string) => {
	try {
		const parsed = normalizeBlockNoteContent(JSON.parse(value));
		return parsed && parsed.length > 0 ? parsed : emptyDocument;
	} catch {
		return emptyDocument;
	}
};

export function BlogEditor({ initialContentJson, onChange }: BlogEditorProps) {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [uploadState, setUploadState] = useState<
		"idle" | "uploading" | "error"
	>("idle");
	const [uploadError, setUploadError] = useState<string | null>(
		env.contentBucketId
			? null
			: "Image upload is unavailable until VITE_APPWRITE_CONTENT_BUCKET_ID is configured.",
	);
	const editor = useCreateBlockNote({
		schema: blockNoteSchema,
		initialContent: parseInitialContent(initialContentJson),
		uploadFile: env.contentBucketId
			? async (file) => {
					setUploadState("uploading");
					setUploadError(null);

					try {
						const url = await uploadBlogImage(file);
						setUploadState("idle");
						return url;
					} catch (error) {
						const message =
							error instanceof Error
								? error.message
								: "Image upload failed. Check Appwrite permissions and try again.";

						setUploadState("error");
						setUploadError(message);
						throw error;
					}
				}
			: undefined,
	});
	const slashMenuItems = useMemo<DefaultReactSuggestionItem[]>(() => {
		const insertYouTubeBlock = () => {
			if (typeof window === "undefined") {
				return;
			}

			const youtubeUrl = window.prompt(
				"Paste a YouTube video, Short, or youtu.be URL.",
			);

			if (!youtubeUrl) {
				return;
			}

			if (!getYouTubeEmbedUrl(youtubeUrl)) {
				setUploadError("Enter a valid YouTube URL.");
				return;
			}

			setUploadError(null);

			const currentBlock = editor.getTextCursorPosition().block;
			const shouldReplaceCurrentBlock =
				Array.isArray(currentBlock.content) &&
				((currentBlock.content.length === 1 &&
					currentBlock.content[0]?.type === "text" &&
					currentBlock.content[0]?.text === "/") ||
					currentBlock.content.length === 0);

			if (shouldReplaceCurrentBlock) {
				const youtubeBlock = editor.updateBlock(currentBlock, {
					type: "youtube",
					props: {
						url: youtubeUrl.trim(),
					},
				} as PartialBlock);
				const paragraph = editor.insertBlocks(
					[{ type: "paragraph" } as PartialBlock],
					youtubeBlock,
					"after",
				)[0];
				editor.setTextCursorPosition(paragraph);
				return;
			}

			const inserted = editor.insertBlocks(
				[
					{
						type: "youtube",
						props: {
							url: youtubeUrl.trim(),
						},
					} as PartialBlock,
					{ type: "paragraph" } as PartialBlock,
				],
				currentBlock,
				"after",
			);
			editor.setTextCursorPosition(inserted[1] ?? inserted[0]);
		};

		return [
			...getDefaultReactSlashMenuItems(editor),
			{
				key: "youtube",
				title: "YouTube",
				subtext: "Embed a YouTube video or Short",
				aliases: ["youtube", "yt", "video", "shorts"],
				group: "Media",
				icon: <RiYoutubeFill size={18} />,
				onItemClick: insertYouTubeBlock,
			},
		];
	}, [editor]);

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
		<div className="blog-editor-shell rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-elevated)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
			<div className="mb-4 flex flex-col gap-3 border-b border-[var(--color-line)] pb-4">
				<div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
							Content editor
						</p>
						<h2 className="mt-1 font-[var(--font-serif)] text-2xl text-[var(--color-ink)]">
							Keyboard-first writing with slash commands
						</h2>
					</div>
					<div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
						<span className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5">
							Use <span className="font-medium text-[var(--color-ink)]">/</span>{" "}
							for blocks
						</span>
						<span className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5">
							Type markdown shortcuts directly
						</span>
						<span className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5">
							Upload images into Appwrite
						</span>
						<div className="editor-help group relative">
							<button
								type="button"
								aria-label="Editor help"
								className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-accent-ink)] shadow-[var(--shadow-soft)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
							>
								?
							</button>
							<div className="editor-help-panel pointer-events-none absolute right-0 top-full z-20 mt-3 w-72 rounded-[1.25rem] border border-[var(--color-line)] bg-[var(--color-elevated)] p-4 text-left shadow-[var(--shadow-panel)] opacity-0 transition duration-180 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
								<p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
									Quick help
								</p>
								<div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-muted)]">
									<p>
										Type <span className="font-medium text-[var(--color-ink)]">/</span>{" "}
										for blocks and media.
									</p>
									<p>
										Type <span className="font-medium text-[var(--color-ink)]">#</span>,{" "}
										<span className="font-medium text-[var(--color-ink)]">##</span>,{" "}
										<span className="font-medium text-[var(--color-ink)]">-</span>, or{" "}
										<span className="font-medium text-[var(--color-ink)]">[]</span>{" "}
										for common structures.
									</p>
									<p>
										Paste a YouTube link into a video block to embed it.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{uploadState === "uploading" ? (
					<p className="rounded-2xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent-ink)]">
						Uploading image to Appwrite...
					</p>
				) : null}

				{uploadError ? (
					<p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 dark:text-red-200">
						{uploadError}
					</p>
				) : null}
			</div>

			<BlockNoteView
				className="blog-editor-root"
				editor={editor}
				formattingToolbar={false}
				slashMenu={false}
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
				shadCNComponents={{ Button, Card }}
				theme={theme}
			>
				<SuggestionMenuController
					triggerCharacter="/"
					getItems={async (query) =>
						filterSuggestionItems(slashMenuItems, query)
					}
				/>
			</BlockNoteView>
		</div>
	);
}
