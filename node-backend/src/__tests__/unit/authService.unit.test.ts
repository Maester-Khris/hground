process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";

import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("../../config/prisma.js", () => ({ prisma: {} }));
vi.mock("../../api/auth/auth.merger.js", () => ({
	AuthMerger: { mergeGuestSession: vi.fn() },
}));

const { mockFindTokenB } = vi.hoisted(() => ({ mockFindTokenB: vi.fn() }));
vi.mock("../../api/user/user.service.js", () => ({
	UserDAO: {
		findTokenB: mockFindTokenB,
		blacklistToken: vi.fn(),
		findByEmail: vi.fn(),
		createUser: vi.fn(),
		getUserById: vi.fn(),
	},
}));

import { AuthService } from "../../api/auth/auth.service.js";

describe("AuthService unit tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFindTokenB.mockResolvedValue(null);
	});

	describe("generateTokens()", () => {
		it("returns an object with accessToken and refreshToken", () => {
			// Validates: baseline token generation contract
			const tokens = AuthService.generateTokens("user-123");
			expect(tokens).toHaveProperty("accessToken");
			expect(tokens).toHaveProperty("refreshToken");
		});

		it("uses the module-level JWT_SECRET constant, not bare process.env at call time", () => {
			// Validates: Fix 1 — captured constant prevents runtime env mutation
			const { accessToken } = AuthService.generateTokens("user-abc");
			expect(() => jwt.verify(accessToken, "test-jwt-secret")).not.toThrow();

			const saved = process.env.JWT_SECRET;
			process.env.JWT_SECRET = "mutated-at-runtime";
			const { accessToken: tok2 } = AuthService.generateTokens("user-abc");
			// Token must still verify with the constant value fixed at import time
			expect(() => jwt.verify(tok2, "test-jwt-secret")).not.toThrow();
			// Must NOT be verifiable with the runtime-mutated value
			expect(() => jwt.verify(tok2, "mutated-at-runtime")).toThrow();
			process.env.JWT_SECRET = saved;
		});

		it("embeds userId in the access token payload", () => {
			const { accessToken } = AuthService.generateTokens("user-xyz");
			const decoded = jwt.decode(accessToken) as any;
			expect(decoded?.userId).toBe("user-xyz");
		});
	});

	describe("verifyToken()", () => {
		it("returns decoded payload for a valid token", async () => {
			// Validates: valid tokens resolve correctly
			const { accessToken } = AuthService.generateTokens("user-999", "USER");
			const decoded = await AuthService.verifyToken(accessToken);
			expect(decoded.userId).toBe("user-999");
		});

		it("throws when the token was signed with a different secret", async () => {
			// Validates: foreign tokens are rejected
			const foreign = jwt.sign({ userId: "attacker" }, "wrong-secret", {
				expiresIn: "1h",
			});
			await expect(AuthService.verifyToken(foreign)).rejects.toThrow();
		});

		it("throws when the token is blacklisted", async () => {
			// Validates: blacklist check fires before signature check
			mockFindTokenB.mockResolvedValue({ token: "some-token" });
			const { accessToken } = AuthService.generateTokens("user-111");
			await expect(AuthService.verifyToken(accessToken)).rejects.toThrow(
				"Token is no longer valid",
			);
		});

		it("throws when the token has expired", async () => {
			// Validates: expired tokens are rejected
			const expired = jwt.sign({ userId: "user-222" }, "test-jwt-secret", {
				expiresIn: "-1s",
			});
			await expect(AuthService.verifyToken(expired)).rejects.toThrow();
		});
	});
});
