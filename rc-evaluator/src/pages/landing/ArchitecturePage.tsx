import { Cpu, Server, Database, Globe, Layers, Zap } from "lucide-react";
import { SEO } from "../../common/components/SEO";
import { Footer } from "@/features/marketing/components/Footer";

export const ArchitecturePage = () => {
    const layers = [
        {
            title: "Orchestration Layer",
            icon: <Server className="text-blue-400" />,
            tech: "Node.js / Express",
            description: "Handles JWT authentication, state management, and primary API routing. Acts as the central traffic controller for the entire ecosystem.",
            details: [
                "Connection Pooling via Prisma v7",
                "Middleware-driven RBAC & Security",
                "Stateless session management",
                "WebSocket bridge for real-time updates"
            ]
        },
        {
            title: "Inference Engine",
            icon: <Cpu className="text-emerald-400" />,
            tech: "Python / FastAPI",
            description: "Decoupled compute-intensive service dedicated to LLM communication, semantic analysis, and intensive data processing.",
            details: [
                "Asynchronous inference loops",
                "Model-agnostic gateway interface",
                "Local Reward Model (RM) integration",
                "Pydantic-based schema validation"
            ]
        },
        {
            title: "Persistence Layer",
            icon: <Database className="text-purple-400" />,
            tech: "PostgreSQL / Redis",
            description: "Hybrid storage strategy combining ACID-compliant persistence with high-throughput event streaming.",
            details: [
                "JSONB for semi-structured message logs",
                "Write-Ahead-Logging (WAL) for safety",
                "Redis Stream Bus for inter-service RPC",
                "Global key-value caching layer"
            ]
        },
        {
            title: "Intelligence Edge",
            icon: <Globe className="text-orange-400" />,
            tech: "React / Vite",
            description: "High-performance client-side application designed for sub-100ms interaction latency and real-time visualization.",
            details: [
                "Component-level state hydration",
                "Opportunistic response rendering",
                "Deterministic validation UI",
                "Edge-ready bundle optimization"
            ]
        }
    ];

    return (
        <div className="bg-slate-950 text-white selection:bg-blue-500/30 font-sans min-h-screen">
            <SEO
                title="System Architecture | RC-Evaluator"
                description="Deep dive into the distributed architecture of RC-Evaluator, featuring our dual-service Node.js and FastAPI topology."
                canonical="https://rc-evaluator.com/docs/architecture"
            />

            <section className="pt-24 pb-12 px-6 max-w-6xl mx-auto border-b border-slate-900">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-4">
                            <Layers size={14} />
                            <span className="tracking-widest uppercase">Spec 2.1.0 - Topology & Infrastructure</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                            Core <span className="text-slate-500 italic">Architecture</span>
                        </h1>
                        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl font-light">
                            A modular, distributed footprint designed for high-concurrency AI evaluation and sub-millisecond inter-service coordination.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 mb-32">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 tracking-tight">The Distributed Event Loop</h2>
                            <p className="text-slate-400 leading-relaxed font-light mb-6">
                                Unlike monolithic AI wrappers, RC-Evaluator utilizes a <strong>Shared-Nothing Architecture</strong>.
                                Each request traverses a non-blocking pathway where the Orchestration layer handles the business logic
                                while the Inference Engine processes the stochastic payloads.
                            </p>
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                                <Zap className="text-blue-400 shrink-0" size={20} />
                                <p className="text-xs text-blue-200/70 font-mono">
                                    Latency Budget: &lt;150ms total overhead (excluding LLM inference time).
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
                                <h4 className="text-sm font-bold mb-2 uppercase tracking-wider text-slate-300">Request Flow</h4>
                                <ol className="space-y-3 font-mono text-[11px] text-slate-500">
                                    <li className="flex gap-3"><span className="text-blue-500">01</span> Ingress via Express API Gateway</li>
                                    <li className="flex gap-3"><span className="text-blue-500">02</span> Task emission to Redis XADD Stream</li>
                                    <li className="flex gap-3"><span className="text-blue-500">03</span> Python Consumer group executes Model Inference</li>
                                    <li className="flex gap-3"><span className="text-blue-500">04</span> Result ingestion & Prisma persistence</li>
                                    <li className="flex gap-3"><span className="text-blue-500">05</span> Client Hydration via WebSocket/SSE</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative h-full rounded-2xl border border-slate-800 p-8 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-4">
                                {layers.map((layer, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-slate-800/50 bg-slate-950/50">
                                        <div className="mb-3">{layer.icon}</div>
                                        <div className="text-[10px] font-mono text-slate-500 mb-1">{layer.tech}</div>
                                        <div className="text-xs font-bold">{layer.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                                <p className="text-[10px] font-mono text-slate-500">FIGURE 1.0: LOGICAL SERVICE TOPOLOGY</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {layers.map((layer, i) => (
                        <div key={i} className="p-8 rounded-3xl border border-slate-900 bg-slate-900/40 flex flex-col">
                            <div className="mb-6">{layer.icon}</div>
                            <h3 className="text-lg font-bold mb-2">{layer.title}</h3>
                            <div className="text-[10px] font-mono text-blue-500 mb-4">{layer.tech}</div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-light">
                                {layer.description}
                            </p>
                            <ul className="mt-auto space-y-2">
                                {layer.details.map((detail, j) => (
                                    <li key={j} className="flex items-center gap-2 text-[10px] text-slate-500 italic">
                                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};
