import { ObjectId } from 'mongoose'

export type TTopicCategory = '정치' | '경제' | '생활/문화' | 'IT/과학' | '세계' | '인권' | '환경' | '기타'
export const TopicCategory = ['정치', '경제', '생활/문화', 'IT/과학', '세계', '인권', '환경', '기타']

export interface ITopic {
	title: string
	views: string[]
	category: TTopicCategory
	comments: ObjectId[]

	// 시스템 정보
	createdAt: Date
	updatedAt: Date
}

export interface ITopicToJSON {
	id: ObjectId
	title: string
	views: string[]
	category: TTopicCategory
	comments: ObjectId[]
}
