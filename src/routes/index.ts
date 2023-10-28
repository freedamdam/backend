import { Router } from 'express'
//-routes
import auth from '@routes/auth'
import debate from '@routes/debate'

const router = Router()
router.use('/auth', auth)
router.use('/debate', debate)

router.use((req, res) => res.status(404).json({ msg: 'API url이 잘못되었습니다', errors: { error: req.originalUrl } } as ErrorResponse))

export default router
