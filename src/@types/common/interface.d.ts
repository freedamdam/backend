interface DataResponse {
	msg?: string
	data: any
}

interface ErrorResponse {
	msg: string
	errors?: {
		message?: string
		error: any
	}
}
