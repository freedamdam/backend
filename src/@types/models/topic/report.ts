import { ObjectId } from 'mongoose'

export interface ITopicReport {
	commentId: ObjectId
	reporterId: ObjectId
	message: string

	// 시스템 정보
	createdAt: Date
	updatedAt: Date
}

export interface ITopicReportToJSON {
	id: ObjectId
	commentId: ObjectId
	reporterId: ObjectId
	message: string
}
