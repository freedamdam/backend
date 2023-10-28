import type { RequestHandler } from 'express'
import { HttpException, HttpStatusCode } from '@exceptions/http'
//-module
// import redisClient from '@utils/auth/redis'
// import { refreshVerify, verify, sign } from '@utils/auth/jwt'
//-model
import User from '@models/account/User'

// [#] Auth : login/register
export const login: RequestHandler = async (req, res, next) => {
	const { identity, password } = req.body

	const user = await User.findOne({ identity })
	if (!user || !user.active) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않는 계정'))
	if (!user.validPassword(password)) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않는 계정'))

	const data = user.toAuth()
	const result: DataResponse = { data, msg: '로그인 완료' }
	// await redisClient.set(user.id, data.refreshToken)
	return res.json(result)
}
export const register: RequestHandler = async (req, res, next) => {
	const { identity, password } = req.body
	const { name } = req.body

	if (await User.exists({ identity })) return next(new HttpException(HttpStatusCode.BAD_REQUEST, 'ALREADY'))

	const user = new User({ identity, name })
	user.setPassword(password)

	const save = await user.save()
	if (!save) return next(new HttpException(HttpStatusCode.BAD_REQUEST, '400'))

	const data = save.toAuth()
	// await redisClient.set(user.id, data.refreshToken)

	const result: DataResponse = { data, msg: 'FINISH REGISTER' }
	return res.json(result)
}

// [#] JWT
export const verifyToken: RequestHandler = async (req, res) => res.sendStatus(HttpStatusCode.SUCESS)
export const loginByToken: RequestHandler = async (req, res) => {
	const { id } = req.user!
	const data = await User.findById(id)
	return res.json({ data: data?.toAuth(), msg: 'OK' })
}
// export const refreshToken: RequestHandler = async (req, res, next) => {
// 	const access_token: string = req.headers.authorization?.split('Bearer ')[1] || ''
// 	const refresh_token: string = (req.headers.refresh as string) || ''
// 	if (!access_token || !refresh_token) return next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'TOKEN FAILED'))

// 	try {
// 		const access_verify = verify(access_token, { ignoreExpiration: true }) as any
// 		const refresh_verify = refreshVerify(refresh_token, '')
// 		if (!access_verify || !refresh_verify) return next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'EXPIRED TOKEN'))

// 		const user = await User.findById(access_verify?.id)
// 		if (!user) return next(new HttpException(HttpStatusCode.NOT_FOUND, '404'))
// 		const new_token = sign(payload(user))

// 		const result: DataResponse = { msg: 'OK', data: { accessToken: new_token, refreshToken: refresh_token } }
// 		return res.json(result)
// 	} catch (_e) {}

// 	return next(new HttpException(HttpStatusCode.BAD_REQUEST, '400'))
// }
