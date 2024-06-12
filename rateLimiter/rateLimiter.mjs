import { TokenBucket } from './tokenBucket.mjs';

/**
 * Initialize token buckets for each endpoint with their respective burst limits.
 * @param {Array} rateLimits - The array of rate limit configurations.
 * @returns {Object} - The token buckets object.
 */
export const initializeTokenBuckets = (rateLimits) => {
    const tokenBuckets = {};

    console.log('rateLimits: ', rateLimits);

    if (!rateLimits || !Array.isArray(rateLimits)) {
        throw new Error("Invalid rateLimits configuration");
    }

    // Initialize a token bucket for each endpoint
    rateLimits.forEach(({ endpoint, burst, sustained }) => {
        tokenBuckets[endpoint] = new TokenBucket(burst, sustained);
        console.log(`Initialized ${endpoint} with burst ${burst} and sustained ${sustained}`);
    });

    return tokenBuckets;
};

/**
 * Replenishes tokens for each endpoint according to the sustained rate.
 * @param {Object} tokenBuckets - The token buckets object.
 */
export const refillAllBuckets = (tokenBuckets) => {
    Object.values(tokenBuckets).forEach(bucket => bucket.refill());
};
