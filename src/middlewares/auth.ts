import { RequestHandler, Request } from 'express'
import { HttpException, HttpStatusCode } from '@exceptions/http'
import { UserRole, UserRoles } from '@types'
import * as jwt from '@utils/auth/jwt'

const getTokenFromHeader = (req: Request) => {
	if (!req || !req.headers) return false
	if (
		(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
		(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
	) {
		return req.headers.authorization.split(' ')[1]
	}

	return null
}

const hasRole = (user: any, roles: UserRole | UserRole[]) => {
	if (user === undefined) return false
	else if (typeof roles === 'string') return user?.role === roles
	return roles.includes(user?.role)
}

export const JWTMiddleware: RequestHandler = (req, res, next) => {
	const token = getTokenFromHeader(req)

	try {
		const payload = jwt.verify(token as string)
		req.user = payload as any
	} catch (e) {}

	next()
}

export const AuthRequired =
	(roles?: UserRole | UserRole[]): RequestHandler =>
	(req, _res, next) => {
		const user = req.user
		if (!user) return next(new HttpException(HttpStatusCode.UNAUTHORIZED, '인증이 필요합니다'))

		const chkRole = hasRole(user, roles ? roles : UserRoles)
		if (!chkRole) return next(new HttpException(HttpStatusCode.FORBIDDEN, '권한이 없습니다'))

		next()
	}
