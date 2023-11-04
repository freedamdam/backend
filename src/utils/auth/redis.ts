import { createClient } from 'redis'
import logger from '@utils/winston'
import dotenv from 'dotenv'

dotenv.config()

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

const client = createClient({
    password: redisPassword,
    socket: {
        host: redisHost,
        port: redisPort
    }
});

client.on('connect', () => logger.debug('⚙️ Redis Client Connected'));
client.on('error', (err) => logger.error('⚙️ Redis Client Error', err));
client.connect().catch(err => logger.error('⚙️ Redis Connection Error', err));

export default client;