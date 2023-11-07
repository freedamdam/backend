import mongoose, { Schema, Document, Model } from 'mongoose'
//-types
import { ITopicReport, ITopicReportToJSON } from '@types'

export interface IReportDocument extends ITopicReport, Document {
    toJSON: () => ITopicReportToJSON
}

interface IReportModel extends Model<IReportDocument> {
    findList: (query?: any, option?: ModelFindListOption) => Promise<IReportDocument[]>
    findOneById: (id: string) => Promise<IReportDocument>
}

const schema: Schema<IReportDocument> = new mongoose.Schema(
  {
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TopicComment', required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
)

const toJSON = (data: IReportDocument) => ({
  id: data._id,
  commentId: data.commentId,
  reporterId: data.reporterId,
  message: data.message,
  
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

schema.methods.toJSON = function () {
  return toJSON(this as IReportDocument)
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

export default mongoose.model<IReportDocument, IReportModel>('TopicReport', schema)
