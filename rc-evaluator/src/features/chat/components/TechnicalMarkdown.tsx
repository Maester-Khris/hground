import { Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const technicalComponents = {
	code({ node, inline, className, children, ...props }: any) {
		const match = /language-(\w+)/.exec(className || "");
		const codeValue = String(children).replace(/\n$/, "");

		return !inline && match ? (
			<div className="my-6 rounded-lg bg-[#010409] overflow-x-auto w-full shadow-2xl border border-white/10">
				<div className="sticky left-0 flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
					<span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
						{match[1]}
					</span>
					<button
						onClick={() => navigator.clipboard.writeText(codeValue)}
						className="p-1.5 rounded-md hover:bg-white/10 text-slate-500 transition-colors"
					>
						<Copy size={14} />
					</button>
				</div>
				<SyntaxHighlighter
					style={vscDarkPlus}
					language={match[1]}
					PreTag="div"
					className="!bg-transparent !m-0 !p-6 text-[13px] font-mono leading-relaxed"
					{...props}
				>
					{codeValue}
				</SyntaxHighlighter>
			</div>
		) : (
			<code
				className="bg-blue-500/20 px-1.5 py-0.5 rounded font-mono text-blue-300 border border-blue-500/10"
				{...props}
			>
				{children}
			</code>
		);
	},
};
