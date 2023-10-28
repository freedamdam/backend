import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
	const { statusCode, status: eStatus, message, error: eError, stack } = error
	const isProd = process.env.NODE_ENV === 'production'
	const status = eStatus || statusCode || 500
	const result: ErrorResponse = {
		msg: message,
		errors: {
			message: '입력값을 확인해주세요' || '',
			error: isProd ? eError || {} : eError || stack,
		},
	}

	return res.status(status).json(result)
}
