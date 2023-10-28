import mongoose, { Schema, Document, Model } from 'mongoose'
//-models
import Room from 'models/debate/Room'
//-types
import { DebateCategory, DebateStatus, IDebate, IDebateToJSON } from '@types'

// [#] 1. Document, Model Interface
export interface IDebateDocument extends IDebate, Document {
	toJSON: () => IDebateToJSON
	toAuth: () => IDebateToJSON
}

interface IDebateModel extends Model<IDebateDocument> {
	findList: (query?: any, option?: ModelFindListOption) => Promise<IDebateDocument[]>
	findOneById: (id: string) => Promise<IDebateDocument>
}

// [#] 2. Schema
const schema: Schema<IDebateDocument> = new mongoose.Schema(
	{
		authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		categorys: [{ type: String, enum: DebateCategory }],
		status: { type: String, enum: DebateStatus, default: '시작 전' },
		startAt: { type: Date },
		title: String,
		maxUsers: Number,
		agreeUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		disagreeUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		observeUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		isAllowIncome: { type: Boolean, default: true },
		isAllowObserve: { type: Boolean, default: true },
		password: String,
	},
	{ timestamps: true },
)

// [#] 3. Functions

// [#] 4. toJSON
const toJSON = (data: IDebateDocument) => ({
	id: data._id,
	authorId: data.authorId,
	categorys: data.categorys,
	status: data.status,
	startAt: data.startAt,
	title: data.title,
	maxUsers: data.maxUsers,
	agreeUserIds: data.agreeUserIds?.map((obj) => obj?._id || obj),
	agreeUsers: data.agreeUserIds?.map((obj) => (obj.toPublic ? obj.toPublic() : obj)),
	disagreeUserIds: data.disagreeUserIds?.map((obj) => obj?._id || obj),
	disagreeUsers: data.disagreeUserIds?.map((obj) => (obj.toPublic ? obj.toPublic() : obj)),
	observeUserIds: data.observeUserIds?.map((obj) => obj?._id || obj),
	isAllowIncome: data.isAllowIncome,
	isAllowObserve: data.isAllowObserve,

	createdAt: data.createdAt,
	updatedAt: data.updatedAt,
})
const toAuth = (data: IDebateDocument) => ({
	password: data.password,
})

// [#] 5. Statics Functions
schema.methods.toJSON = function () {
	return toJSON(this as IDebateDocument)
}
schema.methods.toAuth = function () {
	return { ...toJSON(this as IDebateDocument), ...toAuth(this as IDebateDocument) }
}
schema.statics.findList = function (query?: any, option?: any) {
	return this.find(query)
		.sort(option?.sort ? option.sort : { createdAt: -1 })
		.skip(option?.offset ? option?.offset : null)
		.limit(option?.limit ? option.limit : null)
		.populate(['agreeUserIds', 'disagreeUserIds'])
}
schema.statics.findOneById = function (id: string) {
	return this.findById(id).populate(['agreeUserIds', 'disagreeUserIds'])
}

// [#] 6. Cascade
schema.pre('save', async function (next) {
	if (this.isNew) await new Room({ debateId: this._id }).save()
	next()
})

export default mongoose.model<IDebateDocument, IDebateModel>('Debate', schema)
