import schedule from 'node-schedule'
import moment from 'moment'
import { Server } from 'socket.io'
//-models
import Debate from '@models/debate/Debate'
import Room from '@models/debate/Room'
import Chat from '@models/debate/Chat'

// [#] Constants
const every_seconds = new schedule.RecurrenceRule()
every_seconds.second = new schedule.Range(0, 59)

const every_minutes = new schedule.RecurrenceRule()
every_minutes.second = 0

// [#] Crontab
export default (io: Server) => {
	schedule.scheduleJob(every_seconds, async () => {
		const playing = await Room.find({ status: { $nin: ['시작 전', '종료'] } }).populate('processList')
		for (const info of playing) {
			const next_process: any = info.processList[0]
			if (next_process && next_process?.startAt < moment()) {
				if (next_process.status === '종료') await Debate.findByIdAndUpdate(info.debateId, { status: '종료' })
				await Room.findByIdAndUpdate(info.id, {
					status: next_process.status,
					current: next_process,
					processList: info.processList.slice(1),
				})

				const debate = await Debate.findById(info.debateId)
				const toUserIds = [...debate!.agreeUserIds, ...debate!.disagreeUserIds, ...debate!.observeUserIds]

				if (next_process.status === '사회자 진행') {
					const new_chat = await new Chat({
						roomId: info,
						authorId: undefined,
						name: '사회자 담비',
						group: 'all',
						message: next_process.systemMessage,
					}).save()

					toUserIds.map((id) => io.to(id.toString()).emit('recv_message', { data: new_chat.toJSON() }))
				}

				const update = await Room.findById(info.id).populate(['current'])
				toUserIds.map((id) => io.to(id.toString()).emit('room_update', { data: update?.toJSON() }))
			}
		}
	})

	schedule.scheduleJob(every_minutes, async () => {
		await Debate.updateMany({ status: '시작 전', startAt: { $lte: moment().add(-60, 'minutes').toISOString() } }, { status: '취소' })
		await Debate.updateMany({ status: '진행 중', startAt: { $lte: moment().add(-150, 'minutes').toISOString() } }, { status: '종료' })
	})
}
