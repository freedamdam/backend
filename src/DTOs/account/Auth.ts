import 'reflect-metadata'
import { IsString, Matches, IsDate, IsOptional, ValidateIf } from 'class-validator'
import { Expose, Transform } from 'class-transformer'

export class LoginUserDTO {
	@Expose()
	@IsString()
	public identity!: string

	@Expose()
	@IsString()
	@Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,30}$/, {
		message: '비밀번호는 8~30자리 알파벳, 숫자, 특수문자 조합으로 설정해야 합니다',
	})
	public password!: string
}

export class RegisterUserDTO {
	@Expose()
	@IsString()
	public identity!: string

	@Expose()
	@IsString()
	@Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,30}$/, {
		message: '비밀번호는 8~30자리 알파벳, 숫자, 특수문자 조합으로 설정해야 합니다',
	})
	public password!: string

	@Expose()
	@IsString()
	public name!: string

	@Expose()
	@IsOptional()
	@IsString()
	public sex?: string

	@Expose()
	@IsOptional()
	@Transform(({ value }) => {
	  if (typeof value === 'string' && value.match(/^\d{8}$/)) {
		return new Date(`${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`);
	  }
	  return value;
	})
	@ValidateIf((o) => o.birth !== undefined)
	@IsDate()
	public birth?: Date;
  }
