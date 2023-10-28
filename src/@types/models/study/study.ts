import { IUserDocument } from '@models/account/User'
import { ObjectId } from 'mongoose'

export interface IStudy {
	userId: IUserDocument
	title: string

	// 시스템 정보
	createdAt: Date
	updatedAt: Date
}

export interface IStudyToJSON {
	id: ObjectId
	title: string
}
