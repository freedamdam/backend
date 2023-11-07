// topicHandler.ts
import { Server } from 'socket.io'
import { verify } from '@utils/auth/jwt'

// Import necessary models
import Comment from '@models/topic/Comment'
import Topic from '@models/topic/Topic'
import Report from '@models/topic/Report'

export default (io: Server) => {
  io.use((socket: any, next) => {
    const token = socket.handshake.query.token
    try {
      const payload = verify(token as string)
      socket.user = payload
      next()
    } catch (e) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const userId = (socket as any)?.user?.id
    if (!userId) {
      socket.disconnect()
      return
    }

    // Joining a topic
    socket.on('join_topic', async (topicId: string) => {
      try {
        const topic = await Topic.findById(topicId)
        if (!topic) {
          io.to(socket.id).emit('error', '토픽을 찾을 수 없습니다')
          return
        }

        socket.join(topicId)
        io.to(socket.id).emit('joined_topic', topicId)

        const comments = await Comment.find({ topicId: topic._id })
          .sort({ createdAt: -1 }) // 가장 최신 댓글부터 정렬
          .limit(3) // 최대 3개의 댓글만 가져옴

        // 실시간 댓글 상태를 클라이언트에 전송
        io.to(socket.id).emit('topic_state', { topic, comments })
      } catch (error) {
        io.to(socket.id).emit('error', 'Error joining topic')
      }
    })

    // Sending a comment
    socket.on('send_comment', async (data: { topicId: string; message: string; emotion?: string }) => {
      const { topicId, message, emotion } = data

      try {
        const topic = await Topic.findById(topicId)
        if (!topic) {
          io.to(socket.id).emit('error', '토픽을 찾을 수 없습니다')
          return
        }

        const comment = await new Comment({
          topicId,
          authorId: userId,
          message,
          emotion
        }).save()

        io.to(topicId).emit('new_comment', comment)

        // 모든 사용자에게 실시간으로 댓글 업데이트를 알림
        const latestComments = await Comment.find({ topicId: topic._id })
          .sort({ createdAt: -1 })
          .limit(3)

        io.to(topicId).emit('latest_comments', latestComments)
      } catch (error) {
        io.to(socket.id).emit('error', 'Error sending comment')
      }
    })

    // Reporting a comment
    socket.on('report_comment', async (data: { commentId: string; message: string }) => {
      const { commentId, message } = data

      try {
        const comment = await Comment.findById(commentId)
        if (!comment) {
          io.to(socket.id).emit('error', '코멘트를 찾을 수 없습니다')
          return
        }

        const report = await new Report({
          commentId,
          reporterId: userId,
          message
        }).save()

        // Notify admin or moderators
        io.emit('new_report', report)
      } catch (error) {
        io.to(socket.id).emit('error', 'Error reporting comment')
      }
    })

    // Disconnecting
    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms)
      rooms.forEach((room) => {
        socket.to(room).emit('user_left', { userId, room })
      })
    })
  })
}
