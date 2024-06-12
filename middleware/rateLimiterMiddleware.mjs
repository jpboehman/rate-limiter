// THOUGHT OF THIS LATER
import { TokenBucket } from '../rateLimiter/tokenBucket.mjs';

/**
 * Middleware to rate limit requests.
 * @param {Object} tokenBuckets - A map of route templates to TokenBucket instances.
 * @returns {Function} Express middleware function.
 */
export const rateLimiterMiddleware = (tokenBuckets) => {
    return async (req, res, next) => {
        const routeTemplate = req.path;

        // Validate if the route exists
        if (!tokenBuckets[routeTemplate]) {
            return res.status(404).send('Route not found');
        }

        const bucket = tokenBuckets[routeTemplate];
        bucket.refill(); // Ensure tokens are refilled before checking

        // Check if there are enough tokens to consume
        if (await bucket.consume()) {
            next(); // Allow the request to proceed to the next middleware or route handler
        } else {
            res.status(429).json({
                tokensRemaining: bucket.tokens,
                accept: false,
                message: 'Rate limit exceeded',
            });
        }
    };
};

