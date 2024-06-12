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
