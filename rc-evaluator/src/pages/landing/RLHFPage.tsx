import { GitMerge, Target, Repeat, Fingerprint, BrainCircuit, ShieldAlert } from "lucide-react";
import { SEO } from "../../common/components/SEO";
import { Footer } from "@/features/marketing/components/Footer";

export const RLHFPage = () => {
    const levels = [
        {
            number: "01",
            title: "Transient Context",
            subtitle: "Rolling Window Intelligence",
            icon: <Fingerprint className="text-blue-400" />,
            description: "The baseline level of alignment focuses on keeping the agent grounded in the immediate conversation. It utilizes sliding-window context management to maintain coherence without long-term bias.",
            keyFeatures: [
                "Token-limited history windowing",
                "Dynamic system prompt injection",
                "Immediate session-only relevance",
                "Low-latency context retrieval"
            ],
            status: "PRODUCTION READY",
            statusColor: "text-blue-500"
        },
        {
            number: "02",
            title: "Semantic Profiling",
            subtitle: "Preference Distribution",
            icon: <BrainCircuit className="text-emerald-400" />,
            description: "At Level 2, we implement Retrieval-Augmented Generation (RAG) mapped to user-specific preference vectors. Human feedback is converted into semantic clusters that influence response tone and accuracy.",
            keyFeatures: [
                "Vector-based user sub-profiling",
                "Automated brand guideline matching",
                "Feedback-driven weight adjustment",
                "Cross-session behavioral consistency"
            ],
            status: "ACTIVE STAGE",
            statusColor: "text-emerald-500"
        },
        {
            number: "03",
            title: "Recursive Memory",
            subtitle: "Model Context Protocol (MCP)",
            icon: <GitMerge className="text-purple-400" />,
            description: "The pinnacle of our RLHF implementation. Level 3 uses recursive graph state and the Model Context Protocol to create an agentic bridge. Every human correction act as a delta signal that reshapes the agent's behavioral manifold.",
            keyFeatures: [
                "Recursive graph state updates",
                "Real-time policy refinement",
                "HITL (Human-in-the-Loop) deltas",
                "Agentic memory persistence"
            ],
            status: "EXPERIMENTAL",
            statusColor: "text-purple-500"
        }
    ];

    return (
        <div className="bg-slate-950 text-white selection:bg-blue-500/30 font-sans min-h-screen">
            <SEO
                title="RLHF Implementation | RC-Evaluator"
                description="Technical breakdown of our 3-level RLHF and behavioral alignment implementation for LLM agents."
                canonical="https://rc-evaluator.com/docs/rlhf"
            />

            <section className="pt-24 pb-12 px-6 max-w-6xl mx-auto border-b border-slate-900">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs mb-4">
                            <Target size={14} />
                            <span className="tracking-widest uppercase">Spec 4.5.2 - Behavioral Alignment Loops</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                            RLHF <span className="text-slate-500 italic">Evolution</span>
                        </h1>
                        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl font-light">
                            A systematic framework for bridging the gap between stochastic model outputs and deterministic human expert intent through iterative refinement.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="space-y-32">
                    {levels.map((level, i) => (
                        <div key={i} className={`grid lg:grid-cols-2 gap-16 items-start ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                            <div className={`${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className={`font-mono text-4xl font-bold ${level.statusColor} opacity-20`}>{level.number}</span>
                                    <div className="h-px bg-slate-800 grow" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2 tracking-tight">{level.title}</h2>
                                <h4 className={`text-xs font-mono mb-6 uppercase tracking-widest ${level.statusColor}`}>{level.subtitle}</h4>
                                <p className="text-slate-400 leading-relaxed font-light mb-8 italic">
                                    "{level.description}"
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {level.keyFeatures.map((feature, j) => (
                                        <div key={j} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors">
                                            <p className="text-[11px] text-slate-300 font-medium">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`relative group ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                                <div className={`absolute -inset-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
                                <div className="relative p-12 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center text-center aspect-video">
                                    <div className="p-6 rounded-full bg-slate-950/80 border border-slate-800 mb-6 group-hover:scale-110 transition-transform duration-500">
                                        {level.icon}
                                    </div>
                                    <div className={`text-[10px] font-mono mb-2 ${level.statusColor} tracking-tighter`}>NODE STATUS: {level.status}</div>
                                    <div className="text-[9px] font-mono text-slate-500 uppercase">Latency Impact: {i === 0 ? '< 20ms' : i === 1 ? '< 80ms' : '< 250ms'}</div>

                                    <div className="mt-8 flex gap-2">
                                        {[1, 2, 3].map((dot) => (
                                            <div key={dot} className={`w-1.5 h-1.5 rounded-full ${dot <= (i + 1) ? level.statusColor.replace('text-', 'bg-') : 'bg-slate-800'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-40 p-12 rounded-3xl border border-slate-900 bg-gradient-to-b from-slate-900/40 to-transparent text-center max-w-4xl mx-auto">
                    <Repeat className="text-slate-500 mx-auto mb-6" size={32} />
                    <h3 className="text-xl font-bold mb-4">The Convergence Loop</h3>
                    <p className="text-sm text-slate-400 font-light mb-8 max-w-2xl mx-auto">
                        Alignment is not a destination but a continuous synchronization process. Each interaction provides a data point that either reinforces or recalibrates the agent's behavioral manifold.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-slate-950 text-[10px] text-slate-500">
                            <ShieldAlert size={12} className="text-orange-500" />
                            Safety Hard-Guardrails Active
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};
