import { Router } from 'express'
import { AuthRequired } from '@middlewares/auth'
import { validation } from '@middlewares/validator'
//-DTOs
import { DebateRoomCreateDTO, DebateRoomUpdateDTO } from '@DTOs/debate/RoomCRUD'
//-controllers
import * as controller from './controllers'
import { DebateRoomMemberJoin, DebateRoomObserveJoin } from '@DTOs/debate/Join'

const router = Router()
// [#] Debate
router.get('/dashboard', controller.getDebateDashboard)
router.get('/search', controller.searchDebateList)
router.get('/detail/:id', controller.getDebateDetailOne)
//-Room Join
router.post('/join/:id/member', AuthRequired(), validation(DebateRoomMemberJoin), controller.joinDebateMember)
router.post('/join/:id/observe', AuthRequired(), validation(DebateRoomObserveJoin), controller.joinDebateObserve)
router.post('/cancel/:id/member', AuthRequired(), controller.cancelDebateMember)
//-Room info
router.get('/room/:debateId', AuthRequired(), controller.getDebateRoomOne)
router.get('/message/:roomId', AuthRequired(), controller.getDebateChatList)

//-CRUD
router.put('/', AuthRequired(), validation(DebateRoomCreateDTO), controller.createDebateOne)
router.post('/:id', AuthRequired(), validation(DebateRoomUpdateDTO), controller.updateDebateOne)
router.delete('/:id', AuthRequired(), controller.deleteDebateOne)

export default router
