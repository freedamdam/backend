import { randomUUID } from 'crypto'

// User ID
export const makeUUID = () => randomUUID()
export const makeId = (length: number) => {
	let result = ''
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength = characters.length

	for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength))

	return result
}

export const makeNumberCode = (length: number) => {
	return Math.random()
		.toString()
		.substring(2, 2 + length)
}

export default { makeId, makeNumberCode, makeUUID }
