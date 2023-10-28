import { IUserDocument } from '@models/account/User'
import { ObjectId } from 'mongoose'
import { IUserToPublic } from '../account/user'

export interface ITopicComment {
	topicId: ObjectId
	authorId: IUserDocument
	message: string
	emtion: string

	// 시스템 정보
	createdAt: Date
	updatedAt: Date
}

export interface ITopicCommentToJSON {
	id: ObjectId
	topicId: ObjectId
	authorId: IUserToPublic
	message: string
	emtion: string
}
