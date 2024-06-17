/**
 * Represents a token bucket for rate limiting. A 'token' is synonymous with a request.
 * A token bucket is a mechanism that controls how many requests a user can make within a certain period of time.
 * It allows for bursts of requests to be made in a short period of time while enforcing a steady rate of requests over a longer period.
 */
export class TokenBucket {
    /**
     * Creates a new TokenBucket instance.
     * @param {number} burst - The maximum number of tokens the bucket can hold. Represents the burst rate.
     * @param {number} sustained - The rate at which tokens are replenished (tokens per minute). Represents the sustained rate.
     * 
     * Burst: This represents the maximum number of requests that can be made in a short period (immediately available tokens). 
     * It allows for short bursts of high activity. Think of it as the initial number of tokens in the bucket that can be spent quickly.
     * 
     * Sustained: This indicates the rate at which tokens are refilled over time, typically per minute. 
     * It controls the long-term rate of requests, ensuring that the system isn't overwhelmed by too many requests over time. 
     * It essentially defines how many tokens are added back to the bucket every minute.
     */
    constructor(burst, sustained) {
        this.tokens = burst; // Initial number of tokens, equal to the burst rate.
        this.burst = burst; // Maximum capacity of the bucket.
        this.sustained = sustained; // Rate at which tokens are added to the bucket.
        this.lastRefill = Date.now(); // Timestamp of the last refill operation.
    }

    /**
     * Replenishes tokens for the bucket according to the sustained rate.
     * This method calculates how many tokens should be added to the bucket based on the elapsed time since the last refill.
     */
    refill() {
        const now = Date.now();
        const elapsedTime = now - this.lastRefill; // Time elapsed since the last refill.

        // Calculate the number of tokens to add based on elapsed time and sustained rate.
        // (60000 / this.sustained) calculates the interval in milliseconds for adding one token.
        const tokensToAdd = Math.floor(elapsedTime / (60000 / this.sustained));

        // Add tokens to the bucket, ensuring not to exceed the burst limit.
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.tokens + tokensToAdd, this.burst);
            // Update the last refill timestamp to account for the added tokens.
            this.lastRefill += tokensToAdd * (60000 / this.sustained);
            console.log(`Refilled ${tokensToAdd} tokens. Tokens now: ${this.tokens}`);
        } else {
            console.log(`No tokens to refill. Elapsed time: ${elapsedTime}, Tokens now: ${this.tokens}`);
        }
    }

    /**
     * Consumes one token from the bucket.
     * This method reduces the number of tokens by one if there are tokens available.
     * @returns {boolean} - True if a token was successfully consumed, false otherwise.
     */
    consume() {
        if (this.tokens > 0) {
            this.tokens -= 1; // Decrease the token count by one.
            return true; // Indicate that a token was successfully consumed.
        }
        return false; // Indicate that no token was available to consume.
    }
}

/*
    Chose to implement the TokenBucket as a class to encapsulate all the data and behavior related to token bucket management. 
    This approach provides several advantages: it encapsulates the state and logic within a single unit, making the code more modular and maintainable. 
    It also promotes reusability, as we can instantiate multiple token buckets for different endpoints without duplicating code. 
    The class structure enhances readability and follows object-oriented principles, allowing for future extensibility.
*/

/*
- Advantages
    - This algorithm can cause a burst of traffic as long as there are enough tokens in the bucket.
    - It is space efficient. The memory needed for the algorithm is nominal due to limited states.
- Disadvantages
    - Choosing an optimal value for the essential parameters is a difficult task.
*/

// Sliding Window log:
    // The sliding window algorithm is a common approach to rate limiting that divides time into fixed-size intervals (windows) and tracks the number of requests made within each window.
    // The algorithm maintains a log of timestamps for each request and counts the number of requests that fall within the current window.
    // If the number of requests exceeds the limit, the algorithm rejects the request; otherwise, it allows the request and updates the log.
    // The sliding window algorithm is more memory-intensive than the token bucket algorithm, as it requires storing timestamps for each request.
    // However, it provides more fine-grained control over the rate limiting, allowing for precise enforcement of request limits.

/**
 * TODO: Can use Redis + AWS DynamoDB to store the token bucket state for persistence across server restarts.
 * - DynamoDB is designed for HIGH-AVAILABILITY + LOW LATENCY operations, making it ideal for real-time applications like rate-limiting and tracking bucket state.
 * - TTL (Time to Live): Automatically expire items after a certain period, which is useful for cleaning up old bucket states.
 * 
 * - Streams: DynamoDB Streams can be used to trigger AWS Lambda functions on data changes, useful for event-driven architectures.
 * - NOTE: Idempotency is more challenging to achieve when using a distributed system like DynamoDB, as multiple requests can update the same bucket concurrently.
 * - To alleviate that, we can use conditional writes (e.g., UpdateItem with ConditionExpression) to ensure that only one request updates the bucket at a time.
 * 
 * 
 * TODO: Partitioning the token buckets based on the endpoint or user ID to distribute the load across multiple servers.
 * - Use a consistent hashing algorithm to map endpoints or user IDs to specific servers.
 * - Avoids bottlenecks and ensures that each server is responsible for a subset of token buckets.
 */