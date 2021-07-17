import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT!;
export const NODE_ENV = process.env.NODE_ENV!;
export const MONGO_URI = process.env.MONGO_URI!;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
export const AWS_ACCESS_KEY_SECRET = process.env.AWS_ACCESS_KEY_SECRET!;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const HONEYBADGER_API_KEY = process.env.HONEYBADGER_API_KEY!;
