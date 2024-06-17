/**
 * Represents a token bucket for rate limiting. A 'token' is synonymous with a request.
 * A token bucket is a mechanism that controls how many requests a user can make within a certain period of time.
 * It allows for bursts of requests to be made in a short period of time while enforcing a steady rate of requests over a longer period.
 */
export class TokenBucket {
    /**
     * Creates a new TokenBucket instance.
     * @param {number} maxBurstTokens - The maximum number of tokens the bucket can hold. Represents the burst rate.
     * @param {number} tokensPerMinute - The rate at which tokens are replenished (tokens per minute). Represents the sustained rate.
     */
    constructor(maxBurstTokens, tokensPerMinute) {
        this.tokens = maxBurstTokens;
        this.maxBurstTokens = maxBurstTokens;
        this.tokensPerMinute = tokensPerMinute;
        this.lastRefill = Date.now();
    }

    /**
     * Replenishes tokens for the bucket according to the sustained rate.
     * This method calculates how many tokens should be added to the bucket based on the elapsed time since the last refill.
     */
    refill() {
        const now = Date.now();
        const elapsedTime = now - this.lastRefill; // Time elapsed since the last refill

        // Calculate the number of tokens to add based on elapsed time and sustained rate
        const tokensToAdd = Math.floor(elapsedTime / (60000 / this.tokensPerMinute));

        // Add tokens, ensuring not to exceed the burst limit
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.tokens + tokensToAdd, this.maxBurstTokens);
            this.lastRefill += tokensToAdd * (60000 / this.tokensPerMinute);
        }
    }

    /**
     * Consumes one token from the bucket.
     * @returns {boolean} - True if a token was successfully consumed, false otherwise.
     */
    consume() {
        if (this.tokens > 0) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }

    /**
     * Returns the current state of the token bucket.
     * @returns {Object} - The state of the token bucket.
     */
    getState() {
        return {
            tokens: this.tokens,
            maxBurstTokens: this.maxBurstTokens,
            tokensPerMinute: this.tokensPerMinute,
            lastRefill: this.lastRefill
        };
    }

    /**
     * Sets the state of the token bucket.
     * @param {Object} state - The state to set.
     */
    setState(state) {
        this.tokens = state.tokens;
        this.maxBurstTokens = state.maxBurstTokens;
        this.tokensPerMinute = state.tokensPerMinute;
        this.lastRefill = state.lastRefill;
    }
}
