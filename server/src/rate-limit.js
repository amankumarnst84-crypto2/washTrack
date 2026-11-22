// Per-process academic-demo limiter; a shared store is needed for multiple servers.
const { fail } = require("./rules");
module.exports = function rateLimit(limit, minutes) {
  const attempts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, item] of attempts) {
      if (item.until <= now) {
        attempts.delete(key);
      }
    }
    const record = attempts.get(req.ip) || {
      count: 0,
      until: now + minutes * 60000,
    };
    if (record.count >= limit) {
      res.set("Retry-After", String(Math.ceil((record.until - now) / 1000)));
      fail("Too many attempts. Please try again later.", 429);
    }
    record.count++;
    attempts.set(req.ip, record);
    next();
  };
};
