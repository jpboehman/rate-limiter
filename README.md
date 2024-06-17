Request Initiation
   ↓
 ┌──────────────────────────────────────────────────────────────┐
 │                          app.use(express.json())             │
 ├──────────────────────────────────────────────────────────────┤
 │ Parses incoming JSON requests, making the parsed data        │
 │ available in req.body.                                        │
 └──────────────────────────────────────────────────────────────┘
   ↓
 ┌──────────────────────────────────────────────────────────────┐
 │                      app.use(authMiddleware)                 │
 ├──────────────────────────────────────────────────────────────┤
 │ Authenticates the request using AWS Cognito.                  │
 │ - If an error occurs (e.g., missing or invalid token),        │
 │   the error is passed to next(err) and handled by the         │
 │   error-handling middleware.                                  │
 │ - If authentication is successful, the request proceeds       │
 │   to the next middleware using next().                        │
 └──────────────────────────────────────────────────────────────┘
   ↓
 ┌──────────────────────────────────────────────────────────────┐
 │   app.use('/', createRateLimiterRoutes(tokenBuckets))         │
 ├──────────────────────────────────────────────────────────────┤
 │ Applies rate limiting to the routes defined by                │
 │ createRateLimiterRoutes. (API Router at this path)            │
 │ - Manages and enforces rate limits based on the token         │
 │   buckets configuration.                                       │
 │ - If the rate limit is exceeded, returns a response           │
 │   with status code 429.                                        │
 │ - If within limit, the request is processed normally          │
 │   and proceeds to the next middleware or route handler        │
 │   using next().                                                │
 └──────────────────────────────────────────────────────────────┘
   ↓
 ┌──────────────────────────────────────────────────────────────┐
 │                Error Handling Middleware                     │
 ├──────────────────────────────────────────────────────────────┤
 │ Catches any errors passed by previous middleware or           │
 │ route handlers and sends a consistent error response.         │
 │ - Logs the error stack trace for debugging purposes.          │
 │ - Sends error response with the error status and message.     │
 └──────────────────────────────────────────────────────────────┘


WOULD HAVE DONE DIFFERENTLY:
- Leveraged Rate-Limiting middleware - including logic to forward the request if tokens are available
- Implemented BOTH:
  - Redis for Real-Time Rate-Limiting
    - Store token bucket counters in Redis for quick access
    - Perform all rate-limiting checks and updates DIRECTLY in Redis since we need low-latency
  - Periodically sync Redis state with DynamoDB
    - Periodically (every x seconds, every minute) sync the state of the token buckets from Redis -> DynamoDB
    - Ensures that the state is durable and can be restored in the case of a Redis failure