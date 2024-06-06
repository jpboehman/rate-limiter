import { TokenBucket } from './tokenBucket.mjs';

// Initialize token buckets for each endpoint with their respective burst limits
export const initializeTokenBuckets = (rateLimits) => {
    const tokenBuckets = {};
    console.log('rateLimits: ', rateLimits);
    

    rateLimits.forEach(({ endpoint, burst, sustained }) => {
        tokenBuckets[endpoint] = new TokenBucket(burst, sustained);
        console.log(`Initialized ${endpoint} with burst ${burst} and sustained ${sustained}`);
    });

    return tokenBuckets;
};

// Function to replenish tokens for each endpoint according to the sustained rate
export const refillAllBuckets = (tokenBuckets) => {
    Object.values(tokenBuckets).forEach(bucket => bucket.refill());
};
