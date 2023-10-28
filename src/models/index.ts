import mongoose from 'mongoose'
import dotenv from 'dotenv'
import logger from '@utils/winston'

export const config = async () => {
   dotenv.config()
   mongoose.set('debug', false)
   // const isProd = process.env.NODE_ENV === 'production'
   // const { ATLAS_URL, ATLAS_USER_ID, ATLAS_USER_PW } = process.env
   // const mongo_conn = isProd ? `mongodb+srv://${ATLAS_USER_ID}:${ATLAS_USER_PW}@${ATLAS_URL}` : 'mongodb://localhost:27017/damdam'
   // const options: any = isProd ? {} : { useNewUrlParser: true, useUnifiedTopology: true }

   // const mongo_conn = 'mongodb://localhost:27017/damdam'
   // const options: any = { useNewUrlParser: true, useUnifiedTopology: true }
   const mongo_conn = process.env.MONGO_CONN_URL
   const options = {}
   await mongoose
      .connect(mongo_conn, options)
      .then(() => logger.debug('⚙️ mongo DB connect'))
      .catch((err) => logger.error(`⚙️ mongo DB connect Error - ${err}`))
}

export default { config }