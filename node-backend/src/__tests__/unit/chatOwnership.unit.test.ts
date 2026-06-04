process.env.NODE_ENV = "test";

import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { errorHandler } from "../../core/errors.js";

// Stub every module the chat router pulls in so no real I/O occurs
vi.mock("../../config/prisma.js", () => ({ prisma: {} }));

vi.mock("../../services/redis-streaming.js", () => ({
	redisStream: {
		pushToInferenceQueue: vi.fn().mockResolvedValue("ok"),
		listenForLLMResults: vi.fn(),
		eventEmitter: { on: vi.fn() },
	},
}));

vi.mock("../../api/chat/chat.service.js", () => ({
	ChatDAO: {
		getConversationsByUser: vi.fn().mockResolvedValue([]),
		getSidebarHistory: vi.fn().mockResolvedValue([]),
		getFullConversation: vi.fn().mockResolvedValue(null),
		saveMessage: vi.fn().mockResolvedValue({}),
		updateMessageEvaluation: vi.fn().mockResolvedValue(null),
	},
}));

// Replace authMiddleware with a passthrough; req.user is injected by the test app
vi.mock("../../middleware/auth.middleware.js", () => ({
	authMiddleware: (_req: any, _res: any, next: any) => next(),
}));

import chatRouter from "../../api/chat/chat.routes.js";

const buildApp = (requestingUserId: string) => {
	const app = express();
	app.use(express.json());
	// Simulate a prior authMiddleware having resolved req.user
	app.use((req: any, _res, next) => {
		req.user = { id: requestingUserId, role: "USER" };
		next();
	});
	app.use("/api/chat", chatRouter);
	app.use(errorHandler);
	return app;
};

describe("Chat history ownership guard (Fix 5)", () => {
	const USER_A = "aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa";
	const USER_B = "bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb";

	it("returns 403 when the token user does not own the requested userId", async () => {
		// Validates: Fix 5 — cross-user history access is blocked
		const res = await request(buildApp(USER_A)).get(
			`/api/chat/history/${USER_B}`,
		);
		expect(res.status).toBe(403);
		expect(res.body.message).toBe("Forbidden");
	});

	it("proceeds to the handler (200) when userId param matches req.user.id", async () => {
		// Validates: Fix 5 — same-user access is permitted
		const res = await request(buildApp(USER_A)).get(
			`/api/chat/history/${USER_A}`,
		);
		expect(res.status).toBe(200);
	});
});
