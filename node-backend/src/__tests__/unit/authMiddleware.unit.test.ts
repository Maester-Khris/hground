process.env.NODE_ENV = "test";

import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { errorHandler } from "../../core/errors.js";

const { mockVerifyToken } = vi.hoisted(() => ({ mockVerifyToken: vi.fn() }));
vi.mock("../../api/auth/auth.service.js", () => ({
	AuthService: { verifyToken: mockVerifyToken },
}));

import { authMiddleware } from "../../middleware/auth.middleware.js";

const buildApp = () => {
	const app = express();
	app.get("/protected", authMiddleware, (req, res) => {
		res.json({ ok: true, userId: (req as any).user?.id });
	});
	app.use(errorHandler);
	return app;
};

describe("authMiddleware unit tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls next() and attaches req.user for a valid token", async () => {
		// Validates: Fix 2 — middleware passes valid tokens through
		mockVerifyToken.mockResolvedValue({ userId: "user-valid", role: "USER" });

		const res = await request(buildApp())
			.get("/protected")
			.set("Authorization", "Bearer valid.token.here");

		expect(res.status).toBe(200);
		expect(res.body.userId).toBe("user-valid");
	});

	it("returns 401 when Authorization header is absent", async () => {
		// Validates: Fix 2 — missing header rejected
		const res = await request(buildApp()).get("/protected");
		expect(res.status).toBe(401);
	});

	it("returns 401 for a malformed / invalid token", async () => {
		// Validates: Fix 2 — bad tokens rejected
		mockVerifyToken.mockRejectedValue(new Error("Invalid or expired token"));

		const res = await request(buildApp())
			.get("/protected")
			.set("Authorization", "Bearer bad.token");

		expect(res.status).toBe(401);
	});

	it("returns 401 for a blacklisted token", async () => {
		// Validates: Fix 2 — blacklisted tokens rejected
		mockVerifyToken.mockRejectedValue(new Error("Token is no longer valid"));

		const res = await request(buildApp())
			.get("/protected")
			.set("Authorization", "Bearer blacklisted.token");

		expect(res.status).toBe(401);
		expect(res.body.error).toMatch(/no longer valid/i);
	});
});
