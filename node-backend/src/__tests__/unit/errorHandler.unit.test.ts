process.env.NODE_ENV = "test";

import { describe, expect, it } from "vitest";
import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import { AppError, errorHandler } from "../../core/errors.js";

const buildApp = (thrower: () => never) => {
	const app = express();
	app.get("/boom", (_req: Request, _res: Response, next) => {
		try {
			thrower();
		} catch (err) {
			next(err);
		}
	});
	app.use(errorHandler);
	return app;
};

describe("errorHandler unit tests", () => {
	it("maps AppError('msg', 400) to HTTP 400 with message in body", async () => {
		// Validates: Fix 2 — registered errorHandler, not inline 500-always handler
		const app = buildApp(() => {
			throw new AppError("bad input", 400);
		});
		const res = await request(app).get("/boom");
		expect(res.status).toBe(400);
		expect(res.body.message).toBe("bad input");
	});

	it("maps AppError('msg', 403) to HTTP 403", async () => {
		// Validates: Fix 2 — 403 passes through correctly
		const app = buildApp(() => {
			throw new AppError("Forbidden", 403);
		});
		const res = await request(app).get("/boom");
		expect(res.status).toBe(403);
		expect(res.body.message).toBe("Forbidden");
	});

	it("maps an unhandled Error (not AppError) to HTTP 500", async () => {
		// Validates: Fix 2 — non-AppError still produces 500, not a crash
		const app = buildApp(() => {
			throw new Error("something unexpected");
		});
		const res = await request(app).get("/boom");
		expect(res.status).toBe(500);
		expect(res.body.message).toBe("Internal Server Error");
	});
});
