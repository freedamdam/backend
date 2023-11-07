import mongoose, { Schema, Document, Model } from 'mongoose'
//-types
import { ITopicComment, ITopicCommentToJSON } from '@types'

export interface ITopicCommentDocument extends ITopicComment, Document {
    toJSON: () => ITopicCommentToJSON
}

interface ITopicCommentModel extends Model<ITopicCommentDocument> {
    findList: (query?: any, option?: ModelFindListOption) => Promise<ITopicCommentDocument[]>
    findOneById: (id: string) => Promise<ITopicCommentDocument>
}

const schema: Schema<ITopicCommentDocument> = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    emotion: { type: String, required: true },
  },
  { timestamps: true },
)

const toJSON = (data: ITopicCommentDocument) => ({
  id: data._id,
  topicId: data.topicId,
  authorId: data.authorId,
  message: data.message,
  emotion: data.emotion,
  
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

schema.methods.toJSON = function () {
  return toJSON(this as ITopicCommentDocument)
}

// [#] 5. Statics Functions
schema.statics.findList = function (query?: any, option?: any) {
  return this.find(query)
    .sort(option?.sort ? option.sort : { createdAt: -1 })
    .skip(option?.offset ? option?.offset : null)
    .limit(option?.limit ? option.limit : null)
}
schema.statics.findOneById = function (id: string) {
  return this.findById(id)
}

export default mongoose.model<ITopicCommentDocument, ITopicCommentModel>('TopicComment', schema)
