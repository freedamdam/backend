import type { RequestHandler } from 'express'
import { HttpException, HttpStatusCode } from '@exceptions/http'
//-module
//-model
import Debate from '@models/debate/Debate'
import { PagingParams, makeParamQuery, makeParamReturn } from '@utils/paging'
import { isValidObjectId } from 'mongoose'
import Room from '@models/debate/Room'
import Chat from '@models/debate/Chat'

// [#] Debate
export const getDebateDashboard: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user || {}
	const { category, search, my, maxUsers } = req.query

	let query: any = new Object()
	if (my === 'true' && userId) query.authorId = userId
	if (typeof category === 'string' && category) query.categorys = category
	if (typeof maxUsers === 'string' && parseInt(maxUsers)) query.maxUsers = parseInt(maxUsers)
	if (typeof search === 'string' && search) {
		query = { $and: [] }
		const keywords = search.split(' ')
		query.$and.push({ title: { $regex: new RegExp(keywords.join('|')) } })
	}

	const data = {
		'시작 전': (
			await Debate.find({ ...query, status: '시작 전' })
				.limit(3)
				.sort({ createdAt: -1 })
		).map((obj) => obj.toJSON()),

		'진행 중': (
			await Debate.find({ ...query, status: '진행 중' })
				.limit(3)
				.sort({ createdAt: -1 })
		).map((obj) => obj.toJSON()),

		'종료': (
			await Debate.find({ ...query, status: '종료' })
				.limit(3)
				.sort({ createdAt: -1 })
		).map((obj) => obj.toJSON()),
	}

	const result: DataResponse = { data, msg: 'OK' }
	return res.json(result)
}
export const searchDebateList: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user || {}
	const { limit, offset, page, perPage } = req.query
	const { status, category, search, my, maxUsers } = req.query
	const pagination: PagingParams = makeParamQuery({ limit, offset, page, perPage })

	const query: any = new Object({})
	if (my === 'true' && userId) query.authorId = userId
	if (typeof status === 'string' && status) query.status = status
	if (typeof category === 'string' && category) query.categorys = category
	if (typeof maxUsers === 'string' && parseInt(maxUsers)) query.maxUsers = parseInt(maxUsers)
	if (typeof search === 'string' && search) {
		query.$and = []
		const keywords = search.split(' ')
		query.$and.push({ title: { $regex: new RegExp(keywords.join('|')) } })
	}

	const data = await Debate.findList(query, pagination)
	const count = await Debate.countDocuments(query).exec()
	const params = makeParamReturn({ count, query: { search }, ...pagination })

	const result: DataResponse = { data: data.map((obj) => obj.toJSON()), msg: 'OK', ...params }
	return res.json(result)
}
export const getDebateDetailOne: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user || {}
	const { id } = req.params
	if (!isValidObjectId(id)) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))

	const data = await Debate.findOneById(id)
	if (!data) return next(new HttpException(HttpStatusCode.NOT_FOUND, '데이터가 존재하지 않습니다'))

	const result: DataResponse = { data: userId == data.authorId.toString() ? data.toAuth() : data.toJSON(), msg: 'OK' }
	return res.json(result)
}

export const createDebateOne: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user!
	const { categorys, startAt, title, maxUsers } = req.body
	const { isAllowIncome, isAllowObserve, password } = req.body

	//-create
	const save = await new Debate({
		authorId: userId,
		categorys,
		startAt,
		title,
		maxUsers,
		isAllowIncome,
		isAllowObserve,
		password,
		agreeUserIds: [],
		disagreeUserIds: [],
	}).save()
	if (!save) return next(new HttpException(HttpStatusCode.BAD_REQUEST, '토론을 생성하는데 문제가 발생하였습니다'))

	const data = await Debate.findOneById(save._id)
	return res.json({ data: data?.toJSON(), msg: '생성완료' })
}
export const updateDebateOne: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user!
	const { id } = req.params
	const { categorys, startAt, title, maxUsers } = req.body
	const { isAllowIncome, isAllowObserve, password } = req.body
	if (!isValidObjectId(id)) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))

	const prev = await Debate.findOne({ _id: id, authorId: userId })
	if (!prev) return res.status(400).json({ msg: '데이터가 존재하지 않습니다' })

	const query: any = new Object()
	if (title !== undefined && prev.title !== title) query.title = title
	if (categorys !== undefined && prev.categorys !== categorys) query.categorys = categorys
	if (startAt !== undefined && prev.startAt !== startAt) query.startAt = startAt
	if (maxUsers !== undefined && prev.maxUsers !== maxUsers) query.maxUsers = maxUsers
	if (isAllowIncome !== undefined && prev.isAllowIncome !== isAllowIncome) query.isAllowIncome = isAllowIncome
	if (isAllowObserve !== undefined && prev.isAllowObserve !== title) query.isAllowObserve = isAllowObserve
	if (password !== undefined && prev.password !== password) query.password = password

	await Debate.findByIdAndUpdate(id, query)
	const data = await Debate.findOneById(id)

	if (!data) return next(new HttpException(HttpStatusCode.BAD_REQUEST, '수정에 실패하였습니다'))
	return res.json({ data: data.toJSON(), msg: '수정완료' })
}
export const deleteDebateOne: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user!
	const { id } = req.params
	if (!isValidObjectId(id) || !(await Debate.exists({ _id: id, authorId: userId })))
		return next(new HttpException(HttpStatusCode.NOT_FOUND, '데이터가 존재하지 않습니다'))

	const data = await Debate.findByIdAndDelete(id)
	if (!data) return res.status(400).json({ msg: '삭제에 실패하였습니다', data })
	return res.json({ data: { id }, msg: '삭제완료' })
}

//-Member&Observe
export const joinDebateMember: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user!
	const { id } = req.params
	const { team, password } = req.body

	const prev = await Debate.findById(id)
	if (!isValidObjectId(id) || !prev) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))
	if (!prev.isAllowIncome && prev.password !== password)
		return next(new HttpException(HttpStatusCode.NOT_FOUND, '패스워드가 일치하지 않습니다'))

	const want_team = team === 'agree' ? prev.agreeUserIds : prev.disagreeUserIds
	if (want_team.length >= prev.maxUsers) return next(new HttpException(HttpStatusCode.NOT_FOUND, '참여하려는 팀의 남은 자리가 없습니다'))
	else if (prev.agreeUserIds.find((obj) => obj.toString() == userId) || prev.disagreeUserIds.find((obj) => obj.toString() == userId))
		return next(new HttpException(HttpStatusCode.NOT_FOUND, '이미 참가한 토론입니다'))

	const query = team === 'agree' ? { $addToSet: { agreeUserIds: userId } } : { $addToSet: { disagreeUserIds: userId } }

	await Debate.findByIdAndUpdate(id, query)
	const data = await Debate.findOneById(id)

	if (!data) return next(new HttpException(HttpStatusCode.BAD_REQUEST, '수정에 실패하였습니다'))
	return res.json({ data: data.toJSON(), msg: '참가완료' })
}
export const joinDebateObserve: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user!
	const { id } = req.params
	const { password } = req.body

	const prev = await Debate.findById(id)
	if (!isValidObjectId(id) || !prev) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))
	if (!prev.isAllowObserve && prev.password !== password)
		return next(new HttpException(HttpStatusCode.NOT_FOUND, '패스워드가 일치하지 않습니다'))

	const query = { $addToSet: { observeUserIds: userId } }

	await Debate.findByIdAndUpdate(id, query)
	const data = await Debate.findOneById(id)

	if (!data) return next(new HttpException(HttpStatusCode.BAD_REQUEST, '수정에 실패하였습니다'))
	return res.json({ data: data.toJSON(), msg: '참가완료' })
}
export const cancelDebateMember: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user!
	const { id } = req.params

	const prev = await Debate.findById(id)
	if (!isValidObjectId(id) || !prev) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))

	const query = { $pull: { agreeUserIds: userId, disagreeUserIds: userId, observeUserIds: userId } }

	await Debate.findByIdAndUpdate(id, query)
	const data = await Debate.findOneById(id)

	if (!data) return next(new HttpException(HttpStatusCode.BAD_REQUEST, '수정에 실패하였습니다'))
	return res.json({ data: data.toJSON(), msg: '참가완료' })
}

// [#] Room
export const getDebateRoomOne: RequestHandler = async (req, res, next) => {
	const { debateId } = req.params
	if (!isValidObjectId(debateId)) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))

	const data = await Room.findOne({ debateId }).populate(['current'])
	if (!data) return next(new HttpException(HttpStatusCode.NOT_FOUND, '데이터가 존재하지 않습니다'))

	const result: DataResponse = { data: data.toJSON(), msg: 'OK' }
	return res.json(result)
}
export const getDebateChatList: RequestHandler = async (req, res, next) => {
	const { id: userId } = req.user!
	const { roomId } = req.params
	const { group } = req.query
	// const { limit, offset, page, perPage } = req.query
	// const pagination: PagingParams = makeParamQuery({ limit, offset, page, perPage })
	if (!isValidObjectId(roomId)) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))

	// [#] room & permission Check
	const room = await Room.findById(roomId).populate(['current'])
	const debate: any = await Debate.findById(room?.debateId)
	if (!room || !debate) return next(new HttpException(HttpStatusCode.NOT_FOUND, '존재하지 않습니다'))

	const isTeamA = debate?.agreeUserIds?.includes(userId)
	const isTeamB = debate?.disagreeUserIds?.includes(userId)

	const query: any = new Object({ roomId, group: group === 'team' && isTeamA ? 'teamA' : group === 'team' && isTeamB ? 'teamB' : 'all' })
	const data = await Chat.findList(query)
	const count = await Chat.countDocuments(query).exec()
	const params = makeParamReturn({ count, query: { group } })

	const result: DataResponse = { data: data.map((obj) => obj.toJSON()), msg: 'OK', ...params }
	return res.json(result)
}
