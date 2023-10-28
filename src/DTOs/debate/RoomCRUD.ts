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
//-types
import { DebateCategory } from '@types'
import type { TDebateCategory } from '@types'

export class DebateRoomCreateDTO {
	@Expose()
	@IsEnum(DebateCategory, { each: true })
	@ArrayMinSize(1)
	@ArrayMaxSize(3)
	public categorys!: TDebateCategory[]

	@Expose()
	@IsString()
	@Length(1, 100)
	public title!: string

	@Expose()
	@IsNumber()
	@Min(1)
	@Max(4)
	public maxUsers!: number

	@Expose()
	@IsBoolean()
	public isAllowIncome!: boolean

	@Expose()
	@IsBoolean()
	public isAllowObserve!: boolean

	@Expose()
	@IsOptional()
	@IsString()
	public password!: boolean

	@Expose()
	@IsDateString()
	public startAt!: Date
}

export class DebateRoomUpdateDTO {
	@Expose()
	@IsOptional()
	@IsEnum(DebateCategory, { each: true })
	@ArrayMinSize(1)
	@ArrayMaxSize(3)
	public categorys!: TDebateCategory[]

	@Expose()
	@IsOptional()
	@IsString()
	@Length(1, 100)
	public title!: string

	@Expose()
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(4)
	public maxUsers!: number

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isAllowIncome!: boolean

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isAllowObserve!: boolean

	@Expose()
	@IsOptional()
	@IsString()
	public password!: boolean

	@Expose()
	@IsOptional()
	@IsDateString()
	public startAt!: Date
}
