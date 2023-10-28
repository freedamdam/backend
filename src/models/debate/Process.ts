import mongoose, { Schema, Document, Model } from 'mongoose'
//-types
import { DebatePlayStatus, IDebateProcess, IDebateProcessToJSON } from '@types'

// [#] 1. Document, Model Interface
export interface IDebateProcessDocument extends IDebateProcess, Document {
	toJSON: () => IDebateProcessToJSON
}

interface IDebateProcessModel extends Model<IDebateProcessDocument> {
	findList: (query?: any, option?: ModelFindListOption) => Promise<IDebateProcessDocument[]>
	findOneById: (id: string) => Promise<IDebateProcessDocument>
}

// [#] 2. Schema
const schema: Schema<IDebateProcessDocument> = new mongoose.Schema(
	{
		status: { type: String, enum: DebatePlayStatus, default: '시작 전' },
		talker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		allowTeamChat: { type: Boolean, default: false },
		startAt: { type: Date },
		duration: { type: Number, default: 0 },
		systemMessage: String,
	},
	{ timestamps: true },
)

// [#] 3. Functions

// [#] 4. toJSON
const toJSON = (data: IDebateProcessDocument) => ({
	id: data._id,
	status: data.status,
	talker: data.talker,
	allowTeamChat: data.allowTeamChat,
	startAt: data.startAt,
	duration: data.duration,

	createdAt: data.createdAt,
})

// [#] 5. Statics Functions
schema.methods.toJSON = function () {
	return toJSON(this as IDebateProcessDocument)
}
schema.statics.findList = function (query?: any, option?: any) {
	return this.find(query)
		.sort(option?.sort ? option.sort : { createdAt: -1 })
		.skip(option?.offset ? option?.offset : null)
		.limit(option?.limit ? option.limit : null)
}
schema.statics.findOneById = function (id: string) {
	return this.findById(id)
}

// [#] 6. Cascade

export default mongoose.model<IDebateProcessDocument, IDebateProcessModel>('DebateProcess', schema)
