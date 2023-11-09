import mongoose, { Schema, Document, Model } from 'mongoose'
//-types
import { ITopic, ITopicToJSON, TopicCategory } from '@types'

export interface ITopicDocument extends ITopic, Document {
    toJSON: () => ITopicToJSON
}

interface ITopicModel extends Model<ITopicDocument> {
    findList: (query?: any, option?: ModelFindListOption) => Promise<ITopicDocument[]>
	  findOneById: (id: string) => Promise<ITopicDocument>
}

const schema: Schema<ITopicDocument> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    views: { type: Number, default: 0, required: true },
    comments: { type: Number, default: 0, required: true },
    category: { type: String, enum: TopicCategory, required: true },
  },
  { timestamps: true },
)

const toJSON = (data: ITopicDocument) => ({
  id: data._id,
  title: data.title,
  views: data.views,
  category: data.category,
  comments: data.comments,
  
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

schema.methods.toJSON = function () {
  return toJSON(this as ITopicDocument)
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

export default mongoose.model<ITopicDocument, ITopicModel>('Topic', schema)
