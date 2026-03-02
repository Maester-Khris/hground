import AuthModal from "@/features/auth/components/AuthModal";
import UserSection from "@/features/auth/components/UserSection";
import { useAIReview } from "@/features/review/hooks/useEvaluation";
import MainLayout from "@/layouts/MainLayout";
import { useChat } from "../hooks/useChat";
import ChatSidebar from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";

export const ChatContainer = () => {
	const {
		conversations,
		activeConversation,
		sendMessageToSocket,
		createNewConversation,
		setActiveId,
		isStreaming,
		stopStreaming,
	} = useChat([]);
	const { sendEvaluationToSocket } = useAIReview();

	const sidebar = (
		<ChatSidebar
			conversations={conversations}
			activeId={activeConversation?.id}
			onSelect={setActiveId}
			onNewChat={createNewConversation}
			userSection={<UserSection />}
		/>
	);

	return (
		<MainLayout sidebar={sidebar}>
			<ChatWindow>
				<ChatWindow.Messages
					messages={activeConversation?.messages || []}
					onEvaluate={sendEvaluationToSocket}
					isStreaming={isStreaming}
				/>
				<ChatWindow.Input
					onSubmit={sendMessageToSocket}
					isStreaming={isStreaming}
					onStop={stopStreaming}
				/>
			</ChatWindow>
			<AuthModal />
		</MainLayout>
	);
};
