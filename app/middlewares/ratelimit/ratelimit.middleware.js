import rateLimit from "express-rate-limit";

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window (more generous for general use)
  message: {
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, // Adds "RateLimit" headers (e.g., RateLimit-Limit, RateLimit-Remaining)
  legacyHeaders: false, // Drops old X-RateLimit headers
});

export default globalRateLimiter;
