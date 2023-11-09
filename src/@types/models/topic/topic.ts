import { ObjectId } from 'mongoose'

export type TTopicCategory = '정치' | '경제' | '생활/문화' | 'IT/과학' | '세계' | '인권' | '환경' | '기타'
export const TopicCategory = ['정치', '경제', '생활/문화', 'IT/과학', '세계', '인권', '환경', '기타']
// { id: 2, category: '정치', title: '의대 정원 확대', isLike: false, views: 32542, comments: 112 }, // 1

export interface ITopic {	
	category: TTopicCategory
	title: string
	views: number
	comments: number

	// 시스템 정보
	createdAt: Date
	updatedAt: Date
}

export interface ITopicToJSON {
	id: ObjectId
	category: TTopicCategory
	title: string
	views: number
	comments: number
}

