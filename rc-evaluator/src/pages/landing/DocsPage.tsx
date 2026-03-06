// import { HelpCircle, Book, Code, Terminal } from "lucide-react";
// import { SEO } from "../../common/components/SEO";
// import { Footer } from "@/features/marketing/components/Footer";

// export const DocsPage = () => {
//     const sections = [
//         {
//             title: "Getting Started",
//             icon: <Terminal className="text-blue-500" />,
//             content: "Learn how to integrate RC-Evaluator into your LLM development workflow in less than 5 minutes.",
//         },
//         {
//             title: "Core Concepts",
//             icon: <HelpCircle className="text-blue-500" />,
//             content: "Explore the philosophy behind behavioral alignment and Reinforcement Learning from Human Feedback (RLHF).",
//         },
//         {
//             title: "API Reference",
//             icon: <Code className="text-blue-500" />,
//             content: "Detailed documentation for our high-throughput evaluation pipeline and data export APIs.",
//         },
//         {
//             title: "Research Ethics",
//             icon: <Book className="text-blue-500" />,
//             content: "Guidelines on responsible AI evaluation and human-in-the-loop best practices.",
//         },
//     ];

//     return (
//         <div className="bg-slate-950 text-white selection:bg-blue-500/30">
//             <SEO
//                 title="Documentation"
//                 description="Access the full technical documentation, API references, and core concepts for the RC-Evaluator platform."
//                 canonical="https://rc-evaluator.com/docs"
//             />

//             <section className="py-24 px-6 max-w-5xl mx-auto">
//                 <div className="text-center mb-16">
//                     <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
//                         Documentation
//                     </h1>
//                     <p className="text-slate-400 text-lg max-w-2xl mx-auto">
//                         Everything you need to build, evaluate, and align your AI agents.
//                     </p>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-8">
//                     {sections.map((section, i) => (
//                         <div
//                             key={i}
//                             className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-blue-500/30 transition-all group"
//                         >
//                             <div className="mb-6 p-3 bg-blue-500/10 w-fit rounded-2xl group-hover:scale-110 transition-transform">
//                                 {section.icon}
//                             </div>
//                             <h3 className="text-xl font-bold mb-3 text-white">
//                                 {section.title}
//                             </h3>
//                             <p className="text-slate-400 text-sm leading-relaxed">
//                                 {section.content}
//                             </p>
//                             <button className="mt-6 text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">
//                                 Read More &rarr;
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             </section>

//             <Footer />
//         </div>
//     );
// };

import { GitBranch, Zap, Cpu, ShieldCheck, FileText, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEO } from "../../common/components/SEO";
import { Footer } from "@/features/marketing/components/Footer";

import systemArch from "@/assets/images/system_architecture.png";
import adaptiveLearning from "@/assets/images/adaptative_learning.png";

// Note: Ensure your public/images folder contains these previously generated assets
const ASSETS = {
    systemArch,
    adaptiveLearning
};

export const DocsPage = () => {
    const navigate = useNavigate();
    const deepDives = [
        {
            title: "Distributed Pipeline",
            icon: <GitBranch className="text-blue-400" />,
            content: "Implementation of a non-blocking I/O orchestrator utilizing Redis XADD/XREADGroups for idempotent task delivery. Designed for horizontal elasticity and sub-50ms inter-service latency overhead.",
            label: "Throughput & Scalability",
            path: "/docs/architecture"
        },
        {
            title: "Behavioral Graph Memory",
            icon: <Zap className="text-blue-400" />,
            content: "Integration of Model Context Protocol (MCP) to facilitate stateful memory management. Transforms transient inference logs into persistent graph nodes for recursive context retrieval.",
            label: "State Management",
            path: "/docs/rlhf"
        },
        {
            title: "Surveilled Refinement",
            icon: <Cpu className="text-blue-400" />,
            content: "Implementation of a local Reward Model (RM) for real-time policy correction. Human-driven delta signals directly influence the preference distribution during the next inference pass.",
            label: "Control Systems",
            path: "/docs/rlhf"
        },
        {
            title: "Deterministic Validation",
            icon: <ShieldCheck className="text-blue-400" />,
            content: "Multi-layered consensus engine running semantic Pydantic validation. Ensures all machine-generated tokens adhere to strictly defined JSON schemas and behavioral safety constraints.",
            label: "Validation Layer",
            path: "/docs/architecture"
        },
    ];

    return (
        <div className="bg-slate-950 text-white selection:bg-blue-500/30 font-sans">
            <SEO
                title="Engineering Docs | RC-Evaluator"
                description="Technical documentation for the RC-Evaluator reliability layer, covering distributed event loops, MCP memory integration, and surveilled refinement protocols."
                canonical="https://rc-evaluator.com/docs"
            />

            {/* Header / Hero */}
            <section className="pt-24 pb-12 px-6 max-w-6xl mx-auto border-b border-slate-900">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-4">
                            <FileText size={14} />
                            <span className="tracking-widest uppercase">Spec 1.2.0 - Intelligence Control Systems</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                            The Reliability <span className="text-slate-500 italic">Protocol</span>
                        </h1>
                        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl font-light">
                            A high-fidelity feedback architecture designed to engineer the interface between human cognitive expertise and autonomous machine intelligence through surveilled refinement loops.
                        </p>
                    </div>
                </div>
            </section>

            {/* Interactive Visual Sections */}
            <section className="py-20 px-6 max-w-6xl mx-auto space-y-40">

                {/* Visual 1: The Engine */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 tracking-tight">System Core: Hybrid Event Topology</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed font-light">
                            Our architecture solves the overhead of multi-language AI applications by decoupling state-heavy orchestration from compute-intensive inference. By utilizing a <strong>Shared-Nothing Architecture</strong> across workers, we achieve linear scalability and deterministic resource isolation.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                                <div className="text-blue-400 font-mono text-[10px] uppercase mb-2">Network Layer</div>
                                <h4 className="text-sm font-bold mb-1">Redis Stream Bus</h4>
                                <p className="text-[11px] text-slate-500 leading-tight">Idempotent task distribution with consumer groups for sub-1ms coordination.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                                <div className="text-blue-400 font-mono text-[10px] uppercase mb-2">Storage Layer</div>
                                <h4 className="text-sm font-bold mb-1">WAL Persistence</h4>
                                <p className="text-[11px] text-slate-500 leading-tight">Parallel Postgres logging with asynchronous write-ahead buffering for zero-lag state commits.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                                <div className="text-blue-400 font-mono text-[10px] uppercase mb-2">Compute Layer</div>
                                <h4 className="text-sm font-bold mb-1">Python Sub-Workers</h4>
                                <p className="text-[11px] text-slate-500 leading-tight">Isolated ML environments utilizing shared-memory IPC for accelerated weight loading.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                                <div className="text-blue-400 font-mono text-[10px] uppercase mb-2">Security Layer</div>
                                <h4 className="text-sm font-bold mb-1">Deterministic Filters</h4>
                                <p className="text-[11px] text-slate-500 leading-tight">Hard-guardrail validation loops that intercept tokens before client-side hydration.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative rounded-2xl border border-slate-800 p-4 bg-slate-900/60 backdrop-blur-xl">
                            <img src={ASSETS.systemArch} alt="System Architecture Topology" className="rounded-lg mix-blend-lighten opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Visual 2: The Value Prop (Adaptive Learning) */}
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="relative rounded-2xl border border-slate-800 p-6 bg-slate-900/40 backdrop-blur-sm">
                            <img src={ASSETS.adaptiveLearning} alt="Intelligence Progression Roadmap" className="rounded-lg contrast-125" />
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl font-bold mb-6 tracking-tight">Adaptive Intelligence Progression</h2>
                        <p className="text-slate-400 mb-10 leading-relaxed font-light">
                            Intelligence is treated as a continuous variable rather than a static deployment. Our refinement loops facilitate the systematic movement from transient context to deep behavioral memory.
                        </p>
                        <div className="space-y-6">
                            <div className="group relative p-5 bg-slate-900/20 rounded-2xl border border-slate-800/50 hover:bg-slate-900/40 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white text-sm">Level 1: Transient Context</h4>
                                    <span className="text-[10px] font-mono text-slate-600">STATELESS</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Rolling message history windowing. Maintains semantic coherence via sliding-window persistence but lacks cross-session intelligence.</p>
                            </div>
                            <div className="group relative p-5 bg-slate-900/30 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all shadow-lg shadow-blue-500/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-blue-400 text-sm">Level 2: Semantic Profiling</h4>
                                    <span className="text-[10px] font-mono text-blue-900">VECTOR STORE</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Retrieval-Augmented Generation (RAG) utilized for dynamic user sub-profiling and brand guideline injection based on real-time semantic query analysis.</p>
                            </div>
                            <div className="group relative p-5 bg-slate-900/40 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-xl shadow-emerald-500/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-emerald-400 text-sm">Level 3: Recursive Memory (MCP)</h4>
                                    <span className="text-[10px] font-mono text-emerald-900">AGENTIC BRIDGE</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">Implementing <strong>Model Context Protocol (MCP)</strong> to bridge raw event streams with recursive graph state. Human corrections act as preference deltas that reshape the agent's behavioral manifold in real-time.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Navigation */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-20">
                    {deepDives.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => navigate(item.path)}
                            className="group p-8 rounded-3xl border border-slate-900 bg-slate-900/20 hover:bg-blue-500/[0.03] hover:border-blue-500/20 transition-all cursor-pointer flex flex-col relative"
                        >
                            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-6">{item.label}</span>
                            <div className="mb-6 opacity-80">{item.icon}</div>
                            <h3 className="font-bold mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-xs flex items-center justify-between">
                                {item.title}
                                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-slate-500 text-[10px] leading-relaxed font-light">{item.content}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};