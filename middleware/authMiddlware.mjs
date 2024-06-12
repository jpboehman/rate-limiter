import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Configure AWS Cognito settings
const cognitoPoolId = 'YOUR_COGNITO_USER_POOL_ID';
const cognitoClientId = 'YOUR_COGNITO_APP_CLIENT_ID';
const region = 'YOUR_AWS_REGION';
const issuer = `https://cognito-idp.${region}.amazonaws.com/${cognitoPoolId}`;

// Initialize the JWKS client
const client = jwksClient({
    jwksUri: `${issuer}/.well-known/jwks.json`
});

// Function to get the signing key
const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    });
};

// Middleware function for authenticating with AWS Cognito
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    const tokenParts = token.split(' ');

    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    const accessToken = tokenParts[1];

    jwt.verify(accessToken, getKey, { issuer }, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized', error: err });
        }

        if (decoded.aud !== cognitoClientId) {
            return res.status(401).json({ message: 'Invalid token audience' });
        }

        req.user = decoded; // Add the decoded user information to the request object
        next();
    });
};
