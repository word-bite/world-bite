// Mock Redis implementation for development
// Replace with actual Redis client in production

const cache = new Map();

const redis = {
  async setCache(key, value, ttlSeconds = 3600) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    cache.set(key, { value, expiry });
    return true;
  },

  async getCache(key) {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    
    return item.value;
  },

  async deleteCache(key) {
    return cache.delete(key);
  },

  async clearCache() {
    cache.clear();
    return true;
  }
};

module.exports = redis;
