import { IUserDocument } from '@models/account/User'
import { ObjectId } from 'mongoose'
import { IUserToPublic } from '../account/user'

export type TDebateStatus = '시작 전' | '진행 중' | '종료' | '취소'
export const DebateStatus = ['시작 전', '진행 중', '종료', '취소']
export type TDebateCategory = '정치' | '경제' | '생활/문화' | 'IT/과학' | '세계' | '인권' | '환경' | '기타'
export const DebateCategory = ['정치', '경제', '생활/문화', 'IT/과학', '세계', '인권', '환경', '기타']

export interface IDebate {
	authorId: IUserDocument
	categorys: TDebateCategory[]
	status: TDebateStatus
	startAt: Date
	title: string
	maxUsers: number
	agreeUserIds: IUserDocument[]
	disagreeUserIds: IUserDocument[]
	observeUserIds: IUserDocument[]
	isAllowIncome: boolean
	isAllowObserve: boolean
	password: string

	// 시스템 정보
	createdAt: Date
	updatedAt: Date
}

export interface IDebateToJSON {
	id: ObjectId
	categorys: TDebateCategory[]
	status: TDebateStatus
	startAt: Date
	title: string
	maxUsers: number
	agreeUsers: IUserToPublic[]
	agreeUserIds: ObjectId[]
	disagreeUsers: IUserToPublic[]
	disagreeUserIds: ObjectId[]
	observeUserIds: ObjectId[]
	isAllowIncome: boolean
	isAllowObserve: boolean
	password: string
}
