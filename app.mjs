/**
 * Express application for the server.
 * @module app
 */

import express from 'express';
import { loadConfig } from './config/configLoader.mjs';
import { initializeTokenBuckets, refillAllBuckets } from './rateLimiter/rateLimiter.mjs';
import { createRateLimiterRoutes } from './routes/rateLimiterRoutes.mjs';

const app = express();

// Middleware to parse incoming requests with JSON payloads
// TODO:
// What I would've done - placed all middleware in an AWS Lambda for code reuse
// Also, would've used a more sophisticated logging mechanism like AWS CloudWatch
// as well as a more secure way to store secrets like AWS Secrets Manager
app.use(express.json());
// TODO: Would also add middleware for logging, security, authorization, etc.

// Load configuration from config.json at server startup to get rate limits for each endpoint
// In a production environment, we would get this from a secure location like AWS Secrets Manager
const config = loadConfig();
const tokenBuckets = initializeTokenBuckets(config.rateLimitsPerEndpoint);
/*
tokenBuckets data structure:
route serves as the key, TokenBucket instance for the route serves as the value

{
  'GET /user/:id': TokenBucket {
    tokens: 10,
    burst: 10,
    sustained: 6,
    lastRefill: 1718152673361
  },
}
*/

// Middleware for authentication - calling BEFORE creating rate limiter routes
// In Express, middleware functions are executed in the order they're defined
// app.use(authMiddleware);

// In practicality for an API, rate-limiting is an excellent candiddate for middleware
// as it's a cross-cutting concern that applies to all routes
// This is why we're creating the rate limiter routes AFTER the authentication middleware
// Additionally, it makes sense for us to host an AWS Lammbda Layer for our middleware functions:
// (authentication, caching, rate-limiting, request-logging, etc)

// Mount rate limiter routes at the root of the application
app.use('/', createRateLimiterRoutes(tokenBuckets));

// Set interval to periodically refill tokens
// In a production environment, we would use a more sophisticated scheduling mechanism like cron jobs
setInterval(() => refillAllBuckets(tokenBuckets), 500); // Check every half-second

/**
 * Error handling middleware.
 * This middleware is called when an error occurs during the execution of route handlers or other middleware.
 * It sends a response with the error status and message.
 * 
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use((err, req, res, next) => {
    // TODO: Could send logs every so often instead of right away to reduce I/O
    console.error(err.stack); // Log the error stack trace for debugging purposes
    res.status(500).send('Something went wrong!'); // Send a 500 Internal Server Error response
});

export default app;
