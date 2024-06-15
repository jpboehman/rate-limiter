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

/**
 * TODO: Can use AWS DynamoDB to store the token bucket state for persistence across server restarts.
 * - Low latency, high availability, and scalability
 * 
 * TODO: Partitioning the token buckets based on the endpoint or user ID to distribute the load across multiple servers.
 * - Use a consistent hashing algorithm to map endpoints or user IDs to specific servers.
 * - Avoids bottlenecks and ensures that each server is responsible for a subset of token buckets.
 */