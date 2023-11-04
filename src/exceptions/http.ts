export enum HttpStatusCode {
	SUCCESS = 200,
	CREATED = 201,
	NO_CONTENT = 204,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	UNPROCESSABLE_CONTENT = 422,
	INTERNAL_SERVER_ERROR = 500,
}

export class HttpException extends Error {
	public status: HttpStatusCode
	public message: string
	public error: any

	constructor(status: number, message: string, error?: any) {
		super(message)
		this.status = status
		this.message = message
		this.error = error
	}
}
