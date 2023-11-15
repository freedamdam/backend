import type { RequestHandler } from 'express'
// import { HttpException, HttpStatusCode } from '@exceptions/http'
//-module
//-model
import { PagingParams, makeParamQuery, makeParamReturn } from '@utils/paging'
import User from '@models/account/User'
import Topic from '@models/topic/Topic'

// [#] Topic
export const getTopicDashboard: RequestHandler = async (req, res, next) => {
    try {
        const { category, search } = req.query

        let query: any = {}

        // 카테고리에 대한 필터를 적용
        if (typeof category === 'string' && category) {
            query.category = category
        }

        // 검색어에 대한 필터를 적용
        if (typeof search === 'string' && search) {
            const keywords = search.split(' ')
            query.$text = { $search: keywords.join(' ') }
        }

        // 쿼리를 사용하여 토픽을 검색
        const topics = await Topic.find(query).limit(12)

        // 결과를 반환합니다.
        const result: DataResponse = {
            data: topics.map((topic) => topic.toJSON()),
            msg: 'OK'
        }
        return res.json(result)
    } catch (error) {
        // 에러 처리
        return res.status(500).json({ msg: 'Server error'})
    }
}

// Search for topics
export const searchTopicList: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user || {}
	const { limit, offset, page, perPage } = req.query
	const { category, search } = req.query
	const pagination: PagingParams = makeParamQuery({ limit, offset, page, perPage })

	const query: any = new Object({})
	if (typeof category === 'string' && category) query.category = category
	if (typeof search === 'string' && search) {
    const keywords = search.split(' ')
    query.$or = keywords.map((keyword) => ({ title: { $regex: new RegExp(keyword, 'i') } }))
  }

	const data = await Topic.findList(query, pagination)
	const count = await Topic.countDocuments(query).exec()
	const params = makeParamReturn({ count, query: { search }, ...pagination })

	const result: DataResponse = { data: data.map((obj) => obj.toJSON()), msg: 'OK', ...params }
	return res.json(result)
}

// Register a like for a topic
export const registerLike: RequestHandler = async (req, res, next) => {
    try {
      const { topicId } = req.params
      const userId = req.user?.id
  
      // 사용자의 likedTopics 배열에서 topicId를 찾아보고 없으면 추가
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { topicInterests: topicId } }, // $addToSet은 중복을 방지
        { new: true } // 업데이트된 문서를 반환하도록 설정
      )
  
      // 결과에 따라 응답을 전송
      if (user) {
        return res.status(200).json({ msg: 'Like registered successfully' })
      } else {
        return res.status(404).json({ msg: 'User not found' })
      }
    } catch (error) {
      return res.status(500).json({ msg: 'Server error', error })
    }
  }
  

// Cancel a like for a topic
export const cancelLike: RequestHandler = async (req, res, next) => {
    try {
      const { topicId } = req.params
      const userId = req.user?.id
  
      // 사용자의 likedTopics 배열에서 topicId를 제거
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { topicInterests: topicId } }, // $pull로 배열에서 요소를 제거
        { new: true }
      )
  
      // 결과에 따라 응답을 전송
      if (user) {
        return res.status(200).json({ msg: 'Like cancelled successfully' })
      } else {
        return res.status(404).json({ msg: 'User not found' })
      }
    } catch (error) {
      return res.status(500).json({ msg: 'Server error', error })
    }
  }
  

// Get list of liked topics for a user
export const getLikedTopicsList: RequestHandler = async (req, res, next) => {
    try {
      const { id: userId } = req.user || {}

      // 유저 정보와 좋아요 표시한 토픽 목록을 불러오는 쿼리
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ msg: 'User not found' })
      }
      const likedTopics = user.topicInterests

      // 좋아요 표시한 토픽들에 대한 쿼리를 생성
      const topics = await Topic.find({
        _id: { $in: likedTopics }
      }).limit(12) // 예를 들어 최대 12개를 반환하도록 설정

      // 결과를 반환합니다.
      const result: DataResponse = {
        data: topics.map((topic) => topic.toJSON()),
        msg: 'OK'
      }
      return res.json(result)
    } catch (error) {
      // 에러 처리
      return res.status(500).json({ msg: 'Server error'})
    }
  }

// Register a hit for a topic
export const registerHit: RequestHandler = async (req, res, next) => {
  try {
      const { topicId } = req.params

      // 토픽의 조회수를 1 증가시키는 업데이트 쿼리
      const topic = await Topic.findByIdAndUpdate(
          topicId,
          { $inc: { views: 1 } }, // $inc 연산자로 조회수를 1 증가
          { new: true, runValidators: true } // 업데이트된 문서를 반환하고 유효성 검사 실행
      )

      // 결과에 따라 응답을 전송
      if (topic) {
          return res.status(200).json({ msg: 'Hit registered successfully' })
      } else {
          return res.status(404).json({ msg: 'Topic not found' })
      }
  } catch (error) {
      return res.status(500).json({ msg: 'Server error', error })
  }
}
