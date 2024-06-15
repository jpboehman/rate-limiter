
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


// NOTE: How this would look in Production with AWS
// import AWS from 'aws-sdk';
// import app from './app.mjs';

// const dynamodb = new AWS.DynamoDB();

// /**
//  * The handler function that will be invoked by AWS Lambda.
//  * @param {object} event - The event object containing the request details.
//  * @param {object} context - The context object containing information about the execution environment.
//  * @returns {object} - The response object.
//  */
// export async function handler(event, context) {
//     // Implement rate-limiting logic using DynamoDB or ElastiCache (Redis)

//     // Process the request using the app logic
//     const response = await app(event);

//     return response;
// }
