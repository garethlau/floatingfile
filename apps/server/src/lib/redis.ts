import { createClient } from "redis";
import logger from "./logger";
import { REDIS_URL } from "../config";

export enum RedisKeys {}

const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => {
  console.log("REDIS URL: ", REDIS_URL);
  console.error("Redis Client Error", err);
});

export async function connect() {
  await redis.connect();
  console.log(`Successfully connected to Redis instance at ${REDIS_URL}.`);
}

export function set(
  ...p: Parameters<typeof redis.set>
): ReturnType<typeof redis.set> {
  logger.info(`[Redis]: Set key "${p[0]}" with value "${p[1]}"`);
  return redis.set(...p);
}

export function get(
  ...p: Parameters<typeof redis.get>
): ReturnType<typeof redis.get> {
  logger.info(`[Redis]: Get value by key "${p[0]}"`);
  return redis.get(...p);
}

export default {
  connect,
  set,
  get,
  client: redis,
};
