const authService = require("../service/auth.service");
const chatService = require("../service/chat.service");

module.exports = establishSocket = (io) => {
  io.engine.opts.cors = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  };

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const user = await authService.verifyToken(token);
      socket.userId = user._id;
      next();
    } catch (error) {
      console.log(error);
      next(new Error("Invalid token"));
    }
  });

  const userSockets = new Map();

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.userId}`);
    await authService.setUserStatus(socket.userId, true);
    userSockets.set(socket.userId.toString(), socket);
    io.emit("user_status_change", {
      userId: socket.userId,
      online: true,
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.userId}`);
      await authService.setUserStatus(socket.userId, false);
      io.emit("user_status_change", {
        userId: socket.userId,
        online: false,
      });
      userSockets.delete(socket.userId.toString());
    });

    socket.on("start_conversation", async (otherUserId, callback) => {
      try {
        console.log(socket.userId, otherUserId);
        const conversation = await chatService.createConversation(
          socket.userId,
          otherUserId
        );

        if (conversation?.isNew) {
          const otherSocket = userSockets.get(otherUserId.toString());
          if (otherSocket) {
            otherSocket.emit("new_conversation", conversation);
          }
        }
        callback({ success: true, conversation });
      } catch (error) {
        console.log(error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("send_message", async (data, callback) => {
      try {
        const { conversationId, messageType, content } = data;

        const message = await chatService.saveMessage(
          conversationId,
          socket.userId,
          messageType,
          content
        );

        const conversation = await chatService.getConversationById(
          conversationId
        );
        if (conversation) {
          const otherUserId = conversation.participants.find(
            (participant) =>
              participant._id.toString() !== socket.userId.toString()
          );

          if (otherUserId) {
            const otherSocket = userSockets.get(otherUserId._id.toString());
            if (otherSocket) {
              otherSocket.emit("new_message", message);
              otherSocket.emit("conversation_update", conversation);
              socket.emit("conversation_update", conversation);
            }
          }
        }

        callback({ success: true, message });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("get_messages", async (conversationId, callback) => {
      try {
        const messages = await chatService.getConversationMessages(
          conversationId
        );
        callback({ success: true, messages });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("get_conversations", async (callback) => {
      try {
        const conversations = await chatService.getUserConversations(
          socket.userId
        );
        callback({ success: true, conversations });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("get_users", async (callback) => {
      try {
        const users = await authService.getAllUsers(socket.userId);
        callback({ success: true, users });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });
  });
};
