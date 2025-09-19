import { getRedisClient } from "../db/redis.js";

export const cache = {
  set: async (key, value, ttl = 3600) => {
    try {
      const redis = getRedisClient();
      await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      console.error("Cache set failed:", key, error.message);
    }
  },

  get: async (key) => {
    try {
      const redis = getRedisClient();
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get failed:", key, error.message);
      return null;
    }
  },

  del: async (key) => {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      console.error("Cache delete failed:", key, error.message);
    }
  },

  // ✅ Bulk operations
  mget: async (keys) => {
    try {
      const redis = getRedisClient();
      const results = await redis.mget(keys);
      return results.map((data) => (data ? JSON.parse(data) : null));
    } catch (error) {
      console.error("Cache mget failed:", error.message);
      return [];
    }
  },

  // ✅ Pattern-based deletion
  deletePattern: async (pattern) => {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache pattern delete failed:", pattern, error.message);
    }
  },
};
