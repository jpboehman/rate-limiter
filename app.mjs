import express from 'express';
import { loadConfig } from './config/configLoader.mjs';
import { initializeTokenBuckets, refillAllBuckets } from './rateLimiter/rateLimiter.mjs';
import { createRateLimiterRoutes } from './routes/rateLimiterRoutes.mjs';

const app = express();
app.use(express.json());

// Load configuration from config.json at server startup to get rate limits for each endpoint
const config = loadConfig();
const tokenBuckets = initializeTokenBuckets(config.rateLimitsPerEndpoint);

app.use('/', createRateLimiterRoutes(tokenBuckets));

// Set interval to periodically refill tokens
setInterval(() => refillAllBuckets(tokenBuckets), 500); // Check every half-second

// Error handling middleware - prevents bad requests from contacting the server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

export default app;
