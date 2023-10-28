import mongoose, { Schema, Document, Model } from 'mongoose'
//-types
import { DebateChatGroup, DebatePlayStatus, IDebateChat, IDebateChatToJSON } from '@types'

// [#] 1. Document, Model Interface
export interface IDebateChatDocument extends IDebateChat, Document {
	toJSON: () => IDebateChatToJSON
}

interface IDebateChatModel extends Model<IDebateChatDocument> {
	findList: (query?: any, option?: ModelFindListOption) => Promise<IDebateChatDocument[]>
	findOneById: (id: string) => Promise<IDebateChatDocument>
}

// [#] 2. Schema
const schema: Schema<IDebateChatDocument> = new mongoose.Schema(
	{
		roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'DebateRoom' },
		authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		group: { type: String, enum: DebateChatGroup, default: 'all' },
		name: String,
		message: String,
	},
	{ timestamps: true },
)

// [#] 3. Functions

// [#] 4. toJSON
const toJSON = (data: IDebateChatDocument) => ({
	id: data._id,
	roomId: data.roomId,
	name: data.name,
	group: data.group === 'all' ? 'all' : 'team',
	message: data.message,
	authorId: data.authorId,

	createdAt: data.createdAt,
})

// [#] 5. Statics Functions
schema.methods.toJSON = function () {
	return toJSON(this as IDebateChatDocument)
}
schema.statics.findList = function (query?: any, option?: any) {
	return this.find(query).sort(option?.sort ? option.sort : { createdAt: 1 })
	// .skip(option?.offset ? option?.offset : null)
	// .limit(option?.limit ? option.limit : null)
}
schema.statics.findOneById = function (id: string) {
	return this.findById(id)
}

// [#] 6. Cascade

export default mongoose.model<IDebateChatDocument, IDebateChatModel>('DebateChat', schema)
