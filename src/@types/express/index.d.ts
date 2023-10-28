import { UserRole } from '@types'

declare global {
	namespace Express {
		interface User {
			id: string
			role: UserRole
		}
		interface Request {
			user?: User
		}
	}
}
