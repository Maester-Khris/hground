import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import { ChatContainer } from "@/features/chat/components/ChatContainer";
import { GlobalNotification } from "@/features/notifications/globalNotification";
import { OnlineStatusChecker } from "@/features/notifications/OnlineStatusChecker";
import { PublicLayout } from "@/layouts/PublicLayout";
import { DocsPage } from "@/pages/landing/DocsPage";
import { FeaturesPage } from "@/pages/landing/FeaturesPage";
import { HomePage } from "@/pages/landing/HomePage";
import { ArchitecturePage } from "@/pages/landing/ArchitecturePage";
import { RLHFPage } from "@/pages/landing/RLHFPage";

export const AppRouter = () => {
	return (
		<BrowserRouter>
			<GlobalNotification />
			<Routes>
				{/* Public Marketing Routes */}
				<Route element={<PublicLayout />}>
					<Route path="/" element={<HomePage />} />
					<Route path="/features" element={<FeaturesPage />} />
					<Route path="/docs" element={<DocsPage />} />
					<Route path="/docs/architecture" element={<ArchitecturePage />} />
					<Route path="/docs/rlhf" element={<RLHFPage />} />
				</Route>

				{/* Protected/App Routes - Gated with Status Checker */}
				<Route
					element={
						<>
							<OnlineStatusChecker />
							<Outlet />
						</>
					}
				>
					<Route path="/chat" element={<ChatContainer />} />
				</Route>

				{/* Fallback */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
};
