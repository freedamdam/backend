import express from 'express'
import cookieParser from 'cookie-parser'
import override from 'method-override'
import cors from 'cors'
import http from 'http'
import socket from 'socket.io'
// config
import dotenv from 'dotenv'
import morgan from 'morgan'
import logger from '@utils/winston'
// middleware
import { JWTMiddleware } from '@middlewares/auth'
import { errorHandler } from '@middlewares/error'
// APP
import model from '@models/index'
import route from '@routes/index'
import handler from 'socket/handler'
import crontab from '@crontab'

// 0. config
dotenv.config()
model.config()
// 01. app settings
const isProd = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 3000

const app = express()
app.use(cors())
app.use(override())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan(isProd ? 'combined' : 'dev'))

// 02. middleware/handler/routing
app.use(JWTMiddleware)
app.use(route)
app.use(errorHandler)

// [#] Create HTTP Server
const server = http.createServer(app)
server.listen(PORT, () => logger.debug(`✅ API start ${PORT}`))
server.on('close', () => logger.debug(`⚙️ API stop`))

const io = new socket.Server(server, { cors: { origin: '*' } })
global.io = io
crontab(io)
handler(io)

export default server
