import { ObjectId } from 'mongoose'
import { IDebateProcessToJSON } from './process'

export const DebatePlayStatus: string[] = ['시작 전', '사회자 진행', '시작', '입론', '교차조사', '반박', '작전회의', '최종결론', '종료']
export type TDebatePlayStatus = '시작 전' | '사회자 진행' | '시작' | '입론' | '교차조사' | '반박' | '작전회의' | '최종결론' | '종료'
export interface IDebateRoom {
	debateId: ObjectId
	status: TDebatePlayStatus
	current: ObjectId
	processList: ObjectId[]

	// 시스템 정보
	createdAt: Date
}

export interface IDebateRoomToJSON {
	id: ObjectId
	status: TDebatePlayStatus
	debate: any
	debateId: ObjectId
	current: IDebateProcessToJSON
	processList: ObjectId[]
}
