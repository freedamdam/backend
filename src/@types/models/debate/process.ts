import type { TDebatePlayStatus } from './room'
import { ObjectId } from 'mongoose'

export interface IDebateProcess {
	status: TDebatePlayStatus
	talker: ObjectId
	allowTeamChat: boolean
	startAt: Date
	duration: number
	systemMessage: string

	// 시스템 정보
	createdAt: Date
}

export interface IDebateProcessToJSON {
	id: ObjectId
	status: TDebatePlayStatus
	talker: ObjectId
	allowTeamChat: boolean
	startAt: Date
	duration: number
	systemMessage: string
}
