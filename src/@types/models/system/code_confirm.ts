export interface ICodeConfirm {
	userId: any
	phone: string
	code: string
	confirm?: boolean
	createdAt: Date
}

export interface ICodeConfirmToJSON {
	phone: string
	confirm: boolean
	createdAt: Date
}
