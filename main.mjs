/*
    ES Modules (.mjs files) are a standardized way to include and share code between files in JavaScript:
    - Standardized Syntax:
    - Import/Export: ES modules use the import and export statements to include and share code between files
        - Uniform across codebases, making it easier to understand and maintain code.

    - Module Scope: Each ES module has its own scope, meaning that variables and functions defined in one module are not accessible in other modules unless explicitly exported and imported.
        - Helps in avoiding naming conflicts and unintended side effects.
    
    - Asynchronous Loading: ES modules are loaded asynchronously, meaning that the browser can load multiple modules in parallel, 
        improving performance.
*/

/**
 * Key Strategies for Scaling
 * 
 * Statelessness and AWS Lambda:
 * 
 * - AWS Lambda: Make the rate-limiting service stateless and deploy it as a serverless function using AWS Lambda. This ensures automatic scaling and high availability without managing servers.
 * - Stateless Design: Ensure that the rate-limiting logic does not depend on local state but instead uses shared storage for token buckets.
 * 
 * Shared Storage for Rate Limits:
 * 
 * - DynamoDB: Use AWS DynamoDB to store token bucket states. DynamoDB provides low-latency access and can scale to handle high traffic.
 * - Redis: Use a distributed cache like AWS ElastiCache (Redis) to store token buckets. Redis can handle high read/write throughput and provides in-memory performance.
 * 
 * Data Partitioning and Indexing:
 * 
 * - Partitioning: Ensure that the rate-limiting data is partitioned effectively to distribute the load evenly across the storage backend.
 * - Indexing: Use appropriate indexing strategies in DynamoDB to ensure fast lookups of token buckets based on route templates.
 * 
 * Load Balancing:
 * 
 * - API Gateway: Use AWS API Gateway in front of your Lambda functions to handle routing, throttling, and load balancing.
 * - Elastic Load Balancer (ELB): If using EC2 instances, use ELB to distribute incoming traffic across multiple instances.
 * 
 * Caching:
 * 
 * - Edge Caching: Use AWS CloudFront to cache responses at the edge locations, reducing the load on your backend services.
 * - Local Caching: Implement local caching strategies to reduce the number of calls to the shared storage for frequently accessed data.
 * 
 * Rate Limiting Logic Optimization:
 * 
 * - Efficient Algorithms: Ensure that the rate limiting and token bucket algorithms are efficient and optimized for performance.
 * - Batch Processing: Process rate-limiting updates in batches where possible to reduce the number of storage operations.
 */


import app from './app.mjs';

const PORT = process.env.PORT || 3000;

/**
 * The server instance created by calling the `listen` method on the `app` object.
 * Starts the server.
 * @type {import('http').Server}
 */
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default server;
