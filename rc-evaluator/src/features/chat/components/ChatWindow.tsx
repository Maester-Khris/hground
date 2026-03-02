import { ArrowUp, Loader2, RefreshCw, Square, Terminal } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/common/ui/scroll-area";
import { Textarea } from "@/common/ui/textarea";
import { useServerStatus } from "@/hooks/useServerStatus";
import type { MessageReview as MessageReviewType } from "@/features/review/types"; // Type

type ChatWindowComponent = React.FC<{ children: React.ReactNode }> & {
	Messages: React.FC<{
		messages: any[];
		onEvaluate: (evaluation: MessageReviewType) => void;
		isStreaming?: boolean;
	}>;

	Input: React.FC<{
		onSubmit: (val: string) => void;
		isStreaming?: boolean;
		onStop?: () => void;
	}>;
};

// 1. Parent Wrapper: Now uses a darker, unified background
export const ChatWindow: ChatWindowComponent = ({ children }) => {
	return (
		<div className="flex flex-col h-full relative bg-[#020617] selection:bg-blue-500/30 overflow-hidden">
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
			{children}
		</div>
	);
};

import { ChatMessage } from "./ChatMessage";

// 2. The Messages Display
const Messages: React.FC<{
	messages: any[];
	onEvaluate: (evaluation: MessageReviewType) => void;
	isStreaming?: boolean;
}> = ({ messages, onEvaluate, isStreaming }) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const { isAvailable } = useServerStatus();

	useEffect(() => {
		if (scrollRef.current) {
			const viewport = scrollRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (viewport)
				viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
		}
	}, [messages]);

	const getRenderableText = (content: any): string => {
		if (!content) return "";
		if (typeof content === "string") {
			if (content.startsWith("{")) {
				try {
					const parsed = JSON.parse(content);
					return parsed.text || content;
				} catch {
					return content;
				}
			}
			return content;
		}
		if (typeof content === "object") {
			if (typeof content.text === "string") return content.text;
			return JSON.stringify(content, null, 2);
		}

		return String(content);
	};

	return (
		<ScrollArea ref={scrollRef} className="flex-1 h-full z-10">
			<div className="pt-[15vh] pb-48 px-4 md:px-0">
				<div className="max-w-3xl mx-auto space-y-10">
					{messages.length === 0 ? (
						<div className="text-center py-20 flex flex-col items-center">
							<div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
								<Terminal size={24} />
							</div>
							<h1 className="text-3xl font-black tracking-tighter text-white uppercase mb-2">
								Evaluation Ready
							</h1>
							<p className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">
								System Status: {isAvailable ? "Optimal // Behavior Loop Active" : "Degraded // Reconnecting..."}
							</p>
						</div>
					) : (
						messages.map((m, i) => {
							const isAssistant = m.sender === "assistant";
							const textToShow = getRenderableText(m.content);

							return (
								<ChatMessage
									key={m.id || i}
									message={m}
									isAssistant={isAssistant}
									textToShow={textToShow}
									onEvaluate={onEvaluate}
									isStreaming={isStreaming && i === messages.length - 1}
								/>
							);
						})
					)}
				</div>
			</div>
		</ScrollArea>
	);
};

const Input: React.FC<{
	onSubmit: (val: string) => void;
	isStreaming?: boolean;
	onStop?: () => void;
}> = ({ onSubmit, isStreaming, onStop }) => {
	const [value, setValue] = React.useState("");
	const { isAvailable, triggerRefresh } = useServerStatus();

	const handleAction = () => {
		if (value.trim() && isAvailable) {
			onSubmit(value.trim());
			setValue("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleAction();
		}
	};

	return (
		<div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pt-32 pb-8 px-4 pointer-events-none">
			<div className="max-w-3xl mx-auto flex flex-col items-center pointer-events-auto">
				<div className="w-full relative group">
					<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
					<div className="relative w-full rounded-2xl border border-white/10 bg-[#030712]/80 backdrop-blur-xl shadow-2xl p-2 flex items-end">
						<Textarea
							value={value}
							onChange={(e) => setValue(e.target.value)}
							disabled={!isAvailable}
							className="flex-1 min-h-[48px] max-h-[200px] resize-none bg-transparent border-none text-slate-200 placeholder:text-slate-600 focus-visible:ring-0 py-3 px-4 text-sm font-medium leading-relaxed disabled:opacity-50"
							placeholder={isAvailable ? "Enter prompt for behavioral evaluation..." : "System offline - Messaging disabled"}
							onKeyDown={handleKeyDown}
						/>
						<button
							onClick={isStreaming ? onStop : handleAction}
							disabled={(!value.trim() && !isStreaming) || !isAvailable}
							className={`mb-1 mr-1 w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-lg ${isStreaming
								? "bg-red-500/20 text-red-500 hover:bg-red-500/30 shadow-red-900/10"
								: "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 shadow-blue-900/20"
								}`}
						>
							{isStreaming ? (
								<div className="relative flex items-center justify-center">
									<Loader2 size={24} className="animate-spin absolute" />
									<Square size={10} fill="currentColor" strokeWidth={0} />
								</div>
							) : (
								<ArrowUp size={20} strokeWidth={2.5} />
							)}
						</button>
					</div>
				</div>

				<p className="mt-4 text-[9px] text-slate-500 font-black tracking-[0.2em] uppercase opacity-60 flex items-center gap-2">
					<span className={`w-1 h-1 rounded-full ${isAvailable ? "bg-blue-500 animate-pulse" : "bg-red-500 animate-none"}`} />
					{isAvailable ? "Verify Logic & Behavioral Alignment // AI-Generated Output" : "Connection Lost // Re-establishing Link"}
					<button
						onClick={() => triggerRefresh()}
						className="ml-2 hover:text-blue-400 transition-colors flex items-center gap-1 group"
						title="Refresh System Status"
					>
						<RefreshCw size={10} className="group-active:rotate-180 transition-transform duration-500" />
						<span>Refresh</span>
					</button>
				</p>
			</div>
		</div>
	);
};
ChatWindow.Messages = Messages;
ChatWindow.Input = Input;
