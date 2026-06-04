import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "path";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/index.js";

dotenv.config({ path: path.resolve(process.cwd(), "src/.env") });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
