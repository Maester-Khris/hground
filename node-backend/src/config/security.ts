import type { CorsOptions } from "cors";

const clientUrl =
	process.env.NODE_ENV === "production"
		? process.env.CLIENT_SERVICE_URL
		: "http://localhost:5173";

const allowedOrigins = [
	clientUrl,
	"http://127.0.0.1:5173",
].filter(Boolean) as string[];

export const corsConfig: CorsOptions = {
	origin: (
		origin: string | undefined,
		callback: (err: Error | null, allow?: boolean) => void,
	) => {
		// Allow requests with no origin (like mobile apps or curl)
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true, // Required if you decide to use cookies/sessions later
};
