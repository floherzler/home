import {
	BlockNoteSchema,
	defaultBlockSpecs,
	defaultProps,
	type PartialBlock,
} from "@blocknote/core";
import {
	createReactBlockSpec,
	FigureWithCaption,
} from "@blocknote/react";
import { RiYoutubeFill } from "react-icons/ri";
import { getYouTubeEmbedUrl } from "./utils/embeds";

const youtubeBlockConfig = {
	type: "youtube" as const,
	propSchema: {
		textAlignment: defaultProps.textAlignment,
		backgroundColor: defaultProps.backgroundColor,
		showPreview: {
			default: true,
		},
		previewWidth: {
			default: 512,
		},
		url: {
			default: "" as const,
		},
		caption: {
			default: "" as const,
		},
	},
	content: "none" as const,
	isFileBlock: true,
};

const YouTubeBlock = createReactBlockSpec(youtubeBlockConfig, {
	render: (props) => {
		const embedUrl = getYouTubeEmbedUrl(props.block.props.url);
		const promptForUrl = () => {
			if (typeof window === "undefined") {
				return;
			}

			const nextUrl = window.prompt(
				"Paste a YouTube video, short, or youtu.be URL.",
				props.block.props.url || "",
			);

			if (nextUrl === null) {
				return;
			}

			props.editor.updateBlock(props.block, {
				type: "youtube",
				props: {
					url: nextUrl.trim(),
					caption: props.block.props.caption,
				},
			});
		};

		if (!embedUrl) {
			return (
				<div className="bn-file-block-content-wrapper" contentEditable={false}>
					<div
						className="bn-add-file-button youtube-block-empty"
						onClick={props.editor.isEditable ? promptForUrl : undefined}
					>
						<div className="bn-add-file-button-icon">
							<RiYoutubeFill size={24} />
						</div>
						<div className="bn-add-file-button-text">
							{props.editor.isEditable
								? "Add YouTube video"
								: "Invalid YouTube URL"}
						</div>
					</div>
				</div>
			);
		}

		return (
			<div
				className="bn-file-block-content-wrapper youtube-block"
				contentEditable={false}
				style={
					props.block.props.showPreview
						? { width: `${props.block.props.previewWidth}px` }
						: undefined
				}
			>
				<div className="bn-visual-media-wrapper">
					<div className="youtube-embed-shell">
						<iframe
							className="youtube-embed-frame"
							src={embedUrl}
							title={props.block.props.caption || "YouTube video"}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							referrerPolicy="strict-origin-when-cross-origin"
							allowFullScreen
						/>
					</div>
				</div>
				{props.block.props.caption ? (
					<p className="bn-file-caption">{props.block.props.caption}</p>
				) : null}
			</div>
		);
	},
	toExternalHTML: (props) => {
		const embedUrl = getYouTubeEmbedUrl(props.block.props.url);

		if (!embedUrl) {
			return <p>Invalid YouTube URL</p>;
		}

		const iframe = (
			<div className="youtube-embed-shell">
				<iframe
					className="youtube-embed-frame"
					src={embedUrl}
					title={props.block.props.caption || "YouTube video"}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerPolicy="strict-origin-when-cross-origin"
					allowFullScreen
				/>
			</div>
		);

		return props.block.props.caption ? (
			<FigureWithCaption caption={props.block.props.caption}>
				{iframe}
			</FigureWithCaption>
		) : (
			iframe
		);
	},
});

export const blockNoteSchema = BlockNoteSchema.create({
	blockSpecs: {
		...defaultBlockSpecs,
		youtube: YouTubeBlock,
	},
});

const normalizeBlock = (block: PartialBlock): PartialBlock => {
	const children = Array.isArray(block.children)
		? block.children.map((child) => normalizeBlock(child as PartialBlock))
		: undefined;

	if (
		block.type === "video" &&
		block.props &&
		typeof block.props === "object" &&
		"url" in block.props &&
		typeof block.props.url === "string" &&
		getYouTubeEmbedUrl(block.props.url)
	) {
		return {
			id: block.id,
			type: "youtube",
			props: {
				url: block.props.url,
				showPreview: true,
				previewWidth:
					"previewWidth" in block.props &&
					typeof block.props.previewWidth === "number"
						? block.props.previewWidth
						: 512,
				caption:
					"caption" in block.props && typeof block.props.caption === "string"
						? block.props.caption
						: "",
			},
		};
	}

	return children ? { ...block, children } : block;
};

export const normalizeBlockNoteContent = (value: unknown): PartialBlock[] | undefined => {
	if (!Array.isArray(value)) {
		return undefined;
	}

	return value.map((block) => normalizeBlock(block as PartialBlock));
};
