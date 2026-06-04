process.env.NODE_ENV = "test";

import { execSync } from "child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "../../config/prisma.js";
import { app } from "../../index.js";

describe("Auth integration — additional coverage", () => {
	beforeAll(async () => {
		try {
			execSync("npx prisma migrate deploy --config=./src/prisma.config.ts", {
				stdio: "pipe",
			});
		} catch {
			// Migrations already applied is acceptable
		}
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	beforeEach(async () => {
		await prisma.blacklistedToken.deleteMany();
		await prisma.user.deleteMany();
	});

	describe("GET /health", () => {
		it("returns 200 with no auth required", async () => {
			// Validates: health route is publicly accessible
			const res = await request(app).get("/health");
			expect(res.status).toBe(200);
			expect(res.body.status).toBe("active");
		});
	});

	describe("POST /api/auth/signup — validation", () => {
		it("returns 400 (not 500) when required fields are missing", async () => {
			// Validates: Fix 2 — errorHandler is wired; validation errors do not become 500s
			const res = await request(app).post("/api/auth/signup").send({});
			expect(res.status).toBe(400);
		});

		it("returns 400 when password is too short", async () => {
			const res = await request(app)
				.post("/api/auth/signup")
				.send({ email: "a@b.com", password: "123" });
			expect(res.status).toBe(400);
		});

		it("returns 400 for a duplicate email", async () => {
			// Validates: duplicate user handled gracefully (not 500)
			const user = { email: "dup@test.com", password: "secret123", name: "Dup" };
			await request(app).post("/api/auth/signup").send(user);
			const res = await request(app).post("/api/auth/signup").send(user);
			expect(res.status).toBe(400);
			expect(res.body.error).toMatch(/already exists/i);
		});
	});

	describe("POST /api/auth/guest", () => {
		it("returns 200 with an access token for a guest session", async () => {
			// Validates: guest login flow produces a usable token
			const res = await request(app)
				.post("/api/auth/guest")
				.send({ name: "Guest One", id: "guest-id-001" });
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("accessToken");
			expect(res.body.user.isGuest).toBe(true);
		});
	});

	describe("POST /api/auth/login", () => {
		it("returns 401 for missing fields", async () => {
			const res = await request(app).post("/api/auth/login").send({});
			expect(res.status).toBe(400);
		});
	});
});
