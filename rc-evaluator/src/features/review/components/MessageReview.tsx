import { MessageSquare, Send, Star } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Textarea } from "@/common/ui/textarea";

interface MessageReviewProps {
	onAction: (rating: number, comment: string) => void;
	initialRating?: number;
	initialComment?: string;
}

export const MessageReview: React.FC<MessageReviewProps> = ({
	onAction,
	initialRating,
	initialComment,
}) => {
	const [rating, setRating] = useState(initialRating || 0);
	const [comment, setComment] = useState(initialComment || "");
	const [isSubmitted, setIsSubmitted] = useState(!!initialRating);
	const [showComment, setShowComment] = useState(false);

	const handleSubmit = () => {
		if (rating > 0) {
			onAction(rating, comment);
			setIsSubmitted(true);
		}
	};

	// If it's already submitted (or we just submitted it), show a compact version
	if (isSubmitted) {
		return (
			<div className="mt-4 pt-3 border-white/10 flex items-center justify-between">
				<div className="flex items-center gap-1">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							key={star}
							size={12}
							className={`${star <= rating
									? "fill-yellow-500 text-yellow-500"
									: "text-zinc-600"
								}`}
						/>
					))}
				</div>
				{comment && (
					<div className="relative group/comment">
						<button
							onClick={() => setShowComment(!showComment)}
							className="p-1 rounded hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-colors"
						>
							<MessageSquare size={14} />
						</button>
						{showComment && (
							<div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#2D3249] border border-white/10 rounded-lg shadow-xl text-[10px] text-zinc-300 z-50 animate-in fade-in zoom-in-95 duration-200">
								{comment}
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="mt-4 pt-3 border-t border-white/10">
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-1">
					<span className="text-xs text-zinc-400 mr-2">Rate response:</span>
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							onClick={() => setRating(star)}
							className="focus:outline-none transition-colors"
						>
							<Star
								size={14}
								className={`${star <= rating
										? "fill-yellow-500 text-yellow-500"
										: "text-zinc-600 hover:text-zinc-400"
									}`}
							/>
						</button>
					))}
				</div>

				{rating > 0 && (
					<div className="relative group animate-in fade-in slide-in-from-top-2 duration-200">
						<div className="relative flex items-end bg-black/30 border border-white/10 rounded-xl p-1.5 focus-within:border-white/20 transition-all">
							<Textarea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="Optional feedback..."
								className="flex-1 min-h-[60px] max-h-[120px] text-[11px] bg-transparent border-none focus-visible:ring-0 resize-none py-2 px-3 text-zinc-300 placeholder:text-zinc-600"
							/>
							<button
								onClick={handleSubmit}
								className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95 mb-1 mr-1"
							>
								<Send size={12} />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
