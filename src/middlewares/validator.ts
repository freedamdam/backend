import type { RequestHandler } from 'express'

import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { HttpException, HttpStatusCode } from '@exceptions/http'

export const validation =
	(type: any, skipMissingProperties = false): RequestHandler =>
	(req, _res, next) => {
		validate(plainToInstance(type, req.body, { excludeExtraneousValues: true }), { skipMissingProperties }).then(
			(errors: ValidationError[]) => {
				req.body = plainToInstance(type, req.body, { excludeExtraneousValues: true })

				if (errors.length > 0) {
					const message = errors.map((error: ValidationError) => (Object as any).values(error.constraints)).join(', ')
					const error = errors.map((error: ValidationError) => ({ [error.property]: (Object as any).values(error.constraints)[0] })) || []
					return next(new HttpException(HttpStatusCode.UNPROCESSABLE_CONTENT, message, ...error))
				}

				next()
			},
		)
	}
