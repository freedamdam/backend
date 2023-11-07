import { UserRole } from '@types'

export interface IUser {
	// _id: string // mongodb ObjectID
	identity: string // userId
	role: UserRole
	//-password
	hash?: string
	salt?: string

	// 기본 정보
	name?: string
	sex?: 'man' | 'woman'
	birth?: Date
	phone?: string

	// 시스템 정보
	active: boolean
	createdAt?: number
	updatedAt?: number

	// 토픽 정보
	topicInterests?: object[]
	hiddenTopicMessageIds?: object[]
}

export interface IUserToPublic {
	id: string
	name: string
}

export interface IUserToAuth {
	id: string
	role: UserRole
	accessToken: string
	refreshToken: string
}
