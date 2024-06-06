import express from 'express';

const router = express.Router();

export const createRateLimiterRoutes = (tokenBuckets) => {
    // Route to check rate limits and consume tokens for the specified route
    router.post('/take', (req, res) => {
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
    });

    // Debug endpoint to get the state of token buckets
    router.get('/debug/tokenBuckets', (req, res) => {
        res.json(tokenBuckets);
    });

    return router;
};
