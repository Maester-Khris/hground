import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import express from "express";
import http from "http";
import morgan from "morgan";
import apiRouter from "./api/index.js";
import { redisConfig } from "./config/redis.js";
import { corsConfig } from "./config/security.js";
import { errorHandler } from "./core/errors.js";
import { redisStream } from "./services/redis-streaming.js";
import { emitToRoom, initSocketManager } from "./services/socket-manager.js";

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms"),
);
app.use(cors(corsConfig));
app.use(express.json());

// Basic Health Check
app.get("/health", (req, res) => {
	res.json({ status: "active", timestamp: new Date().toISOString() });
});
app.use("/api", apiRouter);

app.use(errorHandler);

// Create the HTTP Server manually
const httpServer = http.createServer(app);
const startServer = async () => {
	try {
		// Ensure Redis is ready before we accept chat messages
		await redisConfig.connect();
		const isRedisReady = await redisConfig.testConnection();
		if (!isRedisReady) {
			throw new Error("Redis connection failed");
		}
		console.log("Redis connected and verified successfully");

		// Initialize Socket.io and pass the httpServer
		initSocketManager(httpServer);

		// Wire up the event from Redis -> Socket.io
		redisStream.eventEmitter.on("chunk_received", (data) => {
			emitToRoom(data.roomId, "ai_chunk", {
				conversationId: data.conversationId,
				messageId: data.messageId, // Include the generated UUID
				chunk: data.content,
				isDone: data.isDone,
			});
		});

		// Wire up the event from Redis -> Socket.io
		redisStream.eventEmitter.on("ai_request", (data) => {
			console.log("AI Request:", data);
			redisStream.pushToInferenceQueue(data).then((id) => {
				console.log("Redis Push Result ID:", id);
			});
		});

		// Start listening for results from Python (via Redis)
		redisStream.listenForLLMResults();

		if (process.env.NODE_ENV !== "test") {
			httpServer.listen(PORT, () => {
				console.log(`AI Evaluator Backend running at http://localhost:${PORT}`);
			});
		}
	} catch (err) {
		console.error("Failed to start server:", err);
		process.exit(1);
	}
};

startServer();
