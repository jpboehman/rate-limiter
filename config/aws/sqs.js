import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1' });

/**
 * AWS Simple Queue Service (SQS) instance for eventual writes to DynamoDB.
 * @type {AWS.SQS}
 */
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

export default sqs;