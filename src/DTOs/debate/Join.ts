import {
	IsNumber,
	IsString,
	Max,
	Min,
	IsOptional,
	IsEnum,
	IsBoolean,
	Length,
	ArrayMinSize,
	ArrayMaxSize,
	IsDateString,
} from 'class-validator'
import { Expose } from 'class-transformer'

export class DebateRoomMemberJoin {
	@Expose()
	@IsEnum(['agree', 'disagree'])
	public team!: string

	@Expose()
	@IsString()
	@IsOptional()
	public password!: boolean
}
export class DebateRoomObserveJoin {
	@Expose()
	@IsString()
	@IsOptional()
	public password!: boolean
}
