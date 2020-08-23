const Redis = require("ioredis");
const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
const { TooManyConnections } = require("../helpers/response.helper");
const redisClient = new Redis({ enableOfflineQueue: false });

const rateLimiterMemory = new RateLimiterMemory({
  points: 2, // 10 / 5 if there are 5 processes
  duration: 1,
});

const rateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "standard_request",
  points: 10, // Number of connections
  inmemoryBlockOnConsumed: 10,
  duration: 1, // Per second,
  blockDuration: 60 * 60 * 24, // block for 1 day,
  inmemoryBlockDuration: 60 * 60 * 24,
  insuranceLimiter: rateLimiterMemory,
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiterRedis.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(_ => {
      res.status(429).send(TooManyConnections);
    })
}

module.exports = {
  middleware: {
    rateLimiterMiddleware
  },
}