import { createClient } from 'redis'
import logger from '@utils/winston'

export const client = createClient()
client.on('connect', () => logger.debug('⚙️ Redis Client Connected'))
client.on('error', (err) => logger.error('⚙️ Redis Client Error', err))
client.connect().then()

export default client
