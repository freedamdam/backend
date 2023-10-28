import { Server } from 'socket.io'
import { verify } from '@utils/auth/jwt'
import moment from 'moment'

//-models
import User from '@models/account/User'
import Debate from '@models/debate/Debate'
import Room from '@models/debate/Room'
import Chat from '@models/debate/Chat'
import Process from '@models/debate/Process'

export default (io: Server) => {
	io.use((socket: any, next) => {
		const token = socket.handshake.query.token
		try {
			const payload = verify(token as string)
			socket.user = payload
		} catch (e) {}

		next()
	})

	io.on('connection', async (socket) => {
		const userId = (socket as any)?.user?.id
		if (!userId) socket.disconnect()
		await socket.join(userId)

		// [#] send message
		socket.on('send_message', async (data: any) => {
			const { roomId, debateId, message, group } = data

			// [#] room & permission Check
			const user = await User.findById(userId)
			const room = await Room.findById(roomId).populate(['current'])
			const debate = await Debate.findById(debateId)
			if (!user || !room || !debate) return io.to(userId).emit('error', { msg: '잘못된 접근입니다' })

			const { status, current } = room
			const { talker, allowTeamChat } = (current || {}) as any

			const isTeamA = debate?.agreeUserIds?.includes(userId)
			const isTeamB = debate?.disagreeUserIds?.includes(userId)
			const isMember = isTeamA || isTeamB
			const chkAllChat = isMember && ((talker && talker.toString() === userId) || status === '시작 전')
			const chkTeamChat = isMember && (allowTeamChat || status === '시작 전')

			if (!((group === 'all' && chkAllChat) || (group === 'team' && chkTeamChat)))
				return io.to(userId).emit('error', { msg: '메시지를 보낼 수 없습니다' })

			// [#] save
			const sendTo = group === 'team' && isTeamA ? 'teamA' : group === 'team' && isTeamB ? 'teamB' : 'all'
			const new_chat = await new Chat({
				roomId,
				authorId: userId,
				group: sendTo,
				name: user.name,
				message,
			}).save()

			// [#] socket emit message
			const toUserIds =
				sendTo === 'all'
					? [...debate.agreeUserIds, ...debate.disagreeUserIds, ...debate.observeUserIds]
					: sendTo === 'teamA'
					? debate.agreeUserIds
					: debate.disagreeUserIds

			toUserIds.map((id) => socket.to(id.toString()).emit('recv_message', { data: new_chat.toJSON() }))
			socket.emit('send_finish', { data: new_chat.toJSON() })
		})

		// [#] on start
		socket.on('start', async (data: any) => {
			const { roomId, debateId } = data

			// [#] room & permission Check
			const user = await User.findById(userId)
			const room = await Room.findById(roomId).populate(['current'])
			const debate = await Debate.findById(debateId).populate(['agreeUserIds', 'disagreeUserIds'])
			if (!user || !room || !debate) return io.to(userId).emit('error', { msg: '잘못된 접근입니다' })

			// 1. update debate status
			const { authorId, maxUsers, agreeUserIds, disagreeUserIds } = debate
			if (authorId.toString() !== userId) return io.to(userId).emit('error', { msg: '시작 권한이 없습니다' })
			if (agreeUserIds.length < 1 || disagreeUserIds.length < 1)
				return io.to(userId).emit('error', { msg: '최소 인원이 모이지 않았습니다' })
			if (debate.status === '진행 중' || debate.status === '종료')
				return io.to(userId).emit('error', { msg: '이미 시작되거나 끝난 토론입니다' })

			// 2. add room process
			const steps: string[] =
				maxUsers === 1
					? ['입론', '교차조사', '반박', '교차조사', '최종결론']
					: maxUsers === 2
					? ['입론', '교차조사', '반박', '작전회의', '교차조사', '반박', '최종결론']
					: maxUsers === 3
					? ['입론', '교차조사', '반박', '교차조사', '반박', '작전회의', '교차조사', '반박', '교차조사', '최종결론']
					: ['입론', '교차조사', '반박', '교차조사', '반박', '작전회의', '교차조사', '반박', '교차조사', '최종결론']

			let startAt = moment().add(5, 'seconds')
			const step2seconds = (str: string) =>
				str === '입론'
					? 90
					: str === '교차조사'
					? 120
					: str === '반박'
					? 90
					: str === '작전회의'
					? 120
					: str === '최종결론'
					? 60
					: str === '사회자 진행'
					? 2
					: 0

			const processList: any = [
				await new Process({
					status: '사회자 진행',
					talker: undefined,
					startAt,
					systemMessage: `<span>안녕하세요! 사회자 담비입니다.<br/></span>`,
				}).save(),
				await new Process({
					status: '사회자 진행',
					talker: undefined,
					startAt,
					systemMessage: `<span><b>지금부터 "${debate.title}"라는 논제로 토론을 시작</b>하겠습니다.</span>`,
				}).save(),
			]

			startAt = startAt.add(step2seconds('사회자 진행'), 'seconds')
			for (let i = 0; i < steps.length; i++) {
				const step = steps[i]
				const agreeTalker = agreeUserIds[i % agreeUserIds.length]
				const disagreeTalker = disagreeUserIds[i % disagreeUserIds.length]
				const seconds = step2seconds(step)

				if (step === '작전회의') {
					processList.push(
						await new Process({
							status: '사회자 진행',
							talker: undefined,
							startAt,
							systemMessage: `<span>지금부터 작전 회의 시간입니다.<br/>시간은 2분입니다</span>`,
						}).save(),
					)
					processList.push(
						await new Process({
							status: '사회자 진행',
							talker: undefined,
							startAt,
							systemMessage: `<span>시간은 2분입니다</span>`,
						}).save(),
					)
					processList.push(
						await new Process({
							status: step,
							talker: undefined,
							allowTeamChat: true,
							startAt,
							duration: seconds,
						}).save(),
					)
					startAt = startAt.add(seconds, 'seconds')
					continue
				}

				processList.push(
					await new Process({
						status: '사회자 진행',
						talker: undefined,
						startAt,
						systemMessage: `<span>찬성측 ${agreeTalker.name} 님의 ${step}을(를) 듣겠습니다.</span>`,
					}).save(),
				)
				processList.push(
					await new Process({
						status: '사회자 진행',
						talker: undefined,
						startAt,
						systemMessage: `${agreeTalker.name} 님은 찬성측의 주장을 뒷받침할 근거를 말씀해주세요.</span>`,
					}).save(),
				)
				processList.push(
					await new Process({
						status: '사회자 진행',
						talker: undefined,
						startAt,
						systemMessage: `<span>시간은 ${seconds}초 드리겠습니다. 시작하겠습니다.</span>`,
					}).save(),
				)
				startAt = startAt.add(step2seconds('사회자 진행'), 'seconds')

				processList.push(
					await new Process({
						status: step,
						talker: agreeTalker,
						startAt,
						duration: seconds,
					}).save(),
				)
				startAt = startAt.add(seconds, 'seconds')

				processList.push(
					await new Process({
						status: '사회자 진행',
						talker: undefined,
						startAt,
						systemMessage: `<span>반대측 ${disagreeTalker.name} 님의 ${step}을(를) 듣겠습니다.</span>`,
					}).save(),
				)
				processList.push(
					await new Process({
						status: '사회자 진행',
						talker: undefined,
						startAt,
						systemMessage: `<span>${disagreeTalker.name} 님은 반대측의 주장을 뒷받침할 근거를 말씀해주세요.</span>`,
					}).save(),
				)
				processList.push(
					await new Process({
						status: '사회자 진행',
						talker: undefined,
						startAt,
						systemMessage: `<span>시간은 ${seconds}초 드리겠습니다. 시작하겠습니다.</span>`,
					}).save(),
				)
				startAt = startAt.add(step2seconds('사회자 진행'), 'seconds')

				processList.push(
					await new Process({
						status: step,
						talker: disagreeTalker,
						startAt,
						duration: seconds,
					}).save(),
				)
				startAt = startAt.add(seconds, 'seconds')
			}

			processList.push(
				await new Process({
					status: '사회자 진행',
					talker: undefined,
					startAt,
					systemMessage: `<span>이상으로 토론을 마치겠습니다.</span>`,
				}).save(),
			)

			processList.push(
				await new Process({
					status: '종료',
					talker: undefined,
					startAt,
				}).save(),
			)

			// 3. update database
			await Debate.findByIdAndUpdate(debateId, { status: '진행 중' })
			await Room.findByIdAndUpdate(roomId, { status: '시작', processList })

			const update = await Room.findById(roomId)
			const toUserIds = [...debate.agreeUserIds.map((obj) => obj._id), ...debate.disagreeUserIds.map((obj) => obj._id)]
			toUserIds.map((id) => io.to(id.toString()).emit('room_update', { data: update?.toJSON() }))
		})
	})
}
