import { create } from "zustand";

interface ServerStatusState {
    isAvailable: boolean;
    dependencies: {
        database: string;
        redis: string;
        pythonServer: string;
    };
    refreshTrigger: number;
    triggerRefresh: () => void;
    setAvailable: (available: boolean, dependencies?: any) => void;
}

export const useServerStatus = create<ServerStatusState>((set) => ({
    isAvailable: true,
    dependencies: {
        database: "unknown",
        redis: "unknown",
        pythonServer: "unknown",
    },
    refreshTrigger: 0,
    triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
    setAvailable: (available, dependencies) =>
        set({
            isAvailable: available,
            dependencies: dependencies || {
                database: "unknown",
                redis: "unknown",
                pythonServer: "unknown",
            },
        }),
}));
