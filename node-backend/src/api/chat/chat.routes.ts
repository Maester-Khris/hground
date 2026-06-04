// src/api/chat/chat.routes.ts

import { randomUUID } from "node:crypto";
import { Router } from "express";
import { AppError } from "../../core/errors.js";
import {
	isNonEmptyString,
	isValidRating,
	validate,
} from "../../core/validation.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { redisStream } from "../../services/redis-streaming.js";
import type { StreamMessageRequest } from "../../types/streaming.contract.js";
import { ChatDAO } from "./chat.service.js";

const router = Router();

// POST /api/chat/message
router.post(
	"/message",
	authMiddleware,
	validate("body", {
		id: (v) => v === undefined || typeof v === "string" || "id must be a string",
		conversationId: (v) =>
			v === undefined ||
			typeof v === "string" ||
			"conversationId must be a string",
		sender: (v) => isNonEmptyString(v) || "sender is required",
		content: (v) =>
			typeof v === "string" ||
			(v && typeof v === "object") ||
			"content must be a string or valid JSON object",
	}),
	async (req, res, next) => {
		const { id, conversationId, sender, content: rawContent } = req.body;
		const { id: userId, isGuest } = (req as any).user;
		console.log("User:", userId, "Guest retrieved from auth middleware:", isGuest);
		const content =
			typeof rawContent === "string" ? { text: rawContent } : rawContent;

		// 1. Unique Hook for this specific interaction
		const correlationId = randomUUID();

		try {
			// 2. Persist Message (Handles both Guest and DB internally)
			const envelope = await ChatDAO.saveMessage(
				sender,
				content,
				conversationId,
				userId,
				correlationId,
				isGuest,
				id,
			);

			// 3. Prepare the Task for Python
			const task: StreamMessageRequest = {
				roomId: envelope.conversationId,
				correlationId: correlationId,
				userId: userId,
				conversationId: envelope.conversationId,
				message: content.text || "",
				context: [], // Future: Add last 2-3 messages for context here
				isGuest,
			};

			// 4. Fire and Forget to Redis
			console.log(
				`[Queue] Dispatching task ${correlationId} for user ${userId} (Guest: ${isGuest})`,
			);
			await redisStream.pushToInferenceQueue(task);

			// 5. Response to Client
			res.status(201).json(envelope);
		} catch (error) {
			console.error("Chat Route Error:", error);
			next(error);
		}
	},
);

// PATCH /api/chat/message/:id/evaluate
router.patch(
	"/message/:id/evaluate",
	validate("params", {
		id: (v) => isNonEmptyString(v) || "message id parameter is required",
	}),
	validate("body", {
		rating: (v) =>
			v === undefined
				? "rating is required"
				: isValidRating(v) || "rating must be a number between 1 and 5",
		evaluationComment: (v) =>
			v === undefined
				? true
				: typeof v === "string" || "evaluationComment must be a string",
	}),
	async (req, res, next) => {
		const id = req.params.id as string;
		const { rating, evaluationComment } = req.body;
		try {
			const result = await ChatDAO.updateMessageEvaluation(id, {
				rating,
				evaluationComment,
			});
			res.json(result);
		} catch (error) {
			next(error);
		}
	},
);

// GET /api/chat/history/:userId
router.get(
	"/history/:userId",
	authMiddleware,
	validate("params", {
		userId: (v) =>
			isNonEmptyString(v) ||
			"userId parameter is required and must be a non-empty string",
	}),
	async (req, res, next) => {
		try {
			if (req.params.userId !== (req as any).user.id) {
				throw new AppError("Forbidden", 403);
			}
			const userId = req.params.userId as string;
			const history = await ChatDAO.getConversationsByUser(userId);
			res.json(history);
		} catch (error) {
			next(error);
		}
	},
);

// GET /api/chat/sidebar/:userId
router.get("/sidebar/:userId", async (req, res, next) => {
	try {
		const history = await ChatDAO.getSidebarHistory(
			req.params.userId as string,
		);
		res.json(history);
	} catch (error) {
		next(error);
	}
});

// GET /api/chat/conversation/:id
router.get("/conversation/:id", async (req, res, next) => {
	try {
		const convo = await ChatDAO.getFullConversation(req.params.id as string);
		res.json(convo);
	} catch (error) {
		next(error);
	}
});

export default router;
