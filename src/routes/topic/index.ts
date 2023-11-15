import { Router } from 'express'
import { AuthRequired } from '@middlewares/auth'
import * as controller from './controllers'

const router = Router()
// [#] Topic
router.get('/dashboard', controller.getTopicDashboard)
router.get('/search', controller.searchTopicList)
// Topic Likes
router.post('/:topicId/likes', AuthRequired() , controller.registerLike)
router.delete('/:topicId/likes', AuthRequired(), controller.cancelLike)
// List of Liked Topics
router.get('/myLikes', AuthRequired(), controller.getLikedTopicsList)
// Topic Hit
router.put('/:topicId/hit', controller.registerHit)

export default router
