import { ObjectId } from 'mongoose'

export interface IStudyChat {
	studyId: ObjectId
	sendor: 'user' | 'system'
	message: string
	questionList: string[]

	// 시스템 정보
	createdAt: Date
}

export interface IStudyChatToJSON {
	id: ObjectId
	studyId: ObjectId
	sendor: 'user' | 'system'
	message: string
	questionList: string[]

	// 시스템 정보
	createdAt: Date
}
