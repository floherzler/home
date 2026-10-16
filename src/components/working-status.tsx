import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];
const WORDS = [
	"Overfitting",
	"Underfitting",
	"Convoluting",
	"Backpropagating",
	"Softmaxing",
	"Tokenizing",
	"Annealing",
	"Denoising",
	"Hallucinating",
	"Bootstrapping",
	"Quantizing",
	"Regularizing",
	"Normalizing",
	"Embedding",
	"Pooling",
	"Distilling",
	"Pruning",
	"Finetuning",
	"Pretraining",
	"Sampling",
	"Diffusing",
	"Attending",
	"Transposing",
	"Unsqueezing",
	"Vectorizing",
	"Clustering",
	"Marginalizing",
	"Reparameterizing",
	"Interpolating",
	"Extrapolating",
	"Descending",
	"Shuffling",
	"Batching",
	"Encoding",
	"Decoding",
	"Memorizing",
	"Generalizing",
	"Ensembling",
	"Bagging",
	"Boosting",
	"Initializing",
	"Augmenting",
	"Imputing",
	"Benchmarking",
	"Prompting",
	"Aligning",
	"Grokking",
	"Crossvalidating",
	"Kernelizing",
	"Hyperparameterizing",
];

const reducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Spinner glyph plus a nerdy gerund that types itself out, pauses, deletes and moves on. */
export function WorkingStatus({ className }: { className?: string }) {
	const [glyph, setGlyph] = useState(0);
	const [word, setWord] = useState(0);
	const [length, setLength] = useState(WORDS[0].length);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		if (reducedMotion()) return;
		const id = window.setInterval(
			() => setGlyph((g) => (g + 1) % GLYPHS.length),
			120,
		);
		return () => window.clearInterval(id);
	}, []);

	useEffect(() => {
		if (reducedMotion()) return;
		const full = WORDS[word].length;
		let delay = deleting ? 35 : 75;
		if (!deleting && length === full) delay = 2000;
		const id = window.setTimeout(() => {
			if (!deleting && length === full) setDeleting(true);
			else if (deleting && length === 0) {
				setDeleting(false);
				// jump somewhere random so the order never feels scripted
				setWord(
					(w) =>
						(w + 1 + Math.floor(Math.random() * (WORDS.length - 1))) %
						WORDS.length,
				);
			} else setLength((l) => l + (deleting ? -1 : 1));
		}, delay);
		return () => window.clearTimeout(id);
	}, [word, length, deleting]);

	const typing = deleting || length < WORDS[word].length;
	return (
		<output
			className={cn(
				"cmap-text inline-flex items-center gap-1.5 font-mono text-xs",
				className,
			)}
			aria-label="Work in progress"
		>
			<span className="w-3 text-center" aria-hidden="true">
				{GLYPHS[glyph]}
			</span>
			<span aria-hidden="true">
				{WORDS[word].slice(0, length)}
				{typing ? <span className="animate-pulse">▍</span> : "…"}
			</span>
		</output>
	);
}
