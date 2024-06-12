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
 │ createRateLimiterRoutes.                                       │
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
