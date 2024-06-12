import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads configuration from config.json file.
 * @returns {Object} - The configuration object.
 */
export const loadConfig = () => {
    try {
        // Load configuration from config.json at server startup to get rate limits for each endpoint
        const config = JSON.parse(fs.readFileSync(`${__dirname}/../config.json`, 'utf8'));
        return config;
    } catch (error) {
        console.error('Failed to load configuration:', error);
        process.exit(1);
    }
};
