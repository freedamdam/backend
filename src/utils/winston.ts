import process from 'process'
import winston from 'winston'
import WinstonDaily from 'winston-daily-rotate-file'

const { combine, timestamp, printf, colorize } = winston.format
const logDir = `${process.cwd()}/logs`
const isTest = process.env.NODE_ENV === 'test'
const isProd = process.env.NODE_ENV === 'production'

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
}

const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'blue',
}

winston.addColors(colors)

const level = () => {
	const env = process.env.NODE_ENV || 'development'
	const isDevelopment = env === 'development'
	return isDevelopment ? 'debug' : 'http'
}

// Log Format
const logFormat = combine(
	timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
	printf((info) => {
		if (info.stack) {
			return `${info.timestamp} ${info.level}: ${info.message} \n Error Stack: ${info.stack}`
		}
		return `${info.timestamp} ${info.level}: ${info.message}`
	}),
)

const consoleOpts = {
	handleExceptions: true,
	level: isProd || isTest ? 'error' : 'debug',
	format: combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' })),
}

const transports = [
	new winston.transports.Console(consoleOpts),
	//-test env
	//-error
	new WinstonDaily({
		level: 'error',
		datePattern: 'YYYY-MM-DD',
		dirname: logDir + '/error',
		filename: '%DATE%.error.log',
		maxFiles: 30,
		zippedArchive: true,
	}),

	//-info
	new WinstonDaily({
		level: 'info',
		datePattern: 'YYYY-MM-DD',
		dirname: logDir + '/info',
		filename: '%DATE%.info.log',
		maxFiles: 30,
		zippedArchive: true,
	}),

	//-other logs
	new WinstonDaily({
		level: 'debug',
		datePattern: 'YYYY-MM-DD',
		dirname: logDir + '/all',
		filename: '%DATE%.all.log',
		maxFiles: 7,
		zippedArchive: true,
	}),
]

export const logger = winston.createLogger({
	level: level(),
	levels,
	format: logFormat,
	transports,
})

export default logger
