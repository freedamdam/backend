import { Router } from 'express'
import { AuthRequired } from '@middlewares/auth'
import * as controller from './controllers'

const router = Router()
// [#] Topic
router.get('/dashboard', controller.getTopicDashboard)
router.get('/search', controller.searchTopicList)
// Topic Likes
router.post('/topic/:topicId/likes', AuthRequired(), controller.registerLike)
router.delete('/topic/:topicId/likes', AuthRequired(), controller.cancelLike)

// List of Liked Topics
router.get('/topic/myLikes', AuthRequired(), controller.getLikedTopicsList)

export default router
