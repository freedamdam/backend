import { ObjectId } from 'mongoose'

export const DebateChatGroup = ['all', 'teamA', 'teamB']
export type TDebateChatType = 'all' | 'teamA' | 'teamB'
export interface IDebateChat {
	roomId: ObjectId
	authorId: ObjectId
	group: TDebateChatType

	name: string
	message: string

	// 시스템 정보
	createdAt: Date
}

export interface IDebateChatToJSON {
	id: ObjectId
	roomId: ObjectId
	authorId: ObjectId
	group: TDebateChatType

	name: string
	message: string

	// 시스템 정보
	createdAt: Date
}
