import redisClient from './redis-config';
import { TokenBucket } from './tokenBucket';
import dynamodb from './dynamodb-config';

/**
 * Middleware for rate limiting.
 * Checks and updates the token bucket state stored in Redis for the specified route.
 * If the rate limit is not exceeded, it allows the request to proceed.
 * If the rate limit is exceeded, it responds with a 429 status code.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const rateLimiterMiddleware = async (req, res, next) => {
    const routeTemplate = req.body.endpoint;

    try {
        // Fetch the token bucket state from Redis
        const data = await redisClient.getAsync(routeTemplate);

        let bucket;
        if (data) {
            // If data exists in Redis, parse it and initialize the token bucket
            const state = JSON.parse(data);
            bucket = new TokenBucket(state.maxBurstTokens, state.tokensPerMinute);
            bucket.setState(state); // Restore the state of the token bucket
        } else {
            // Initialize a new token bucket if not found in Redis
            bucket = new TokenBucket(10, 6); // Example values for maxBurstTokens and tokensPerMinute
        }

        // Refill the token bucket based on the elapsed time
        bucket.refill();

        if (bucket.consume()) {
            // If a token is successfully consumed, update the state in Redis
            await redisClient.setAsync(routeTemplate, JSON.stringify(bucket.getState()), 'EX', 3600); // Set 1 hour TTL
            next(); // Proceed to the next middleware or route handler
        } else {
            // If no tokens are available, respond with a 429 status code
            res.status(429).json({
                tokensRemaining: bucket.tokens,
                accept: false,
                message: 'Rate limit exceeded'
            });
        }
    } catch (err) {
        console.error('Redis error:', err);
        res.status(500).send('Server Error'); // Respond with a server error if Redis query fails
    }
};

/**
 * NOT a middleware function since it doesn't call next()
 * Periodic function to sync Redis state with DynamoDB.
 * Fetches all keys from Redis, retrieves their state, and updates DynamoDB.
 * This ensures that the token bucket state is durable and can be restored if needed.
 */
export const syncWithDynamoDB = async () => {
    try {
        const keys = await redisClient.keysAsync('*'); // Get all keys from Redis
        for (const key of keys) {
            const data = await redisClient.getAsync(key); // Get the state for each key
            const state = JSON.parse(data);
            const params = {
                TableName: 'RateLimiterTable',
                Item: {
                    routeTemplate: key,
                    state
                }
            };

            // Update the state in DynamoDB
            await dynamodb.put(params).promise();
            console.log(`Synced ${key} state with DynamoDB`);
        }
    } catch (err) {
        console.error('Error syncing with DynamoDB:', err);
    }
};

// Schedule the syncWithDynamoDB function to run every minute - would call in app.mjs
setInterval(syncWithDynamoDB, 60000);
