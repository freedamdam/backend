import { Router } from 'express'
//-routes
import auth from '@routes/auth'
import debate from '@routes/debate'
import topic from '@routes/topic'

const router = Router()
router.use('/auth', auth)
router.use('/debate', debate)
router.use('/topic', topic)

router.use((req, res) => res.status(404).json({ msg: 'API url이 잘못되었습니다', errors: { error: req.originalUrl } } as ErrorResponse))

export default router
