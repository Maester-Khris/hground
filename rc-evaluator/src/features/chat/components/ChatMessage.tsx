import { Code2, Terminal } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageReview } from "@/features/review/components/MessageReview";
import type { MessageReview as MessageReviewType } from "@/features/review/types";
import { technicalComponents } from "./TechnicalMarkdown";

interface ChatMessageProps {
	message: any;
	isAssistant: boolean;
	textToShow: string;
	isStreaming?: boolean;
	onEvaluate?: (evaluation: MessageReviewType) => void;
}

const MemoizedMarkdown = memo(
	({ content, components }: { content: string; components: any }) => (
		<ReactMarkdown components={components}>{content}</ReactMarkdown>
	),
	(prevProps, nextProps) => {
		return prevProps.content === nextProps.content;
	},
);

export const ChatMessage = ({
	message,
	isAssistant,
	textToShow,
	onEvaluate,
	isStreaming,
}: ChatMessageProps) => {
	// --- Robust Streaming Drip Logic ---
	const [displayedText, setDisplayedText] = useState((isAssistant && isStreaming) ? "" : textToShow);
	const fullTextRef = useRef(textToShow);
	const indexRef = useRef((isAssistant && isStreaming) ? 0 : textToShow.length);
	const requestRef = useRef<number | null>(null);

	// Sync ref whenever textToShow changes from parent
	useEffect(() => {
		fullTextRef.current = textToShow;
	}, [textToShow]);

	useEffect(() => {
		// Non-assistant messages show instantly
		// Assistant messages already in history show instantly
		if (!isAssistant || !isStreaming) {
			setDisplayedText(textToShow);
			indexRef.current = textToShow.length;
			return;
		}

		const drip = () => {
			if (indexRef.current < fullTextRef.current.length) {
				const remaining = fullTextRef.current.length - indexRef.current;

				// "Catch-up" logic: If we are far behind the buffer, increase speed
				let increment = 1;
				if (remaining > 500) increment = 20;
				else if (remaining > 100) increment = 10;
				else if (remaining > 20) increment = 3;

				indexRef.current = Math.min(indexRef.current + increment, fullTextRef.current.length);
				setDisplayedText(fullTextRef.current.slice(0, indexRef.current));

				requestRef.current = requestAnimationFrame(drip);
			} else {
				// We've caught up. Keep the loop alive to watch for new ref updates
				// without restarting the effect (which causes jitter).
				requestRef.current = requestAnimationFrame(drip);
			}
		};

		// Start the loop once on mount
		requestRef.current = requestAnimationFrame(drip);

		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [isAssistant]); // ONLY run on mount/role change

	return (
		<div
			className={`w-full border-b border-white/[0.03] py-10 transition-all duration-500 animate-in fade-in-0 duration-700 ${isAssistant ? "bg-blue-500/[0.01]" : "bg-transparent"
				}`}
		>
			<div
				className={`max-w-4xl mx-auto flex gap-6 px-4 md:px-6 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
			>
				{/* Technical Avatar Area */}
				<div className="flex flex-col items-center gap-3">
					<div
						className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border shadow-xl ${isAssistant
							? "bg-[#030712] border-blue-500/30 text-blue-400"
							: "bg-zinc-900 border-white/10 text-zinc-400"
							}`}
					>
						{isAssistant ? <Terminal size={18} /> : <Code2 size={18} />}
					</div>
					<div className="w-px flex-1 bg-gradient-to-b from-white/10 to-transparent" />
				</div>

				{/* Content Container: min-w-0 for overflow control */}
				<div
					className={`flex-1 min-w-0 flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
				>
					{/* Header: Fixed metadata layout */}
					<div
						className={`flex items-center gap-3 mb-4 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
					>
						<span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
							{isAssistant ? "SYS.EVALUATOR_01" : "USER.OPERATOR"}
						</span>
						<div className="h-px w-8 bg-white/10" />
						<span className="text-[9px] font-mono text-slate-600 uppercase">
							{isAssistant ? "Response_Stream" : "CMD_Input"}
						</span>
					</div>

					{/* Content Section: Grid cols 1 forces respect for parent width */}
					<div
						className={`prose prose-invert prose-sm max-w-none text-slate-300 selection:bg-blue-500/30 w-full overflow-hidden ${!isAssistant ? "text-right" : "grid grid-cols-1"}`}
					>
						<div className="min-w-0 w-full">
							<MemoizedMarkdown
								content={displayedText}
								components={technicalComponents}
							/>
						</div>
					</div>

					{/* Action Area for Assistant */}
					{isAssistant && onEvaluate && (
						<div className="mt-2 border-white/[0.05] w-full max-w-md">
							<MessageReview
								initialRating={message.rating}
								initialComment={message.evaluationComment}
								onAction={(rating, comment) =>
									onEvaluate({
										message_id: message.id,
										rating,
										comment,
									})
								}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
