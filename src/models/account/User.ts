import mongoose, { Schema, Document, Model } from 'mongoose'
//-JWT utils
import crypto from 'crypto'
import { refresh, sign } from '@utils/auth/jwt'
//-types
import { IUser, IUserToAuth, IUserToPublic, UserRole, UserRoles } from '@types'

// [#] 1. Document, Model Interface
export interface IUserDocument extends IUser, Document {
	setPassword: (password: string) => void
	validPassword: (password: string) => boolean

	toAuth: () => IUserToAuth
	toJSON: () => any
	toPublic: () => IUserToPublic
}

interface IUserModel extends Model<IUserDocument> {
	findList: (query?: any, option?: ModelFindListOption) => Promise<IUserDocument[]>
	findOneById: (id: string) => Promise<IUserDocument>
}

// [#] 2. Schema
const schema: Schema<IUserDocument> = new mongoose.Schema(
	{
		identity: { type: String, unique: true, required: true },
		role: { type: String, enum: UserRoles, default: UserRole.user },
		//-password
		hash: String,
		salt: String,
		//-personal
		name: { type: String, default: undefined, minlength: 2, maxlength: 12 },
		active: { type: Boolean, default: true },
		birth: { type: Date, default: Date.now },
		phone: { type: String, default: '', trim: true },
		sex: { type: String, enum: ['man', 'woman'], default: undefined },
		//-topic
		topicInterests: { type: [Object], default: [] },
		hiddenTopicMessageIds: { type: [Object], default: [] },
	},
	{ timestamps: true },
)

// [#] 3. Functions
schema.methods.setPassword = function (password: string) {
	const user = this as IUserDocument
	user.salt = crypto.randomBytes(16).toString('hex')
	user.hash = crypto.pbkdf2Sync(password, user.salt, 10000, 512, 'sha512').toString('hex')
}
schema.methods.validPassword = function (password: string) {
	const user = this as IUserDocument
	const hash = crypto.pbkdf2Sync(password, user.salt || '', 10000, 512, 'sha512').toString('hex')
	return user.hash === hash
}

// [#] 4. toJSON
export const payload = (user: IUserDocument) => ({
	id: user._id,
	role: user.role,
})

const toPublic = (user: IUserDocument) => ({
	id: user._id,
	name: user.name,
})
const toJSON = (user: IUserDocument) => ({
	id: user._id,
	name: user.name,

	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
})
const toAuth = (user: IUserDocument) => ({
	role: user.role,

	accessToken: sign(payload(user)),
	refreshToken: refresh(),
})

// [#] 5. Statics Functions
schema.methods.toAuth = function () {
	return { ...toJSON(this as IUserDocument), ...toAuth(this as IUserDocument) }
}
schema.methods.toJSON = function () {
	return toJSON(this as IUserDocument)
}
schema.methods.toPublic = function () {
	return toPublic(this as IUserDocument)
}

schema.statics.findList = function (query?: any, option?: any) {
	return this.find(query)
		.sort(option?.sort ? option.sort : { createdAt: 1 })
		.skip(option?.offset ? option?.offset : null)
		.limit(option?.limit ? option.limit : null)
}
schema.statics.findOneById = function (id: string) {
	return this.findById(id)
}

// [#] 6. Cascade

export default mongoose.model<IUserDocument, IUserModel>('User', schema)
