import { ObjectId } from 'mongoose'

export interface IDebate {
	commentId: ObjectId
	reporterId: ObjectId
	message: string

	// 시스템 정보
	createdAt: Date
	updatedAt: Date
}

export interface IDebateToJSON {
	id: ObjectId
	commentId: ObjectId
	reporterId: ObjectId
	message: string
}
