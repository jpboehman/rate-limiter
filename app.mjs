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
// What I would've done:
// -  Placed all middleware in an Lambda Layer (code-reuse within Lambdas) OR API Gateway (abstracted away from Lambdas)
// -  Would've used a more sophisticated logging mechanism like AWS CloudWatch
//      as well as a more secure way to store secrets like AWS Secrets Manager
app.use(express.json());

// TODO: Would also add middleware for logging, caching, security (AWS Cognito + JWT), authorization, etc.

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
    maxBurstTokens: 10, // Maximum number of tokens available for immediate use (burst capacity)
    tokensPerMinute: 6, // Number of tokens refilled per minute (sustained rate)
    lastRefill: 1718152673361
  },
}
*/

// Either in Lambda Layer or API Gateway, would use middleware for authentication
// app.use(authMiddleware)

// In practicality for an API, rate-limiting is an excellent candiddate for middleware
// as it's a cross-cutting concern that applies to all routes

// Mount rate limiter routes at the root of the application
app.use('/', createRateLimiterRoutes(tokenBuckets));

// Set interval to periodically refill tokens
// In a production environment, we would use a more sophisticated scheduling mechanism like cron jobs
setInterval(() => refillAllBuckets(tokenBuckets), 500); // Check every half-second

/**
 * Error handling middleware - uniform error handling across the application.
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

// An advantage of using API Gateway over Lambda Layers is that we can use API Gateway
// to handle / implement ALL of our middleware functions (authentication, caching, rate-limiting, etc)
// across all of our Lambda functions. 
// This way, we can keep our Lambda functions clean and focused, and don't
// even need to import the middleware functions into our Lambda functions. We can also use API Gateway to
// manage our middleware functions in a centralized location, and we can easily enable or disable them for
// specific endpoints or services. This approach also allows us to easily scale our middleware functions
// independently of our Lambda functions, and we can reuse them across multiple services or applications.