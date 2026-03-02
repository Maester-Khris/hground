import { useCallback, useEffect, useRef } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useServerStatus } from "@/hooks/useServerStatus";


const API_BASE = `${import.meta.env.VITE_API_HOST}/api`;

export const OnlineStatusChecker = () => {
	const { isOffline } = useOnlineStatus();
	const { show, clear } = useNotification();
	const setAvailable = useServerStatus((state) => state.setAvailable);
	const refreshTrigger = useServerStatus((state) => state.refreshTrigger);

	const lastStatus = useRef<"active" | "degraded" | "unknown">("unknown");
	const backoffDelay = useRef(5000);
	const timerRef = useRef<number | null>(null);

	const checkBackend = useCallback(async () => {
		// Clear any existing timer to prevent race conditions during manual triggers
		if (timerRef.current) clearTimeout(timerRef.current);

		try {
			const response = await fetch(`${API_BASE}/system/health`);
			const data = await response.json().catch(() => ({}));

			if (response.ok) {
				setAvailable(true, data.dependencies);
				if (lastStatus.current !== "active") {
					clear();
					lastStatus.current = "active";
				}
				// SUCCESS: Stop polling. The "Adaptive" part.
				backoffDelay.current = 5000;
				timerRef.current = null;
				return;
			} else {
				throw new Error("Degraded");
			}
		} catch (error) {
			setAvailable(false);
			if (lastStatus.current !== "degraded") {
				show("Connection lost. Retrying in background...", "error");
				lastStatus.current = "degraded";
			}

			// FAILURE: Start/Continue polling with exponential backoff
			backoffDelay.current = Math.min(backoffDelay.current * 2, 60000);
			timerRef.current = setTimeout(checkBackend, backoffDelay.current);
		}
	}, [API_BASE, setAvailable, clear, show]);

	useEffect(() => {
		// Handle physical network loss
		if (isOffline) {
			if (timerRef.current) clearTimeout(timerRef.current);
			setAvailable(false);
			show("You are currently offline.", "offline");
			lastStatus.current = "unknown";
			return;
		}

		// Trigger check on mount or when coming back online or when manually triggered
		checkBackend();

		// Re-validate when user returns to tab (Lazy Validation)
		const handleFocus = () => {
			if (lastStatus.current === "active") checkBackend();
		};

		window.addEventListener("focus", handleFocus);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			window.removeEventListener("focus", handleFocus);
		};
	}, [isOffline, checkBackend, show, setAvailable, refreshTrigger]);

	return null;
};

