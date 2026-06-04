process.env.NODE_ENV = "test";

import { execSync } from "child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "../../config/prisma.js";
import { app } from "../../index.js";

const USER_A = { email: "alice@test.com", password: "password123", name: "Alice" };
const USER_B = { email: "bob@test.com", password: "password123", name: "Bob" };

describe("Chat history ownership integration (Fix 5)", () => {
	beforeAll(async () => {
		try {
			execSync("npx prisma migrate deploy --config=./src/prisma.config.ts", {
				stdio: "pipe",
			});
		} catch {
			// Already applied
		}
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	beforeEach(async () => {
		await prisma.blacklistedToken.deleteMany();
		await prisma.message.deleteMany();
		await prisma.conversation.deleteMany();
		await prisma.user.deleteMany();
	});

	it("returns 403 when user A requests history for user B", async () => {
		// Validates: Fix 5 — cross-user history access blocked end-to-end
		const resA = await request(app).post("/api/auth/signup").send(USER_A);
		expect(resA.status).toBe(201);
		const tokenA: string = resA.body.accessToken;

		const resB = await request(app).post("/api/auth/signup").send(USER_B);
		expect(resB.status).toBe(201);
		const userBId: string = resB.body.user.id;

		const res = await request(app)
			.get(`/api/chat/history/${userBId}`)
			.set("Authorization", `Bearer ${tokenA}`);

		expect(res.status).toBe(403);
		expect(res.body.message).toBe("Forbidden");
	});

	it("returns 200 when user A requests their own history", async () => {
		// Validates: Fix 5 — same-user access is permitted end-to-end
		const resA = await request(app).post("/api/auth/signup").send(USER_A);
		expect(resA.status).toBe(201);
		const tokenA: string = resA.body.accessToken;
		const userAId: string = resA.body.user.id;

		const res = await request(app)
			.get(`/api/chat/history/${userAId}`)
			.set("Authorization", `Bearer ${tokenA}`);

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	it("returns 401 when no token is provided", async () => {
		// Validates: history endpoint is not publicly accessible
		const res = await request(app).get("/api/chat/history/some-user-id");
		expect(res.status).toBe(401);
	});
});
