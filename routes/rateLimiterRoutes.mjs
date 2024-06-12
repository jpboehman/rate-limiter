import express from 'express';

const router = express.Router();

/**
 * Creates rate limiter routes.
 * @param {Object} tokenBuckets - The token buckets object.
 * @returns {Object} - The router object.
 */
export const createRateLimiterRoutes = (tokenBuckets) => {
    // Route to check rate limits and consume tokens for the specified route
    // NOTE: Added error-handling middleware to catch any errors that occur during the route handling - see app.mjs (centralizes error handling)
    router.post('/take', (req, res, next) => {
        try {
            const routeTemplate = req.body.endpoint;

            // Validate if the route exists
            if (!tokenBuckets[routeTemplate]) {
                res.status(404).send('Route not found');
                return;
            }

            const bucket = tokenBuckets[routeTemplate];

            // Check if there are enough tokens to consume
            if (bucket.consume()) {
                res.json({
                    tokensRemaining: bucket.tokens,
                    accept: true,
                    message: 'Request accepted',
                });
            } else {
                res.status(429).json({
                    tokensRemaining: 0,
                    accept: false,
                    message: 'Rate limit exceeded',
                });
            }
        } catch (err) {
            next(err); // Pass the error to the error handling middleware
        }
    });

    // Debug endpoint to get the state of token buckets
    router.get('/debug/tokenBuckets', (req, res, next) => {
        try {
            res.json(tokenBuckets);
        } catch (err) {
            next(err); // Pass the error to the error handling middleware
        }
    });

    return router;
};
