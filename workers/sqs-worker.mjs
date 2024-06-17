import AWS from 'aws-sdk';
import dynamodb from './dynamodb-config';
import { TokenBucket } from './tokenBucket';

AWS.config.update({ region: 'us-east-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/your-account-id/your-queue-name';

/**
 * Processes messages from the SQS queue and updates DynamoDB.
 * Could use standard SQS queue instead of FIFO queue for parallel processing and higher throughput.
 * The operations we're performing (updating bucket states) should ideally be idempotent, meaning
 * that applying the same operation multiple times should have the same effect as applying it once
 * (e.g., updating the state in DynamoDB with the same value should not change the state).
 */
/**
 * Processes messages from an SQS queue, updates the state in DynamoDB, and deletes the processed messages from the queue.
 * @returns {Promise<void>} A promise that resolves when all messages have been processed.
 */
const processMessages = async () => {
    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20
    };

    try {
        const data = await sqs.receiveMessage(params).promise();
        if (data.Messages) {
            for (const message of data.Messages) {
                const { routeTemplate, state } = JSON.parse(message.Body);
                const params = {
                    TableName: 'RateLimiterTable',
                    Item: {
                        routeTemplate,
                        state
                    }
                };

                // Update the state in DynamoDB
                await dynamodb.put(params).promise();
                console.log(`Synced ${routeTemplate} state with DynamoDB`);

                // Delete the message from the queue
                const deleteParams = {
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle
                };
                await sqs.deleteMessage(deleteParams).promise();
            }
        }
    } catch (err) {
        console.error('Error processing messages:', err);
    }
};

// Poll the SQS queue for messages
setInterval(processMessages, 5000); // Adjust the polling interval as needed
