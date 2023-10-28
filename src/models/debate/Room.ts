import mongoose, { Schema, Document, Model } from 'mongoose'
//-types
import { DebatePlayStatus, IDebateRoom, IDebateRoomToJSON } from '@types'

// [#] 1. Document, Model Interface
export interface IDebateRoomDocument extends IDebateRoom, Document {
	toJSON: () => IDebateRoomToJSON
}

interface IDebateRoomModel extends Model<IDebateRoomDocument> {
	findList: (query?: any, option?: ModelFindListOption) => Promise<IDebateRoomDocument[]>
	findOneById: (id: string) => Promise<IDebateRoomDocument>
}

// [#] 2. Schema
const schema: Schema<IDebateRoomDocument> = new mongoose.Schema(
	{
		debateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate' },
		status: { type: String, enum: DebatePlayStatus, default: '시작 전' },
		current: { type: mongoose.Schema.Types.ObjectId, ref: 'DebateProcess' },
		processList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DebateProcess' }],
	},
	{ timestamps: true },
)

// [#] 3. Functions

// [#] 4. toJSON
const toJSON = (data: IDebateRoomDocument) => ({
	id: data._id,
	debateId: data.debateId,
	status: data.status,
	current: data.current,

	createdAt: data.createdAt,
})

// [#] 5. Statics Functions
schema.methods.toJSON = function () {
	return toJSON(this as IDebateRoomDocument)
}
schema.statics.findList = function (query?: any, option?: any) {
	return this.find(query)
		.sort(option?.sort ? option.sort : { createdAt: -1 })
		.skip(option?.offset ? option?.offset : null)
		.limit(option?.limit ? option.limit : null)
		.populate(['current'])
}
schema.statics.findOneById = function (id: string) {
	return this.findById(id).populate(['current'])
}

// [#] 6. Cascade

export default mongoose.model<IDebateRoomDocument, IDebateRoomModel>('DebateRoom', schema)
