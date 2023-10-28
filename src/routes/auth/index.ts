import { Router } from 'express'
import { AuthRequired } from '@middlewares/auth'
import { validation } from '@middlewares/validator'
//-DTOs
import { LoginUserDTO, RegisterUserDTO } from '@DTOs/account/Auth'
//-controllers
import * as controller from './controllers'

const router = Router()
// [#] Auth : login/register
router.post('/login', validation(LoginUserDTO), controller.login)
router.post('/register', validation(RegisterUserDTO), controller.register)

//-Token
router.post('/token/login', AuthRequired(), controller.loginByToken)
router.post('/token/verify', AuthRequired(), controller.verifyToken)
// router.post('/token/refresh', controller.refreshToken)

export default router
