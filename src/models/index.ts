import mongoose from 'mongoose'
import dotenv from 'dotenv'
import logger from '@utils/winston'

export const config = async () => {
	dotenv.config()
	mongoose.set('debug', false)

	const mongo_conn = process.env.MONGO_CONN_URL
	const options = {}
	await mongoose
		.connect(mongo_conn, options)
		.then(() => logger.debug('⚙️ mongo DB connect'))
		.catch((err) => logger.error(`⚙️ mongo DB connect Error - ${err}`))
}

export default { config }