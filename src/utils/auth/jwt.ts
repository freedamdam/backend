import jwt, { VerifyOptions } from 'jsonwebtoken'
import redisClient from '@utils/auth/redis'

const secret = process.env.SECRET || 'default'

export const sign = (data: any) => jwt.sign(data, secret, { issuer: 'backend', expiresIn: '30d' })
export const verify = (token: string, option?: VerifyOptions) => jwt.verify(token, secret, option)
export const refresh = () => jwt.sign({}, secret, { issuer: 'backend', expiresIn: '90d' })
export const refreshVerify = async (token: string, userId: string) => {
	const data = await redisClient.get(userId)
	if (token !== data) return false

	try {
		verify(token)
		return true
	} catch (_e) {
		/* token error exception */
	}

	return false
}
